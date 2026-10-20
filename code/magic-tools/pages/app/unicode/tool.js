/**
 * Unicode 编解码
 * 目录：pages/app/unicode/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { mountTool } from "../shared/page.js";

// ---------- Unicode ----------
const unicodeTool = {
    id: "unicode",
    name: "Unicode 编解码",
    category: "codec",
    desc: "文本 <-> \\uXXXX 转义",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "input", label: "输入", type: "textarea", default: "你好 ABC 😀" },
    ],
    run(v) {
        if (v.mode === "encode") {
            let out = "";
            for (const ch of v.input) {
                const cp = ch.codePointAt(0);
                if (cp > 0xffff) {
                    const h = Math.floor((cp - 0x10000) / 0x400) + 0xd800;
                    const l = ((cp - 0x10000) % 0x400) + 0xdc00;
                    out += "\\u" + h.toString(16).padStart(4, "0") + "\\u" + l.toString(16).padStart(4, "0");
                } else if (cp > 0x7f) {
                    out += "\\u" + cp.toString(16).padStart(4, "0");
                } else {
                    out += ch;
                }
            }
            return out;
        }
        return v.input.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, a, b) =>
            String.fromCodePoint(parseInt(a || b, 16))
        );
    },
};

export default unicodeTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(unicodeTool);
