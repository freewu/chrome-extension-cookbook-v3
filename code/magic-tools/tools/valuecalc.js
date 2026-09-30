// 值计算工具集：Hash / HMAC / CRC / 校验 / 派生 等
import {
    utf8ToBytes,
    bytesToHex,
    hexToBytes,
    bytesToBase64,
    base64ToBytes,
    inputToBytes,
    crcReflected,
    el,
} from "../js/utils.js";

const C = window.CryptoJS;
const S = window.sha3;

// 字节 -> CryptoJS WordArray
function wa(bytes) {
    return C.enc.Hex.parse(bytesToHex(bytes));
}

function outFormat(bytes, format) {
    return format === "base64" ? bytesToBase64(bytes) : bytesToHex(bytes);
}

// ============================================================
// Hash 值计算
// ============================================================
const HASH_FUNCS = {
    MD5: (s) => C.MD5(s),
    SHA1: (s) => C.SHA1(s),
    SHA224: (s) => C.SHA224(s),
    SHA256: (s) => C.SHA256(s),
    SHA384: (s) => C.SHA384(s),
    SHA512: (s) => C.SHA512(s),
    RIPEMD160: (s) => C.RIPEMD160(s),
};

const hashTool = {
    id: "hash",
    name: "Hash 值计算",
    category: "value-calc",
    desc: "MD5 / SHA-1 / SHA-2 / RIPEMD160 摘要",
    fields: [
        {
            name: "algorithm", label: "算法", type: "select",
            options: Object.keys(HASH_FUNCS), default: "MD5",
        },
        { name: "format", label: "输出格式", type: "select", options: [["hex", "Hex"], ["base64", "Base64"]], default: "hex" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const hasher = HASH_FUNCS[v.algorithm];
        const digest = hasher(wa(utf8ToBytes(v.input)));
        return v.format === "base64" ? digest.toString(C.enc.Base64) : digest.toString(C.enc.Hex);
    },
};

// ============================================================
// HMAC
// ============================================================
async function subtleHmac(hash, key, data) {
    const cryptoKey = await crypto.subtle.importKey(
        "raw", utf8ToBytes(key), { name: "HMAC", hash }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
    return new Uint8Array(sig);
}

const hmacTool = {
    id: "hmac",
    name: "HmacHash 值计算",
    category: "value-calc",
    desc: "HMAC-MD5 / SHA-1 / SHA-2",
    fields: [
        { name: "algorithm", label: "算法", type: "select", options: ["MD5", "SHA1", "SHA256", "SHA384", "SHA512"], default: "SHA256" },
        { name: "key", label: "密钥", type: "text", default: "secret" },
        { name: "format", label: "输出格式", type: "select", options: [["hex", "Hex"], ["base64", "Base64"]], default: "hex" },
        { name: "input", label: "消息", type: "textarea", default: "Magic Tools" },
    ],
    async run(v) {
        if (v.algorithm === "MD5") {
            const sig = C.HmacMD5(wa(utf8ToBytes(v.input)), wa(utf8ToBytes(v.key)));
            return v.format === "base64" ? sig.toString(C.enc.Base64) : sig.toString(C.enc.Hex);
        }
        const map = { SHA1: "SHA-1", SHA256: "SHA-256", SHA384: "SHA-384", SHA512: "SHA-512" };
        const bytes = await subtleHmac(map[v.algorithm], v.key, utf8ToBytes(v.input));
        return outFormat(bytes, v.format);
    },
};

// ============================================================
// SHA3 / Keccak
// ============================================================
const sha3Tool = {
    id: "sha3",
    name: "SHA3 Hash 值计算",
    category: "value-calc",
    desc: "NIST SHA-3（FIPS 202）",
    fields: [
        {
            name: "algorithm", label: "算法", type: "select",
            options: ["sha3_224", "sha3_256", "sha3_384", "sha3_512"], default: "sha3_256",
        },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        return S[v.algorithm](v.input);
    },
};

const keccakTool = {
    id: "keccak",
    name: "Keccak Hash 值计算",
    category: "value-calc",
    desc: "原始 Keccak（以太坊使用 keccak256）",
    fields: [
        {
            name: "algorithm", label: "算法", type: "select",
            options: ["keccak224", "keccak256", "keccak384", "keccak512"], default: "keccak256",
        },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        return S[v.algorithm](v.input);
    },
};

// ============================================================
// KMAC
// ============================================================
const kmacTool = {
    id: "kmac",
    name: "KMAC 计算",
    category: "value-calc",
    desc: "SP 800-185 KMAC128 / KMAC256",
    fields: [
        { name: "algorithm", label: "算法", type: "select", options: ["kmac128", "kmac256"], default: "kmac128" },
        { name: "key", label: "密钥", type: "text", default: "secret" },
        { name: "outputBits", label: "输出位长", type: "number", default: 256 },
        { name: "custom", label: "自定义字符串 (S)", type: "text", default: "" },
        { name: "input", label: "消息", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const bits = parseInt(v.outputBits, 10) || 256;
        return S[v.algorithm](v.key, v.input, bits, v.custom || "");
    },
};

// ============================================================
// CMAC (AES-128)
// ============================================================
const RB = 0x87;

function xorBlock(a, b) {
    const out = new Uint8Array(16);
    for (let i = 0; i < 16; i++) out[i] = a[i] ^ b[i];
    return out;
}

function leftShiftBlock(block) {
    const out = new Uint8Array(16);
    let carry = 0;
    for (let i = 15; i >= 0; i--) {
        out[i] = ((block[i] << 1) | carry) & 0xff;
        carry = (block[i] & 0x80) ? 1 : 0;
    }
    return { out, overflow: carry };
}

function aesEcbBlock(keyBytes, blockBytes) {
    const key = C.enc.Hex.parse(bytesToHex(keyBytes));
    const msg = C.enc.Hex.parse(bytesToHex(blockBytes));
    const encrypted = C.AES.encrypt(msg, key, {
        mode: C.mode.ECB,
        padding: C.pad.NoPadding,
    });
    return hexToBytes(encrypted.ciphertext.toString(C.enc.Hex));
}

function aesCmac(keyBytes, message) {
    if (![16, 24, 32].includes(keyBytes.length)) throw new Error("AES 密钥长度必须为 16/24/32 字节");
    const L = aesEcbBlock(keyBytes, new Uint8Array(16));
    const k1raw = leftShiftBlock(L);
    const K1 = k1raw.overflow ? (() => { const t = k1raw.out.slice(); t[15] ^= RB; return t; })() : k1raw.out;
    const k2raw = leftShiftBlock(K1);
    const K2 = k2raw.overflow ? (() => { const t = k2raw.out.slice(); t[15] ^= RB; return t; })() : k2raw.out;

    const n = Math.ceil(message.length / 16) || 1;
    const lastComplete = message.length > 0 && message.length % 16 === 0;
    let lastBlock = new Uint8Array(16);
    if (lastComplete) {
        lastBlock = xorBlock(message.slice((n - 1) * 16, n * 16), K1);
    } else {
        const rem = message.slice((n - 1) * 16);
        lastBlock = new Uint8Array(16);
        lastBlock.set(rem);
        lastBlock[rem.length] = 0x80;
        lastBlock = xorBlock(lastBlock, K2);
    }

    let x = new Uint8Array(16);
    for (let i = 0; i < n - 1; i++) {
        x = aesEcbBlock(keyBytes, xorBlock(x, message.slice(i * 16, i * 16 + 16)));
    }
    return aesEcbBlock(keyBytes, xorBlock(x, lastBlock));
}

const cmacTool = {
    id: "cmac",
    name: "CMAC 计算",
    category: "value-calc",
    desc: "基于 AES 的消息认证码（RFC 4493）",
    fields: [
        { name: "keyFormat", label: "密钥格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "utf8" },
        { name: "key", label: "密钥", type: "text", default: "0123456789abcdef" },
        { name: "inputFormat", label: "消息格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "utf8" },
        { name: "input", label: "消息", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const key = inputToBytes(v.key, v.keyFormat);
        const msg = inputToBytes(v.input, v.inputFormat);
        return bytesToHex(aesCmac(key, msg));
    },
};

// ============================================================
// CRC 校验
// ============================================================
// [name, width, poly, init, xorout, refin, refout]
const CRC_VARIANTS = {
    "CRC-8": [8, 0x07, 0x00, 0x00, false, false],
    "CRC-8/MAXIM": [8, 0x31, 0x00, 0x00, true, true],
    "CRC-16/ARC": [16, 0x8005, 0x0000, 0x0000, true, true],
    "CRC-16/CCITT-FALSE": [16, 0x1021, 0xffff, 0x0000, false, false],
    "CRC-16/XMODEM": [16, 0x1021, 0x0000, 0x0000, false, false],
    "CRC-16/MODBUS": [16, 0x8005, 0xffff, 0x0000, true, true],
    "CRC-16/USB": [16, 0x8005, 0xffff, 0xffff, true, true],
    "CRC-32": [32, 0x04c11db7, 0xffffffff, 0xffffffff, true, true],
    "CRC-32/MPEG-2": [32, 0x04c11db7, 0xffffffff, 0x00000000, false, false],
    "CRC-32C": [32, 0x1edc6f41, 0xffffffff, 0xffffffff, true, true],
};

const crcTool = {
    id: "crc",
    name: "CRC 校验",
    category: "value-calc",
    desc: "CRC-8 / CRC-16 / CRC-32 多种参数",
    fields: [
        { name: "variant", label: "参数模型", type: "select", options: Object.keys(CRC_VARIANTS), default: "CRC-32" },
        { name: "inputFormat", label: "输入格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"], ["base64", "Base64"]], default: "utf8" },
        { name: "input", label: "输入", type: "textarea", default: "123456789" },
    ],
    run(v) {
        const [width, poly, init, xorout, refin, refout] = CRC_VARIANTS[v.variant];
        const bytes = inputToBytes(v.input, v.inputFormat);
        const value = crcReflected(bytes, width, poly, init, xorout, refin, refout);
        const hexWidth = width / 4;
        const unsigned = value >>> 0;
        return {
            Dec: String(unsigned),
            Hex: "0x" + unsigned.toString(16).padStart(hexWidth, "0").toUpperCase(),
        };
    },
};

// ============================================================
// BCC / LRC 校验
// ============================================================
const bccTool = {
    id: "bcc",
    name: "BCC 校验",
    category: "value-calc",
    desc: "逐字节异或校验",
    fields: [
        { name: "inputFormat", label: "输入格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "hex" },
        { name: "input", label: "输入", type: "textarea", default: "01 02 03 04" },
    ],
    run(v) {
        const bytes = inputToBytes(v.input, v.inputFormat);
        let bcc = 0;
        for (const b of bytes) bcc ^= b;
        return { Hex: "0x" + bcc.toString(16).padStart(2, "0").toUpperCase(), Dec: String(bcc) };
    },
};

const lrcTool = {
    id: "lrc",
    name: "LRC 校验",
    category: "value-calc",
    desc: "纵向冗余校验（补码和）",
    fields: [
        { name: "inputFormat", label: "输入格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "hex" },
        { name: "input", label: "输入", type: "textarea", default: "01 02 03 04" },
    ],
    run(v) {
        const bytes = inputToBytes(v.input, v.inputFormat);
        let sum = 0;
        for (const b of bytes) sum = (sum + b) & 0xff;
        const lrc = (256 - sum) & 0xff;
        return { Hex: "0x" + lrc.toString(16).padStart(2, "0").toUpperCase(), Dec: String(lrc) };
    },
};

// ============================================================
// 原码 / 反码 / 补码
// ============================================================
const complementTool = {
    id: "complement",
    name: "原码/反码/补码计算",
    category: "value-calc",
    desc: "整数的机器表示",
    fields: [
        { name: "value", label: "整数", type: "text", default: "-5" },
        { name: "bits", label: "位宽", type: "number", default: 8 },
    ],
    run(v) {
        const bits = Math.max(2, parseInt(v.bits, 10));
        let n = BigInt(v.value.trim());
        const mask = (1n << BigInt(bits)) - 1n;
        const negative = n < 0n;
        const abs = negative ? -n : n;
        if (abs > (1n << BigInt(bits - 1)) - 1n) throw new Error("数值超出该位宽的可表示范围");
        // 原码
        let signMagnitude = abs;
        if (negative) signMagnitude |= 1n << BigInt(bits - 1);
        // 反码
        let onesComplement = negative ? ((~abs) & ((1n << BigInt(bits - 1)) - 1n)) | (1n << BigInt(bits - 1)) : abs;
        // 补码
        const twos = n & mask;
        const fmt = (x) => x.toString(2).padStart(bits, "0");
        return {
            原码: fmt(signMagnitude),
            反码: fmt(onesComplement),
            补码: fmt(twos),
            无符号值: (twos & mask).toString(10),
        };
    },
};

// ============================================================
// HKDF
// ============================================================
const hkdfTool = {
    id: "hkdf",
    name: "HKDF 计算",
    category: "value-calc",
    desc: "基于 HMAC 的密钥派生（RFC 5869）",
    fields: [
        { name: "hash", label: "Hash", type: "select", options: ["SHA-256", "SHA-384", "SHA-512", "SHA-1"], default: "SHA-256" },
        { name: "ikm", label: "IKM (输入密钥材料)", type: "textarea", default: "password" },
        { name: "salt", label: "Salt", type: "text", default: "" },
        { name: "info", label: "Info", type: "text", default: "" },
        { name: "bits", label: "输出位长", type: "number", default: 256 },
    ],
    async run(v) {
        const bits = Math.max(8, parseInt(v.bits, 10) || 256);
        const baseKey = await crypto.subtle.importKey("raw", utf8ToBytes(v.ikm), "HKDF", false, ["deriveBits"]);
        const out = await crypto.subtle.deriveBits({
            name: "HKDF",
            hash: v.hash,
            salt: utf8ToBytes(v.salt),
            info: utf8ToBytes(v.info),
        }, baseKey, bits);
        return bytesToHex(new Uint8Array(out));
    },
};

// ============================================================
// PBKDF2
// ============================================================
const pbkdf2Tool = {
    id: "pbkdf2",
    name: "PBKDF2 值计算",
    category: "value-calc",
    desc: "基于口令的密钥派生",
    fields: [
        { name: "hash", label: "Hash", type: "select", options: ["SHA1", "SHA256", "SHA512"], default: "SHA256" },
        { name: "password", label: "口令", type: "text", default: "password" },
        { name: "salt", label: "Salt", type: "text", default: "salt" },
        { name: "iterations", label: "迭代次数", type: "number", default: 10000 },
        { name: "bits", label: "输出位长", type: "number", default: 256 },
    ],
    run(v) {
        const hasher = { SHA1: C.algo.SHA1, SHA256: C.algo.SHA256, SHA512: C.algo.SHA512 }[v.hash];
        const bits = Math.max(8, parseInt(v.bits, 10) || 256);
        const derived = C.PBKDF2(wa(utf8ToBytes(v.password)), wa(utf8ToBytes(v.salt)), {
            keySize: bits / 32,
            iterations: Math.max(1, parseInt(v.iterations, 10) || 1),
            hasher,
        });
        return derived.toString(C.enc.Hex);
    },
};

// ============================================================
// BCrypt
// ============================================================
const bcryptTool = {
    id: "bcrypt",
    name: "BCrypt",
    category: "value-calc",
    desc: "BCrypt 哈希 / 校验",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["hash", "生成哈希"], ["verify", "校验"]], default: "hash" },
        { name: "password", label: "口令", type: "text", default: "password" },
        { name: "rounds", label: "Rounds(生成)", type: "number", default: 10 },
        { name: "hash", label: "哈希(校验)", type: "text", default: "" },
    ],
    run(v) {
        const bcrypt = window.dcodeIO?.bcrypt;
        if (!bcrypt) throw new Error("BCrypt 库未加载");
        if (v.mode === "hash") {
            return bcrypt.hashSync(v.password, Math.min(15, Math.max(4, parseInt(v.rounds, 10) || 10)));
        }
        return bcrypt.compareSync(v.password, v.hash) ? "校验通过 ✓" : "校验失败 ✗";
    },
};

// ============================================================
// Scrypt
// ============================================================
const scryptTool = {
    id: "scrypt",
    name: "Scrypt",
    category: "value-calc",
    desc: "scrypt KDF",
    fields: [
        { name: "password", label: "口令", type: "text", default: "password" },
        { name: "salt", label: "Salt", type: "text", default: "salt" },
        { name: "n", label: "N (CPU/内存代价)", type: "number", default: 16384 },
        { name: "r", label: "r (块大小)", type: "number", default: 8 },
        { name: "p", label: "p (并行度)", type: "number", default: 1 },
        { name: "dkLen", label: "输出字节数", type: "number", default: 32 },
    ],
    async run(v) {
        const lib = window.scrypt;
        if (!lib) throw new Error("scrypt 库未加载");
        const bytes = await lib.scrypt(
            utf8ToBytes(v.password), utf8ToBytes(v.salt),
            parseInt(v.n, 10), parseInt(v.r, 10), parseInt(v.p, 10), parseInt(v.dkLen, 10)
        );
        return bytesToHex(bytes);
    },
};

// ============================================================
// PPI 计算
// ============================================================
const ppiTool = {
    id: "ppi",
    name: "PPI计算",
    category: "value-calc",
    desc: "由分辨率与对角线尺寸计算像素密度",
    fields: [
        { name: "width", label: "横向像素", type: "number", default: 1920 },
        { name: "height", label: "纵向像素", type: "number", default: 1080 },
        { name: "diagonal", label: "对角线(英寸)", type: "number", default: 24 },
    ],
    run(v) {
        const w = Number(v.width), h = Number(v.height), d = Number(v.diagonal);
        if (d <= 0) throw new Error("对角线尺寸必须大于 0");
        const ppi = Math.sqrt(w * w + h * h) / d;
        const dotPitch = d * 25.4 / Math.sqrt(w * w + h * h);
        return {
            PPI: ppi.toFixed(2),
            点距mm: dotPitch.toFixed(4),
            总像素: String(w * h),
        };
    },
};

export default [
    hashTool,
    hmacTool,
    sha3Tool,
    keccakTool,
    kmacTool,
    cmacTool,
    crcTool,
    bccTool,
    lrcTool,
    complementTool,
    hkdfTool,
    pbkdf2Tool,
    bcryptTool,
    scryptTool,
    ppiTool,
];
