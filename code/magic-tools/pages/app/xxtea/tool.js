/**
 * XXTEA 加解密
 * 目录：pages/app/xxtea/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import {
    utf8ToBytes, bytesToUtf8, bytesToHex, bytesToBase64, inputToBytes
} from "../shared/utils.js";
import { DELTA, bytesToWords, wordsToBytes } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

// XXTEA 按 32 位整数数组整体加密
const xxteaTool = {
    id: "xxtea",
    name: "XXTEA 加解密",
    category: "crypto",
    desc: "Corrected Block TEA",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "keyFormat", label: "密钥格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "utf8" },
        { name: "key", label: "密钥", type: "text", default: "0123456789abcdef" },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const keyBytes = inputToBytes(v.key, v.keyFormat);
        if (keyBytes.length < 16) throw new Error("XXTEA 密钥至少 16 字节");
        const key = bytesToWords(keyBytes.slice(0, 16));
        const MX = (sum, y, z, p, e, k) => {
            const h = (z >>> 5) ^ (y << 2);
            const p2 = (p & 3) ^ e;
            return (((z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4)) ^ ((sum ^ y) + (k[(p & 3) ^ e] ^ z))) >>> 0;
        };
        const toUint32 = (x) => x >>> 0;

        if (v.mode === "encrypt") {
            const data = utf8ToBytes(v.input);
            // 补齐到 4 字节边界，并保证至少 2 个 32 位字（XXTEA 要求 n >= 2）；
            // 填充字节的值等于填充长度，解密时据此还原
            let padLen = 4 - (data.length % 4);
            if (data.length + padLen < 8) padLen += 4;
            const padded = new Uint8Array(data.length + padLen);
            padded.set(data);
            padded.fill(padLen, data.length);
            const words = bytesToWords(padded);
            const n = words.length;
            const vArr = words.slice();
            let sum = 0;
            const rounds = 6 + Math.floor(52 / n);
            let z = vArr[n - 1];
            for (let r = 0; r < rounds; r++) {
                sum = (sum + DELTA) >>> 0;
                const e = (sum >>> 2) & 3;
                for (let p = 0; p < n - 1; p++) {
                    const y = vArr[p + 1];
                    z = vArr[p] = (vArr[p] + MX(sum, y, z, p, e, key)) >>> 0;
                }
                const y = vArr[0];
                z = vArr[n - 1] = (vArr[n - 1] + MX(sum, y, z, n - 1, e, key)) >>> 0;
            }
            const bytes = wordsToBytes(vArr);
            return v.outputFormat === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes);
        }

        const bytes = inputToBytes(v.input, v.outputFormat === "hex" ? "hex" : "base64");
        const vArr = bytesToWords(bytes);
        const n = vArr.length;
        if (n < 2) throw new Error("密文长度不足");
        let rounds = 6 + Math.floor(52 / n);
        let sum = (rounds * DELTA) >>> 0;
        let y = vArr[0];
        while (sum !== 0) {
            const e = (sum >>> 2) & 3;
            for (let p = n - 1; p > 0; p--) {
                const z = vArr[p - 1];
                y = vArr[p] = (vArr[p] - MX(sum, y, z, p, e, key)) >>> 0;
            }
            const z = vArr[n - 1];
            y = vArr[0] = (vArr[0] - MX(sum, y, z, 0, e, key)) >>> 0;
            sum = (sum - DELTA) >>> 0;
        }
        const plain = wordsToBytes(vArr);
        const padLen = plain.length > 0 ? plain[plain.length - 1] : 0;
        const end = padLen >= 1 && padLen <= 8 ? plain.length - padLen : plain.length;
        return bytesToUtf8(plain.slice(0, end));
    },
};

export default xxteaTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(xxteaTool);
