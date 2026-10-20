/**
 * ============================================================================
 * JSON Viewer —— 内容脚本（js/content.js）
 * ============================================================================
 *
 * 注入到所有页面，但只有在「裸 JSON 文档」页面才真正干活：
 *
 *   1. 识别页面：Content-Type 是 JSON，或者「页面只有一个 <pre> / 纯文本 body」
 *      且内容能 JSON.parse —— 后者用来兜底那些把 JSON 当 text/plain 返回的接口。
 *   2. 渲染界面：用一个全屏浮层盖住原始文本（原始文本不动，随时可以切回去），
 *      浮层里是「语法高亮 + 可逐层折叠」的树。
 *   3. 工具栏：展开全部 / 折叠全部 / 缩进 / 搜索 / 复制 / 原始视图 / 主题 / 关闭。
 *   4. 响应工具栏图标点击：background.js 会转发一条 JV_TOGGLE_VIEW 消息，
 *      用来在「格式化视图」和「原始视图」之间来回切换。
 *
 * 依赖：js/tree.js（提供 window.JsonTree，负责纯渲染）
 * ============================================================================
 */

(function () {
    "use strict";

    // ------------------------------------------------------------------
    // 0. 防止重复注入（比如用户手动 executeScript 时）
    // ------------------------------------------------------------------
    if (window.__JSON_VIEWER_LOADED__) {
        return;
    }
    window.__JSON_VIEWER_LOADED__ = true;

    // ------------------------------------------------------------------
    // 1. 常量与状态
    // ------------------------------------------------------------------

    /** 偏好设置存在 chrome.storage.local 里的 key */
    const PREFS_KEY = "jsonViewerPrefs";

    /** 默认偏好：主题跟随系统、缩进 2 空格、默认展开 3 层 */
    const DEFAULT_PREFS = { theme: "auto", indent: 2, expandDepth: 3 };

    /** 主题的轮换顺序（点一次换个主题） */
    const THEME_ORDER = ["auto", "light", "dark"];

    /** 主题在按钮上的文案 */
    const THEME_LABEL = { auto: "主题：跟随系统", light: "主题：浅色", dark: "主题：深色" };

    /**
     * 全局状态。
     * raw 为 null 表示「当前页面不是 JSON 页面」，此时整个脚本什么都不做。
     */
    const state = {
        raw: null,          // 页面里原始的 JSON 文本
        data: null,         // JSON.parse 之后的数据
        parsedOk: false,    // 解析是否成功（根节点合法值是 null 时也不能用 data 判断）
        parseError: null,   // 解析失败时的错误对象
        parseCost: 0,       // 解析耗时（毫秒），显示在状态栏
        view: "formatted",  // 当前视图：formatted（树） / raw（原始文本）
        theme: DEFAULT_PREFS.theme,
        indent: DEFAULT_PREFS.indent,
        expandDepth: DEFAULT_PREFS.expandDepth,
        app: null,          // 浮层根元素
        tree: null,         // JsonTree.create() 的返回值
        hits: [],           // 搜索命中的行元素
        hitIndex: -1,       // 当前定位到第几个命中
        ui: null,           // 工具栏里会用到的元素引用
        onKeydown: null,    // 注册在 document 上的键盘监听（关闭时要解绑）
        onSchemeChange: null, // 系统深浅色变化监听
    };

    // ------------------------------------------------------------------
    // 2. 通用小工具
    // ------------------------------------------------------------------

    /**
     * 创建元素（和 tree.js 里的同名函数一样的套路，简单复制一份，
     * 避免两个文件之间产生隐藏依赖）。
     */
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text !== undefined) {
            node.textContent = text;
        }
        return node;
    }

    /** 创建工具栏按钮 */
    function button(label, title, onClick) {
        const btn = el("button", "jv-btn", label);
        btn.type = "button";
        btn.title = title || label;
        btn.addEventListener("click", onClick);
        return btn;
    }

    /** 去掉可能存在的 UTF-8 BOM，否则 JSON.parse 会报错 */
    function stripBOM(text) {
        return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
    }

    /** 字节数转人类可读（1.2 KB / 3.4 MB） */
    function formatSize(bytes) {
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    }

    /** 把缩进偏好转成 JSON.stringify 需要的参数 */
    function indentValue(indent) {
        return indent === "tab" ? "\t" : Number(indent) || 2;
    }

    /** 简单的防抖，避免每敲一个字符就把整棵树扫一遍 */
    function debounce(fn, wait) {
        let timer = 0;
        return function debounced(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // ------------------------------------------------------------------
    // 3. 页面识别
    // ------------------------------------------------------------------

    /**
     * 判断当前页面是不是「裸 JSON 文档」，是的话返回页面里的 JSON 文本。
     * 判定规则：
     *   a) 响应头 Content-Type 含 json → 直接认定；
     *   b) 页面结构极简（没有元素子节点，或只有一个 <pre>）且文本以 { / [ 开头，
     *      并且能 JSON.parse 成功 → 认定（兜底 text/plain 返回 JSON 的接口）。
     * 其它情况一律返回 null，保证不会误伤普通网页。
     *
     * @returns {string|null}
     */
    function readJsonText() {
        const body = document.body;
        if (!body) {
            return null;
        }

        const contentType = (document.contentType || "").toLowerCase();
        const looksLikeJsonType = contentType.indexOf("json") !== -1;

        // 过滤掉 <script> / <style>，它们不影响「裸文本页」的判断
        const elementChildren = Array.prototype.filter.call(
            body.children,
            (node) => node.tagName !== "SCRIPT" && node.tagName !== "STYLE"
        );
        const simpleDoc =
            elementChildren.length === 0 ||
            (elementChildren.length === 1 && elementChildren[0].tagName === "PRE");

        // 既不是 JSON 响应头，又不是裸文本结构 → 肯定不是我们要处理的页面
        if (!looksLikeJsonType && !simpleDoc) {
            return null;
        }

        // Chrome 打开 JSON 文件时会把内容包在一个 <pre> 里，优先取它
        const pre = body.querySelector("pre");
        const text = (pre ? pre.textContent : body.textContent) || "";
        const trimmed = stripBOM(text).trim();

        // 只认对象和数组（接口 99% 都是这两种），避免把普通文本页面误判成 JSON
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            return null;
        }

        // 响应头明确是 JSON 时信任服务器（即使内容不合法，也进来展示错误信息）
        if (looksLikeJsonType) {
            return text;
        }

        // 否则必须真的能解析成功，才认为是 JSON 页面
        try {
            JSON.parse(trimmed);
            return text;
        } catch (err) {
            return null;
        }
    }

    // ------------------------------------------------------------------
    // 4. 偏好设置读写
    // ------------------------------------------------------------------

    /** 读取用户偏好；扩展上下文失效（扩展被重载）时回退到默认值 */
    function loadPrefs() {
        return new Promise((resolve) => {
            try {
                chrome.storage.local.get(PREFS_KEY, (result) => {
                    resolve(Object.assign({}, DEFAULT_PREFS, (result && result[PREFS_KEY]) || {}));
                });
            } catch (err) {
                resolve(Object.assign({}, DEFAULT_PREFS));
            }
        });
    }

    /** 保存用户偏好（失败也无所谓，下次打开就用默认值） */
    function savePrefs() {
        try {
            const prefs = { theme: state.theme, indent: state.indent, expandDepth: state.expandDepth };
            chrome.storage.local.set({ [PREFS_KEY]: prefs });
        } catch (err) {
            /* 扩展上下文已失效，忽略 */
        }
    }

    // ------------------------------------------------------------------
    // 5. 主题
    // ------------------------------------------------------------------

    /** 当前是否应该用深色（auto 模式下跟随系统） */
    function isDarkMode() {
        if (state.theme === "dark") {
            return true;
        }
        if (state.theme === "light") {
            return false;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    /** 把主题应用到浮层上（CSS 变量全挂在 .jv-app 上） */
    function applyTheme() {
        if (!state.app) {
            return;
        }
        state.app.classList.toggle("is-dark", isDarkMode());
        if (state.ui && state.ui.themeBtn) {
            state.ui.themeBtn.textContent = THEME_LABEL[state.theme];
        }
    }

    // ------------------------------------------------------------------
    // 6. 工具栏
    // ------------------------------------------------------------------

    /**
     * 构建顶部工具栏。
     * @param {HTMLElement} app 浮层根元素
     * @returns {{toolbar: HTMLElement, ui: object}} ui 里是后续需要改状态的元素引用
     */
    function buildToolbar(app) {
        const toolbar = el("header", "jv-toolbar");

        // ---- 品牌 + 文件信息 ----
        const brand = el("div", "jv-brand");
        brand.appendChild(el("span", "jv-logo", "{ }"));
        brand.appendChild(el("span", "jv-brand-text", "JSON Viewer"));

        const status = el("div", "jv-status");
        const sizeText = formatSize(new Blob([state.raw]).size);
        const summaryText = !state.parsedOk
            ? "解析失败"
            : `${sizeText} · ${state.tree ? state.tree.nodeCount : 0} 个节点 · 解析 ${state.parseCost} ms`;
        status.textContent = summaryText;
        brand.appendChild(status);

        // ---- 右侧按钮组 ----
        const actions = el("div", "jv-actions");

        // 展开全部 / 折叠全部：只是切 class，几乎是瞬时的
        const expandBtn = button("展开全部", "展开所有层级", () => {
            state.tree.expandAll();
            clearSearch();
        });
        const collapseBtn = button("折叠全部", "折叠所有层级", () => {
            state.tree.collapseAll();
            clearSearch();
        });

        // 缩进选择：只影响树的缩进宽度 + 复制出来的文本
        const indentWrap = el("label", "jv-field");
        indentWrap.appendChild(el("span", "jv-field-label", "缩进"));
        const indentSelect = el("select", "jv-select");
        [
            ["2", "2 空格"],
            ["4", "4 空格"],
            ["tab", "Tab"],
        ].forEach(([value, label]) => {
            const option = el("option", "", label);
            option.value = value;
            indentSelect.appendChild(option);
        });
        indentSelect.value = String(state.indent);
        indentSelect.addEventListener("change", () => {
            state.indent = indentSelect.value === "tab" ? "tab" : Number(indentSelect.value);
            state.tree.setIndent(state.indent);
            savePrefs();
        });
        indentWrap.appendChild(indentSelect);

        // 搜索框 + 命中计数 + 上一个 / 下一个
        const searchWrap = el("div", "jv-search");
        const searchInput = el("input", "jv-search-input");
        searchInput.type = "search";
        searchInput.placeholder = "搜索键名或值（Ctrl+F）";
        searchInput.spellcheck = false;
        const searchCount = el("span", "jv-search-count", "");
        const prevBtn = button("↑", "上一个匹配项", () => goToHit(state.hitIndex - 1));
        const nextBtn = button("↓", "下一个匹配项", () => goToHit(state.hitIndex + 1));
        prevBtn.classList.add("jv-btn--icon");
        nextBtn.classList.add("jv-btn--icon");
        searchWrap.appendChild(searchInput);
        searchWrap.appendChild(searchCount);
        searchWrap.appendChild(prevBtn);
        searchWrap.appendChild(nextBtn);

        // 输入即搜索（防抖 200ms：大文件下边打字边扫描会很卡）
        const debouncedSearch = debounce(() => runSearch(searchInput.value), 200);
        searchInput.addEventListener("input", debouncedSearch);
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                // Enter 下一个，Shift+Enter 上一个
                goToHit(state.hitIndex + (event.shiftKey ? -1 : 1));
            } else if (event.key === "Escape") {
                searchInput.value = "";
                runSearch("");
                searchInput.blur();
            }
        });

        // 复制：按当前缩进把数据重新序列化
        const copyBtn = button("复制 JSON", "复制格式化后的 JSON 到剪贴板", async () => {
            const text = JSON.stringify(state.data, null, indentValue(state.indent));
            const ok = await copyText(text);
            const original = "复制 JSON";
            copyBtn.textContent = ok ? "已复制 ✓" : "复制失败";
            setTimeout(() => {
                copyBtn.textContent = original;
            }, 1200);
        });

        // 原始视图 / 格式化视图 切换
        const rawBtn = button("原始视图", "查看服务器返回的原始文本", () => {
            showView(state.view === "raw" ? "formatted" : "raw");
        });

        // 主题：auto → light → dark → auto ...
        const themeBtn = button(THEME_LABEL[state.theme], "切换浅色 / 深色主题", () => {
            const index = THEME_ORDER.indexOf(state.theme);
            state.theme = THEME_ORDER[(index + 1) % THEME_ORDER.length];
            applyTheme();
            savePrefs();
        });

        // 关闭：直接移除浮层，页面恢复成 Chrome 默认的纯文本 JSON
        const closeBtn = button("关闭", "关闭 JSON Viewer，恢复页面原始文本", () => {
            unmount();
        });

        [expandBtn, collapseBtn, indentWrap, searchWrap, copyBtn, rawBtn, themeBtn, closeBtn].forEach((item) => {
            actions.appendChild(item);
        });

        toolbar.appendChild(brand);
        toolbar.appendChild(actions);
        app.appendChild(toolbar);

        return {
            toolbar,
            ui: {
                expandBtn,
                collapseBtn,
                indentSelect,
                searchInput,
                searchCount,
                prevBtn,
                nextBtn,
                copyBtn,
                rawBtn,
                themeBtn,
                closeBtn,
            },
        };
    }

    /**
     * 写剪贴板。
     * 优先用异步的 navigator.clipboard；它在非聚焦 / 非安全上下文会失败，
     * 所以再兜底一个「隐藏 textarea + execCommand」的老写法。
     */
    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            try {
                const area = el("textarea");
                area.value = text;
                area.style.position = "fixed";
                area.style.opacity = "0";
                document.body.appendChild(area);
                area.select();
                const ok = document.execCommand("copy");
                area.remove();
                return ok;
            } catch (err2) {
                return false;
            }
        }
    }

    // ------------------------------------------------------------------
    // 7. 搜索
    // ------------------------------------------------------------------

    /** 清除所有搜索高亮 */
    function clearSearch() {
        if (!state.tree) {
            return;
        }
        state.tree.root.querySelectorAll(".jv-row.jv-hit").forEach((row) => {
            row.classList.remove("jv-hit", "jv-hit--current");
        });
        state.hits = [];
        state.hitIndex = -1;
        if (state.ui) {
            state.ui.searchCount.textContent = "";
        }
    }

    /** 刷新「第 n / 共 m 个」提示 */
    function updateSearchCount() {
        if (!state.ui) {
            return;
        }
        if (!state.hits.length) {
            state.ui.searchCount.textContent = state.ui.searchInput.value ? "0 个" : "";
            return;
        }
        state.ui.searchCount.textContent = `${state.hitIndex + 1} / ${state.hits.length}`;
    }

    /**
     * 执行搜索：扫描所有行，把包含关键字的行标上 .jv-hit。
     * 说明：折叠起来的行也在 DOM 里（只是被 CSS 隐藏），所以也会被搜索到，
     * 跳到命中项时会自动展开它的祖先节点。
     */
    function runSearch(keyword) {
        clearSearch();
        if (!state.tree || !keyword) {
            return;
        }
        const needle = keyword.toLowerCase();
        state.tree.root.querySelectorAll(".jv-row").forEach((row) => {
            if (row.textContent.toLowerCase().indexOf(needle) !== -1) {
                row.classList.add("jv-hit");
                state.hits.push(row);
            }
        });
        if (state.hits.length) {
            goToHit(0);
        } else {
            updateSearchCount();
        }
    }

    /**
     * 定位到第 index 个命中项（循环：到底了回到第一个）。
     * 定位前先把祖先节点展开，否则命中的行是不可见的。
     */
    function goToHit(index) {
        if (!state.hits.length) {
            return;
        }
        // 取模实现循环翻页（负数也能正确绕回去）
        const total = state.hits.length;
        state.hitIndex = ((index % total) + total) % total;

        state.hits.forEach((row) => row.classList.remove("jv-hit--current"));
        const current = state.hits[state.hitIndex];
        current.classList.add("jv-hit--current");

        // 展开所有祖先容器，保证这一行可见
        state.tree.expandAncestors(current);
        current.scrollIntoView({ block: "center", inline: "nearest" });
        updateSearchCount();
    }

    // ------------------------------------------------------------------
    // 8. 视图切换
    // ------------------------------------------------------------------

    /**
     * 切换「格式化视图」和「原始视图」。
     * @param {"formatted"|"raw"} kind
     */
    function showView(kind) {
        if (!state.ui) {
            return;
        }
        const { content, rawBtn, expandBtn, collapseBtn, indentSelect, searchInput, prevBtn, nextBtn, copyBtn } = state.ui;

        state.view = kind;
        content.textContent = ""; // 清空当前视图（DOM 节点之后可以复用）

        if (kind === "raw") {
            content.appendChild(el("pre", "jv-raw", state.raw));
            clearSearch();
            rawBtn.textContent = "格式化视图";
        } else {
            // 解析失败时没有树可看，退回原始视图
            if (!state.parsedOk || !state.tree) {
                showView("raw");
                return;
            }
            content.appendChild(state.tree.root);
            rawBtn.textContent = "原始视图";
        }

        // 原始视图下，只在树上生效的按钮统一禁用，避免误操作
        const disable = kind === "raw" || !state.parsedOk;
        [expandBtn, collapseBtn, indentSelect, searchInput, prevBtn, nextBtn, copyBtn].forEach((node) => {
            node.disabled = disable;
        });
        // 解析失败时没有「格式化视图」可回，切换按钮也一并禁用
        rawBtn.disabled = !state.parsedOk;

        // 回到格式化视图时，把之前的搜索关键词重新执行一次
        if (!disable && state.ui.searchInput.value) {
            runSearch(state.ui.searchInput.value);
        }
    }

    // ------------------------------------------------------------------
    // 9. 挂载 / 卸载
    // ------------------------------------------------------------------

    /** 挂载全屏浮层 */
    function mount() {
        if (state.app || state.raw === null) {
            return;
        }

        // ---- 解析 JSON（顺便计时，显示在状态栏） ----
        const started = performance.now();
        try {
            state.data = JSON.parse(stripBOM(state.raw));
            state.parsedOk = true;
            state.parseError = null;
        } catch (err) {
            state.data = null;
            state.parsedOk = false;
            state.parseError = err;
        }
        state.parseCost = Math.round(performance.now() - started);

        // ---- 用 tree.js 渲染树 ----
        if (state.parsedOk) {
            state.tree = window.JsonTree.create(state.data, { expandDepth: state.expandDepth });
            state.tree.setIndent(state.indent);
        } else {
            state.tree = null;
        }

        // ---- 浮层骨架 ----
        const app = el("div", "jv-app");
        app.id = "json-viewer-app";
        app.dataset.theme = state.theme;
        state.app = app;

        // 工具栏
        const built = buildToolbar(app);
        state.ui = built.ui;

        // 解析失败时给一条红色横幅提示（JSON 很常见的手滑：多打一个逗号）
        if (state.parseError) {
            const banner = el("div", "jv-banner");
            banner.appendChild(el("strong", "", "JSON 解析失败："));
            banner.appendChild(el("span", "", state.parseError.message));
            banner.appendChild(el("em", "", "已自动切换到原始视图。"));
            app.appendChild(banner);
        }

        // 内容区
        const content = el("div", "jv-content");
        state.ui.content = content;
        app.appendChild(content);

        document.documentElement.appendChild(app);

        // 主题 + 首屏视图
        applyTheme();
        showView(state.parsedOk ? "formatted" : "raw");

        // ---- 绑定键盘快捷键 ----
        state.onKeydown = (event) => {
            const key = (event.key || "").toLowerCase();
            // Ctrl/Cmd + F：把焦点抢到我们的搜索框（浏览器自带的查找只能找纯文本）
            if ((event.ctrlKey || event.metaKey) && key === "f") {
                event.preventDefault();
                state.ui.searchInput.focus();
                state.ui.searchInput.select();
                return;
            }
            // Esc：有搜索内容时先清空搜索，否则关闭视图
            if (key === "escape") {
                if (state.ui.searchInput.value) {
                    state.ui.searchInput.value = "";
                    runSearch("");
                } else {
                    unmount();
                }
            }
        };
        document.addEventListener("keydown", state.onKeydown, true);

        // ---- 跟随系统深浅色变化 ----
        state.onSchemeChange = () => {
            if (state.theme === "auto") {
                applyTheme();
            }
        };
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", state.onSchemeChange);
    }

    /** 移除浮层，恢复页面原貌（原始 JSON 文本一直在页面里，没被破坏） */
    function unmount() {
        if (state.app) {
            state.app.remove();
            state.app = null;
        }
        if (state.onKeydown) {
            document.removeEventListener("keydown", state.onKeydown, true);
            state.onKeydown = null;
        }
        if (state.onSchemeChange) {
            window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", state.onSchemeChange);
            state.onSchemeChange = null;
        }
        // 树和 UI 引用一起清掉，下次挂载会重新渲染
        state.tree = null;
        state.ui = null;
        state.hits = [];
        state.hitIndex = -1;
    }

    // ------------------------------------------------------------------
    // 10. 消息：工具栏图标点击 → 切换视图
    // ------------------------------------------------------------------

    try {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (!message || message.type !== "JV_TOGGLE_VIEW") {
                return undefined; // 不是我们的消息，交给别人处理
            }
            // 当前页面不是 JSON 页面：告诉 background 一声，让它给个提示
            if (state.raw === null) {
                sendResponse({ ok: false, reason: "not-json-page" });
                return undefined;
            }
            if (!state.app) {
                mount(); // 之前被关掉了，重新挂载
                sendResponse({ ok: true, action: "mount" });
                return undefined;
            }
            showView(state.view === "raw" ? "formatted" : "raw");
            sendResponse({ ok: true, action: "toggle" });
            return undefined;
        });
    } catch (err) {
        /* 扩展上下文失效时忽略 */
    }

    // ------------------------------------------------------------------
    // 11. 启动
    // ------------------------------------------------------------------

    (async function init() {
        // 第一步永远是「这是不是 JSON 页面」，不是就直接退出，零副作用
        const text = readJsonText();
        if (text === null) {
            return;
        }
        // 超大文件保护：直接把几十 MB 文本塞进 DOM 会让标签页卡死
        if (text.length > 8 * 1024 * 1024) {
            console.warn("[JSON Viewer] 文件超过 8MB，已跳过格式化。");
            return;
        }

        state.raw = text;
        const prefs = await loadPrefs();
        state.theme = prefs.theme || DEFAULT_PREFS.theme;
        state.indent = prefs.indent || DEFAULT_PREFS.indent;
        state.expandDepth = Number(prefs.expandDepth) || DEFAULT_PREFS.expandDepth;

        mount();
    })();
})();
