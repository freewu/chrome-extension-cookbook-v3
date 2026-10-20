# JSON Viewer 实战

前面几十章都在讲单个 `chrome.*` API，这一章我们做一个「开箱即用」的小项目：
**JSON Viewer** —— 打开 JSON 接口或 `.json` 文件时，自动把那一大坨纯文本渲染成
带语法高亮、可逐层折叠的树。

> 源码目录：`code/json-viewer`

## 一、先看效果

用 Chrome 直接打开 <https://jsonplaceholder.typicode.com/todos/1>，默认是这样的纯文本：

```text
{"userId":1,"id":1,"title":"delectus aut autem","completed":false}
```

装上扩展后，页面会变成：

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ { } JSON Viewer   36 B · 5 个节点 · 解析 0 ms   展开全部 折叠全部 缩进[2] │
│                                        搜索键名或值(Ctrl+F) 0/0 ↑ ↓       │
│                                        复制 JSON  原始视图  主题：跟随系统 关闭 │
├──────────────────────────────────────────────────────────────────────────┤
│ ▾ {  4 个键                                                              │
│   ▾ "userId": 1,                                                         │
│   ▸ "id": 1,                                                             │
│   ▸ "title": "delectus aut autem",                                       │
│   ▸ "completed": false                                                   │
│ }                                                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

（真实界面里不同类型是有颜色的：键名蓝、字符串绿、数字橙、布尔紫、`null` 红。）

几个典型操作：

| 想要 | 怎么做 |
| ---- | ---- |
| 只看整体结构 | 点「折叠全部」，再逐层点箭头展开 |
| 找某个字段 | `Ctrl / Cmd + F` → 输入关键字 → `Enter` 跳下一个 |
| 把格式化后的 JSON 带走 | 选好缩进 → 点「复制 JSON」 |
| 确认服务器到底返回了什么 | 点「原始视图」 |
| 换配色 | 点「主题：跟随系统」，在 跟随系统 → 浅色 → 深色 之间循环 |
| 恢复 Chrome 默认显示 | 点「关闭」，或按两次 `Esc` |

## 二、目录结构

```markdown
json-viewer
├── manifest.json          // 清单文件 (MV3)
├── images/icon.png
├── css/viewer.css         // 浮层 + 树 + 主题 + 搜索高亮
└── js
    ├── background.js      // service worker：图标点击 → 通知内容脚本切换视图
    ├── content.js         // 内容脚本：识别页面、浮层、工具栏、搜索、主题、偏好
    └── tree.js            // 纯渲染：JS 值 → 可折叠 DOM 树（window.JsonTree）
```

之所以拆成三份，是因为它们的心智负担完全不同：

- **tree.js** 是纯粹的「数据 → DOM」渲染器，可以单独拿去做别的页面；
- **content.js** 是「业务逻辑」，管识别、交互、快捷键、偏好；
- **background.js** 只有几十行，只做一件事：把图标点击转成一条消息。

## 三、清单文件

```json
{
    "manifest_version": 3,
    "name": "JSON Viewer",
    "version": "1.0.0",
    "action": {
        "default_title": "JSON Viewer：切换 格式化 / 原始 视图",
        "default_icon": "images/icon.png"
    },
    "background": {
        "service_worker": "js/background.js"
    },
    "permissions": ["storage"],
    "content_scripts": [
        {
            "matches": ["<all_urls>"],
            "js": ["js/tree.js", "js/content.js"],
            "css": ["css/viewer.css"],
            "run_at": "document_end",
            "all_frames": false
        }
    ]
}
```

| 配置 | 说明 |
| ---- | ---- |
| 无 `default_popup` | 点图标直接在当前页面切换视图，不弹窗 |
| `permissions: ["storage"]` | 只用来记住 主题 / 缩进 / 展开层数；不读 `tabs`，也不发任何请求 |
| `js` 顺序 | `tree.js` 必须先注入，`content.js` 才能用 `window.JsonTree` |
| `matches: <all_urls>` | 脚本注入所有页面，但「是不是 JSON 页面」由脚本自己判断 |
| `run_at: document_end` | DOM 已就绪，`body` 里能读到 Chrome 渲染好的 `<pre>` |
| `all_frames: false` | 只处理顶层文档，避免 iframe 里重复出现浮层 |

> 注意：`content_scripts` 里有 `matches` 就够了，注入不需要额外的 `host_permissions`；
> 只有当扩展自己要 `fetch` 别家地址时才需要它。

## 四、第一步：怎么判断「这是 JSON 页面」

这是整个项目最需要克制的地方。`<all_urls>` 意味着脚本会进入每一个网页，
一旦误判，用户会看到满屏乱入的浮层。

所以判定分成两条路径，最终只有「确定是裸 JSON 文档」才继续：

```js
// js/content.js
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
```

两个小细节：

1. **`stripBOM()`**。有些接口会带 UTF-8 BOM（`\uFEFF`），`JSON.parse` 遇到它会直接抛错：

   ```js
   function stripBOM(text) {
       return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
   }
   ```

2. **`document.contentType`**。它就是响应的 `Content-Type`，Chrome 打开纯文本 JSON 时
   通常是 `application/json`；而「把 JSON 当 `text/plain` 返回」的接口则要靠「页面极简 + 能解析」兜底。

> 顺带一提：新版 Chrome 已经自带了 JSON 查看器（会往 `body` 里插一个
> `.json-formatter-container`）。这不影响我们：`<pre>` 里的原始文本仍在，浮层照样盖在最上层，
> 嫌重复的话也可以按「关闭」让原生视图接管。

启动逻辑因此非常简单——**不是 JSON 页面就零副作用地退出**：

```js
(async function init() {
    const text = readJsonText();
    if (text === null) {
        return;                       // 普通网页：什么都不做
    }
    // 超大文件保护：几十 MB 文本塞进 DOM 会让标签页卡死
    if (text.length > 8 * 1024 * 1024) {
        console.warn("[JSON Viewer] 文件超过 8MB，已跳过格式化。");
        return;
    }

    state.raw = text;
    const prefs = await loadPrefs();
    state.theme = prefs.theme;
    state.indent = prefs.indent;
    state.expandDepth = Number(prefs.expandDepth) || 3;

    mount();
})();
```

## 五、第二步：全屏浮层，而不是替换页面

一个很容易走偏的做法是「把页面的 `<pre>` 换成自己的树」。这样一旦渲染出错，
用户就再也拿不回原文了。我们改用**浮层**：

```css
/* css/viewer.css */
.jv-app {
    position: fixed;
    inset: 0;
    z-index: 2147483647;       /* 尽量压在页面所有内容之上 */
    display: flex;
    flex-direction: column;
    background: var(--jv-bg);
    color: var(--jv-fg);
}
```

好处是全部变成「可逆」的：

- 关闭 = `app.remove()`，原始文本一直在页面里，立刻恢复 Chrome 默认显示；
- 「原始视图」只是把同一份 `state.raw` 再显示一遍；
- 页面刷新、前进后退都不受扩展影响。

同时，因为 CSS 注入到所有页面，所有类名统一加 `jv-` 前缀，颜色变量全挂在 `.jv-app` 上，
保证不会污染（也不会被污染）宿主页面：

```css
.jv-app {
    --jv-bg: #ffffff;
    --jv-key: #0550ae;
    --jv-string: #0a7d32;
    --jv-indent: 16px;         /* JS 会改这个变量实现「缩进切换」 */
}

.jv-app.is-dark {
    --jv-bg: #1f2430;
    --jv-key: #79c0ff;
    --jv-string: #7ee787;
}
```

## 六、第三步：把数据渲染成可折叠的树

`tree.js` 只暴露一个 `create(data, { expandDepth })`，返回 `root` 和几个操作方法。
一个节点渲染成「头部行 + 子节点容器 + 结束行」：

```text
div.jv-node
├── div.jv-row                 ← ▾ "a": [ 2 项
│   ├── span.jv-toggle         ← 折叠箭头
│   ├── span.jv-key            ← "a"
│   ├── span.jv-punc           ← :
│   ├── span.jv-bracket        ← [
│   ├── span.jv-meta           ← 2 项（展开时显示）
│   └── span.jv-summary        ← […] 2 项（折叠时显示）
├── div.jv-children            ← 子节点容器（padding-left 实现缩进）
└── div.jv-row.jv-row--close   ← ]
```

关键设计：**折叠不是删 DOM，而是加一个 class**

```js
// js/tree.js
function setCollapsed(nodeEl, collapsed) {
    if (!nodeEl.classList.contains("jv-collapsible")) {
        return;                            // 基础值 / 空容器没有可折叠的内容
    }
    nodeEl.classList.toggle("is-collapsed", collapsed);

    const arrow = nodeEl.firstElementChild.querySelector(".jv-toggle");
    if (arrow) {
        arrow.textContent = collapsed ? "▸" : "▾";
        arrow.setAttribute("aria-expanded", String(!collapsed));
    }
}
```

```css
.jv-node.is-collapsed > .jv-children,
.jv-node.is-collapsed > .jv-row--close {
    display: none;
}
```

因为所有节点一次性渲染完成，「展开全部 / 折叠全部」只是遍历一遍 class 切换，
几万个节点也是瞬间完成，不用重新渲染。

默认展开层数也是渲染时决定的，既能看到整体结构，又不会被超大 JSON 淹没：

```js
// 深度小于 expandDepth 的层次默认展开，更深的默认折叠
setCollapsed(nodeEl, depth >= ctx.expandDepth);
```

缩进切换则只改一个 CSS 变量：

```js
setIndent(indent) {
    const width = indent === "tab" ? 24 : Math.max(1, Number(indent) || 2) * 8;
    root.style.setProperty("--jv-indent", `${width}px`);
}
```

## 七、第四步：搜索与定位

浏览器的 `Ctrl + F` 只能匹配「页面上看得见的文本」，折叠起来的节点搜不到。
所以我们自己实现一个搜索框，逻辑比想象中简单——

**折叠的节点仍在 DOM 里**（只是 `display: none`），所以直接扫 `.jv-row` 就行：

```js
// js/content.js
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
    }
}
```

命中项可能藏在好几层折叠里，所以跳转前要先把祖先全部展开：

```js
function goToHit(index) {
    const total = state.hits.length;
    if (!total) {
        return;
    }
    // 取模实现循环翻页（负数也能正确绕回去）
    state.hitIndex = ((index % total) + total) % total;

    state.hits.forEach((row) => row.classList.remove("jv-hit--current"));
    const current = state.hits[state.hitIndex];
    current.classList.add("jv-hit--current");

    state.tree.expandAncestors(current);          // 展开沿途所有父节点
    current.scrollIntoView({ block: "center", inline: "nearest" });
    updateSearchCount();
}
```

```js
// js/tree.js
expandAncestors(element) {
    let current = element;
    while (current && current !== root) {
        if (current.classList.contains("jv-node")) {
            setCollapsed(current, false);
        }
        current = current.parentElement;
    }
}
```

输入做 200ms 防抖，避免每敲一个字符就扫一遍整棵树：

```js
const debouncedSearch = debounce(() => runSearch(searchInput.value), 200);
searchInput.addEventListener("input", debouncedSearch);
```

最后把 `Ctrl / Cmd + F` 抢过来，指向自己的搜索框：

```js
state.onKeydown = (event) => {
    const key = (event.key || "").toLowerCase();
    if ((event.ctrlKey || event.metaKey) && key === "f") {
        event.preventDefault();
        state.ui.searchInput.focus();
        state.ui.searchInput.select();
        return;
    }
    if (key === "escape") {
        if (state.ui.searchInput.value) {
            state.ui.searchInput.value = "";
            runSearch("");               // 第一次 Esc：清空搜索
        } else {
            unmount();                   // 第二次 Esc：关闭浮层
        }
    }
};
document.addEventListener("keydown", state.onKeydown, true);
```

## 八、第五步：图标点击 → 切换视图

工具栏图标点击在 MV3 里由 service worker 接收，它只做「转发」：

```js
// js/background.js
async function onActionClicked(tab) {
    if (!tab || typeof tab.id !== "number") {
        return;
    }
    try {
        const response = await chrome.tabs.sendMessage(tab.id, { type: "JV_TOGGLE_VIEW" });
        if (!response || !response.ok) {
            await flashBadge(tab.id, "✕");
        }
    } catch (err) {
        // 该标签页没有内容脚本：不是 http/https 页面，或扩展刚重载
        await flashBadge(tab.id, "✕");
    }
}

chrome.action.onClicked.addListener(onActionClicked);
```

`flashBadge()` 会在图标上闪一个红色 `✕`，1.5 秒后自动清除，告诉用户「这页不是 JSON 页面」。

内容脚本这边接收消息，并根据当前状态决定行为：

```js
// js/content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== "JV_TOGGLE_VIEW") {
        return undefined;                     // 不是我们的消息
    }
    if (state.raw === null) {
        sendResponse({ ok: false, reason: "not-json-page" });
        return undefined;
    }
    if (!state.app) {
        mount();                              // 之前被关掉了，重新挂载
        sendResponse({ ok: true, action: "mount" });
        return undefined;
    }
    showView(state.view === "raw" ? "formatted" : "raw");
    sendResponse({ ok: true, action: "toggle" });
    return undefined;
});
```

> 小坑：这个监听器必须放在 `try / catch` 里。扩展被重载后，旧页面里的内容脚本
> 会失去上下文，访问 `chrome.runtime` 会直接抛错。

## 九、第六步：视图切换、偏好与主题

「格式化视图」和「原始视图」共用一个内容容器，切换就是换个子节点，
顺便把只在树上有意义的按钮禁用掉：

```js
function showView(kind) {
    const { content, rawBtn, expandBtn, collapseBtn, indentSelect,
            searchInput, prevBtn, nextBtn, copyBtn } = state.ui;

    state.view = kind;
    content.textContent = "";

    if (kind === "raw") {
        content.appendChild(el("pre", "jv-raw", state.raw));
        clearSearch();
        rawBtn.textContent = "格式化视图";
    } else {
        if (!state.parsedOk || !state.tree) {
            showView("raw");                  // 解析失败时没有树可看
            return;
        }
        content.appendChild(state.tree.root);
        rawBtn.textContent = "原始视图";
    }

    const disable = kind === "raw" || !state.parsedOk;
    [expandBtn, collapseBtn, indentSelect, searchInput, prevBtn, nextBtn, copyBtn]
        .forEach((node) => { node.disabled = disable; });
    rawBtn.disabled = !state.parsedOk;        // 解析失败时没得切

    if (!disable && searchInput.value) {
        runSearch(searchInput.value);          // 回到树视图时恢复搜索
    }
}
```

偏好只需要三个字段，用 `chrome.storage.local` 记住即可：

```js
const DEFAULT_PREFS = { theme: "auto", indent: 2, expandDepth: 3 };

function loadPrefs() {
    return new Promise((resolve) => {
        try {
            chrome.storage.local.get(PREFS_KEY, (result) => {
                resolve(Object.assign({}, DEFAULT_PREFS, (result && result[PREFS_KEY]) || {}));
            });
        } catch (err) {
            resolve(Object.assign({}, DEFAULT_PREFS));   // 扩展上下文失效，用默认值
        }
    });
}
```

主题用「自动 → 浅色 → 深色」轮换，`auto` 跟随系统：

```js
function isDarkMode() {
    if (state.theme === "dark") return true;
    if (state.theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme() {
    state.app.classList.toggle("is-dark", isDarkMode());
    state.ui.themeBtn.textContent = THEME_LABEL[state.theme];
}
```

系统配色变化时也要跟着变（`auto` 模式下）：

```js
state.onSchemeChange = () => {
    if (state.theme === "auto") {
        applyTheme();
    }
};
window.matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", state.onSchemeChange);
```

## 十、第七步：别被大文件和大字符串拖死

两个真实的性能坑：

1. **超大文件**。8 MB 文本直接塞进 DOM，标签页基本就废了，所以 `init()` 里直接跳过。
2. **超长字符串**。接口里常见的 base64 图片、整段 HTML，一个值就几十万字符。
   渲染时先截断，点击才展开：

```js
// js/tree.js
const MAX_STRING_LENGTH = 2000;

if (full.length <= MAX_STRING_LENGTH) {
    span.textContent = full;
    return span;
}

const short = full.slice(0, MAX_STRING_LENGTH) + '…"';
let expanded = false;
span.classList.add("jv-string--cut");
span.textContent = short;
span.addEventListener("click", () => {
    expanded = !expanded;
    span.textContent = expanded ? full : short;
});
```

## 十一、安全：JSON 是不可信输入

JSON 来自任意接口，里面完全可能有 `<img onerror=...>` 这种内容。所以渲染全程只用
`textContent`，绝不碰 `innerHTML`：

```js
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (text !== undefined) {
        node.textContent = text;   // 当成纯文本，不会被解析成 HTML
    }
    return node;
}
```

复制也做了兜底：`navigator.clipboard` 在非聚焦 / 非安全上下文会失败，退回老写法：

```js
async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        const area = el("textarea");
        area.value = text;
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        return ok;
    }
}
```

## 十二、运行扩展

1. 打开 `chrome://extensions`，开启「开发者模式」；
2. 点击「加载已解压的扩展程序」，选择 `code/json-viewer` 目录；
3. 打开任意 JSON 地址，比如 <https://jsonplaceholder.typicode.com/todos/1>；
4. 页面自动变成树形视图，试着 `Ctrl / Cmd + F` 搜索 `title`；
5. 想验证「不会误伤普通网页」，随便打开一个新闻站，图标点击后只会闪一个 `✕`。

在 `chrome://extensions` 里重载扩展后，**记得刷新已打开的 JSON 页面**，
否则旧页面里还是旧版本的内容脚本。

## 十三、小结

这个小项目串起了几个在真实扩展里很常见的做法：

- 用 `content_scripts` + `<all_urls>` 注入，再用严格的「自我识别」把影响范围收敛到 JSON 页面；
- 用全屏浮层而不是替换页面，让所有操作都可逆；
- 折叠 / 展开只切 class，避免重建 DOM；
- 搜索复用 DOM（隐藏的节点也能被 `querySelectorAll` 找到），配合 `expandAncestors()` 定位；
- 用 CSS 变量做主题与缩进，JS 只改一个属性；
- 一切内容走 `textContent`，把 XSS 挡在渲染层之外；
- 对超大文件与超长字符串做兜底，保证任何页面都不会被拖死。

## 资料

```markdown
https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/action?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/runtime?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/storage?hl=zh-cn
```
