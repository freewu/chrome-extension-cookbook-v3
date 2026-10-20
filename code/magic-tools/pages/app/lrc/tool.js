/**
 * LRC 校验
 * 目录：pages/app/lrc/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { inputToBytes } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

const lrcTool = {
    id: "lrc",
    name: "LRC 校验",
    category: "value-calc",
    desc: "纵向冗余校验（补码和）",
    fields: [
        { name: "inputFormat", label: "输入格式", type: "select", options: [["utf8", "文本"], ["hex", "Hex"]], default: "hex" },
        { name: "input", label: "输入", type: "textarea", default: "01 02 03 04" },
    ],
    run(v) {
        const bytes = inputToBytes(v.input, v.inputFormat);
        let sum = 0;
        for (const b of bytes) sum = (sum + b) & 0xff;
        const lrc = (256 - sum) & 0xff;
        return { Hex: "0x" + lrc.toString(16).padStart(2, "0").toUpperCase(), Dec: String(lrc) };
    },
};

export default lrcTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(lrcTool);
