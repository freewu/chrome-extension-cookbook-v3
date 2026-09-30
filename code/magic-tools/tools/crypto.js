// 加解密工具集
import { Blowfish } from "../lib/blowfish.mjs";
import {
    utf8ToBytes,
    bytesToUtf8,
    bytesToHex,
    hexToBytes,
    bytesToBase64,
    base64ToBytes,
    inputToBytes,
    bytesToLatin1,
    latin1ToBytes,
} from "../js/utils.js";

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

const aesTool = {
    id: "aes",
    name: "AES 加解密",
    category: "crypto",
    desc: "AES-128/192/256，CBC/ECB/CFB/OFB/CTR",
    fields: symmetricFields(),
    run: (v) => runCryptoJs(C.AES, v, { keySizes: [16, 24, 32] }),
};

const desTool = {
    id: "des",
    name: "DES 加解密",
    category: "crypto",
    desc: "DES 对称加密",
    fields: symmetricFields(),
    run: (v) => runCryptoJs(C.DES, v),
};

const tripleDesTool = {
    id: "3des",
    name: "3DES 加解密",
    category: "crypto",
    desc: "Triple DES (3DES)",
    fields: symmetricFields(),
    run: (v) => runCryptoJs(C.TripleDES, v),
};

const rc4Tool = {
    id: "rc4",
    name: "RC4 加解密",
    category: "crypto",
    desc: "RC4 流密码",
    fields: symmetricFields({ noMode: true, noIv: true }),
    run: (v) => runCryptoJs(C.RC4, v, { noMode: true, noIv: true }),
};

const rabbitTool = {
    id: "rabbit",
    name: "Rabbit 加解密",
    category: "crypto",
    desc: "Rabbit 流密码",
    fields: symmetricFields({ noMode: true }),
    run: (v) => runCryptoJs(C.Rabbit, v, { noMode: true }),
};

// ============================================================
// Blowfish
// ============================================================
const blowfishTool = {
    id: "blowfish",
    name: "Blowfish 加解密",
    category: "crypto",
    desc: "Blowfish (ECB/CBC)",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "cipherMode", label: "分组模式", type: "select", options: ["ECB", "CBC"], default: "ECB" },
        { name: "key", label: "密钥", type: "text", default: "secret-key" },
        { name: "iv", label: "IV (CBC, 8 字节)", type: "text", default: "12345678" },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "inputFormat", label: "密文输入格式(解密)", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const mode = v.cipherMode === "CBC" ? Blowfish.MODE.CBC : Blowfish.MODE.ECB;
        const bf = new Blowfish(v.key, mode, Blowfish.PADDING.PKCS5);
        if (mode === Blowfish.MODE.CBC) {
            bf.setIv(latin1ToBytes(v.iv.padEnd(8, "\0").slice(0, 8)));
        }
        if (v.mode === "encrypt") {
            const out = bf.encode(utf8ToBytes(v.input));
            return v.outputFormat === "hex" ? bytesToHex(out) : bytesToBase64(out);
        }
        const data = v.inputFormat === "hex" ? hexToBytes(v.input) : base64ToBytes(v.input.trim());
        return bytesToUtf8(bf.decode(data, Blowfish.TYPE.UINT8_ARRAY));
    },
};

// ============================================================
// SM2 / SM4 / SM9
// ============================================================
const sm2Tool = {
    id: "sm2",
    name: "SM2 加解密",
    category: "crypto",
    desc: "国密 SM2 非对称加密",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"], ["keygen", "生成密钥对"]], default: "keygen" },
        { name: "cipherMode", label: "密文格式", type: "select", options: [["1", "C1C3C2"], ["0", "C1C2C3"]], default: "1" },
        { name: "publicKey", label: "公钥(Hex)", type: "textarea", default: "" },
        { name: "privateKey", label: "私钥(Hex)", type: "textarea", default: "" },
        { name: "input", label: "明文/密文", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const sm2 = window.sm2;
        if (!sm2) throw new Error("sm-crypto 未加载");
        if (v.mode === "keygen") {
            const kp = sm2.generateKeyPairHex();
            return { 公钥: kp.publicKey, 私钥: kp.privateKey };
        }
        if (v.mode === "encrypt") {
            if (!v.publicKey.trim()) throw new Error("请填写公钥");
            return sm2.doEncrypt(v.input, v.publicKey.trim(), parseInt(v.cipherMode, 10));
        }
        if (!v.privateKey.trim()) throw new Error("请填写私钥");
        return sm2.doDecrypt(v.input.trim(), v.privateKey.trim(), parseInt(v.cipherMode, 10));
    },
};

const sm4Tool = {
    id: "sm4",
    name: "SM4 加解密",
    category: "crypto",
    desc: "国密 SM4 对称加密",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "keyFormat", label: "密钥格式", type: "select", options: [["hex", "Hex"], ["utf8", "文本"]], default: "hex" },
        { name: "key", label: "密钥 (16 字节)", type: "text", default: "0123456789abcdeffedcba9876543210" },
        { name: "iv", label: "IV (CBC, 16 字节 Hex)", type: "text", default: "00000000000000000000000000000000" },
        { name: "cipherMode", label: "分组模式", type: "select", options: [["ecb", "ECB"], ["cbc", "CBC"]], default: "ecb" },
        { name: "outputFormat", label: "输出格式", type: "select", options: [["hex", "Hex"], ["base64", "Base64"]], default: "hex" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const sm4 = window.sm4;
        if (!sm4) throw new Error("sm-crypto 未加载");
        const key = v.keyFormat === "hex" ? v.key : bytesToHex(utf8ToBytes(v.key));
        if (v.mode === "encrypt") {
            const out = sm4.encrypt(v.input, key, { mode: v.cipherMode, iv: v.iv });
            return v.outputFormat === "base64"
                ? bytesToBase64(hexToBytes(out))
                : out;
        }
        const cipherHex = v.outputFormat === "hex" ? v.input.trim() : bytesToHex(base64ToBytes(v.input.trim()));
        return sm4.decrypt(cipherHex, key, { mode: v.cipherMode, iv: v.iv });
    },
};

const sm9Tool = {
    id: "sm9",
    name: "SM9 加解密",
    category: "crypto",
    desc: "国密 SM9（标识密码，暂未内置完整实现）",
    fields: [
        { name: "input", label: "输入", type: "textarea", default: "" },
    ],
    run() {
        throw new Error("SM9 属于标识密码体系，实现较为复杂，本示例暂未内置。可参考 sm-crypto / GmSSL 的 SM9 实现。");
    },
};

// ============================================================
// RSA（JSEncrypt）
// ============================================================
const rsaTool = {
    id: "rsa",
    name: "RSA 加解密",
    category: "crypto",
    desc: "RSA 加密/解密/签名/验签/生成密钥",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"], ["sign", "签名"], ["verify", "验签"], ["keygen", "生成密钥对"], ["keygen2048", "生成密钥对(2048)"]], default: "keygen" },
        { name: "publicKey", label: "公钥 (PEM)", type: "textarea", default: "" },
        { name: "privateKey", label: "私钥 (PEM)", type: "textarea", default: "" },
        { name: "signature", label: "签名(Base64, 验签用)", type: "text", default: "" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    async run(v) {
        const JSEncrypt = window.JSEncrypt;
        if (!JSEncrypt) throw new Error("JSEncrypt 未加载");
        if (v.mode === "keygen" || v.mode === "keygen2048") {
            const bits = v.mode === "keygen2048" ? 2048 : 1024;
            return await new Promise((resolve, reject) => {
                const enc = new JSEncrypt({ default_key_size: bits });
                // 注意：jsencrypt 的 getKey 回调不带参数，密钥会写入实例内部
                enc.getKey(() => {
                    const publicKey = enc.getPublicKey();
                    const privateKey = enc.getPrivateKey();
                    if (!publicKey || !privateKey) return reject(new Error("密钥生成失败"));
                    resolve({ 公钥: publicKey, 私钥: privateKey });
                });
            });
        }
        const enc = new JSEncrypt();
        if (v.mode === "encrypt") {
            enc.setPublicKey(v.publicKey.trim());
            const out = enc.encrypt(v.input);
            if (out === false) throw new Error("加密失败，请检查公钥");
            return out;
        }
        if (v.mode === "decrypt") {
            enc.setPrivateKey(v.privateKey.trim());
            const out = enc.decrypt(v.input.trim());
            if (out === false) throw new Error("解密失败，请检查私钥或密文");
            return out;
        }
        if (v.mode === "sign") {
            enc.setPrivateKey(v.privateKey.trim());
            const sig = enc.sign(v.input, window.CryptoJS.SHA256, "sha256");
            if (sig === false) throw new Error("签名失败");
            return sig;
        }
        enc.setPublicKey(v.publicKey.trim());
        return enc.verify(v.input, v.signature.trim(), window.CryptoJS.SHA256) ? "验签通过 ✓" : "验签失败 ✗";
    },
};

// ============================================================
// 古典密码
// ============================================================
const caesarTool = {
    id: "caesar",
    name: "凯撒加解密",
    category: "crypto",
    desc: "移位替换密码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "shift", label: "位移", type: "number", default: 3 },
        { name: "input", label: "输入", type: "textarea", default: "Hello World" },
    ],
    run(v) {
        let s = ((parseInt(v.shift, 10) % 26) + 26) % 26;
        if (v.mode === "decrypt") s = (26 - s) % 26;
        return v.input.replace(/[a-zA-Z]/g, (ch) => {
            const base = ch <= "Z" ? 65 : 97;
            return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
        });
    },
};

const vigenereTool = {
    id: "vigenere",
    name: "维吉尼亚加解密",
    category: "crypto",
    desc: "多表替换密码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "key", label: "密钥(字母)", type: "text", default: "KEY" },
        { name: "input", label: "输入", type: "textarea", default: "Hello World" },
    ],
    run(v) {
        const key = v.key.replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (!key) throw new Error("密钥不能为空");
        let ki = 0;
        return v.input.replace(/[a-zA-Z]/g, (ch) => {
            const base = ch <= "Z" ? 65 : 97;
            const shift = key.charCodeAt(ki % key.length) - 65;
            ki++;
            const delta = v.mode === "encrypt" ? shift : -shift;
            return String.fromCharCode(((ch.charCodeAt(0) - base + delta + 26) % 26) + base);
        });
    },
};

const railFenceTool = {
    id: "rail-fence",
    name: "栅栏加解密",
    category: "crypto",
    desc: "栅栏（W 型）换位密码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "rails", label: "栏数", type: "number", default: 3 },
        { name: "input", label: "输入", type: "textarea", default: "Hello World" },
    ],
    run(v) {
        const rails = Math.max(2, parseInt(v.rails, 10));
        const text = v.input;
        if (v.mode === "encrypt") {
            const rows = Array.from({ length: rails }, () => []);
            let rail = 0, dir = 1;
            for (const ch of text) {
                rows[rail].push(ch);
                if (rail === 0) dir = 1;
                else if (rail === rails - 1) dir = -1;
                rail += dir;
            }
            return rows.map((r) => r.join("")).join("");
        }
        const len = text.length;
        const pattern = [];
        let rail = 0, dir = 1;
        for (let i = 0; i < len; i++) {
            pattern.push(rail);
            if (rail === 0) dir = 1;
            else if (rail === rails - 1) dir = -1;
            rail += dir;
        }
        const counts = Array(rails).fill(0);
        pattern.forEach((r) => counts[r]++);
        const rows = [];
        let idx = 0;
        for (let r = 0; r < rails; r++) {
            rows.push(text.slice(idx, idx + counts[r]).split(""));
            idx += counts[r];
        }
        const pos = Array(rails).fill(0);
        let out = "";
        for (const r of pattern) out += rows[r][pos[r]++];
        return out;
    },
};

const hillTool = {
    id: "hill",
    name: "希尔加解密",
    category: "crypto",
    desc: "Hill 矩阵密码（2x2 / 3x3）",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "size", label: "矩阵阶数", type: "select", options: [["2", "2x2"], ["3", "3x3"]], default: "2" },
        { name: "key", label: "密钥矩阵(行优先, 空格分隔)", type: "text", default: "3 3 2 5" },
        { name: "input", label: "输入(字母)", type: "textarea", default: "HELP" },
    ],
    run(v) {
        const n = parseInt(v.size, 10);
        const nums = v.key.trim().split(/\s+/).map(Number);
        if (nums.length !== n * n) throw new Error(`密钥需要 ${n * n} 个数字`);
        let m = [];
        for (let i = 0; i < n; i++) m.push(nums.slice(i * n, i * n + n));

        const mod = (x, p = 26) => ((x % p) + p) % p;
        const det = (mat) => {
            if (n === 2) return mod(mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0]);
            return mod(
                mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
                mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
                mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0])
            );
        };
        const modInverse = (a) => {
            a = mod(a);
            for (let x = 1; x < 26; x++) if (mod(a * x) === 1) return x;
            throw new Error("密钥矩阵不可逆（行列式与 26 不互质）");
        };
        let use = m.map((r) => r.slice());
        if (v.mode === "decrypt") {
            const d = det(m);
            const inv = modInverse(d);
            if (n === 2) {
                use = [
                    [mod(m[1][1] * inv), mod(-m[0][1] * inv)],
                    [mod(-m[1][0] * inv), mod(m[0][0] * inv)],
                ];
            } else {
                const cof = [];
                for (let i = 0; i < 3; i++) {
                    cof.push([]);
                    for (let j = 0; j < 3; j++) {
                        const sub = m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
                        const minor = sub[0][0] * sub[1][1] - sub[0][1] * sub[1][0];
                        cof[i].push(mod(((i + j) % 2 ? -1 : 1) * minor));
                    }
                }
                use = [];
                for (let i = 0; i < 3; i++) {
                    use.push([]);
                    for (let j = 0; j < 3; j++) use[i].push(mod(cof[j][i] * inv));
                }
            }
        }

        const letters = v.input.toUpperCase().replace(/[^A-Z]/g, "");
        const padded = letters.padEnd(Math.ceil(letters.length / n) * n, "X");
        let out = "";
        for (let i = 0; i < padded.length; i += n) {
            const vec = [];
            for (let j = 0; j < n; j++) vec.push(padded.charCodeAt(i + j) - 65);
            for (let r = 0; r < n; r++) {
                let sum = 0;
                for (let k = 0; k < n; k++) sum += use[r][k] * vec[k];
                out += String.fromCharCode(mod(sum) + 65);
            }
        }
        return out;
    },
};

const ciscoType7Tool = {
    id: "cisco-type7",
    name: "Cisco Type 7",
    category: "crypto",
    desc: "Cisco Type 7 口令（可逆混淆）",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "input", label: "输入", type: "textarea", default: "password" },
    ],
    run(v) {
        const KEY = "dsfd;kfoA,.iyewrkldJKDHSUB";
        if (v.mode === "encrypt") {
            const plain = v.input;
            const seed = Math.floor(Math.random() * 15) + 1;
            let out = String(seed).padStart(2, "0");
            for (let i = 0; i < plain.length; i++) {
                const x = plain.charCodeAt(i) ^ KEY.charCodeAt((seed + i) % KEY.length);
                out += x.toString(16).padStart(2, "0");
            }
            return out.toUpperCase();
        }
        const hex = v.input.replace(/\s+/g, "");
        const seed = parseInt(hex.slice(0, 2), 10);
        let out = "";
        for (let i = 2; i + 1 < hex.length; i += 2) {
            const x = parseInt(hex.slice(i, i + 2), 16) ^ KEY.charCodeAt((seed + (i - 2) / 2) % KEY.length);
            out += String.fromCharCode(x);
        }
        return out;
    },
};

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

function teaEncryptBlock(v0, v1, k, rounds = 32) {
    let sum = 0;
    for (let i = 0; i < rounds; i++) {
        sum = (sum + DELTA) >>> 0;
        v0 = (v0 + ((((v1 << 4) >>> 0) + k[0]) ^ ((v1 + sum) >>> 0) ^ (((v1 >>> 5) + k[1]) >>> 0))) >>> 0;
        v1 = (v1 + ((((v0 << 4) >>> 0) + k[2]) ^ ((v0 + sum) >>> 0) ^ (((v0 >>> 5) + k[3]) >>> 0))) >>> 0;
    }
    return [v0, v1];
}

function teaDecryptBlock(v0, v1, k, rounds = 32) {
    let sum = (DELTA * rounds) >>> 0;
    for (let i = 0; i < rounds; i++) {
        v1 = (v1 - ((((v0 << 4) >>> 0) + k[2]) ^ ((v0 + sum) >>> 0) ^ (((v0 >>> 5) + k[3]) >>> 0))) >>> 0;
        v0 = (v0 - ((((v1 << 4) >>> 0) + k[0]) ^ ((v1 + sum) >>> 0) ^ (((v1 >>> 5) + k[1]) >>> 0))) >>> 0;
        sum = (sum - DELTA) >>> 0;
    }
    return [v0, v1];
}

function xteaEncryptBlock(v0, v1, k, rounds = 32) {
    let sum = 0;
    for (let i = 0; i < rounds; i++) {
        v0 = (v0 + (((((v1 << 4) >>> 0) ^ (v1 >>> 5)) + v1) ^ (sum + k[sum & 3]))) >>> 0;
        sum = (sum + DELTA) >>> 0;
        v1 = (v1 + (((((v0 << 4) >>> 0) ^ (v0 >>> 5)) + v0) ^ (sum + k[(sum >>> 11) & 3]))) >>> 0;
    }
    return [v0, v1];
}

function xteaDecryptBlock(v0, v1, k, rounds = 32) {
    let sum = (DELTA * rounds) >>> 0;
    for (let i = 0; i < rounds; i++) {
        v1 = (v1 - (((((v0 << 4) >>> 0) ^ (v0 >>> 5)) + v0) ^ (sum + k[(sum >>> 11) & 3]))) >>> 0;
        sum = (sum - DELTA) >>> 0;
        v0 = (v0 - (((((v1 << 4) >>> 0) ^ (v1 >>> 5)) + v1) ^ (sum + k[sum & 3]))) >>> 0;
    }
    return [v0, v1];
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

const teaTool = blockCipherTool("tea", "TEA 加解密", "Tiny Encryption Algorithm", teaEncryptBlock, teaDecryptBlock, 16);
const xteaTool = blockCipherTool("xtea", "XTEA 加解密", "eXtended TEA", xteaEncryptBlock, xteaDecryptBlock, 16);

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

export default [
    aesTool,
    desTool,
    tripleDesTool,
    rc4Tool,
    rabbitTool,
    blowfishTool,
    sm2Tool,
    sm4Tool,
    sm9Tool,
    rsaTool,
    caesarTool,
    vigenereTool,
    railFenceTool,
    hillTool,
    ciscoType7Tool,
    teaTool,
    xteaTool,
    xxteaTool,
    rc5Tool,
    rc6Tool,
    rc2Tool,
    chacha20Tool,
];
