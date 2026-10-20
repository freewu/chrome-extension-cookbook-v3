/**
 * HTTP Basic Auth 编解码
 * 目录：pages/app/basic-auth/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { utf8ToBytes, bytesToUtf8, bytesToBase64, base64ToBytes } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

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

export default basicAuthTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(basicAuthTool);
