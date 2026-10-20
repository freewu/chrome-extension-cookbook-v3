/**
 * 加解密分类的公共 helper（被多个工具目录共用）
 */
import {
    utf8ToBytes, bytesToUtf8, bytesToHex, hexToBytes, bytesToBase64, inputToBytes
} from "./utils.js";

const C = window.CryptoJS;

// ============================================================
// 通用对称加密（crypto-js）
// ============================================================
const MODE = { CBC: "CBC", CFB: "CFB", OFB: "OFB", CTR: "CTR", ECB: "ECB" };

const PAD = { Pkcs7: "Pkcs7", ZeroPadding: "ZeroPadding", NoPadding: "NoPadding", AnsiX923: "AnsiX923", Iso10126: "Iso10126", Iso97971: "Iso97971" };

function toWA(bytes) {
    return C.enc.Hex.parse(bytesToHex(bytes));
}

function symmetricFields(extra = {}) {
    const fields = [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "keyFormat", label: "密钥格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"], ["base64", "Base64"]], default: "utf8" },
        { name: "key", label: "密钥", type: "text", default: "0123456789abcdef" },
        { name: "inputFormat", label: "输入格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"], ["base64", "Base64"]], default: "utf8" },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ];
    if (!extra.noMode) {
        fields.splice(1, 0, { name: "cipherMode", label: "分组模式", type: "select", options: Object.keys(MODE), default: extra.defaultMode || "CBC" });
        fields.splice(2, 0, { name: "padding", label: "填充", type: "select", options: Object.keys(PAD), default: "Pkcs7" });
    }
    if (!extra.noIv) {
        fields.splice(3, 0, { name: "ivFormat", label: "IV 格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"], ["base64", "Base64"]], default: "utf8" });
        fields.splice(4, 0, { name: "iv", label: "IV", type: "text", default: extra.defaultIv ?? "0000000000000000" });
    }
    return fields;
}

function runCryptoJs(cipher, v, extra = {}) {
    const keyBytes = inputToBytes(v.key, v.keyFormat);
    // 部分密码（如 AES）对非标准密钥长度不会报错，但会得到无法解密的密文，这里提前拦截
    if (extra.keySizes && !extra.keySizes.includes(keyBytes.length)) {
        throw new Error(`密钥长度必须为 ${extra.keySizes.join(" / ")} 字节（当前 ${keyBytes.length} 字节）`);
    }
    const key = toWA(keyBytes);
    const options = {};
    if (!extra.noMode) {
        options.mode = C.mode[v.cipherMode];
        options.padding = C.pad[v.padding];
    }
    const mode = extra.noMode ? "CBC" : v.cipherMode;
    if (!extra.noIv && mode !== "ECB") {
        options.iv = toWA(inputToBytes(v.iv, v.ivFormat));
    }

    if (v.mode === "encrypt") {
        const msg = toWA(inputToBytes(v.input, v.inputFormat));
        const encrypted = cipher.encrypt(msg, key, options);
        return v.outputFormat === "hex"
            ? encrypted.ciphertext.toString(C.enc.Hex)
            : encrypted.ciphertext.toString(C.enc.Base64);
    }

    const cipherWA = toWA(inputToBytes(v.input, v.outputFormat === "hex" ? "hex" : "base64"));
    const decrypted = cipher.decrypt({ ciphertext: cipherWA }, key, options);
    const hex = decrypted.toString(C.enc.Hex);
    return bytesToUtf8(hexToBytes(hex));
}

// ============================================================
// TEA / XTEA / XXTEA
// ============================================================
const DELTA = 0x9e3779b9;

function teaKeys(keyBytes) {
    const k = [];
    for (let i = 0; i < 4; i++) {
        k.push((keyBytes[i * 4] | (keyBytes[i * 4 + 1] << 8) | (keyBytes[i * 4 + 2] << 16) | (keyBytes[i * 4 + 3] << 24)) >>> 0);
    }
    return k;
}

function bytesToWords(bytes) {
    const words = [];
    for (let i = 0; i < bytes.length; i += 4) {
        words.push((bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24)) >>> 0);
    }
    return words;
}

function wordsToBytes(words) {
    const out = [];
    for (const w of words) {
        out.push(w & 0xff, (w >>> 8) & 0xff, (w >>> 16) & 0xff, (w >>> 24) & 0xff);
    }
    return new Uint8Array(out);
}

function blockCipherTool(id, name, desc, encryptBlock, decryptBlock, keyLen) {
    return {
        id, name, category: "crypto", desc,
        fields: [
            { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
            { name: "keyFormat", label: "密钥格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "utf8" },
            { name: "key", label: `密钥 (${keyLen} 字节)`, type: "text", default: "0123456789abcdef" },
            { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
            { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
        ],
        run(v) {
            const key = inputToBytes(v.key, v.keyFormat);
            const padKey = new Uint8Array(keyLen);
            padKey.set(key.slice(0, keyLen));
            const words = bytesToWords(padKey);
            const k = words.slice(0, 4);

            if (v.mode === "encrypt") {
                let data = utf8ToBytes(v.input);
                const padLen = 8 - (data.length % 8);
                const padded = new Uint8Array(data.length + padLen);
                padded.set(data);
                for (let i = data.length; i < padded.length; i++) padded[i] = padLen;
                const out = [];
                for (let i = 0; i < padded.length; i += 8) {
                    const v0 = (padded[i] | (padded[i + 1] << 8) | (padded[i + 2] << 16) | (padded[i + 3] << 24)) >>> 0;
                    const v1 = (padded[i + 4] | (padded[i + 5] << 8) | (padded[i + 6] << 16) | (padded[i + 7] << 24)) >>> 0;
                    const [c0, c1] = encryptBlock(v0, v1, k);
                    out.push(c0, c1);
                }
                const bytes = wordsToBytes(out);
                return v.outputFormat === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes);
            }

            const bytes = inputToBytes(v.input, v.inputFormatOf ? v.inputFormatOf : (v.outputFormat === "hex" ? "hex" : "base64"));
            const blocks = bytesToWords(bytes);
            const outWords = [];
            for (let i = 0; i < blocks.length; i += 2) {
                const [p0, p1] = decryptBlock(blocks[i], blocks[i + 1], k);
                outWords.push(p0, p1);
            }
            let plain = wordsToBytes(outWords);
            if (plain.length > 0) {
                const pad = plain[plain.length - 1];
                if (pad > 0 && pad <= 8 && pad <= plain.length) plain = plain.slice(0, plain.length - pad);
            }
            return bytesToUtf8(plain);
        },
    };
}

export { C, MODE, PAD, toWA, symmetricFields, runCryptoJs, DELTA, teaKeys, bytesToWords, wordsToBytes, blockCipherTool };
