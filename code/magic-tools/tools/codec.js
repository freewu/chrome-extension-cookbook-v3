// 编解码工具集
import {
    utf8ToBytes,
    bytesToUtf8,
    bytesToHex,
    hexToBytes,
    bytesToBase64,
    base64ToBytes,
    bytesToBaseX,
    baseXToBytes,
    latin1ToBytes,
    bytesToLatin1,
} from "../js/utils.js";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const XXENCODE = "+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// ---------- Base64 ----------
const base64Tool = {
    id: "base64",
    name: "Base64 编解码",
    category: "codec",
    desc: "支持 UTF-8 文本、URL 安全字符",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "urlSafe", label: "URL 安全 (-_ 且无填充)", type: "checkbox", default: false },
        { name: "input", label: "输入", type: "textarea", default: "Hello, Magic Tools!" },
    ],
    run(v) {
        if (v.mode === "encode") {
            let b64 = bytesToBase64(utf8ToBytes(v.input));
            if (v.urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            return b64;
        }
        let b64 = v.input.trim().replace(/-/g, "+").replace(/_/g, "/");
        while (b64.length % 4) b64 += "=";
        return bytesToUtf8(base64ToBytes(b64));
    },
};

// ---------- Base58 ----------
const base58Tool = {
    id: "base58",
    name: "Base58 编解码",
    category: "codec",
    desc: "比特币字母表",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "Hello" },
    ],
    run(v) {
        if (v.mode === "encode") return bytesToBaseX(utf8ToBytes(v.input), BASE58);
        return bytesToUtf8(baseXToBytes(v.input.trim(), BASE58));
    },
};

// ---------- BaseX ----------
const baseXTool = {
    id: "basex",
    name: "BaseX 编解码",
    category: "codec",
    desc: "自定义字母表的任意进制转换",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "alphabet", label: "字母表", type: "text", default: "0123456789abcdef" },
        { name: "input", label: "输入", type: "textarea", default: "Hi" },
    ],
    run(v) {
        const alphabet = v.alphabet;
        if (new Set(alphabet).size !== alphabet.length) throw new Error("字母表存在重复字符");
        if (v.mode === "encode") return bytesToBaseX(utf8ToBytes(v.input), alphabet);
        return bytesToUtf8(baseXToBytes(v.input.trim(), alphabet));
    },
};

// ---------- BCD ----------
const bcdTool = {
    id: "bcd",
    name: "BCD 编解码",
    category: "codec",
    desc: "8421 码，十进制 <-> 十六进制",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码(十进制→BCD)"], ["decode", "解码(BCD→十进制)"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "1234567890" },
    ],
    run(v) {
        if (v.mode === "encode") {
            const digits = v.input.replace(/\D/g, "");
            if (digits.length === 0) return "";
            let hex = digits;
            if (digits.length % 2) hex = "0" + digits;
            return hex.toUpperCase();
        }
        const hex = v.input.replace(/[^0-9a-fA-F]/g, "");
        const digits = hex.split("").map((c) => parseInt(c, 16));
        if (digits.some((d) => d > 9)) throw new Error("BCD 每一位必须 <= 9");
        return digits.join("").replace(/^0+(?=\d)/, "");
    },
};

// ---------- HTTP Basic Auth ----------
const basicAuthTool = {
    id: "basic-auth",
    name: "HTTP Basic Auth 编解码",
    category: "codec",
    desc: "Authorization: Basic base64(user:pass)",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "user", label: "用户名", type: "text", default: "admin" },
        { name: "pass", label: "密码", type: "text", default: "123456" },
        { name: "input", label: "输入(Base64)", type: "textarea", default: "" },
    ],
    run(v) {
        if (v.mode === "encode") {
            return "Basic " + bytesToBase64(utf8ToBytes(`${v.user}:${v.pass}`));
        }
        let b64 = v.input.trim().replace(/^Basic\s+/i, "");
        while (b64.length % 4) b64 += "=";
        return bytesToUtf8(base64ToBytes(b64));
    },
};

// ---------- Gzip ----------
async function gzipBytes(bytes) {
    const cs = new CompressionStream("gzip");
    const stream = new Blob([bytes]).stream().pipeThrough(cs);
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzipBytes(bytes) {
    const ds = new DecompressionStream("gzip");
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

const gzipTool = {
    id: "gzip",
    name: "Gzip 编解码",
    category: "codec",
    desc: "文本 <-> gzip 压缩数据的 Base64/Hex",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["compress", "压缩"], ["decompress", "解压"]], default: "compress" },
        { name: "format", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools for Chrome" },
    ],
    async run(v) {
        if (v.mode === "compress") {
            const out = await gzipBytes(utf8ToBytes(v.input));
            return v.format === "hex" ? bytesToHex(out) : bytesToBase64(out);
        }
        const bytes = v.format === "hex" ? hexToBytes(v.input) : base64ToBytes(v.input);
        return bytesToUtf8(await gunzipBytes(bytes));
    },
};

// ---------- JWT ----------
function b64urlDecode(str) {
    let s = str.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return bytesToUtf8(base64ToBytes(s));
}

const jwtTool = {
    id: "jwt",
    name: "JWT 编解码器",
    category: "codec",
    desc: "解码 JWT 的 Header / Payload（不校验签名）",
    fields: [
        { name: "input", label: "JWT", type: "textarea", default: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" },
    ],
    run(v) {
        const parts = v.input.trim().split(".");
        if (parts.length < 2) throw new Error("JWT 至少需要 header.payload 两部分");
        const header = JSON.stringify(JSON.parse(b64urlDecode(parts[0])), null, 2);
        const payload = JSON.stringify(JSON.parse(b64urlDecode(parts[1])), null, 2);
        const result = { Header: header, Payload: payload };
        if (parts[2] !== undefined) result.Signature = parts[2];
        return result;
    },
};

// ---------- 摩斯码 ----------
const MORSE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
    5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
    "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
    ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
    '"': ".-..-.", "$": "...-..-", "@": ".--.-.",
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

const morseTool = {
    id: "morse",
    name: "摩斯码编解码",
    category: "codec",
    desc: "字母间用空格，单词间用 /",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "文本→摩斯"], ["decode", "摩斯→文本"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "SOS HELLO" },
    ],
    run(v) {
        if (v.mode === "encode") {
            return v.input
                .toUpperCase()
                .split("")
                .map((ch) => (ch === " " ? "/" : MORSE[ch] || ""))
                .filter(Boolean)
                .join(" ");
        }
        return v.input
            .trim()
            .split(/\s+/)
            .map((code) => (code === "/" ? " " : MORSE_REV[code] || ""))
            .join("");
    },
};

// ---------- Punycode (RFC 3492) ----------
const PUNY_BASE = 36, PUNY_TMIN = 1, PUNY_TMAX = 26, PUNY_SKEW = 38, PUNY_DAMP = 700,
    PUNY_INITIAL_BIAS = 72, PUNY_INITIAL_N = 128;

function punyAdapt(delta, numPoints, firstTime) {
    delta = firstTime ? Math.floor(delta / PUNY_DAMP) : delta >> 1;
    delta += Math.floor(delta / numPoints);
    let k = 0;
    while (delta > ((PUNY_BASE - PUNY_TMIN) * PUNY_TMAX) >> 1) {
        delta = Math.floor(delta / (PUNY_BASE - PUNY_TMIN));
        k += PUNY_BASE;
    }
    return k + Math.floor(((PUNY_BASE - PUNY_TMIN + 1) * delta) / (delta + PUNY_SKEW));
}

function punyDigitToChar(d) {
    return String.fromCharCode(d + 22 + 75 * (d < 26 ? 1 : 0));
}
function punyCharToDigit(c) {
    const code = c.charCodeAt(0);
    if (code >= 48 && code <= 57) return code - 22;
    if (code >= 65 && code <= 90) return code - 65;
    if (code >= 97 && code <= 122) return code - 97;
    return PUNY_BASE;
}

function punycodeEncode(input) {
    const output = [];
    const codePoints = [...input].map((c) => c.codePointAt(0));
    let n = PUNY_INITIAL_N, delta = 0, bias = PUNY_INITIAL_BIAS;
    for (const cp of codePoints) if (cp < 128) output.push(cp);
    let h = output.length;
    const b = h;
    if (b > 0) output.push(45);
    while (h < codePoints.length) {
        let m = Infinity;
        for (const cp of codePoints) if (cp >= n && cp < m) m = cp;
        delta += (m - n) * (h + 1);
        n = m;
        for (const cp of codePoints) {
            if (cp < n) delta++;
            if (cp === n) {
                let q = delta;
                for (let k = PUNY_BASE; ; k += PUNY_BASE) {
                    const t = k <= bias ? PUNY_TMIN : k >= bias + PUNY_TMAX ? PUNY_TMAX : k - bias;
                    if (q < t) break;
                    output.push(punyDigitToChar(t + ((q - t) % (PUNY_BASE - t))).charCodeAt(0));
                    q = Math.floor((q - t) / (PUNY_BASE - t));
                }
                output.push(punyDigitToChar(q).charCodeAt(0));
                bias = punyAdapt(delta, h + 1, h === b);
                delta = 0;
                h++;
            }
        }
        delta++;
        n++;
    }
    return String.fromCharCode(...output);
}

function punycodeDecode(input) {
    const output = [];
    const basic = input.lastIndexOf("-");
    for (let j = 0; j < basic; j++) {
        const c = input.charCodeAt(j);
        if (c >= 128) throw new Error("非法 punycode 输入");
        output.push(c);
    }
    let n = PUNY_INITIAL_N, i = 0, bias = PUNY_INITIAL_BIAS;
    let index = basic > 0 ? basic + 1 : 0;
    while (index < input.length) {
        const oldi = i;
        for (let w = 1, k = PUNY_BASE; ; k += PUNY_BASE) {
            if (index >= input.length) throw new Error("非法 punycode 输入");
            const digit = punyCharToDigit(input[index++]);
            if (digit >= PUNY_BASE) throw new Error("非法 punycode 数字");
            i += digit * w;
            const t = k <= bias ? PUNY_TMIN : k >= bias + PUNY_TMAX ? PUNY_TMAX : k - bias;
            if (digit < t) break;
            w *= PUNY_BASE - t;
        }
        bias = punyAdapt(i - oldi, output.length + 1, oldi === 0);
        n += Math.floor(i / (output.length + 1));
        i %= output.length + 1;
        output.splice(i, 0, n);
        i++;
    }
    return String.fromCodePoint(...output);
}

const punycodeTool = {
    id: "punycode",
    name: "Punycode 编解码",
    category: "codec",
    desc: "国际化域名 <-> Punycode (xn--)",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "中文域名.中国" },
    ],
    run(v) {
        if (v.mode === "encode") {
            return v.input
                .split(".")
                .map((label) => (/[^\x00-\x7f]/.test(label) ? "xn--" + punycodeEncode(label) : label))
                .join(".");
        }
        return v.input
            .split(".")
            .map((label) => (label.toLowerCase().startsWith("xn--") ? punycodeDecode(label.slice(4)) : label))
            .join(".");
    },
};

// ---------- URL ----------
const urlTool = {
    id: "url",
    name: "URL 编解码",
    category: "codec",
    desc: "encodeURIComponent / decodeURIComponent",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "component", label: "仅编码 URI 组件（否则保留 :/?#[]@ 等）", type: "checkbox", default: true },
        { name: "input", label: "输入", type: "textarea", default: "https://example.com/?q=中文&a=1" },
    ],
    run(v) {
        if (v.mode === "encode") {
            return v.component ? encodeURIComponent(v.input) : encodeURI(v.input);
        }
        try {
            return v.component ? decodeURIComponent(v.input) : decodeURI(v.input);
        } catch {
            return decodeURI(v.input);
        }
    },
};

// ---------- UUencode ----------
function uuencode(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 45) {
        const chunk = bytes.slice(i, i + 45);
        out += String.fromCharCode(chunk.length + 32);
        for (let j = 0; j < chunk.length; j += 3) {
            const b0 = chunk[j], b1 = chunk[j + 1] ?? 0, b2 = chunk[j + 2] ?? 0;
            const c = [b0 >> 2, ((b0 & 3) << 4) | (b1 >> 4), ((b1 & 15) << 2) | (b2 >> 6), b2 & 63];
            for (const x of c) out += x === 0 ? "`" : String.fromCharCode(x + 32);
        }
        out += "\n";
    }
    out += "`\n";
    return out;
}

function uudecode(text) {
    const lines = text.split(/\r?\n/);
    const out = [];
    for (const line of lines) {
        if (!line || line === "`") continue;
        if (line.startsWith("begin") || line.startsWith("end")) continue;
        const len = line.charCodeAt(0) - 32;
        const data = line.slice(1);
        let count = 0;
        for (let j = 0; j + 3 < data.length; j += 4) {
            const c = [0, 1, 2, 3].map((k) => data.charCodeAt(j + k) - 32);
            const bytes = [
                (c[0] << 2) | (c[1] >> 4),
                ((c[1] & 15) << 4) | (c[2] >> 2),
                ((c[2] & 3) << 6) | c[3],
            ];
            for (const b of bytes) {
                if (count < len) {
                    out.push(b & 0xff);
                    count++;
                }
            }
        }
    }
    return new Uint8Array(out);
}

const uuencodeTool = {
    id: "uuencode",
    name: "UUencode 编解码",
    category: "codec",
    desc: "Unix-to-Unix 编码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "Hello UUencode" },
    ],
    run(v) {
        if (v.mode === "encode") {
            return "begin 644 data.txt\n" + uuencode(utf8ToBytes(v.input));
        }
        return bytesToUtf8(uudecode(v.input));
    },
};

// ---------- XXencode ----------
function xxencode(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i += 45) {
        const chunk = bytes.slice(i, i + 45);
        out += String.fromCharCode(chunk.length + 32);
        for (let j = 0; j < chunk.length; j += 3) {
            const b0 = chunk[j], b1 = chunk[j + 1] ?? 0, b2 = chunk[j + 2] ?? 0;
            const c = [b0 >> 2, ((b0 & 3) << 4) | (b1 >> 4), ((b1 & 15) << 2) | (b2 >> 6), b2 & 63];
            for (const x of c) out += XXENCODE[x];
        }
        out += "\n";
    }
    out += "+\n";
    return out;
}

function xxdecode(text) {
    const lines = text.split(/\r?\n/);
    const out = [];
    for (const line of lines) {
        if (!line || line === "+") continue;
        const len = line.charCodeAt(0) - 32;
        const data = line.slice(1);
        let count = 0;
        for (let j = 0; j + 3 < data.length; j += 4) {
            const c = [0, 1, 2, 3].map((k) => XXENCODE.indexOf(data[j + k]));
            const bytes = [
                (c[0] << 2) | (c[1] >> 4),
                ((c[1] & 15) << 4) | (c[2] >> 2),
                ((c[2] & 3) << 6) | c[3],
            ];
            for (const b of bytes) {
                if (count < len) {
                    out.push(b & 0xff);
                    count++;
                }
            }
        }
    }
    return new Uint8Array(out);
}

const xxencodeTool = {
    id: "xxencode",
    name: "XXencode 编解码",
    category: "codec",
    desc: "XXencode 编码",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "Hello XXencode" },
    ],
    run(v) {
        if (v.mode === "encode") return xxencode(utf8ToBytes(v.input));
        return bytesToUtf8(xxdecode(v.input));
    },
};

// ---------- Unicode ----------
const unicodeTool = {
    id: "unicode",
    name: "Unicode 编解码",
    category: "codec",
    desc: "文本 <-> \\uXXXX 转义",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "你好 ABC 😀" },
    ],
    run(v) {
        if (v.mode === "encode") {
            let out = "";
            for (const ch of v.input) {
                const cp = ch.codePointAt(0);
                if (cp > 0xffff) {
                    const h = Math.floor((cp - 0x10000) / 0x400) + 0xd800;
                    const l = ((cp - 0x10000) % 0x400) + 0xdc00;
                    out += "\\u" + h.toString(16).padStart(4, "0") + "\\u" + l.toString(16).padStart(4, "0");
                } else if (cp > 0x7f) {
                    out += "\\u" + cp.toString(16).padStart(4, "0");
                } else {
                    out += ch;
                }
            }
            return out;
        }
        return v.input.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, a, b) =>
            String.fromCodePoint(parseInt(a || b, 16))
        );
    },
};

export default [
    base64Tool,
    base58Tool,
    baseXTool,
    bcdTool,
    basicAuthTool,
    gzipTool,
    jwtTool,
    morseTool,
    punycodeTool,
    urlTool,
    uuencodeTool,
    xxencodeTool,
    unicodeTool,
];
