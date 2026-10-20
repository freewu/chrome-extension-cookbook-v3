/**
 * BaseX 编解码
 * 目录：pages/app/basex/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import { utf8ToBytes, bytesToUtf8, bytesToBaseX, baseXToBytes } from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// ---------- BaseX ----------
const baseXTool = {
    id: "basex",
    name: "BaseX 编解码",
    category: "codec",
    desc: "自定义字母表的任意进制转换",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "alphabet", label: "字母表", type: "text", default: "0123456789abcdef" },
        { name: "input", label: "输入", type: "textarea", default: "Hi" },
    ],
    run(v) {
        const alphabet = v.alphabet;
        if (new Set(alphabet).size !== alphabet.length) throw new Error("字母表存在重复字符");
        if (v.mode === "encode") return bytesToBaseX(utf8ToBytes(v.input), alphabet);
        return bytesToUtf8(baseXToBytes(v.input.trim(), alphabet));
    },
};

export default baseXTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(baseXTool);
