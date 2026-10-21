import { mountTool } from "../shared/page.js";

// 各种进制互转：输入二进制 / 八进制 / 十进制 / 十六进制，输出四种进制

// 按进制解析成 BigInt（支持任意长度整数，避免 Number 精度丢失）
function parseByRadix(text, radix) {
    const s = text.trim().replace(/[\s_,]/g, "").replace(/^0[bBoOxX]/, "");
    if (s === "") throw new Error("请输入数值");
    const digit = /^[0-9a-zA-Z]+$/;
    if (!digit.test(s)) throw new Error(`存在非法字符：${s}`);
    let value = 0n;
    for (const ch of s.toLowerCase()) {
        const d = parseInt(ch, 36);
        if (d >= radix) throw new Error(`「${ch}」不是合法的 ${radix} 进制字符`);
        value = value * BigInt(radix) + BigInt(d);
    }
    return value;
}

// 每 4 位插入一个空格（从右往左分组）
function group(text) {
    return text.replace(/\B(?=(?:[0-9a-zA-Z]{4})+$)/g, " ");
}

const tool = {
    id: "number-convert",
    name: "进制转换",
    category: "convert",
    desc: "二进制 / 八进制 / 十进制 / 十六进制互转，支持任意长度整数",
    fields: [
        {
            name: "radix",
            label: "输入进制",
            type: "select",
            options: [["2", "二进制 BIN"], ["8", "八进制 OCT"], ["10", "十进制 DEC"], ["16", "十六进制 HEX"]],
            default: "10",
        },
        { name: "input", label: "数值", type: "text", default: "255", placeholder: "支持 0x / 0b / 0o 前缀与空格分隔" },
        { name: "upper", label: "十六进制大写", type: "checkbox", default: true },
        { name: "grouped", label: "结果每 4 位插入空格", type: "checkbox", default: false },
    ],
    run(v) {
        const value = parseByRadix(v.input, Number(v.radix));
        const fix = (s) => (v.grouped ? group(s) : s);
        const hex = value.toString(16);
        return {
            "二进制 BIN": fix(value.toString(2)),
            "八进制 OCT": fix(value.toString(8)),
            "十进制 DEC": fix(value.toString(10)),
            "十六进制 HEX": v.upper ? hex.toUpperCase() : hex,
        };
    },
};

export default tool;
mountTool(tool);
