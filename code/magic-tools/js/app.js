import { el } from "./utils.js";
import codecTools from "../tools/codec.js";
import cryptoTools from "../tools/crypto.js";
import valueCalcTools from "../tools/valuecalc.js";

const CATEGORIES = {
    codec: { label: "编解码", desc: "Base64 / URL / Unicode / 摩斯码 等" },
    crypto: { label: "加解密", desc: "AES / RSA / SM4 / 古典密码 等" },
    "value-calc": { label: "值计算", desc: "Hash / CRC / HMAC / 进制 等" },
};

const ALL_TOOLS = [...codecTools, ...cryptoTools, ...valueCalcTools];
const byId = new Map(ALL_TOOLS.map((t) => [t.id, t]));

const navEl = document.getElementById("category-nav");
const listEl = document.getElementById("tool-list");
const panelEl = document.getElementById("tool-panel");
const titleEl = document.getElementById("tool-title");
const catEl = document.getElementById("tool-category");
const searchEl = document.getElementById("search");

let currentCategory = "codec";

function renderNav() {
    navEl.innerHTML = "";
    for (const [key, meta] of Object.entries(CATEGORIES)) {
        const a = el("a", {
            text: meta.label,
            class: key === currentCategory ? "active" : "",
            onclick: () => {
                currentCategory = key;
                showList();
            },
        });
        navEl.append(a);
    }
}

function showList(keyword = "") {
    renderNav();
    panelEl.classList.add("hidden");
    listEl.classList.remove("hidden");
    catEl.textContent = CATEGORIES[currentCategory]?.label ?? "";
    titleEl.textContent = CATEGORIES[currentCategory]?.label ?? "工具列表";

    const tools = ALL_TOOLS.filter(
        (t) =>
            (keyword ? true : t.category === currentCategory) &&
            (!keyword ||
                t.name.toLowerCase().includes(keyword) ||
                t.id.toLowerCase().includes(keyword))
    );

    listEl.innerHTML = "";
    if (tools.length === 0) {
        listEl.append(el("p", { text: "没有匹配的工具" }));
        return;
    }
    for (const tool of tools) {
        const card = el("div", {
            class: "tool-card",
            onclick: () => showTool(tool.id),
        }, [
            el("div", { class: "name", text: tool.name }),
            el("div", { class: "desc", text: tool.desc || "" }),
        ]);
        listEl.append(card);
    }
}

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

function showTool(id) {
    const tool = byId.get(id);
    if (!tool) return;

    listEl.classList.add("hidden");
    panelEl.classList.remove("hidden");
    titleEl.textContent = tool.name;
    catEl.textContent = CATEGORIES[tool.category]?.label ?? "";

    panelEl.innerHTML = "";
    const back = el("button", { class: "back", text: "← 返回列表", onclick: () => showList(searchEl.value.trim()) });
    panelEl.append(back);

    if (tool.description) {
        panelEl.append(el("p", { class: "desc", text: tool.description }));
    }

    const values = {};
    const getters = {};
    for (const field of tool.fields || []) {
        const { wrap, get } = buildField(field, (v) => {
            values[field.name] = v;
        });
        values[field.name] = field.type === "checkbox" ? !!field.default : (field.default ?? "");
        getters[field.name] = get;
        panelEl.append(wrap);
    }

    const actions = el("div", { class: "actions" });
    const runBtn = el("button", { class: "btn", text: tool.actionText || "执行" });
    actions.append(runBtn);
    panelEl.append(actions);

    const resultArea = el("div");
    panelEl.append(resultArea);

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

searchEl.addEventListener("input", () => {
    const kw = searchEl.value.trim().toLowerCase();
    if (kw) {
        currentCategory = currentCategory;
        showList(kw);
    } else {
        showList();
    }
});

showList();
