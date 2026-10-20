/**
 * Base64 编解码
 * 目录：pages/app/base64/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { utf8ToBytes, bytesToUtf8, bytesToBase64, base64ToBytes } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

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

export default base64Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(base64Tool);
