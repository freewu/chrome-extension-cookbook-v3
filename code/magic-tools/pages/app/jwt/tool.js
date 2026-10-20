/**
 * JWT 编解码器
 * 目录：pages/app/jwt/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { bytesToUtf8, base64ToBytes } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

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

export default jwtTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(jwtTool);
