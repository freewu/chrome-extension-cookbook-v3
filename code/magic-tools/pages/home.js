// 工具箱首页：分类导航 + 搜索 + 工具卡片（每张卡片跳到一个工具目录）
import { el } from "./app/shared/utils.js";
import { CATEGORIES } from "./app/shared/page.js";
import { ALL_TOOLS } from "./app/registry.js";

const navEl = document.getElementById("category-nav");
const listEl = document.getElementById("tool-list");
const titleEl = document.getElementById("tool-title");
const catEl = document.getElementById("tool-category");
const searchEl = document.getElementById("search");

let currentCategory = "codec";

function renderNav() {
    navEl.innerHTML = "";
    for (const [key, meta] of Object.entries(CATEGORIES)) {
        const count = ALL_TOOLS.filter((t) => t.category === key).length;
        navEl.append(
            el("a", {
                class: key === currentCategory ? "active" : "",
                text: `${meta.label} (${count})`,
                onclick: () => {
                    currentCategory = key;
                    searchEl.value = "";
                    render();
                },
            })
        );
    }
}

function render(keyword = "") {
    renderNav();
    const kw = keyword.trim().toLowerCase();
    const meta = CATEGORIES[currentCategory];

    titleEl.textContent = kw ? `搜索结果：${kw}` : meta.label;
    catEl.textContent = kw ? `${ALL_TOOLS.length} 个工具` : meta.desc;

    const tools = ALL_TOOLS.filter((t) => {
        if (kw) {
            return (
                t.name.toLowerCase().includes(kw) ||
                t.id.toLowerCase().includes(kw) ||
                (t.desc || "").toLowerCase().includes(kw)
            );
        }
        return t.category === currentCategory;
    });

    listEl.innerHTML = "";
    if (tools.length === 0) {
        listEl.append(el("p", { text: "没有匹配的工具" }));
        return;
    }

    for (const tool of tools) {
        // 一个工具一个页面：./app/<工具目录>/index.html
        listEl.append(
            el("a", { class: "tool-card", href: `./app/${tool.id}/index.html` }, [
                el("div", { class: "name", text: tool.name }),
                el("div", { class: "desc", text: tool.desc || "" }),
            ])
        );
    }
}

searchEl.addEventListener("input", () => render(searchEl.value));
render();
