/**
 * RC2 加解密
 * 目录：pages/app/rc2/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import {
    utf8ToBytes, bytesToUtf8, bytesToHex, bytesToBase64, inputToBytes
} from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// RC2 (RFC 2268)，字长 16，密钥 8 字节，64 位有效位
const RC2_PITABLE = [
    0xd9, 0x78, 0xf9, 0xc4, 0x19, 0xdd, 0xb5, 0xed, 0x28, 0xe9, 0xfd, 0x79, 0x4a, 0xa0, 0xd8, 0x9d,
    0xc6, 0x7e, 0x37, 0x83, 0x2b, 0x76, 0x53, 0x8e, 0x62, 0x4c, 0x64, 0x88, 0x44, 0x8b, 0xfb, 0xa2,
    0x17, 0x9a, 0x59, 0xf5, 0x87, 0xb3, 0x4f, 0x13, 0x61, 0x45, 0x6d, 0x8d, 0x09, 0x81, 0x7d, 0x32,
    0xbd, 0x8f, 0x40, 0xeb, 0x86, 0xb7, 0x7b, 0x0b, 0xf0, 0x95, 0x21, 0x22, 0x5c, 0x6b, 0x4e, 0x82,
    0x54, 0xd6, 0x65, 0x93, 0xce, 0x60, 0xb2, 0x1c, 0x73, 0x56, 0xc0, 0x14, 0xa7, 0x8c, 0xf1, 0xdc,
    0x12, 0x75, 0xca, 0x1f, 0x3b, 0xbe, 0xe4, 0xd1, 0x42, 0x3d, 0xd4, 0x30, 0xa3, 0x3c, 0xb6, 0x26,
    0x6f, 0xbf, 0x0e, 0xda, 0x46, 0x69, 0x07, 0x57, 0x27, 0xf2, 0x1d, 0x9b, 0xbc, 0x94, 0x43, 0x03,
    0xf8, 0x11, 0xc7, 0xf6, 0x90, 0xef, 0x3e, 0xe7, 0x06, 0xc3, 0xd5, 0x2f, 0xc8, 0x66, 0x1e, 0xd7,
    0x08, 0xe8, 0xea, 0xde, 0x80, 0x52, 0xee, 0xf7, 0x84, 0xaa, 0x72, 0xac, 0x35, 0x4d, 0x6a, 0x2a,
    0x96, 0x1a, 0xd2, 0x71, 0x5a, 0x15, 0x49, 0x74, 0x4b, 0x9f, 0xd0, 0x5e, 0x04, 0x18, 0xa4, 0xec,
    0xc2, 0xe0, 0x41, 0x6e, 0x0f, 0x51, 0xcb, 0xcc, 0x24, 0x91, 0xaf, 0x50, 0xa1, 0xf4, 0x70, 0x39,
    0x99, 0x7c, 0x3a, 0x85, 0x23, 0xb8, 0xb4, 0x7a, 0xfc, 0x02, 0x36, 0x5b, 0x25, 0x55, 0x97, 0x31,
    0x2d, 0x5d, 0xfa, 0x98, 0xe3, 0x8a, 0x92, 0xae, 0x05, 0xdf, 0x29, 0x10, 0x67, 0x6c, 0xba, 0xc9,
    0xd3, 0x00, 0xe6, 0xcf, 0xe1, 0x9e, 0xa8, 0x2c, 0x63, 0x16, 0x01, 0x3f, 0x58, 0xe2, 0x89, 0xa9,
    0x0d, 0x38, 0x34, 0x1b, 0xab, 0x33, 0xff, 0xb0, 0xbb, 0x48, 0x0c, 0x5f, 0xb9, 0xb1, 0xcd, 0x2e,
    0xc5, 0xf3, 0xdb, 0x47, 0xe5, 0xa5, 0x9c, 0x77, 0x0a, 0xa6, 0x20, 0x68, 0xfe, 0x7f, 0xc1, 0xad,
];

const rc2Tool = {
    id: "rc2",
    name: "RC2 加解密",
    category: "crypto",
    desc: "RC2 (64 位分组)",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "key", label: "密钥 (8 字节)", type: "text", default: "12345678" },
        { name: "bits", label: "有效密钥位", type: "number", default: 64 },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const keyBytes = utf8ToBytes(v.key.padEnd(8, "\0")).slice(0, 8);
        const T = Math.min(1024, Math.max(1, parseInt(v.bits, 10) || 64));
        const L = new Uint16Array(128);
        for (let i = 0; i < 8; i++) L[i] = keyBytes[i];
        for (let i = 8; i < 128; i++) {
            L[i] = (RC2_PITABLE[(L[i - 1] + L[i - 8]) & 0xff] + L[i - 8]) & 0xffff;
        }
        const T1 = T >> 3, T8 = T & 7;
        const K = new Uint16Array(64);
        for (let i = 0; i < T1; i++) K[i] = L[i];
        K[T1] = (RC2_PITABLE[L[T1] & 0xff] & (0xff >> T8)) + (L[T1 + 1] & (0xff << (8 - T8)));
        for (let i = T1 + 1; i < 64; i++) K[i] = RC2_PITABLE[(K[i - 1] + K[i - T1]) & 0xff];

        const rotl16 = (x, s) => (((x << s) | (x >>> (16 - s))) & 0xffff);
        const rotr16 = (x, s) => (((x >>> s) | (x << (16 - s))) & 0xffff);

        const encryptBlock = (words) => {
            let R = words.slice();
            for (let i = 0; i < 16; i++) {
                for (let j = 0; j < 4; j++) R[j] = (R[j] + K[4 * i + j]) & 0xffff;
                R[0] = rotl16(R[0], 1); R[1] = rotl16(R[1], 2); R[2] = rotl16(R[2], 3); R[3] = rotl16(R[3], 5);
                if (i === 4 || i === 10) {
                    R[0] = (R[0] + K[R[3] & 63]) & 0xffff;
                    R[1] = (R[1] + K[R[0] & 63]) & 0xffff;
                    R[2] = (R[2] + K[R[1] & 63]) & 0xffff;
                    R[3] = (R[3] + K[R[2] & 63]) & 0xffff;
                }
            }
            return R;
        };
        const decryptBlock = (words) => {
            let R = words.slice();
            for (let i = 15; i >= 0; i--) {
                if (i === 10 || i === 4) {
                    R[3] = (R[3] - K[R[2] & 63]) & 0xffff;
                    R[2] = (R[2] - K[R[1] & 63]) & 0xffff;
                    R[1] = (R[1] - K[R[0] & 63]) & 0xffff;
                    R[0] = (R[0] - K[R[3] & 63]) & 0xffff;
                }
                R[3] = rotr16(R[3], 5); R[2] = rotr16(R[2], 3); R[1] = rotr16(R[1], 2); R[0] = rotr16(R[0], 1);
                for (let j = 3; j >= 0; j--) R[j] = (R[j] - K[4 * i + j]) & 0xffff;
            }
            return R;
        };

        if (v.mode === "encrypt") {
            let data = utf8ToBytes(v.input);
            const padLen = 8 - (data.length % 8);
            const padded = new Uint8Array(data.length + padLen);
            padded.set(data);
            for (let i = data.length; i < padded.length; i++) padded[i] = padLen;
            const out = [];
            for (let i = 0; i < padded.length; i += 8) {
                const words = [
                    padded[i] | (padded[i + 1] << 8),
                    padded[i + 2] | (padded[i + 3] << 8),
                    padded[i + 4] | (padded[i + 5] << 8),
                    padded[i + 6] | (padded[i + 7] << 8),
                ];
                const enc = encryptBlock(words);
                for (const w of enc) out.push(w & 0xff, (w >> 8) & 0xff);
            }
            const bytes = new Uint8Array(out);
            return v.outputFormat === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes);
        }

        const bytes = inputToBytes(v.input, v.outputFormat === "hex" ? "hex" : "base64");
        const out = [];
        for (let i = 0; i < bytes.length; i += 8) {
            const words = [
                bytes[i] | (bytes[i + 1] << 8),
                bytes[i + 2] | (bytes[i + 3] << 8),
                bytes[i + 4] | (bytes[i + 5] << 8),
                bytes[i + 6] | (bytes[i + 7] << 8),
            ];
            const dec = decryptBlock(words);
            for (const w of dec) out.push(w & 0xff, (w >> 8) & 0xff);
        }
        let plain = new Uint8Array(out);
        const pad = plain[plain.length - 1];
        if (pad > 0 && pad <= 8) plain = plain.slice(0, plain.length - pad);
        return bytesToUtf8(plain);
    },
};

export default rc2Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(rc2Tool);
