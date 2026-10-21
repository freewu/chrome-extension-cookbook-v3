import { mountTool } from "../shared/page.js";

// JSON 数组 ↔ JSONL（JSON Lines / NDJSON）
const stripBom = (s) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);
const indentUnit = (v) => (v === "tab" ? "\t" : v === "4" ? "    " : "  ");

const tool = {
    id: "jsonl-convert",
    name: "JSONL 转换",
    category: "convert",
    desc: "JSON 数组 ↔ JSONL（JSON Lines / NDJSON）互转",
    fields: [
        {
            name: "mode",
            label: "转换方向",
            type: "select",
            options: [
                ["json2jsonl", "JSON 数组 → JSONL"],
                ["jsonl2json", "JSONL → JSON 数组"],
            ],
            default: "json2jsonl",
        },
        { name: "input", label: "输入", type: "textarea", default: '[{"id":1,"name":"foo"},{"id":2,"name":"bar"}]' },
        { name: "indent", label: "输出缩进（转 JSON 时）", type: "select", options: [["2", "2 空格"], ["4", "4 空格"], ["tab", "Tab"]], default: "2" },
        { name: "ignoreBlank", label: "忽略空行", type: "checkbox", default: true },
    ],
    run(v) {
        const text = stripBom(String(v.input || ""));
        if (text.trim() === "") throw new Error("请输入内容");
        if (v.mode === "json2jsonl") {
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error(`JSON 解析失败：${e.message}`);
            }
            const list = Array.isArray(data) ? data : [data];
            if (!list.length) throw new Error("JSON 数组为空");
            return {
                记录条数: String(list.length),
                JSONL: list.map((item) => JSON.stringify(item)).join("\n"),
            };
        }
        const lines = text.split(/\r\n|\r|\n/);
        const list = [];
        lines.forEach((line, i) => {
            if (line.trim() === "") {
                if (!v.ignoreBlank) throw new Error(`第 ${i + 1} 行是空行`);
                return;
            }
            try {
                list.push(JSON.parse(line));
            } catch (e) {
                throw new Error(`第 ${i + 1} 行不是有效 JSON：${e.message}`);
            }
        });
        if (!list.length) throw new Error("没有解析到任何记录");
        return {
            记录条数: String(list.length),
            "JSON 数组": JSON.stringify(list, null, indentUnit(v.indent)),
        };
    },
};

export default tool;
mountTool(tool);
