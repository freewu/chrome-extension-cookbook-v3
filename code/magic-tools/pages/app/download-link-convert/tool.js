import { mountTool } from "../shared/page.js";

// 下载链接转换：真实地址 ↔ 迅雷 / 快车 / 旋风 专用链接
const SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;

const b64Encode = (s) => {
    const bytes = new TextEncoder().encode(s);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
};

const b64Decode = (s) => {
    let bin;
    try {
        bin = atob(s.trim());
    } catch {
        throw new Error("链接内容 Base64 解码失败");
    }
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
};

function convertDownloadLink(input) {
    const text = String(input).trim();
    if (text === "") throw new Error("请输入下载地址");
    let real;
    const m = /^(thunder|qqdl|qdl):\/\//i.exec(text);
    if (m) {
        const decoded = b64Decode(text.slice(text.indexOf("://") + 3));
        if (m[1].toLowerCase() === "thunder") {
            if (!decoded.startsWith("AA") || !decoded.endsWith("ZZ")) throw new Error("迅雷地址内容无效（缺少 AA/ZZ 标记）");
            real = decoded.slice(2, decoded.length - 2);
        } else {
            real = decoded;
        }
    } else if (SCHEME_RE.test(text)) {
        real = text;
    } else {
        throw new Error("无法识别：请输入 http(s)/ftp 真实地址，或 thunder://、qqdl://、qdl:// 专用链接");
    }
    if (!SCHEME_RE.test(real)) throw new Error("识别结果不是有效地址：" + real);
    return {
        真实地址: real,
        迅雷地址: "thunder://" + b64Encode("AA" + real + "ZZ"),
        快车地址: "qqdl://" + b64Encode(real),
        旋风地址: "qdl://" + b64Encode(real),
    };
}

const tool = {
    id: "download-link-convert",
    name: "下载链接转换",
    category: "convert",
    desc: "真实地址 ↔ 迅雷 / 快车 / 旋风 专用下载链接，支持批量（每行一条）",
    fields: [
        {
            name: "input",
            label: "下载地址",
            type: "textarea",
            default: "https://example.com/file.zip",
            placeholder: "支持每行一条批量转换：http(s)/ftp 真实地址、thunder://、qqdl://、qdl://",
        },
    ],
    run(v) {
        const lines = String(v.input || "")
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
        if (!lines.length) throw new Error("请输入下载地址");
        if (lines.length === 1) return convertDownloadLink(lines[0]);
        // 批量：逐行转换，出错时提示行号
        const rows = lines.map((line, i) => {
            try {
                return convertDownloadLink(line);
            } catch (e) {
                throw new Error(`第 ${i + 1} 行：${e.message}`);
            }
        });
        return rows.map((r, i) => ({ [`#${i + 1}`]: `${r.真实地址}` }));
    },
};

export default tool;
mountTool(tool);
