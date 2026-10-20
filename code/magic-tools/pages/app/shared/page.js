// 工具页外壳：把「工具定义」渲染成表单 + 执行结果
// 每个工具目录（pages/app/<id>/tool.js）末尾都会调用 mountTool(tool)
import { el } from "./utils.js";

export const CATEGORIES = {
    codec: { label: "编解码", desc: "Base64 / URL / Unicode / 摩斯码 等" },
    crypto: { label: "加解密", desc: "AES / RSA / SM4 / 古典密码 等" },
    "value-calc": { label: "值计算", desc: "Hash / CRC / HMAC / 派生函数 等" },
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
        for (const opt of field.options) {
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
    } else {
        input = el("input", { type: field.type || "text", placeholder: field.placeholder || "" });
        input.value = field.default ?? "";
        input.addEventListener("input", () => valueSetter(input.value));
    }
    wrap.append(input);
    return { wrap, input, get: () => input.value };
}

function renderOutput(output) {
    const box = el("div", { class: "output" });
    const pre = el("pre");
    pre.textContent = output;
    const copy = el("button", {
        class: "copy",
        text: "复制",
        onclick: async () => {
            await navigator.clipboard.writeText(output);
            copy.textContent = "已复制";
            setTimeout(() => (copy.textContent = "复制"), 1200);
        },
    });
    box.append(pre, copy);
    return box;
}

/**
 * 挂载一个工具。
 * 工具定义只需要关心「有哪些字段」和「怎么算」：
 *   { id, name, category, desc, actionText?, fields: [...], run(values) }
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
        values[field.name] = field.type === "checkbox" ? !!field.default : field.default ?? "";
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
            if (result && typeof result === "object" && !Array.isArray(result)) {
                for (const [label, value] of Object.entries(result)) {
                    resultArea.append(el("div", { class: "output-label", text: label }));
                    resultArea.append(renderOutput(String(value)));
                }
            } else {
                resultArea.append(renderOutput(String(result ?? "")));
            }
        } catch (error) {
            const box = el("div", { class: "output error" });
            const pre = el("pre");
            pre.textContent = "错误：" + (error && error.message ? error.message : String(error));
            box.append(pre);
            resultArea.append(box);
        }
    });
}
