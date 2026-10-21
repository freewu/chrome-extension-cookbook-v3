import { mountTool } from "../shared/page.js";

// 路径列表 ↔ 树形结构（每层 2 空格缩进 / 也可输出 ├── 目录树字符）
function splitParts(line) {
    return line.replace(/\\/g, "/").replace(/^\.\//, "").split("/").filter((s) => s && s !== ".");
}

function parsePathsToRoots(text) {
    const roots = [];
    for (const raw of String(text ?? "").split(/\r?\n/)) {
        const line = raw.trim();
        if (!line) continue;
        const parts = splitParts(line);
        if (!parts.length) continue;
        let cur = roots;
        let prefix = "";
        for (const part of parts) {
            prefix = prefix ? `${prefix}/${part}` : part;
            let node = cur.find((n) => n.name === part);
            if (!node) {
                node = { name: part, path: prefix, children: [] };
                cur.push(node);
            }
            cur = node.children;
        }
    }
    return roots;
}

function rootsToPaths(roots) {
    const out = [];
    const walk = (nodes) => {
        for (const n of nodes) {
            out.push(n.path);
            walk(n.children);
        }
    };
    walk(roots);
    return out;
}

// 2 空格缩进文本
function rootsToIndented(roots) {
    const lines = [];
    const walk = (nodes, depth) => {
        for (const n of nodes) {
            lines.push("  ".repeat(depth) + n.name);
            walk(n.children, depth + 1);
        }
    };
    walk(roots, 0);
    return lines.join("\n");
}

// 带 ├── └── │ 的目录树文本
function rootsToGraph(roots) {
    const lines = [];
    const walk = (nodes, prefix) => {
        nodes.forEach((n, i) => {
            const last = i === nodes.length - 1;
            lines.push(prefix + (last ? "└── " : "├── ") + n.name);
            walk(n.children, prefix + (last ? "    " : "│   "));
        });
    };
    walk(roots, "");
    return lines.join("\n");
}

// 缩进文本 / 目录树文本 → 树
function parseIndentedToRoots(text) {
    const src = String(text ?? "").replace(/\r\n/g, "\n");
    const hasGraph = /[├└│┌┐─]/.test(src);
    const rows = [];
    for (const raw of src.split("\n")) {
        let indent = 0;
        let name;
        if (hasGraph) {
            let col = 0;
            let i = 0;
            while (i < raw.length && /[ \t├└│┌┐─]/.test(raw[i])) {
                col += raw[i] === "\t" ? 4 : 1;
                i += 1;
            }
            name = raw.slice(i).trim();
            indent = Math.max(0, Math.round((col - 1) / 4));
        } else {
            const lead = /^[ \t]*/.exec(raw)?.[0] ?? "";
            for (const ch of lead) indent += ch === "\t" ? 2 : 1;
            name = raw.slice(lead.length).trim();
        }
        if (!name || name === "/") continue;
        rows.push({ indent, name });
    }
    const roots = [];
    const stack = [];
    for (const r of rows) {
        while (stack.length && stack[stack.length - 1].indent >= r.indent) stack.pop();
        const parent = stack.length ? stack[stack.length - 1].node : null;
        const node = { name: r.name, path: "", children: [] };
        if (parent) parent.children.push(node);
        else roots.push(node);
        stack.push({ indent: r.indent, node });
    }
    const fill = (nodes, prefix) => {
        for (const n of nodes) {
            n.path = prefix ? `${prefix}/${n.name}` : n.name;
            fill(n.children, n.path);
        }
    };
    fill(roots, "");
    return roots;
}

const tool = {
    id: "tree-path-convert",
    name: "树形路径转换",
    category: "convert",
    desc: "路径列表 ↔ 树形结构互转，支持 2 空格缩进与 ├── └── 目录树字符",
    fields: [
        {
            name: "mode",
            label: "转换方向",
            type: "select",
            options: [
                ["paths2tree", "路径列表 → 缩进树"],
                ["paths2graph", "路径列表 → 目录树（├──）"],
                ["tree2paths", "缩进树 / 目录树 → 路径列表"],
            ],
            default: "paths2tree",
        },
        {
            name: "input",
            label: "输入",
            type: "textarea",
            default: "src/index.js\nsrc/lib/utils.js\nsrc/lib/page.js\nREADME.md\ndocs/guide.md",
            placeholder: "每行一条路径，支持 / 与 \\ 分隔",
        },
        { name: "dedupe", label: "去重", type: "checkbox", default: true },
    ],
    run(v) {
        const text = String(v.input || "");
        if (text.trim() === "") throw new Error("请输入内容");
        if (v.mode === "tree2paths") {
            const roots = parseIndentedToRoots(text);
            if (!roots.length) throw new Error("没有解析到任何层级");
            let paths = rootsToPaths(roots);
            if (v.dedupe) paths = [...new Set(paths)];
            return {
                路径数量: String(paths.length),
                路径列表: paths.join("\n"),
                缩进树: rootsToIndented(roots),
            };
        }
        let lines = text
            .split(/\r?\n/)
            .map((s) => s.trim().replace(/\\/g, "/").replace(/^\.\//, ""))
            .filter((s) => s && s !== "/");
        if (v.dedupe) lines = [...new Set(lines)];
        if (!lines.length) throw new Error("请每行输入一条路径");
        const roots = parsePathsToRoots(lines.join("\n"));
        return {
            路径数量: String(lines.length),
            结果: v.mode === "paths2graph" ? rootsToGraph(roots) : rootsToIndented(roots),
        };
    },
};

export default tool;
mountTool(tool);
