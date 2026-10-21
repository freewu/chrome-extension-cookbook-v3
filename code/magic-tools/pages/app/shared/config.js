// 配置文件格式互转：JSON / JSON5 / YAML / TOML / INI / Properties / XML
// 统一先解析成普通对象，再序列化成目标格式
import { parse as yamlParse, stringify as yamlStringify } from "../../../lib/yaml/index.js";

// ---------- INI ----------
// [section] / key = value；无 section 的键放在顶层
export function parseIni(text) {
    const root = {};
    let cur = root;
    for (const raw of String(text).split(/\r?\n/)) {
        const line = raw.trim();
        if (line === "" || line.startsWith(";") || line.startsWith("#")) continue;
        const sec = /^\[(.+)\]$/.exec(line);
        if (sec) {
            const name = sec[1].trim();
            root[name] = root[name] || {};
            cur = root[name];
            continue;
        }
        const eq = line.indexOf("=");
        const sep = eq >= 0 ? eq : line.indexOf(":");
        if (sep < 0) continue;
        const key = line.slice(0, sep).trim();
        const value = line.slice(sep + 1).trim();
        cur[key] = toTyped(value);
    }
    return root;
}

// 能转成数字/布尔的就转，其余保持字符串
function toTyped(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value !== "" && !Number.isNaN(Number(value)) && !/^0\d/.test(value)) return Number(value);
    return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

export function stringifyIni(data) {
    const lines = [];
    const scalars = [];
    const sections = [];
    for (const [k, v] of Object.entries(data || {})) {
        if (v !== null && typeof v === "object" && !Array.isArray(v)) sections.push([k, v]);
        else scalars.push([k, v]);
    }
    for (const [k, v] of scalars) lines.push(`${k} = ${fmtScalar(v)}`);
    if (scalars.length && sections.length) lines.push("");
    sections.forEach(([name, obj], i) => {
        if (i > 0) lines.push("");
        lines.push(`[${name}]`);
        for (const [k, v] of Object.entries(obj)) {
            lines.push(`${k} = ${typeof v === "object" ? JSON.stringify(v) : fmtScalar(v)}`);
        }
    });
    return lines.join("\n") + "\n";
}

const fmtScalar = (v) => (typeof v === "string" ? v : String(v));

// ---------- Properties ----------
// 支持 a.b=1 这样的点分键，序列化时展开成嵌套对象
export function parseProperties(text) {
    const root = {};
    for (const raw of String(text).split(/\r?\n/)) {
        const line = raw.trim();
        if (line === "" || line.startsWith("#") || line.startsWith("!")) continue;
        const sep = line.search(/[=:]/);
        if (sep < 0) continue;
        const key = line.slice(0, sep).trim();
        const value = line.slice(sep + 1).trim();
        const parts = key.split(".");
        let cur = root;
        parts.forEach((p, i) => {
            if (i === parts.length - 1) cur[p] = value;
            else cur = cur[p] = cur[p] || {};
        });
    }
    return root;
}

export function stringifyProperties(data) {
    const out = [];
    const walk = (obj, prefix) => {
        for (const [k, v] of Object.entries(obj || {})) {
            const key = prefix ? `${prefix}.${k}` : k;
            if (v !== null && typeof v === "object" && !Array.isArray(v)) walk(v, key);
            else out.push(`${key} = ${typeof v === "object" ? JSON.stringify(v) : v}`);
        }
    };
    walk(data, "");
    return out.join("\n") + "\n";
}

// ---------- XML ----------
// 文本 → 对象：属性加 @_ 前缀，文本用 #text，同名子节点自动成数组
export function parseXml(text) {
    const doc = new DOMParser().parseFromString(String(text), "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) throw new Error("XML 解析失败：" + err.textContent.trim().split("\n")[0]);
    const root = doc.documentElement;
    if (!root) return {};
    return { [root.nodeName]: elementToObject(root) };
}

function elementToObject(el) {
    const obj = {};
    for (const attr of el.attributes) obj["@_" + attr.name] = attr.value;
    const children = [...el.children];
    if (!children.length) {
        const text = el.textContent.trim();
        if (Object.keys(obj).length === 0) return text;
        if (text) obj["#text"] = text;
        return obj;
    }
    for (const child of children) {
        const value = elementToObject(child);
        if (child.nodeName in obj) {
            if (!Array.isArray(obj[child.nodeName])) obj[child.nodeName] = [obj[child.nodeName]];
            obj[child.nodeName].push(value);
        } else {
            obj[child.nodeName] = value;
        }
    }
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("").trim();
    if (text) obj["#text"] = text;
    return obj;
}

export function stringifyXml(data) {
    const keys = data && typeof data === "object" ? Object.keys(data) : [];
    const root = keys.length === 1 ? data : { root: data };
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + buildElement(Object.keys(root)[0], root[Object.keys(root)[0]], 0) + "\n";
}

function buildElement(name, value, depth) {
    const pad = "  ".repeat(depth);
    const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (value === null || value === undefined) return `${pad}<${name}/>`;
    if (Array.isArray(value)) return value.map((v) => buildElement(name, v, depth)).join("\n");
    if (typeof value !== "object") return `${pad}<${name}>${esc(value)}</${name}>`;
    const attrs = Object.entries(value)
        .filter(([k]) => k.startsWith("@_"))
        .map(([k, v]) => ` ${k.slice(2)}="${esc(v)}"`)
        .join("");
    const text = value["#text"] ?? "";
    const children = Object.entries(value).filter(([k]) => k !== "#text" && !k.startsWith("@_"));
    if (!children.length) return text === "" && !attrs ? `${pad}<${name}/>` : `${pad}<${name}${attrs}>${esc(text)}</${name}>`;
    const inner = children.map(([k, v]) => buildElement(k, v, depth + 1)).join("\n");
    return `${pad}<${name}${attrs}>\n${text ? "  ".repeat(depth + 1) + esc(text) + "\n" : ""}${inner}\n${pad}</${name}>`;
}

// ---------- 统一入口 ----------
export const CONFIG_FORMATS = [
    { value: "json", label: "JSON" },
    { value: "json5", label: "JSON5" },
    { value: "yaml", label: "YAML" },
    { value: "toml", label: "TOML" },
    { value: "ini", label: "INI" },
    { value: "properties", label: "Properties" },
    { value: "xml", label: "XML" },
];

export function parseConfig(text, format) {
    const src = String(text ?? "");
    if (src.trim() === "") throw new Error("请输入配置内容");
    switch (format) {
        case "json":
            try {
                return JSON.parse(src);
            } catch (e) {
                throw new Error("JSON 解析失败：" + e.message);
            }
        case "json5":
            if (!window.JSON5) throw new Error("JSON5 库未加载");
            try {
                return window.JSON5.parse(src);
            } catch (e) {
                throw new Error("JSON5 解析失败：" + e.message);
            }
        case "yaml": {
            const data = yamlParse(src);
            if (data === null || data === undefined) throw new Error("YAML 内容为空");
            return data;
        }
        case "toml":
            if (!window.TOML) throw new Error("TOML 库未加载");
            try {
                return window.TOML.parse(src);
            } catch (e) {
                throw new Error("TOML 解析失败：" + e.message);
            }
        case "ini":
            return parseIni(src);
        case "properties":
            return parseProperties(src);
        case "xml":
            return parseXml(src);
        default:
            throw new Error(`不支持的格式：${format}`);
    }
}

export function stringifyConfig(data, format, indent = 2) {
    switch (format) {
        case "json":
            return JSON.stringify(data, null, indent);
        case "json5":
            if (!window.JSON5) throw new Error("JSON5 库未加载");
            return window.JSON5.stringify(data, null, indent);
        case "yaml":
            return yamlStringify(data, { indent }).replace(/\n$/, "");
        case "toml":
            if (!window.TOML) throw new Error("TOML 库未加载");
            return window.TOML.stringify(data).replace(/\n$/, "");
        case "ini":
            return stringifyIni(data).replace(/\n$/, "");
        case "properties":
            return stringifyProperties(data).replace(/\n$/, "");
        case "xml":
            return stringifyXml(data).replace(/\n$/, "");
        default:
            throw new Error(`不支持的格式：${format}`);
    }
}

// 按内容特征猜测格式
export function guessConfigFormat(text) {
    const t = String(text ?? "").trim();
    if (t === "") return "json";
    if (/^<\?xml|^<[a-zA-Z!]/.test(t)) return "xml";
    if (/^\{/.test(t)) {
        try {
            JSON.parse(t);
            return "json";
        } catch {
            return "json5";
        }
    }
    // [section] 开头：[[table]] 或值带引号 → TOML，否则视为 INI
    if (/^\[/.test(t)) {
        if (/^\[\[/m.test(t) || /=\s*["']/.test(t) || /=\s*\[/.test(t)) return "toml";
        return "ini";
    }
    // key = value / key: value：点分键 → properties；带引号或纯数字 → toml；裸值 → ini
    if (/^\s*[^\s=:#]+\s*[=:]/m.test(t)) {
        if (/^\s*[\w.-]+\.[\w.-]+\s*=/m.test(t)) return "properties";
        if (/=\s*["'[]/.test(t)) return "toml";
        if (/^\s*[^\s=:#]+\s*=\s*(true|false|-?\d+(\.\d+)?)\s*$/m.test(t)) return "toml";
        if (/=/m.test(t)) return "ini";
    }
    return "yaml";
}
