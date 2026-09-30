// 通用工具函数（编解码 / 字节处理 / 进制转换）

// ---------- 文本 <-> 字节 ----------
export function utf8ToBytes(str) {
    return new TextEncoder().encode(str);
}

export function bytesToUtf8(bytes) {
    return new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
}

export function latin1ToBytes(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
    return out;
}

export function bytesToLatin1(bytes) {
    let s = "";
    for (const b of bytes) s += String.fromCharCode(b);
    return s;
}

// ---------- hex ----------
export function bytesToHex(bytes) {
    return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex) {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    if (clean.length % 2 !== 0) throw new Error("十六进制长度必须为偶数");
    const out = new Uint8Array(clean.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(clean.substr(i * 2, 2), 16);
    }
    return out;
}

// ---------- base64 ----------
export function bytesToBase64(bytes) {
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
}

export function base64ToBytes(b64) {
    const bin = atob(b64.replace(/\s+/g, ""));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

// ---------- 输入解析：按输入格式得到字节 ----------
// format: utf8 | hex | base64 | latin1
export function inputToBytes(text, format = "utf8") {
    switch (format) {
        case "hex":
            return hexToBytes(text);
        case "base64":
            return base64ToBytes(text);
        case "latin1":
            return latin1ToBytes(text);
        case "utf8":
        default:
            return utf8ToBytes(text);
    }
}

// ---------- 输出格式化：字节 -> 文本 ----------
export function bytesToOutput(bytes, format = "utf8") {
    switch (format) {
        case "hex":
            return bytesToHex(bytes);
        case "base64":
            return bytesToBase64(bytes);
        case "latin1":
            return bytesToLatin1(bytes);
        case "utf8":
        default:
            return bytesToUtf8(bytes);
    }
}

// ---------- 任意进制 ----------
const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function bytesToBaseX(bytes, alphabet) {
    const base = alphabet.length;
    if (base < 2) throw new Error("字母表至少需要 2 个字符");
    let num = 0n;
    for (const b of bytes) num = num * 256n + BigInt(b);
    if (num === 0n) return alphabet[0];
    let out = "";
    while (num > 0n) {
        out = alphabet[Number(num % BigInt(base))] + out;
        num /= BigInt(base);
    }
    return out;
}

export function baseXToBytes(text, alphabet) {
    const base = BigInt(alphabet.length);
    let num = 0n;
    for (const ch of text) {
        const idx = alphabet.indexOf(ch);
        if (idx < 0) throw new Error(`字符「${ch}」不在字母表中`);
        num = num * base + BigInt(idx);
    }
    const bytes = [];
    while (num > 0n) {
        bytes.unshift(Number(num % 256n));
        num /= 256n;
    }
    return new Uint8Array(bytes);
}

export { DIGITS };

// ---------- 生成 CRC 表 ----------
export function makeCrcTable(poly, width) {
    const table = new Uint32Array(256);
    const mask = width === 32 ? 0xffffffff : (1 << width) - 1;
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? (c >>> 1) ^ poly : c >>> 1;
        }
        table[n] = (c & mask) >>> 0;
    }
    return table;
}

// 反射式 CRC 计算
export function crcReflected(bytes, width, poly, init, xorout, refin = true, refout = true) {
    const table = makeCrcTable(refin ? reverseBits(poly, width) : poly, width);
    const mask = width === 32 ? 0xffffffff : (1 << width) - 1;
    let crc = init & mask;
    for (let b of bytes) {
        if (refin) {
            crc = ((crc >>> 8) ^ table[(crc ^ b) & 0xff]) & mask;
        } else {
            const idx = ((crc >>> (width - 8)) ^ b) & 0xff;
            crc = ((crc << 8) ^ table[idx]) & mask;
        }
    }
    if (refin !== refout) crc = reverseBits(crc, width);
    return (crc ^ xorout) & mask;
}

export function reverseBits(value, width) {
    let r = 0;
    for (let i = 0; i < width; i++) {
        r = (r << 1) | (value & 1);
        value >>>= 1;
    }
    return r >>> 0;
}

// ---------- DOM 帮手 ----------
export function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k.startsWith("on") && typeof v === "function") {
            node.addEventListener(k.slice(2), v);
        } else {
            node.setAttribute(k, v);
        }
    }
    for (const c of children) node.append(c);
    return node;
}
