// 颜色格式互转（HEX / RGB / HSL / HSV / CMYK / LAB / LCH / XYZ / 关键字 / 互补色）
// 公式与 color-convert 保持一致，避免为了颜色转换再引入一个第三方库

// CSS 颜色关键字（147 个标准色）
const KEYWORDS = (
    "aliceblue:f0f8ff,antiquewhite:faebd7,aqua:00ffff,aquamarine:7fffd4,azure:f0ffff,beige:f5f5dc,bisque:ffe4c4," +
    "black:000000,blanchedalmond:ffebcd,blue:0000ff,blueviolet:8a2be2,brown:a52a2a,burlywood:deb887," +
    "cadetblue:5f9ea0,chartreuse:7fff00,chocolate:d2691e,coral:ff7f50,cornflowerblue:6495ed,cornsilk:fff8dc," +
    "crimson:dc143c,cyan:00ffff,darkblue:00008b,darkcyan:008b8b,darkgoldenrod:b8860b,darkgray:a9a9a9," +
    "darkgreen:006400,darkgrey:a9a9a9,darkkhaki:bdb76b,darkmagenta:8b008b,darkolivegreen:556b2f," +
    "darkorange:ff8c00,darkorchid:9932cc,darkred:8b0000,darksalmon:e9967a,darkseagreen:8fbc8f," +
    "darkslateblue:483d8b,darkslategray:2f4f4f,darkslategrey:2f4f4f,darkturquoise:00ced1,darkviolet:9400d3," +
    "deeppink:ff1493,deepskyblue:00bfff,dimgray:696969,dimgrey:696969,dodgerblue:1e90ff,firebrick:b22222," +
    "floralwhite:fffaf0,forestgreen:228b22,fuchsia:ff00ff,gainsboro:dcdcdc,ghostwhite:f8f8ff,gold:ffd700," +
    "goldenrod:daa520,gray:808080,green:008000,greenyellow:adff2f,grey:808080,honeydew:f0fff0,hotpink:ff69b4," +
    "indianred:cd5c5c,indigo:4b0082,ivory:fffff0,khaki:f0e68c,lavender:e6e6fa,lavenderblush:fff0f5," +
    "lawngreen:7cfc00,lemonchiffon:fffacd,lightblue:add8e6,lightcoral:f08080,lightcyan:e0ffff," +
    "lightgoldenrodyellow:fafad2,lightgray:d3d3d3,lightgreen:90ee90,lightgrey:d3d3d3,lightpink:ffb6c1," +
    "lightsalmon:ffa07a,lightseagreen:20b2aa,lightskyblue:87cefa,lightslategray:778899,lightslategrey:778899," +
    "lightsteelblue:b0c4de,lightyellow:ffffe0,lime:00ff00,limegreen:32cd32,linen:faf0e6,magenta:ff00ff," +
    "maroon:800000,mediumaquamarine:66cdaa,mediumblue:0000cd,mediumorchid:ba55d3,mediumpurple:9370db," +
    "mediumseagreen:3cb371,mediumslateblue:7b68ee,mediumspringgreen:00fa9a,mediumturquoise:48d1cc," +
    "mediumvioletred:c71585,midnightblue:191970,mintcream:f5fffa,mistyrose:ffe4e1,moccasin:ffe4b5," +
    "navajowhite:ffdead,navy:000080,oldlace:fdf5e6,olive:808000,olivedrab:6b8e23,orange:ffa500,orangered:ff4500," +
    "orchid:da70d6,palegoldenrod:eee8aa,palegreen:98fb98,paleturquoise:afeeee,palevioletred:db7093," +
    "papayawhip:ffefd5,peachpuff:ffdab9,peru:cd853f,pink:ffc0cb,plum:dda0dd,powderblue:b0e0e6,purple:800080," +
    "rebeccapurple:663399,red:ff0000,rosybrown:bc8f8f,royalblue:4169e1,saddlebrown:8b4513,salmon:fa8072," +
    "sandybrown:f4a460,seagreen:2e8b57,seashell:fff5ee,sienna:a0522d,silver:c0c0c0,skyblue:87ceeb," +
    "slateblue:6a5acd,slategray:708090,slategrey:708090,snow:fffafa,springgreen:00ff7f,steelblue:4682b4," +
    "tan:d2b48c,teal:008080,thistle:d8bfd8,tomato:ff6347,turquoise:40e0d0,violet:ee82ee,wheat:f5deb3," +
    "white:ffffff,whitesmoke:f5f5f5,yellow:ffff00,yellowgreen:9acd32"
)
    .split(",")
    .map((pair) => pair.split(":"));

const HEX_TO_NAME = new Map(KEYWORDS.map(([name, hex]) => [hex, name]));
const NAME_TO_HEX = new Map(KEYWORDS);

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const round = (n, digits = 0) => Number(n.toFixed(digits));

// #RGB / #RRGGBB → [r, g, b]
export function hexToRgb(hex) {
    let s = String(hex).trim().replace(/^#/, "");
    if (s.length === 3) s = s.split("").map((c) => c + c).join("");
    if (!/^[0-9a-fA-F]{6}$/.test(s)) throw new Error(`非法 HEX 颜色：${hex}`);
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

// [r, g, b] → #rrggbb（小写，不带 #）
export function rgbToHex(rgb) {
    return rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
}

// [r, g, b] → [h(0-360), s(0-100), l(0-100)]
export function rgbToHsl([r, g, b]) {
    const [rr, gg, bb] = [r / 255, g / 255, b / 255];
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    const l = (max + min) / 2;
    const d = max - min;
    let h = 0;
    let s = 0;
    if (d !== 0) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rr) h = ((gg - bb) / d) % 6;
        else if (max === gg) h = (bb - rr) / d + 2;
        else h = (rr - gg) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    return [h, s * 100, l * 100];
}

// [h, s, l] → [r, g, b]
export function hslToRgb([h, s, l]) {
    const hh = ((h % 360) + 360) % 360;
    const ss = clamp(s, 0, 100) / 100;
    const ll = clamp(l, 0, 100) / 100;
    const c = (1 - Math.abs(2 * ll - 1)) * ss;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = ll - c / 2;
    const table = [
        [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
    ];
    const [rr, gg, bb] = table[Math.floor(hh / 60) % 6];
    return [(rr + m) * 255, (gg + m) * 255, (bb + m) * 255];
}

// [r, g, b] → [h, s, v]
export function rgbToHsv([r, g, b]) {
    const [rr, gg, bb] = [r / 255, g / 255, b / 255];
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === rr) h = ((gg - bb) / d) % 6;
        else if (max === gg) h = (bb - rr) / d + 2;
        else h = (rr - gg) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
    }
    return [h, max === 0 ? 0 : (d / max) * 100, max * 100];
}

// [h, s, v] → [r, g, b]
export function hsvToRgb([h, s, v]) {
    const hh = ((h % 360) + 360) % 360;
    const ss = clamp(s, 0, 100) / 100;
    const vv = clamp(v, 0, 100) / 100;
    const c = vv * ss;
    const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
    const m = vv - c;
    const table = [
        [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
    ];
    const [rr, gg, bb] = table[Math.floor(hh / 60) % 6];
    return [(rr + m) * 255, (gg + m) * 255, (bb + m) * 255];
}

// [r, g, b] → [c, m, y, k]（0-100）
export function rgbToCmyk([r, g, b]) {
    const [rr, gg, bb] = [r / 255, g / 255, b / 255];
    const k = 1 - Math.max(rr, gg, bb);
    if (k === 1) return [0, 0, 0, 100];
    const f = (v) => ((1 - v - k) / (1 - k)) * 100;
    return [f(rr), f(gg), f(bb), k * 100];
}

// [c, m, y, k] → [r, g, b]
export function cmykToRgb([c, m, y, k]) {
    const cc = clamp(c, 0, 100) / 100;
    const mm = clamp(m, 0, 100) / 100;
    const yy = clamp(y, 0, 100) / 100;
    const kk = clamp(k, 0, 100) / 100;
    return [
        (1 - cc) * (1 - kk) * 255,
        (1 - mm) * (1 - kk) * 255,
        (1 - yy) * (1 - kk) * 255,
    ];
}

// 伽马校正辅助
const pivotRgb = (n) => {
    const v = n / 255;
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
};
const pivotXyz = (n) => {
    const v = n > 0.008856 ? Math.pow(n, 1 / 3) : 7.787 * n + 16 / 116;
    return round(v, 4);
};

// [r, g, b] → [x, y, z]
export function rgbToXyz([r, g, b]) {
    const rr = pivotRgb(r) * 100;
    const gg = pivotRgb(g) * 100;
    const bb = pivotRgb(b) * 100;
    return [
        rr * 0.4124 + gg * 0.3576 + bb * 0.1805,
        rr * 0.2126 + gg * 0.7152 + bb * 0.0722,
        rr * 0.0193 + gg * 0.1192 + bb * 0.9505,
    ];
}

// [x, y, z] → [r, g, b]
export function xyzToRgb([x, y, z]) {
    const xx = x / 100;
    const yy = y / 100;
    const zz = z / 100;
    const inv = (v) => {
        const n = v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v;
        return clamp(n * 255, 0, 255);
    };
    return [
        inv(xx * 3.2406 + yy * -1.5372 + zz * -0.4986),
        inv(xx * -0.9689 + yy * 1.8758 + zz * 0.0415),
        inv(xx * 0.0557 + yy * -0.204 + zz * 1.057),
    ];
}

// [x, y, z] → [l, a, b]
export function xyzToLab([x, y, z]) {
    const l = pivotXyz(x / 95.047);
    const a = pivotXyz(y / 100);
    const b = pivotXyz(z / 108.883);
    return [round(116 * a - 16, 4), round(500 * (l - a), 4), round(200 * (a - b), 4)];
}

// [l, a, b] → [x, y, z]
export function labToXyz([l, a, b]) {
    const y = (l + 16) / 116;
    const x = a / 500 + y;
    const z = y - b / 200;
    const inv = (t) => (Math.pow(t, 3) > 0.008856 ? Math.pow(t, 3) : (t - 16 / 116) / 7.787);
    // D65 标准光源白点
    return [inv(x) * 95.047, inv(y) * 100, inv(z) * 108.883];
}

// [l, a, b] → [l, c, h]
export function labToLch([l, a, b]) {
    const c = Math.sqrt(a * a + b * b);
    let h = Math.atan2(b, a) * (180 / Math.PI);
    if (h < 0) h += 360;
    return [l, c, h];
}

// [l, c, h] → [l, a, b]
export function lchToLab([l, c, h]) {
    const rad = (h * Math.PI) / 180;
    return [l, c * Math.cos(rad), c * Math.sin(rad)];
}

// 十六进制（不带 #）→ 颜色关键字；无匹配返回空串
export function hexToKeyword(hex) {
    return HEX_TO_NAME.get(String(hex).toLowerCase().replace(/^#/, "")) || "";
}

// 关键字 → 十六进制（不带 #）
export function keywordToHex(name) {
    return NAME_TO_HEX.get(String(name).toLowerCase()) || "";
}

// 取互补色（RGB 取反）
export function complementaryRgb(rgb) {
    return rgb.map((v) => 255 - v);
}

export { round };

// 统一入口：把任意输入格式 → 各格式结果
export const FORMATS = ["HEX", "RGB", "HSL", "HSV", "CMYK", "LAB", "LCH", "XYZ", "KEYWORD", "ComplementaryColor"];

// 依据颜色类型解析输入，返回 [r, g, b]
export function parseColor(text, type) {
    const s = String(text ?? "").trim();
    if (s === "") throw new Error("请输入颜色值");
    if (type === "AUTO") {
        const lower = s.toLowerCase();
        if (/^rgba?\(/.test(lower)) type = "RGB";
        else if (/^hsla?\(/.test(lower)) type = "HSL";
        else if (/^hsv\(/.test(lower)) type = "HSV";
        else if (/^cmyk\(/.test(lower)) type = "CMYK";
        else if (/^lab\(/.test(lower)) type = "LAB";
        else if (/^lch\(/.test(lower)) type = "LCH";
        else if (/^xyz\(/.test(lower)) type = "XYZ";
        else if (NAME_TO_HEX.has(lower)) type = "KEYWORD";
        else if (/^#?[0-9a-fA-F]{3}$/.test(s) || /^#?[0-9a-fA-F]{6}$/.test(s)) type = "HEX";
        else if (s.includes(",")) type = s.includes("%") ? "HSL" : "RGB";
        else throw new Error(`无法识别的颜色：${s}`);
    }
    const clean = s.replace(/\s/g, "").replace(/%/g, "");
    const nums = () => {
        const m = clean.match(/-?\d+(?:\.\d+)?/g);
        if (!m) throw new Error(`无法解析颜色：${s}`);
        return m.map(Number);
    };
    switch (type) {
        case "HEX": return hexToRgb(clean.replace(/^#/, ""));
        case "KEYWORD": {
            const hex = keywordToHex(clean);
            if (!hex) throw new Error(`未知颜色关键字：${s}`);
            return hexToRgb(hex);
        }
        case "RGB": {
            const [r, g, b] = nums();
            return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
        }
        case "HSL": {
            const [h, s, l] = nums();
            return hslToRgb([h, s, l]);
        }
        case "HSV": {
            const [h, s, v] = nums();
            return hsvToRgb([h, s, v]);
        }
        case "CMYK": {
            const [c, m, y, k] = nums();
            return cmykToRgb([c, m, y, k]);
        }
        case "LAB": {
            const [l, a, b] = nums();
            return xyzToRgb(labToXyz([l, a, b]));
        }
        case "LCH": {
            const [l, c, h] = nums();
            return xyzToRgb(labToXyz(lchToLab([l, c, h])));
        }
        case "XYZ": {
            const [x, y, z] = nums();
            return xyzToRgb([x, y, z]);
        }
        default: throw new Error(`不支持的颜色格式：${type}`);
    }
}

// 依据颜色类型输出字符串
export function formatColor(rgb, type) {
    const hex = rgbToHex(rgb);
    const r2 = (arr) => arr.map((v) => round(v, 2));
    switch (type) {
        case "HEX": return "#" + hex;
        case "RGB": return `rgb(${r2(rgb).join(", ")})`;
        case "HSL": return `hsl(${r2(rgbToHsl(rgb)).join(", ")})`;
        case "HSV": return `hsv(${r2(rgbToHsv(rgb)).join(", ")})`;
        case "CMYK": return `cmyk(${r2(rgbToCmyk(rgb)).join(", ")})`;
        case "LAB": return `lab(${r2(xyzToLab(rgbToXyz(rgb))).join(", ")})`;
        case "LCH": return `lch(${r2(labToLch(xyzToLab(rgbToXyz(rgb)))).join(", ")})`;
        case "XYZ": return `xyz(${r2(rgbToXyz(rgb)).join(", ")})`;
        case "KEYWORD": return hexToKeyword(hex) || "（无匹配关键字）";
        case "ComplementaryColor": return "#" + rgbToHex(complementaryRgb(rgb)).toUpperCase();
        default: return "#" + hex;
    }
}

// 色轮配色方案（与 React 版 SCHEME_DEFS 一致）
export const SCHEMES = [
    { key: "analogous", label: "相似色", offsets: [0, -30, 30] },
    { key: "split", label: "分离色", offsets: [0, 150, 210] },
    { key: "triadic", label: "三角色", offsets: [0, 120, 240] },
    { key: "tetradic", label: "四角色", offsets: [0, 60, 180, 240] },
    { key: "square", label: "方形色", offsets: [0, 90, 180, 270] },
    { key: "compound", label: "复合色", offsets: [0, 30, 150, 180] },
    { key: "doubleSplit", label: "双分离色", offsets: [0, -30, 30, 150, 210] },
];

// 依据主色 RGB 计算全部配色方案
export function buildSchemes(rgb) {
    const [h, s, l] = rgbToHsl(rgb);
    return SCHEMES.map((def) => ({
        label: def.label,
        colors: def.offsets.map((o) => "#" + rgbToHex(hslToRgb([((h + o) % 360 + 360) % 360, s, l])).toUpperCase()),
    }));
}
