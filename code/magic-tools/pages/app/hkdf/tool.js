/**
 * HKDF 计算
 * 目录：pages/app/hkdf/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { utf8ToBytes, bytesToHex } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// HKDF
// ============================================================
const hkdfTool = {
    id: "hkdf",
    name: "HKDF 计算",
    category: "value-calc",
    desc: "基于 HMAC 的密钥派生（RFC 5869）",
    fields: [
        { name: "hash", label: "Hash", type: "select", options: ["SHA-256", "SHA-384", "SHA-512", "SHA-1"], default: "SHA-256" },
        { name: "ikm", label: "IKM (输入密钥材料)", type: "textarea", default: "password" },
        { name: "salt", label: "Salt", type: "text", default: "" },
        { name: "info", label: "Info", type: "text", default: "" },
        { name: "bits", label: "输出位长", type: "number", default: 256 },
    ],
    async run(v) {
        const bits = Math.max(8, parseInt(v.bits, 10) || 256);
        const baseKey = await crypto.subtle.importKey("raw", utf8ToBytes(v.ikm), "HKDF", false, ["deriveBits"]);
        const out = await crypto.subtle.deriveBits({
            name: "HKDF",
            hash: v.hash,
            salt: utf8ToBytes(v.salt),
            info: utf8ToBytes(v.info),
        }, baseKey, bits);
        return bytesToHex(new Uint8Array(out));
    },
};

export default hkdfTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(hkdfTool);
