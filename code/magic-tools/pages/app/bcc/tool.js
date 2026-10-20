/**
 * BCC 校验
 * 目录：pages/app/bcc/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { inputToBytes } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// BCC / LRC 校验
// ============================================================
const bccTool = {
    id: "bcc",
    name: "BCC 校验",
    category: "value-calc",
    desc: "逐字节异或校验",
    fields: [
        { name: "inputFormat", label: "输入格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "hex" },
        { name: "input", label: "输入", type: "textarea", default: "01 02 03 04" },
    ],
    run(v) {
        const bytes = inputToBytes(v.input, v.inputFormat);
        let bcc = 0;
        for (const b of bytes) bcc ^= b;
        return { Hex: "0x" + bcc.toString(16).padStart(2, "0").toUpperCase(), Dec: String(bcc) };
    },
};

export default bccTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(bccTool);
