/**
 * BCD 编解码
 * 目录：pages/app/bcd/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { mountTool } from "../shared/page.js";

// ---------- BCD ----------
const bcdTool = {
    id: "bcd",
    name: "BCD 编解码",
    category: "codec",
    desc: "8421 码，十进制 <-> 十六进制",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码(十进制→BCD)"], ["decode", "解码(BCD→十进制)"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "1234567890" },
    ],
    run(v) {
        if (v.mode === "encode") {
            const digits = v.input.replace(/\D/g, "");
            if (digits.length === 0) return "";
            let hex = digits;
            if (digits.length % 2) hex = "0" + digits;
            return hex.toUpperCase();
        }
        const hex = v.input.replace(/[^0-9a-fA-F]/g, "");
        const digits = hex.split("").map((c) => parseInt(c, 16));
        if (digits.some((d) => d > 9)) throw new Error("BCD 每一位必须 <= 9");
        return digits.join("").replace(/^0+(?=\d)/, "");
    },
};

export default bcdTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(bcdTool);
