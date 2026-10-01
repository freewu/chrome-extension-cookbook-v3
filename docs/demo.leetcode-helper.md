# LeetCode 助手 实战

前面几章都在讲单个 `chrome.*` API，这一章我们做一个更贴近日常的完整小项目：一个
**只在 `leetcode.cn` / `leetcode.com` 题目页生效**的「LeetCode 助手」扩展。

打开任意一道算法题，点击工具栏图标，就能一键复制：

- **标题**（自动带上题号）
- **题目内容**（可切换是否去除 HTML 标签）
- **实现方法**（可切换编程语言，复制对应语言的代码模板）
- **全部内容**（组装成一段 Markdown）

> 源码目录：`code/leetcode-helper`

## 一、先看效果

在 https://leetcode.cn/problems/two-sum/ 页面上点击图标，弹窗大致长这样：

```text
┌────────────────────────────────────────────┐
│ LeetCode 助手                                │
│ 一键复制题目信息，仅在 leetcode.cn/.com 生效    │
├────────────────────────────────────────────┤
│ 1. 两数之和                          [简单]  │
│ ┌ 标题 ──────────────────── [复制标题] ──┐ │
│ │ 1. 两数之和                             │ │
│ └────────────────────────────────────────┘ │
│ ┌ 题目内容 ── ☑去除HTML标签 ─ [复制内容] ─┐ │
│ │ 给定一个整数数组 nums 和一个整数目标值…    │ │
│ └────────────────────────────────────────┘ │
│ ┌ 实现方法 ── [JavaScript ▾] ─ [复制代码] ┐ │
│ │ var twoSum = function (nums, target) {  │ │
│ └────────────────────────────────────────┘ │
│ [ 复制全部（Markdown） ]                     │
└────────────────────────────────────────────┘
```

而在非 LeetCode 网站，工具栏图标会被**自动禁用**，点击没有反应——这就是「只在 LeetCode 生效」的直观体现。

## 二、目录结构

```markdown
leetcode-helper
├── manifest.json          // 清单文件 (MV3)
├── images/icon.png
├── pages/popup.html       // 点击图标弹出的界面
├── css/popup.css
└── js
    ├── background.js      // service worker：按标签页 URL 启用 / 禁用图标
    ├── content.js         // 内容脚本：抓取题目数据、响应 popup 请求
    └── popup.js           // 弹窗逻辑：渲染、语言切换、复制
```

分工很清晰：

- **content.js** 运行在 LeetCode 页面里，负责「抓数据」；
- **popup.js** 运行在扩展弹窗里，负责「展示和复制」；
- **background.js** 负责「决定图标在哪些页面可用」。

## 三、清单文件

```json
{
    "manifest_version": 3,
    "name": "LeetCode 助手",
    "version": "1.0.0",
    "action": {
        "default_popup": "pages/popup.html"
    },
    "background": {
        "service_worker": "js/background.js"
    },
    "permissions": ["tabs", "storage", "scripting", "webNavigation"],
    "host_permissions": [
        "*://leetcode.cn/*",
        "*://*.leetcode.cn/*",
        "*://leetcode.com/*",
        "*://*.leetcode.com/*"
    ],
    "content_scripts": [
        {
            "matches": [
                "*://leetcode.cn/problems/*",
                "*://*.leetcode.cn/problems/*",
                "*://leetcode.com/problems/*",
                "*://*.leetcode.com/problems/*"
            ],
            "js": ["js/content.js"],
            "run_at": "document_idle"
        }
    ]
}
```

| 权限 | 作用 |
| ---- | ---- |
| `host_permissions` | 把扩展能触达的范围限定在 LeetCode 域名 |
| `tabs` | popup 里读取当前标签页 URL，判断是否为题目页 |
| `storage` | 记住「去除 HTML 标签」开关和「上次选择的语言」 |
| `scripting` | 内容脚本没注入成功时兜底手动注入 |
| `webNavigation` | 监听单页应用的 `history.pushState` 跳转 |

注意 `content_scripts.matches` 只写了 `/problems/*`，也就是说**内容脚本只会注入到题目页**。

## 四、只在 LeetCode 生效

光靠 `host_permissions` 还不够：我们希望在其他网站上，图标干脆是禁用的。
于是让后台根据标签页 URL 动态开关图标：

```js
// js/background.js
const LEETCODE_URL = /^https?:\/\/([a-z0-9-]+\.)*leetcode\.(cn|com)(\/|$)/i;

async function syncAction(tabId, url) {
    if (url && LEETCODE_URL.test(url)) {
        await chrome.action.enable(tabId);   // 可用
    } else {
        await chrome.action.disable(tabId);  // 禁用（变灰、点击无反应）
    }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await chrome.tabs.get(tabId);
    syncAction(tabId, tab.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" || changeInfo.url) {
        syncAction(tabId, tab.url);
    }
});
```

这里有个坑：**LeetCode 是单页应用（SPA）**，站内从题目列表跳到某道题时走的是
`history.pushState`，**不会**触发 `tabs.onUpdated`。所以还要监听 `webNavigation`：

```js
chrome.webNavigation.onHistoryStateUpdated.addListener(({ tabId, url }) => {
    syncAction(tabId, url);
});
```

## 五、抓取题目数据

这是整个项目最核心的部分。题目数据有三个来源，逐级兜底。

### 1. 官方 GraphQL（首选）

LeetCode 的前端本身就是用 GraphQL 拿数据的。内容脚本在题目页发起**同源**请求，
浏览器会自动带上 Cookie；若页面存在 `csrftoken`，再补一个请求头：

```js
// js/content.js
async function fetchByGraphQL(slug) {
    const query = `query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            questionFrontendId title translatedTitle difficulty
            content translatedContent
            codeSnippets { lang langSlug code }
        }
    }`;
    const csrf = (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1];

    const response = await fetch(`${location.origin}/graphql/`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {})
        },
        body: JSON.stringify({
            operationName: "questionData",
            query,
            variables: { titleSlug: slug }
        })
    });
    return (await response.json()).data.question;
}
```

其中 `codeSnippets` 就是「实现方法」的来源，每一项形如：

```js
{ lang: "Python3", langSlug: "python3", code: "class Solution:\n    def twoSum(...):" }
```

### 2. 页面内嵌 `__NEXT_DATA__`

LeetCode 用 Next.js 做服务端渲染，首屏数据就内嵌在 `<script id="__NEXT_DATA__">` 里，
内容脚本可以直接读它的 `textContent`：

```js
function readNextDataQuestion(slug) {
    const el = document.getElementById("__NEXT_DATA__");
    if (!el) return null;
    // 递归查找 titleSlug 匹配且带 codeSnippets 的对象
    return findQuestion(JSON.parse(el.textContent), slug);
}
```

> 为什么一定要校验 `titleSlug`？因为单页应用切题后 `__NEXT_DATA__` **不会更新**，
> 不校验就会拿到上一题的旧数据。

### 3. 直接读 DOM（最后兜底）

```js
const titleEl = document.querySelector("div.text-title-large a");
const contentEl = document.querySelector('[data-track-load="description_content"]');
```

DOM 里的标题和内容一定是最新的，缺点是没有代码模板。

## 六、HTML 转纯文本

「去除 HTML 标签」不是简单地把标签删掉，而是尽量保留可读的排版：
`<pre>` 里的代码要保留缩进，`<li>` 要变成列表，段落之间要有空行。

```js
function htmlToText(html) {
    const root = document.createElement("div");
    root.innerHTML = html || "";

    function walk(node, listCtx) {
        let out = "";
        for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                out += child.nodeValue.replace(/\s+/g, " ");
                continue;
            }
            const tag = child.tagName;
            if (tag === "BR") { out += "\n"; continue; }
            if (tag === "PRE") {                       // 代码块：原样保留
                out += "\n" + child.textContent.trim() + "\n";
                continue;
            }
            if (tag === "LI") {                        // 列表项
                const marker = listCtx && listCtx.ordered ? `${listCtx.index++}. ` : "- ";
                out += "\n" + marker + walk(child, listCtx).trim() + "\n";
                continue;
            }
            if (tag === "UL" || tag === "OL") {
                out += "\n" + walk(child, { ordered: tag === "OL", index: 1 }) + "\n";
                continue;
            }
            // 其他块级元素前后补换行
            const isBlock = /^(P|DIV|H[1-6]|BLOCKQUOTE|TABLE|TR)$/.test(tag);
            if (isBlock) out += "\n";
            out += walk(child, listCtx);
            if (isBlock) out += "\n";
        }
        return out;
    }

    return walk(root, null)
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
```

例如两数之和的示例部分，转换后会得到：

```text
示例 1：

输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。
```

## 七、弹窗：语言切换与记忆

`codeSnippets` 里的语言数量最多可达 20 种。弹窗把它们填进下拉框，
默认选中优先级为：**上次选择 > 页面当前语言 > 默认 `javascript` > 第一项**；
选择结果写入 `chrome.storage.sync`，下次打开自动恢复：

```js
els.langSelect.addEventListener("change", () => {
    state.langSlug = els.langSelect.value;
    chrome.storage.sync.set({ lc_lang: state.langSlug });   // 记忆
    renderPreviews();
});
```

「页面当前语言」来自 LeetCode 自己存在 `localStorage.global_lang` 里的值，
内容脚本读取后一并返回，这样用户平时写 JavaScript，打开弹窗就默认是 JavaScript。

## 八、复制全部

「复制全部」把信息拼成一段 Markdown，方便粘贴到笔记或直接丢给 AI：

````markdown
# 1. 两数之和

难度：简单　|　链接：https://leetcode.cn/problems/two-sum/

## 题目描述

给定一个整数数组 nums 和一个整数目标值 target……

## 实现方法（JavaScript）

```javascript
var twoSum = function (nums, target) {

};
```
````

复制用的是 `navigator.clipboard.writeText`，并额外做了 `execCommand("copy")` 的兜底。

## 九、运行扩展

1. 打开 `chrome://extensions`，开启「开发者模式」；
2. 点击「加载已解压的扩展程序」，选择 `code/leetcode-helper` 目录；
3. 打开 https://leetcode.cn/problems/two-sum/ ；
4. 点击工具栏图标，切换语言、勾选是否去除 HTML 标签，点击按钮复制。

## 十、小结

这个小项目把几个关键点串了起来：

- 用 `content_scripts.matches` + `action.enable/disable` 把扩展的影响范围收敛到目标站点；
- 用 `webNavigation` 处理单页应用的站内跳转；
- 内容脚本发起**同源请求**复用页面的登录态（Cookie / CSRF），拿到官方接口数据；
- 用「接口 -> 内嵌数据 -> DOM」三级兜底保证健壮性；
- 用 `chrome.storage.sync` 记住用户偏好。

## 资料

```markdown
https://developer.chrome.com/docs/extensions/reference/api/action?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/webNavigation?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/scripting?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/storage?hl=zh-cn
```
