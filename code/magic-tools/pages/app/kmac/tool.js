/**
 * KMAC 计算
 * 目录：pages/app/kmac/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { S } from "../shared/valuecalc-common.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// KMAC
// ============================================================
const kmacTool = {
    id: "kmac",
    name: "KMAC 计算",
    category: "value-calc",
    desc: "SP 800-185 KMAC128 / KMAC256",
    fields: [
        { name: "algorithm", label: "算法", type: "select", options: ["kmac128", "kmac256"], default: "kmac128" },
        { name: "key", label: "密钥", type: "text", default: "secret" },
        { name: "outputBits", label: "输出位长", type: "number", default: 256 },
        { name: "custom", label: "自定义字符串 (S)", type: "text", default: "" },
        { name: "input", label: "消息", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const bits = parseInt(v.outputBits, 10) || 256;
        return S[v.algorithm](v.key, v.input, bits, v.custom || "");
    },
};

export default kmacTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(kmacTool);
