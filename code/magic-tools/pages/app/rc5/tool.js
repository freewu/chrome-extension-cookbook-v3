/**
 * RC5 加解密
 * 目录：pages/app/rc5/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import {
    utf8ToBytes, bytesToUtf8, bytesToHex, bytesToBase64, inputToBytes
} from "../shared/utils.js";
import { bytesToWords, wordsToBytes } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// RC5 / RC6 / RC2 / ChaCha20
// ============================================================
const rc5Tool = {
    id: "rc5",
    name: "RC5 加解密",
    category: "crypto",
    desc: "RC5 (32 位字, 默认 12 轮)",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "rounds", label: "轮数", type: "number", default: 12 },
        { name: "key", label: "密钥", type: "text", default: "secret" },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const w = 32, r = Math.max(0, parseInt(v.rounds, 10));
        const u = w / 8;
        const key = utf8ToBytes(v.key);
        const c = Math.max(1, Math.ceil(key.length / u));
        const L = new Array(c).fill(0);
        for (let i = key.length - 1; i >= 0; i--) L[Math.floor(i / u)] = ((L[Math.floor(i / u)] << 8) + key[i]) >>> 0;
        const t = 2 * (r + 1);
        const S = new Array(t);
        S[0] = 0xb7e15163;
        for (let i = 1; i < t; i++) S[i] = (S[i - 1] + 0x9e3779b9) >>> 0;
        let A = 0, B = 0, i = 0, j = 0;
        const iter = 3 * Math.max(t, c);
        for (let k = 0; k < iter; k++) {
            S[i] = (S[i] + A + B) >>> 0;
            A = S[i];
            const rotL = (x, s) => ((x << s) | (x >>> (32 - s))) >>> 0;
            L[j] = (L[j] + A + B) >>> 0;
            B = L[j];
            i = (i + 1) % t;
            j = (j + 1) % c;
        }
        const rotl = (x, s) => ((x << s) | (x >>> (32 - s))) >>> 0;
        const rotr = (x, s) => ((x >>> s) | (x << (32 - s))) >>> 0;

        if (v.mode === "encrypt") {
            let data = utf8ToBytes(v.input);
            const padLen = 8 - (data.length % 8);
            const padded = new Uint8Array(data.length + padLen);
            padded.set(data);
            for (let x = data.length; x < padded.length; x++) padded[x] = padLen;
            const out = [];
            for (let x = 0; x < padded.length; x += 8) {
                let A2 = (padded[x] | (padded[x + 1] << 8) | (padded[x + 2] << 16) | (padded[x + 3] << 24)) >>> 0;
                let B2 = (padded[x + 4] | (padded[x + 5] << 8) | (padded[x + 6] << 16) | (padded[x + 7] << 24)) >>> 0;
                A2 = (A2 + S[0]) >>> 0;
                B2 = (B2 + S[1]) >>> 0;
                for (let k = 1; k <= r; k++) {
                    A2 = (rotl(A2 ^ B2, B2) + S[2 * k]) >>> 0;
                    B2 = (rotl(B2 ^ A2, A2) + S[2 * k + 1]) >>> 0;
                }
                out.push(A2, B2);
            }
            const bytes = wordsToBytes(out);
            return v.outputFormat === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes);
        }

        const bytes = inputToBytes(v.input, v.outputFormat === "hex" ? "hex" : "base64");
        const words = bytesToWords(bytes);
        const out = [];
        for (let x = 0; x < words.length; x += 2) {
            let A2 = words[x], B2 = words[x + 1];
            for (let k = r; k >= 1; k--) {
                B2 = (rotr((B2 - S[2 * k + 1]) >>> 0, A2) ^ A2) >>> 0;
                A2 = (rotr((A2 - S[2 * k]) >>> 0, B2) ^ B2) >>> 0;
            }
            A2 = (A2 - S[0]) >>> 0;
            B2 = (B2 - S[1]) >>> 0;
            out.push(A2, B2);
        }
        let plain = wordsToBytes(out);
        const pad = plain[plain.length - 1];
        if (pad > 0 && pad <= 8) plain = plain.slice(0, plain.length - pad);
        return bytesToUtf8(plain);
    },
};

export default rc5Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(rc5Tool);
