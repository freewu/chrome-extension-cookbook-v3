/**
 * ChaCha20 加解密
 * 目录：pages/app/chacha20/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import {
    utf8ToBytes, bytesToUtf8, bytesToHex, hexToBytes, bytesToBase64, inputToBytes
} from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// ChaCha20 (RFC 8439)
function chacha20Block(key, counter, nonce) {
    const rotl = (v, c) => ((v << c) | (v >>> (32 - c))) >>> 0;
    const state = new Uint32Array(16);
    state[0] = 0x61707865; state[1] = 0x3320646e; state[2] = 0x79622d32; state[3] = 0x6b206574;
    for (let i = 0; i < 8; i++) state[4 + i] = (key[i * 4] | (key[i * 4 + 1] << 8) | (key[i * 4 + 2] << 16) | (key[i * 4 + 3] << 24)) >>> 0;
    state[12] = counter >>> 0;
    state[13] = (nonce[0] | (nonce[1] << 8) | (nonce[2] << 16) | (nonce[3] << 24)) >>> 0;
    state[14] = (nonce[4] | (nonce[5] << 8) | (nonce[6] << 16) | (nonce[7] << 24)) >>> 0;
    state[15] = (nonce[8] | (nonce[9] << 8) | (nonce[10] << 16) | (nonce[11] << 24)) >>> 0;
    const x = state.slice();
    const qr = (a, b, c, d) => {
        x[a] = (x[a] + x[b]) >>> 0; x[d] = rotl(x[d] ^ x[a], 16);
        x[c] = (x[c] + x[d]) >>> 0; x[b] = rotl(x[b] ^ x[c], 12);
        x[a] = (x[a] + x[b]) >>> 0; x[d] = rotl(x[d] ^ x[a], 8);
        x[c] = (x[c] + x[d]) >>> 0; x[b] = rotl(x[b] ^ x[c], 7);
    };
    for (let i = 0; i < 10; i++) {
        qr(0, 4, 8, 12); qr(1, 5, 9, 13); qr(2, 6, 10, 14); qr(3, 7, 11, 15);
        qr(0, 5, 10, 15); qr(1, 6, 11, 12); qr(2, 7, 8, 13); qr(3, 4, 9, 14);
    }
    const out = new Uint8Array(64);
    for (let i = 0; i < 16; i++) {
        const val = (x[i] + state[i]) >>> 0;
        out[i * 4] = val & 0xff; out[i * 4 + 1] = (val >>> 8) & 0xff;
        out[i * 4 + 2] = (val >>> 16) & 0xff; out[i * 4 + 3] = (val >>> 24) & 0xff;
    }
    return out;
}

const chacha20Tool = {
    id: "chacha20",
    name: "ChaCha20 加解密",
    category: "crypto",
    desc: "RFC 8439 ChaCha20 流密码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "keyFormat", label: "密钥格式", type: "select", options: [["hex", "Hex"], ["utf8", "文本"]], default: "hex" },
        { name: "key", label: "密钥 (32 字节)", type: "text", default: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f" },
        { name: "nonce", label: "Nonce (12 字节, Hex)", type: "text", default: "000000000000004a00000000" },
        { name: "counter", label: "初始计数器", type: "number", default: 1 },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Ladies and Gentlemen of the class of '99" },
    ],
    run(v) {
        const key = v.keyFormat === "hex" ? hexToBytes(v.key) : utf8ToBytes(v.key);
        if (key.length !== 32) throw new Error("ChaCha20 密钥必须为 32 字节");
        const nonce = hexToBytes(v.nonce);
        if (nonce.length !== 12) throw new Error("Nonce 必须为 12 字节");
        const data = v.mode === "encrypt"
            ? utf8ToBytes(v.input)
            : inputToBytes(v.input, v.outputFormat === "hex" ? "hex" : "base64");
        const out = new Uint8Array(data.length);
        let counter = parseInt(v.counter, 10) >>> 0;
        for (let i = 0; i < data.length; i += 64) {
            const block = chacha20Block(key, counter++, nonce);
            for (let j = 0; j < 64 && i + j < data.length; j++) out[i + j] = data[i + j] ^ block[j];
        }
        if (v.mode !== "encrypt") return bytesToUtf8(out);
        return v.outputFormat === "hex" ? bytesToHex(out) : bytesToBase64(out);
    },
};

export default chacha20Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(chacha20Tool);
