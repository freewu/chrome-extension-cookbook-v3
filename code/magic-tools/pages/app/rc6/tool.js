/**
 * RC6 加解密
 * 目录：pages/app/rc6/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import {
    utf8ToBytes, bytesToUtf8, bytesToHex, bytesToBase64, inputToBytes
} from "../shared/utils.js";
import { bytesToWords, wordsToBytes } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

const rc6Tool = {
    id: "rc6",
    name: "RC6 加解密",
    category: "crypto",
    desc: "RC6 (32 位字, 默认 20 轮)",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "rounds", label: "轮数", type: "number", default: 20 },
        { name: "key", label: "密钥", type: "text", default: "secret" },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const r = Math.max(0, parseInt(v.rounds, 10));
        const u = 4;
        const key = utf8ToBytes(v.key);
        const c = Math.max(1, Math.ceil(key.length / u));
        const L = new Array(c).fill(0);
        for (let i = key.length - 1; i >= 0; i--) L[Math.floor(i / u)] = ((L[Math.floor(i / u)] << 8) + key[i]) >>> 0;
        const t = 2 * r + 4;
        const S = new Array(t);
        S[0] = 0xb7e15163;
        for (let i = 1; i < t; i++) S[i] = (S[i - 1] + 0x9e3779b9) >>> 0;
        let A = 0, B = 0, i = 0, j = 0;
        const iter = 3 * Math.max(t, c);
        const rotl = (x, s) => (((x << s) | (x >>> (32 - s))) >>> 0);
        for (let k = 0; k < iter; k++) {
            S[i] = rotl((S[i] + A + B) >>> 0, 3);
            A = S[i];
            L[j] = rotl((L[j] + A + B) >>> 0, (A + B) & 31);
            B = L[j];
            i = (i + 1) % t;
            j = (j + 1) % c;
        }
        const rotr = (x, s) => (((x >>> s) | (x << (32 - s))) >>> 0);

        if (v.mode === "encrypt") {
            let data = utf8ToBytes(v.input);
            const padLen = 16 - (data.length % 16);
            const padded = new Uint8Array(data.length + padLen);
            padded.set(data);
            for (let x = data.length; x < padded.length; x++) padded[x] = padLen;
            const out = [];
            for (let x = 0; x < padded.length; x += 16) {
                let a = (padded[x] | (padded[x + 1] << 8) | (padded[x + 2] << 16) | (padded[x + 3] << 24)) >>> 0;
                let b = (padded[x + 4] | (padded[x + 5] << 8) | (padded[x + 6] << 16) | (padded[x + 7] << 24)) >>> 0;
                let cc = (padded[x + 8] | (padded[x + 9] << 8) | (padded[x + 10] << 16) | (padded[x + 11] << 24)) >>> 0;
                let d = (padded[x + 12] | (padded[x + 13] << 8) | (padded[x + 14] << 16) | (padded[x + 15] << 24)) >>> 0;
                b = (b + S[0]) >>> 0;
                d = (d + S[1]) >>> 0;
                for (let k = 1; k <= r; k++) {
                    const t2 = rotl((b * (2 * b + 1)) >>> 0, 5);
                    const u2 = rotl((d * (2 * d + 1)) >>> 0, 5);
                    a = (rotl(a ^ t2, u2) + S[2 * k]) >>> 0;
                    cc = (rotl(cc ^ u2, t2) + S[2 * k + 1]) >>> 0;
                    [a, b, cc, d] = [b, cc, d, a];
                }
                a = (a + S[2 * r + 2]) >>> 0;
                cc = (cc + S[2 * r + 3]) >>> 0;
                out.push(a, b, cc, d);
            }
            const bytes = wordsToBytes(out);
            return v.outputFormat === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes);
        }

        const bytes = inputToBytes(v.input, v.outputFormat === "hex" ? "hex" : "base64");
        const words = bytesToWords(bytes);
        const out = [];
        for (let x = 0; x < words.length; x += 4) {
            let a = words[x], b = words[x + 1], cc = words[x + 2], d = words[x + 3];
            cc = (cc - S[2 * r + 3]) >>> 0;
            a = (a - S[2 * r + 2]) >>> 0;
            for (let k = r; k >= 1; k--) {
                [a, b, cc, d] = [d, a, b, cc];
                const u2 = rotl((d * (2 * d + 1)) >>> 0, 5);
                const t2 = rotl((b * (2 * b + 1)) >>> 0, 5);
                cc = (rotr((cc - S[2 * k + 1]) >>> 0, t2) ^ u2) >>> 0;
                a = (rotr((a - S[2 * k]) >>> 0, u2) ^ t2) >>> 0;
            }
            d = (d - S[1]) >>> 0;
            b = (b - S[0]) >>> 0;
            out.push(a, b, cc, d);
        }
        let plain = wordsToBytes(out);
        const pad = plain[plain.length - 1];
        if (pad > 0 && pad <= 16) plain = plain.slice(0, plain.length - pad);
        return bytesToUtf8(plain);
    },
};

export default rc6Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(rc6Tool);
