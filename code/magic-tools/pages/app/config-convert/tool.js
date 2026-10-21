import { mountTool } from "../shared/page.js";
import { CONFIG_FORMATS, parseConfig, stringifyConfig, guessConfigFormat } from "../shared/config.js";

// 配置文件互转：JSON / JSON5 / YAML / TOML / INI / Properties / XML
const tool = {
    id: "config-convert",
    name: "配置文件转换",
    category: "convert",
    desc: "JSON / JSON5 / YAML / TOML / INI / Properties / XML 配置文件互转",
    fields: [
        {
            name: "from",
            label: "输入格式",
            type: "select",
            options: [["auto", "自动识别"], ...CONFIG_FORMATS.map((f) => [f.value, f.label])],
            default: "auto",
        },
        { name: "to", label: "输出格式", type: "select", options: CONFIG_FORMATS.map((f) => [f.value, f.label]), default: "yaml" },
        { name: "indent", label: "缩进空格数", type: "number", default: 2, min: 0, max: 8 },
        {
            name: "input",
            label: "配置内容",
            type: "textarea",
            default: '{\n  "name": "demo",\n  "server": { "host": "127.0.0.1", "port": 8080 },\n  "debug": true\n}',
        },
    ],
    run(v) {
        const text = String(v.input || "");
        const from = v.from === "auto" ? guessConfigFormat(text) : v.from;
        const indent = Number.isFinite(Number(v.indent)) ? Number(v.indent) : 2;
        const data = parseConfig(text, from);
        const output = stringifyConfig(data, v.to, indent);
        return {
            识别格式: CONFIG_FORMATS.find((f) => f.value === from)?.label || from,
            输出格式: CONFIG_FORMATS.find((f) => f.value === v.to)?.label || v.to,
            转换结果: output,
        };
    },
};

export default tool;
mountTool(tool);
