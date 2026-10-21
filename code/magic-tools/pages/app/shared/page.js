// 工具页外壳：把「工具定义」渲染成表单 + 执行结果
// 每个工具目录（pages/app/<id>/tool.js）末尾都会调用 mountTool(tool)
import { el } from "./utils.js";

// 分类顺序与 React 版 src/App/app-types.ts 保持一致
export const CATEGORIES = {
    convert: { label: "类型转换", desc: "单位换算 / 进制 / 时间 / 颜色 等" },
    codec: { label: "编解码", desc: "Base64 / URL / Unicode / 摩斯码 等" },
    crypto: { label: "加解密", desc: "AES / RSA / SM4 / 古典密码 等" },
    "value-calc": { label: "值计算", desc: "Hash / CRC / HMAC / 派生函数 等" },
    formatter: { label: "格式化", desc: "JSON / HTML / SQL / Markdown 等" },
    image: { label: "图片", desc: "压缩 / 调色 / 水印 / 图标 等" },
    generator: { label: "生成器", desc: "二维码 / 密码 / 数据 / 规则 等" },
    webmaster: { label: "站长工具", desc: "UA / Cookie / robots / nginx 等" },
    misc: { label: "其它", desc: "正则 / 统计 / 压缩包 / 小玩具 等" },
};

// 按字段描述创建表单控件
function buildField(field, valueSetter) {
    const wrap = el("div", { class: "field" });
    const label = el("label", { text: field.label });
    if (field.hint) label.append(el("span", { class: "hint", text: field.hint }));
    wrap.append(label);

    let input;
    if (field.type === "textarea") {
        input = el("textarea", { placeholder: field.placeholder || "" });
        input.value = field.default ?? "";
        input.addEventListener("input", () => valueSetter(input.value));
    } else if (field.type === "select") {
        input = el("select");
        for (const opt of field.options || []) {
            const [v, text] = Array.isArray(opt) ? opt : [opt, opt];
            const o = el("option", { value: v, text });
            if (String(field.default) === String(v)) o.selected = true;
            input.append(o);
        }
        input.addEventListener("change", () => valueSetter(input.value));
    } else if (field.type === "checkbox") {
        wrap.innerHTML = "";
        const cb = el("input", { type: "checkbox" });
        cb.checked = !!field.default;
        cb.addEventListener("change", () => valueSetter(cb.checked));
        const l = el("label", { class: "checkbox" });
        l.append(cb, el("span", { text: field.label }));
        wrap.append(l);
        return { wrap, input: cb, get: () => cb.checked };
    } else if (field.type === "file") {
        input = el("input", { type: "file" });
        if (field.accept) input.setAttribute("accept", field.accept);
        if (field.multiple) input.multiple = true;
        input.addEventListener("change", () => valueSetter(input.files));
        wrap.append(input);
        return { wrap, input, get: () => input.files };
    } else {
        const type = field.type === "number" ? "number" : field.type === "color" ? "color" : "text";
        input = el("input", { type, placeholder: field.placeholder || "" });
        if (field.step !== undefined) input.setAttribute("step", field.step);
        if (field.min !== undefined) input.setAttribute("min", field.min);
        if (field.max !== undefined) input.setAttribute("max", field.max);
        input.value = field.default ?? (type === "color" ? "#4f8cff" : "");
        input.addEventListener("input", () => valueSetter(type === "number" ? input.value : input.value));
        wrap.append(input);
        return { wrap, input, get: () => input.value };
    }
    wrap.append(input);
    return { wrap, input, get: () => input.value };
}

function isBlobLike(value) {
    return value instanceof Blob || (value && typeof value === "object" && value.blob instanceof Blob);
}

// 文本结果：<pre> + 复制
function renderText(output) {
    const box = el("div", { class: "output" });
    const pre = el("pre");
    pre.textContent = output;
    box.append(pre);
    const copy = el("button", {
        class: "copy",
        text: "复制",
        onclick: async () => {
            try {
                await navigator.clipboard.writeText(output);
                copy.textContent = "已复制";
            } catch {
                copy.textContent = "复制失败";
            }
            setTimeout(() => (copy.textContent = "复制"), 1200);
        },
    });
    box.append(copy);
    return box;
}

// 二进制 / 图片结果：预览（图片时）+ 下载
function renderBlob(value, label) {
    const blob = value instanceof Blob ? value : value.blob;
    const name = (value && value.name) || label || "result.bin";
    const box = el("div", { class: "output" });
    const url = URL.createObjectURL(blob);
    if (blob.type.startsWith("image/")) {
        const img = el("img", { class: "preview", alt: name });
        img.src = url;
        box.append(img);
    } else {
        const pre = el("pre");
        pre.textContent = `已生成 ${name}（${blob.size} 字节）`;
        box.append(pre);
    }
    const link = el("a", { class: "copy", href: url, download: name, text: "下载" });
    box.append(link);
    return box;
}

// data URL（图片 / 文本）结果
function renderDataUrl(url, label) {
    const match = /^data:([^;,]+)[;,]/.exec(url);
    const mime = match ? match[1] : "text/plain";
    const box = el("div", { class: "output" });
    if (mime.startsWith("image/")) {
        const img = el("img", { class: "preview", alt: label || "image" });
        img.src = url;
        box.append(img);
    }
    const pre = el("pre");
    pre.textContent = url.length > 400 ? url.slice(0, 400) + " …" : url;
    box.append(pre);
    const a = el("a", { class: "copy", href: url, download: label || "result", text: "下载" });
    box.append(a);
    return box;
}

function renderValue(value, label) {
    if (isBlobLike(value)) return renderBlob(value, label);
    if (typeof value === "string" && value.startsWith("data:")) return renderDataUrl(value, label);
    return renderText(value === undefined || value === null ? "" : String(value));
}

function renderResult(result, area) {
    if (result && typeof result === "object" && !Array.isArray(result) && !isBlobLike(result)) {
        for (const [label, value] of Object.entries(result)) {
            area.append(el("div", { class: "output-label", text: label }));
            area.append(renderValue(value, label));
        }
        return;
    }
    if (Array.isArray(result)) {
        for (const item of result) area.append(renderValue(item));
        return;
    }
    area.append(renderValue(result));
}

/**
 * 挂载一个工具。
 * 工具定义只需要关心「有哪些字段」和「怎么算」：
 *   { id, name, category, desc, actionText?, fields: [...], run(values) }
 * run 可以返回：
 *   - 字符串 / 数字            → 纯文本结果
 *   - { 标签: 值 } 对象        → 多条结果（值可以是字符串、dataURL、Blob）
 *   - Blob / { blob, name }    → 二进制结果（图片自动预览，可下载）
 */
export function mountTool(tool) {
    const root = document.getElementById("tool-page");
    // 首页（pages/index.html）会用 registry.js 批量 import 各个 tool.js，
    // 那里没有 #tool-page 容器，因此直接跳过
    if (!root) return;

    const cat = CATEGORIES[tool.category];
    document.title = `${tool.name} · Magic Tools`;

    root.append(el("a", { class: "back", href: "../../index.html", text: "← 返回工具箱" }));
    root.append(
        el("div", { class: "topbar" }, [
            el("h2", { text: tool.name }),
            cat ? el("span", { class: "tag", text: cat.label }) : null,
        ].filter(Boolean))
    );
    if (tool.desc) root.append(el("p", { class: "tool-desc", text: tool.desc }));

    const panel = el("div", { class: "tool-panel" });
    root.append(panel);

    const values = {};
    const getters = {};
    for (const field of tool.fields || []) {
        const { wrap, get } = buildField(field, (v) => {
            values[field.name] = v;
        });
        values[field.name] = field.type === "checkbox" ? !!field.default : field.type === "file" ? null : field.default ?? "";
        getters[field.name] = get;
        panel.append(wrap);
    }

    const actions = el("div", { class: "actions" });
    const runBtn = el("button", { class: "btn", text: tool.actionText || "执行" });
    actions.append(runBtn);
    panel.append(actions);

    const resultArea = el("div");
    panel.append(resultArea);

    runBtn.addEventListener("click", async () => {
        for (const [name, get] of Object.entries(getters)) {
            values[name] = get();
        }
        resultArea.innerHTML = "";
        try {
            const result = await tool.run(values);
            renderResult(result, resultArea);
        } catch (error) {
            const box = el("div", { class: "output error" });
            const pre = el("pre");
            pre.textContent = "错误：" + (error && error.message ? error.message : String(error));
            box.append(pre);
            resultArea.append(box);
        }
    });
}
