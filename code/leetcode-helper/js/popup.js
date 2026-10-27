// LeetCode 助手 - 弹窗逻辑
//
// 两个标签页：
//   · 当前题目：优先读本地缓存（localStorage），命中就直接渲染，不再请求页面；
//     缓存没有（或手动点「重新加载」）时才通过内容脚本抓取。
//   · 历史题目：列出缓存过的所有题目，点击查看详情、打开原题或删除。

import {
    getCached,
    removeCached,
    clearAll,
    saveProblem,
    touchMeta,
    readIndex,
    problemKey
} from "./cache.js";

const el = (id) => document.getElementById(id);

const els = {
    // 标签页
    tabCurrent: el("tab-current"),
    tabHistory: el("tab-history"),
    historyCount: el("history-count"),
    // 区域
    viewCurrent: el("view-current"),
    viewHistory: el("view-history"),
    workspace: el("workspace"),
    // 当前题目的状态提示
    loading: el("loading"),
    notLeetcode: el("not-leetcode"),
    notLeetcodeTitle: el("not-leetcode-title"),
    notLeetcodeText: el("not-leetcode-text"),
    error: el("error"),
    // 历史列表
    historySearch: el("history-search"),
    historyClear: el("history-clear"),
    historyEmpty: el("history-empty"),
    historyList: el("history-list"),
    // 详情头部
    detailSource: el("detail-source"),
    btnRefresh: el("btn-refresh"),
    btnOpen: el("btn-open"),
    btnBack: el("btn-back"),
    // 详情内容
    problemTitle: el("problem-title"),
    difficulty: el("difficulty"),
    titlePreview: el("title-preview"),
    stripHtml: el("strip-html"),
    contentPreview: el("content-preview"),
    tagsPreview: el("tags-preview"),
    hintsPreview: el("hints-preview"),
    langSelect: el("lang-select"),
    codePreview: el("code-preview"),
    copyTitle: el("copy-title"),
    copyContent: el("copy-content"),
    copyTags: el("copy-tags"),
    copyHints: el("copy-hints"),
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

// 弹窗自身状态
const state = {
    viewData: null, // 详情区正在展示的数据
    viewFrom: "current", // "current" | "history"
    currentFromCache: false, // 当前题目的数据是否直接取自缓存
    currentData: null, // 当前标签页题目的数据
    currentKey: "", // 当前题目的缓存键
    target: null, // 当前页面对应的 { origin, slug }
    tabId: null,
    stripHtml: true,
    langSlug: DEFAULT_LANG
};

// 界面状态：当前题目处于哪一步
const ui = {
    mode: "current", // "current" | "history"
    status: "loading", // loading | ready | error | notproblem
    error: ""
};

// -------------------- 基础工具 --------------------

const LEETCODE_HOST = /^([a-z0-9-]+\.)*leetcode\.(cn|com)$/i;

// 从 URL 解析出题目缓存所需的信息：
//   /problems/<slug>/                      -> 普通题目
//   /contest/<contest>/problems/<slug>/    -> 竞赛题目
function parseProblem(url) {
    let parsed;
    try {
        parsed = new URL(url || "");
    } catch (error) {
        return null;
    }
    if (!LEETCODE_HOST.test(parsed.hostname)) {
        return null;
    }
    const match =
        parsed.pathname.match(/^\/problems\/([^/]+)/) ||
        parsed.pathname.match(/^\/contest\/[^/]+\/problems\/([^/]+)/);
    if (!match) {
        return null;
    }
    return { origin: parsed.origin, slug: match[1] };
}

function isLeetCode(url) {
    try {
        return LEETCODE_HOST.test(new URL(url || "").hostname);
    } catch (error) {
        return false;
    }
}

function relativeTime(timestamp) {
    if (!timestamp) {
        return "";
    }
    const diff = Date.now() - timestamp;
    if (diff < 60 * 1000) {
        return "刚刚";
    }
    if (diff < 60 * 60 * 1000) {
        return `${Math.floor(diff / 60000)} 分钟前`;
    }
    if (diff < 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / 3600000)} 小时前`;
    }
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return `${Math.floor(diff / 86400000)} 天前`;
    }
    const date = new Date(timestamp);
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// -------------------- 区域切换 --------------------

function showStateNode(node) {
    for (const item of [els.loading, els.notLeetcode, els.error]) {
        item.hidden = item !== node;
    }
    els.viewCurrent.hidden = false;
    els.viewHistory.hidden = true;
    els.workspace.hidden = true;
}

function showOnlyHistory() {
    els.viewCurrent.hidden = true;
    els.workspace.hidden = true;
    els.viewHistory.hidden = false;
}

function showOnlyWorkspace() {
    els.viewCurrent.hidden = true;
    els.viewHistory.hidden = true;
    els.workspace.hidden = false;
}

function showError(message) {
    ui.status = "error";
    ui.error = message;
    els.error.textContent = message;
    showStateNode(els.error);
}

function showNotProblem(url) {
    ui.status = "notproblem";
    const onLeetCode = isLeetCode(url);
    els.notLeetcodeTitle.textContent = onLeetCode
        ? "当前不是 LeetCode 题目页"
        : "当前不是 LeetCode 页面";
    els.notLeetcodeText.textContent = onLeetCode
        ? "请打开 leetcode.cn 或 leetcode.com 上的某道算法题（含竞赛题目）后再点击本扩展。"
        : "本扩展仅在 leetcode.cn / leetcode.com 的题目页生效；可以切到「历史题目」查看之前缓存的题目。";
    showStateNode(els.notLeetcode);
}

// 历史列表「清空」按钮的二次确认状态
let clearArmed = false;
let clearTimer = null;

function resetClearButton() {
    clearArmed = false;
    clearTimeout(clearTimer);
    els.historyClear.textContent = "清空";
    els.historyClear.classList.remove("btn--danger");
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

// -------------------- 详情渲染 --------------------

function difficultyLabel(value) {
    return DIFFICULTY_LABEL[value] || value || "";
}

function displayTitle() {
    const d = state.viewData;
    const name = d.translatedTitle || d.title || "";
    return `${d.frontendId ? `${d.frontendId}. ` : ""}${name}`;
}

function currentContent() {
    return state.stripHtml ? state.viewData.contentText : state.viewData.contentHtml;
}

function currentSnippet() {
    const snippets = Array.isArray(state.viewData.codeSnippets) ? state.viewData.codeSnippets : [];
    return snippets.find((item) => item.langSlug === state.langSlug) || null;
}

function currentTags() {
    return Array.isArray(state.viewData.tags) ? state.viewData.tags : [];
}

function currentHints() {
    return Array.isArray(state.viewData.hints) ? state.viewData.hints : [];
}

// 标签用空格连接，粘贴到笔记 / 搜索框里都方便
function tagsText() {
    return currentTags().join(" ");
}

// 单个提示直接输出；多个提示带上序号
function hintsText() {
    const hints = currentHints();
    if (hints.length <= 1) {
        return hints[0] || "";
    }
    return hints.map((hint, index) => `${index + 1}. ${hint}`).join("\n");
}

function renderTags() {
    const tags = currentTags();
    els.tagsPreview.textContent = "";

    if (!tags.length) {
        els.tagsPreview.textContent = "（该题未提供标签）";
        els.tagsPreview.classList.add("preview--empty");
        return;
    }

    els.tagsPreview.classList.remove("preview--empty");
    for (const tag of tags) {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.textContent = tag;
        els.tagsPreview.appendChild(chip);
    }
}

function renderHints() {
    const hints = currentHints();
    els.hintsPreview.textContent = hints.length ? hintsText() : "（该题未提供提示）";
    els.hintsPreview.classList.toggle("preview--empty", !hints.length);
}

function renderLanguages() {
    const snippets = Array.isArray(state.viewData.codeSnippets) ? state.viewData.codeSnippets : [];
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
    const candidates = [state.langSlug, state.viewData.currentLangSlug, DEFAULT_LANG, "python3"];
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

// 详情顶部的来源说明 + 按钮
function renderDetailBar() {
    const fromHistory = state.viewFrom === "history";
    els.btnRefresh.hidden = fromHistory;
    els.btnBack.hidden = !fromHistory;

    const cachedAt = state.viewData.cachedAt ? relativeTime(state.viewData.cachedAt) : "";
    if (fromHistory) {
        els.detailSource.textContent = `历史记录 · 缓存于 ${cachedAt || "之前"}`;
    } else if (state.currentFromCache) {
        els.detailSource.textContent = `本地缓存 · 缓存于 ${cachedAt || "之前"}`;
    } else {
        els.detailSource.textContent = "已从当前页面读取";
    }
}

function renderWorkspace() {
    const d = state.viewData;
    els.problemTitle.textContent = displayTitle();
    els.difficulty.textContent = difficultyLabel(d.difficulty);
    els.difficulty.dataset.level = (d.difficulty || "").toLowerCase();

    renderLanguages();
    renderTags();
    renderHints();
    renderPreviews();
    renderDetailBar();
    showOnlyWorkspace();
}

// -------------------- 复制内容组装 --------------------

function buildAll() {
    const d = state.viewData;
    const snippet = currentSnippet();
    const lines = [];

    lines.push(`# ${displayTitle()}`);
    lines.push("");

    const meta = [];
    if (d.contest) {
        meta.push(`竞赛：${d.contest}`);
    }
    if (d.difficulty) {
        meta.push(`难度：${difficultyLabel(d.difficulty)}`);
    }
    if (currentTags().length) {
        meta.push(`标签：${tagsText()}`);
    }
    meta.push(`链接：${d.url}`);
    lines.push(meta.join("　|　"));
    lines.push("");

    lines.push("## 题目描述");
    lines.push("");
    lines.push(currentContent());
    lines.push("");

    if (currentHints().length) {
        lines.push("## 提示");
        lines.push("");
        lines.push(hintsText());
        lines.push("");
    }

    if (snippet) {
        lines.push(`## 实现方法（${snippet.lang}）`);
        lines.push("");
        lines.push("```" + (FENCE_LANG[snippet.langSlug] || snippet.langSlug));
        lines.push(snippet.code);
        lines.push("```");
    }

    return lines.join("\n");
}

// -------------------- 历史题目 --------------------

function updateHistoryBadge() {
    const count = readIndex().length;
    els.historyCount.textContent = String(count);
    els.historyCount.hidden = count === 0;
}

function metaTitle(meta) {
    const name = meta.translatedTitle || meta.title || meta.slug;
    return `${meta.frontendId ? `${meta.frontendId}. ` : ""}${name}`;
}

function renderHistoryList() {
    const keyword = (els.historySearch.value || "").trim().toLowerCase();
    const all = readIndex();
    const list = keyword
        ? all.filter((item) =>
              `${item.frontendId} ${metaTitle(item)} ${item.slug}`.toLowerCase().includes(keyword)
          )
        : all;

    els.historyList.textContent = "";

    if (!all.length) {
        els.historyEmpty.textContent = "还没有缓存的题目，打开任意一道题后会自动记录。";
        els.historyEmpty.hidden = false;
        els.historyList.hidden = true;
        return;
    }

    if (!list.length) {
        els.historyEmpty.textContent = "没有匹配的题目";
        els.historyEmpty.hidden = false;
        els.historyList.hidden = true;
        return;
    }

    els.historyEmpty.hidden = true;
    els.historyList.hidden = false;

    for (const item of list) {
        const li = document.createElement("li");
        li.className = "history-item";
        if (item.key === state.currentKey) {
            li.classList.add("history-item--current");
        }

        const main = document.createElement("button");
        main.type = "button";
        main.className = "history-item__main";
        main.addEventListener("click", () => openHistory(item.key));

        const title = document.createElement("span");
        title.className = "history-item__title";
        title.textContent = metaTitle(item);

        const info = document.createElement("span");
        info.className = "history-item__meta";

        if (item.difficulty) {
            const level = document.createElement("span");
            level.className = "tag";
            level.dataset.level = item.difficulty.toLowerCase();
            level.textContent = difficultyLabel(item.difficulty);
            info.appendChild(level);
        }

        const time = document.createElement("span");
        time.textContent = relativeTime(item.visitedAt);
        info.appendChild(time);

        if (Array.isArray(item.tags) && item.tags.length) {
            const tags = document.createElement("span");
            tags.className = "history-item__tags";
            tags.textContent = item.tags.join(" ");
            info.appendChild(tags);
        }

        main.append(title, info);

        const del = document.createElement("button");
        del.type = "button";
        del.className = "history-item__del";
        del.title = "删除该条缓存";
        del.textContent = "✕";
        del.addEventListener("click", (event) => {
            event.stopPropagation();
            removeCached(item.key);
            if (item.key === state.currentKey) {
                // 当前题目的缓存被删掉了，下次打开会重新从页面读取
                state.currentFromCache = false;
            }
            updateHistoryBadge();
            renderHistoryList();
            toast("已删除该条缓存");
        });

        li.append(main, del);
        els.historyList.appendChild(li);
    }
}

function openHistory(key) {
    const record = getCached(key);
    if (!record) {
        removeCached(key);
        updateHistoryBadge();
        renderHistoryList();
        toast("缓存已失效，请重新打开该题目页");
        return;
    }

    state.viewData = record;
    state.viewFrom = "history";
    renderWorkspace();
}

function backToHistoryList() {
    state.viewFrom = "history";
    renderHistoryList();
    showOnlyHistory();
}

// -------------------- 标签页切换 --------------------

function selectTab(mode) {
    ui.mode = mode;
    els.tabCurrent.classList.toggle("tab--active", mode === "current");
    els.tabHistory.classList.toggle("tab--active", mode === "history");
    els.tabCurrent.setAttribute("aria-selected", String(mode === "current"));
    els.tabHistory.setAttribute("aria-selected", String(mode === "history"));

    if (mode === "history") {
        renderHistoryList();
        showOnlyHistory();
        return;
    }

    showCurrentTab();
}

function showCurrentTab() {
    if (ui.status === "ready" && state.currentData) {
        state.viewData = state.currentData;
        state.viewFrom = "current";
        renderWorkspace();
        return;
    }
    if (ui.status === "error") {
        els.error.textContent = ui.error;
        showStateNode(els.error);
        return;
    }
    if (ui.status === "notproblem") {
        showStateNode(els.notLeetcode);
        return;
    }
    showStateNode(els.loading);
}

// -------------------- 加载题目 --------------------

// 从当前页面抓取题目，成功后写入缓存
async function loadFromPage() {
    state.viewFrom = "current";
    state.currentFromCache = false;

    if (!state.tabId) {
        showNotProblem("");
        return;
    }

    showStateNode(els.loading);

    let response;
    try {
        response = await askContentScript(state.tabId);
    } catch (error) {
        showError(`无法与页面通信：${error.message}。请刷新题目页后重试。`);
        return;
    }

    if (!response || !response.ok) {
        showError((response && response.error) || "读取题目失败，请刷新页面后重试。");
        return;
    }

    const data = response.data;
    const target = state.target || parseProblem(data.url);
    state.currentData = data;
    state.viewData = data;
    ui.status = "ready";

    if (target) {
        state.currentKey = problemKey(target);
        const meta = saveProblem(state.currentKey, data);
        if (meta) {
            // 把保存时间带到界面上，详情头部需要显示「缓存于 x」
            data.cachedAt = meta.visitedAt;
        }
        updateHistoryBadge();
    }

    // 抓取期间用户可能已经切到「历史题目」标签，此时不要再强行切回详情
    if (ui.mode === "current") {
        renderWorkspace();
    }
}

async function refreshCurrent() {
    if (!state.target) {
        return;
    }
    await loadFromPage();
}

// -------------------- 事件绑定 --------------------

function bindEvents() {
    els.tabCurrent.addEventListener("click", () => selectTab("current"));
    els.tabHistory.addEventListener("click", () => selectTab("history"));

    els.historySearch.addEventListener("input", () => renderHistoryList());

    // 清空需要点两次：弹窗里用 confirm() 容易丢焦点，改用按钮二次确认
    els.historyClear.addEventListener("click", () => {
        if (!readIndex().length) {
            toast("没有可清空的缓存");
            return;
        }
        if (!clearArmed) {
            clearArmed = true;
            els.historyClear.textContent = "再点一次确认";
            els.historyClear.classList.add("btn--danger");
            clearTimeout(clearTimer);
            clearTimer = setTimeout(resetClearButton, 3000);
            return;
        }

        resetClearButton();
        clearAll();
        state.currentFromCache = false;
        if (state.viewFrom === "history") {
            state.viewData = state.currentData;
            state.viewFrom = "current";
        }
        updateHistoryBadge();
        renderHistoryList();
        toast("已清空全部缓存");
    });

    els.btnRefresh.addEventListener("click", refreshCurrent);
    els.btnOpen.addEventListener("click", () => {
        const url = state.viewData && state.viewData.url;
        if (url) {
            chrome.tabs.create({ url });
        }
    });
    els.btnBack.addEventListener("click", backToHistoryList);

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

    els.copyTags.addEventListener("click", () => copy(tagsText(), "标签"));

    els.copyHints.addEventListener("click", () => copy(hintsText(), "提示"));

    els.copyMethod.addEventListener("click", () => {
        const snippet = currentSnippet();
        copy(snippet ? snippet.code : "", "代码");
    });

    els.copyAll.addEventListener("click", () => copy(buildAll(), "全部内容"));
}

// -------------------- 初始化 --------------------

async function init() {
    bindEvents();
    updateHistoryBadge();

    const stored = await chrome.storage.sync.get({ lc_strip_html: true, lc_lang: "" });
    state.stripHtml = stored.lc_strip_html;
    state.langSlug = stored.lc_lang || DEFAULT_LANG;
    els.stripHtml.checked = state.stripHtml;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    state.tabId = tab ? tab.id : null;
    state.target = tab ? parseProblem(tab.url) : null;

    if (!state.target) {
        showNotProblem(tab ? tab.url : "");
        return;
    }

    state.currentKey = problemKey(state.target);

    // 关键：本地已有缓存就直接用，不再向页面请求
    const cached = getCached(state.currentKey);
    if (cached) {
        state.currentData = cached;
        state.viewData = cached;
        state.viewFrom = "current";
        state.currentFromCache = true;
        ui.status = "ready";
        touchMeta(state.currentKey);
        updateHistoryBadge();
        renderWorkspace();
        return;
    }

    await loadFromPage();
}

init();
