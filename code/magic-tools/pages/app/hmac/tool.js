/**
 * HmacHash 值计算
 * 目录：pages/app/hmac/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { utf8ToBytes, bytesToHex, bytesToBase64 } from "../shared/utils.js";
import { C, wa } from "../shared/valuecalc-common.js";
import { mountTool } from "../shared/page.js";

function outFormat(bytes, format) {
    return format === "base64" ? bytesToBase64(bytes) : bytesToHex(bytes);
}

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

export default hmacTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(hmacTool);
