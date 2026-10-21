import { mountTool } from "../shared/page.js";

// 汉字转拼音：使用本地内置的 pinyin-pro（UMD 版本挂到 window.pinyinPro 上）
const P = window.pinyinPro;

const MODES = [
    ["symbol", "带声调（hàn zì）"],
    ["num", "数字声调（han4 zi4）"],
    ["none", "不带声调（han zi）"],
    ["first", "首字母（h z）"],
    ["ruby", "逐字注音（汉(hàn)字(zì)）"],
];

const tool = {
    id: "pinyin-convert",
    name: "拼音转换",
    category: "convert",
    desc: "汉字转拼音：支持声调 / 数字声调 / 无调 / 首字母 / 逐字注音（自动识别多音字）",
    fields: [
        { name: "text", label: "中文文本", type: "textarea", default: "锄禾日当午，汗滴禾下土。", placeholder: "输入需要转拼音的中文" },
        { name: "mode", label: "输出格式", type: "select", options: MODES, default: "symbol" },
        { name: "keepNonZh", label: "保留非汉字内容（英文 / 数字 / 标点）", type: "checkbox", default: true },
    ],
    run(v) {
        if (!P || typeof P.pinyin !== "function") throw new Error("pinyin-pro 未加载");
        const text = String(v.text || "");
        if (text.trim() === "") throw new Error("请输入中文文本");
        const base = { nonZh: v.keepNonZh ? "consecutive" : "removed" };
        let result;
        if (v.mode === "ruby") {
            // type: 'all' 逐字返回 origin + pinyin，非汉字项拼音为空
            const items = P.pinyin(text, { ...base, type: "all", toneType: "symbol" });
            result = items.map((it) => (it.isZh && it.pinyin ? `${it.origin}(${it.pinyin})` : it.origin)).join("");
        } else if (v.mode === "first") {
            result = P.pinyin(text, { ...base, pattern: "first", toneType: "none" });
        } else {
            result = P.pinyin(text, { ...base, toneType: v.mode });
        }
        return { 拼音: result };
    },
};

export default tool;
mountTool(tool);
