import { mountTool } from "../shared/page.js";
import { FORMATS, parseColor, formatColor, buildSchemes } from "../shared/color.js";

// 任意颜色格式 ↔ 任意颜色格式
const tool = {
    id: "color-convert",
    name: "颜色转换",
    category: "convert",
    desc: "HEX / RGB / HSL / HSV / CMYK / LAB / LCH / XYZ / 颜色关键字 / 互补色 互转",
    fields: [
        {
            name: "type",
            label: "输入格式",
            type: "select",
            options: [
                ["AUTO", "自动识别"],
                ["HEX", "HEX 十六进制"],
                ["RGB", "RGB 红绿蓝"],
                ["HSL", "HSL"],
                ["HSV", "HSV"],
                ["CMYK", "CMYK"],
                ["LAB", "LAB"],
                ["LCH", "LCH"],
                ["XYZ", "XYZ"],
                ["KEYWORD", "颜色关键字（如 tomato）"],
            ],
            default: "AUTO",
        },
        { name: "input", label: "颜色值", type: "text", default: "#4f8cff", placeholder: "#4f8cff / rgb(79,140,255) / tomato" },
    ],
    run(v) {
        const rgb = parseColor(v.input, v.type);
        const result = {};
        for (const f of FORMATS) result[f] = formatColor(rgb, f);
        // 顺带给出取色器能直接用的 HEX 与配色方案
        const hex = formatColor(rgb, "HEX");
        result["预览"] = `data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="240" height="120" fill="${hex}"/></svg>`
        )}`;
        for (const scheme of buildSchemes(rgb)) result[`配色 · ${scheme.label}`] = scheme.colors.join("  ");
        return result;
    },
};

export default tool;
mountTool(tool);
