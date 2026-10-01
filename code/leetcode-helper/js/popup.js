// LeetCode 助手 - 弹窗逻辑

const el = (id) => document.getElementById(id);

const els = {
    loading: el("loading"),
    notLeetcode: el("not-leetcode"),
    error: el("error"),
    workspace: el("workspace"),
    problemTitle: el("problem-title"),
    difficulty: el("difficulty"),
    titlePreview: el("title-preview"),
    stripHtml: el("strip-html"),
    contentPreview: el("content-preview"),
    langSelect: el("lang-select"),
    codePreview: el("code-preview"),
    copyTitle: el("copy-title"),
    copyContent: el("copy-content"),
    copyMethod: el("copy-method"),
    copyAll: el("copy-all"),
    toast: el("toast")
};

const DEFAULT_LANG = "javascript";
const DIFFICULTY_LABEL = { Easy: "简单", Medium: "中等", Hard: "困难" };
const FENCE_LANG = {
    python3: "python",
    python: "python",
    golang: "go",
    csharp: "csharp",
    cpp: "cpp",
    javascript: "javascript",
    typescript: "typescript"
};

const state = {
    data: null,
    stripHtml: true,
    langSlug: DEFAULT_LANG
};

// -------------------- 基础工具 --------------------

function isLeetCode(url) {
    // 必须是 LeetCode 题目页，例如 https://leetcode.cn/problems/two-sum/
    return /^https?:\/\/([a-z0-9-]+\.)*leetcode\.(cn|com)\/problems\//i.test(url || "");
}

function show(section) {
    for (const node of [els.loading, els.notLeetcode, els.error, els.workspace]) {
        node.hidden = node !== section;
    }
}

function showError(message) {
    els.error.textContent = message;
    show(els.error);
}

let toastTimer = null;
function toast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    // 重新触发动画
    els.toast.style.animation = "none";
    void els.toast.offsetWidth;
    els.toast.style.animation = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        els.toast.hidden = true;
    }, 1600);
}

async function copy(text, label) {
    if (!text) {
        toast("没有可复制的内容");
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        // 剪贴板 API 不可用时的兜底方案
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
    }
    toast(`已复制${label || ""}`);
}

// -------------------- 与页面通信 --------------------

async function askContentScript(tabId) {
    try {
        return await chrome.tabs.sendMessage(tabId, { type: "LC_GET_PROBLEM" });
    } catch (error) {
        // 内容脚本可能尚未注入（例如扩展刚安装 / 页面在安装前打开），手动注入后重试
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ["js/content.js"]
        });
        return await chrome.tabs.sendMessage(tabId, { type: "LC_GET_PROBLEM" });
    }
}

// -------------------- 渲染 --------------------

function difficultyLabel(value) {
    return DIFFICULTY_LABEL[value] || value || "";
}

function displayTitle() {
    const d = state.data;
    const name = d.translatedTitle || d.title || "";
    return `${d.frontendId ? `${d.frontendId}. ` : ""}${name}`;
}

function currentContent() {
    return state.stripHtml ? state.data.contentText : state.data.contentHtml;
}

function currentSnippet() {
    return state.data.codeSnippets.find((item) => item.langSlug === state.langSlug) || null;
}

function renderLanguages() {
    const snippets = state.data.codeSnippets;
    els.langSelect.innerHTML = "";

    if (!snippets.length) {
        els.langSelect.appendChild(new Option("（该题未提供代码模板）", ""));
        els.langSelect.disabled = true;
        return;
    }

    els.langSelect.disabled = false;
    for (const snippet of snippets) {
        els.langSelect.appendChild(new Option(snippet.lang, snippet.langSlug));
    }

    // 语言优先级：上次选择 > 页面当前语言 > 默认语言 > 第一项
    const candidates = [state.langSlug, state.data.currentLangSlug, DEFAULT_LANG, "python3"];
    const picked = candidates.find(
        (slug) => slug && snippets.some((item) => item.langSlug === slug)
    );
    state.langSlug = picked || snippets[0].langSlug;
    els.langSelect.value = state.langSlug;
}

function renderPreviews() {
    els.titlePreview.textContent = displayTitle();
    els.contentPreview.textContent = currentContent();

    const snippet = currentSnippet();
    els.codePreview.textContent = snippet ? snippet.code : "（无代码模板）";
}

function renderWorkspace() {
    const d = state.data;
    els.problemTitle.textContent = displayTitle();
    els.difficulty.textContent = difficultyLabel(d.difficulty);
    els.difficulty.dataset.level = (d.difficulty || "").toLowerCase();

    renderLanguages();
    renderPreviews();
    show(els.workspace);
}

// -------------------- 复制内容组装 --------------------

function buildAll() {
    const d = state.data;
    const snippet = currentSnippet();
    const lines = [];

    lines.push(`# ${displayTitle()}`);
    lines.push("");

    const meta = [];
    if (d.difficulty) {
        meta.push(`难度：${difficultyLabel(d.difficulty)}`);
    }
    meta.push(`链接：${d.url}`);
    lines.push(meta.join("　|　"));
    lines.push("");

    lines.push("## 题目描述");
    lines.push("");
    lines.push(currentContent());
    lines.push("");

    if (snippet) {
        lines.push(`## 实现方法（${snippet.lang}）`);
        lines.push("");
        lines.push("```" + (FENCE_LANG[snippet.langSlug] || snippet.langSlug));
        lines.push(snippet.code);
        lines.push("```");
    }

    return lines.join("\n");
}

// -------------------- 事件绑定 --------------------

function bindEvents() {
    els.stripHtml.addEventListener("change", () => {
        state.stripHtml = els.stripHtml.checked;
        chrome.storage.sync.set({ lc_strip_html: state.stripHtml });
        els.contentPreview.textContent = currentContent();
    });

    els.langSelect.addEventListener("change", () => {
        state.langSlug = els.langSelect.value;
        chrome.storage.sync.set({ lc_lang: state.langSlug });
        renderPreviews();
    });

    els.copyTitle.addEventListener("click", () => copy(displayTitle(), "标题"));
    els.copyContent.addEventListener("click", () => copy(currentContent(), "题目内容"));

    els.copyMethod.addEventListener("click", () => {
        const snippet = currentSnippet();
        copy(snippet ? snippet.code : "", "代码");
    });

    els.copyAll.addEventListener("click", () => copy(buildAll(), "全部内容"));
}

// -------------------- 初始化 --------------------

async function init() {
    bindEvents();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !isLeetCode(tab.url)) {
        show(els.notLeetcode);
        return;
    }

    const stored = await chrome.storage.sync.get({ lc_strip_html: true, lc_lang: "" });
    state.stripHtml = stored.lc_strip_html;
    state.langSlug = stored.lc_lang || DEFAULT_LANG;
    els.stripHtml.checked = state.stripHtml;

    show(els.loading);

    let response;
    try {
        response = await askContentScript(tab.id);
    } catch (error) {
        showError(`无法与页面通信：${error.message}。请刷新题目页后重试。`);
        return;
    }

    if (!response || !response.ok) {
        showError((response && response.error) || "读取题目失败，请刷新页面后重试。");
        return;
    }

    state.data = response.data;
    renderWorkspace();
}

init();
