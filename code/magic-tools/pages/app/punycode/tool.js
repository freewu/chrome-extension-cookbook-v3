/**
 * Punycode 编解码
 * 目录：pages/app/punycode/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { mountTool } from "../shared/page.js";

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

export default punycodeTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(punycodeTool);
