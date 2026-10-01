# LeetCode 助手 实战

> 一个只在 `leetcode.cn` / `leetcode.com` 题目页生效的扩展。
>
> 打开某道算法题后，点击工具栏图标即可一键复制：
> **标题**、**题目内容（可切换是否去除 HTML 标签）**、**实现方法（可切换编程语言）**，以及一键复制的 Markdown 全文。

## 功能

| 功能 | 说明 |
| ---- | ---- |
| 复制标题 | 复制形如 `1. 两数之和` 的标题（自动带上题号） |
| 复制题目内容 | 支持开关「去除 HTML 标签」：关闭时复制原始 HTML，开启时复制可读纯文本（`<img>` 图片标签会保留） |
| 复制实现方法 | 从下拉框选择语言（C++ / Java / Python3 / JavaScript / Go … 最多 20 种），复制该语言的代码模板 |
| 复制全部 | 组装成一段 Markdown（标题 + 难度 + 链接 + 题目描述 + 代码块），方便粘贴到笔记或丢给 AI |

只有在 LeetCode 题目页，工具栏图标才是可用状态；其他网站图标会被禁用。

## 目录结构

```markdown
leetcode-helper
├── Readme.md
├── manifest.json          // 清单文件 (MV3)
├── images
│   └── icon.png           // 扩展图标
├── pages
│   └── popup.html         // 点击图标弹出的界面
├── css
│   └── popup.css          // 弹窗样式
└── js
    ├── background.js      // service worker：按标签页 URL 启用 / 禁用图标
    ├── content.js         // 内容脚本：抓取题目数据、响应 popup 请求
    └── popup.js           // 弹窗逻辑：渲染、语言切换、复制
```

## manifest.json 配置

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
    "permissions": [
        "tabs",
        "storage",
        "scripting",
        "webNavigation"
    ],
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

### 权限说明

| 权限 | 用途 |
| ---- | ---- |
| `host_permissions` | 限定只能访问 LeetCode 域名，也是内容脚本注入、请求 GraphQL 的前提 |
| `tabs` | 在 popup 中读取当前标签页 URL，判断是否为题目页 |
| `storage` | 记忆「是否去除 HTML 标签」和「上次选择的语言」 |
| `scripting` | 内容脚本未注入时（如扩展刚安装）兜底手动注入 |
| `webNavigation` | LeetCode 是单页应用，用它监听 `history.pushState` 触发的站内跳转 |

## 数据来源

内容脚本按以下优先级抓取数据，逐级兜底：

1. **官方 GraphQL**（首选，最新最全）

   在题目页发起同源请求 `POST /graphql/`，查询 `question` 的 `title / translatedTitle / difficulty / content / translatedContent / codeSnippets`。
   同源请求会自动携带 Cookie，若页面存在 `csrftoken` 则一并带上：

   ```js
   const response = await fetch(`${location.origin}/graphql/`, {
       method: "POST",
       credentials: "include",
       headers: {
           "Content-Type": "application/json",
           ...(csrf ? { "x-csrf-token": csrf } : {})
       },
       body: JSON.stringify({ operationName: "questionData", query, variables: { titleSlug: slug } })
   });
   ```

2. **页面内嵌 `__NEXT_DATA__`**

   LeetCode 使用 Next.js 服务端渲染，题目数据就在 `<script id="__NEXT_DATA__">` 里。
   只有当其中的 `titleSlug` 与当前 URL 一致时才使用，避免单页切换后拿到上一题的旧数据。

3. **直接读取 DOM**

   标题取 `div.text-title-large a`，内容取 `[data-track-load="description_content"]`。
   这两个一定是最新的，缺点是拿不到代码模板。

## 关键代码

### 1. 只在 LeetCode 生效

内容脚本通过 `matches` 限定只注入 LeetCode；后台再用标签页 URL 动态开关图标：

```js
const LEETCODE_URL = /^https?:\/\/([a-z0-9-]+\.)*leetcode\.(cn|com)(\/|$)/i;

async function syncAction(tabId, url) {
    if (url && LEETCODE_URL.test(url)) {
        await chrome.action.enable(tabId);
    } else {
        await chrome.action.disable(tabId);
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" || changeInfo.url) {
        syncAction(tabId, tab.url);
    }
});

// SPA 站内跳转不会触发 tabs.onUpdated，需要监听 history 变化
chrome.webNavigation.onHistoryStateUpdated.addListener(({ tabId, url }) => {
    syncAction(tabId, url);
});
```

### 2. 题目内容 HTML -> 纯文本

`题目内容（去除 HTML 标签）` 开关背后是一个递归转换函数：`<pre>` 原样保留缩进、`<li>` 转成列表、`<sup>` / `<sub>` 转成上/下标写法（`10<sup>9</sup>` -> `10^{9}`、`a<sub>i</sub>` -> `a_{i}`）、`<img>` 原样保留、块级元素之间补换行，其余空白折叠：

```js
if (tag === "IMG") {
    // 保留 <img> 标签：题目里的示意图 / 公式图片不能丢
    out += child.outerHTML || "";
    continue;
}
if (tag === "SUP") {
    out += "^{" + walk(child, listCtx).trim() + "}";
    continue;
}
if (tag === "SUB") {
    out += "_{" + walk(child, listCtx).trim() + "}";
    continue;
}
if (tag === "PRE") {
    out += "\n" + (child.textContent || "").replace(/^\n+|\n+$/g, "") + "\n";
    continue;
}
if (tag === "LI") {
    const marker = listCtx && listCtx.ordered ? `${listCtx.index++}. ` : "- ";
    out += "\n" + marker + walk(child, listCtx).trim() + "\n";
    continue;
}
```

### 3. 语言切换与记忆

`codeSnippets` 里每个元素形如 `{ lang: "Python3", langSlug: "python3", code: "class Solution:..." }`。
下拉框的默认值优先级为：**上次选择 > 页面当前语言（`localStorage.global_lang`）> 默认 `javascript` > 第一项**，
选择结果写入 `chrome.storage.sync`，下次自动恢复。

### 4. 复制全部（Markdown）

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

## 运行扩展

1. 打开 `chrome://extensions` 并开启「开发者模式」。
2. 点击「加载已解压的扩展程序」，选择本目录（包含 `manifest.json` 的目录）。
3. 打开任意一道题，例如 https://leetcode.cn/problems/two-sum/ 。
4. 点击工具栏的 LeetCode 助手图标，按需切换语言、勾选是否去除 HTML 标签，点击对应按钮复制。

## 说明

- 代码模板来自题目自带的 `codeSnippets`（即「实现方法」的函数骨架），不是题解文章；题解文章需要登录且多数为付费内容，未纳入。
- 若 GraphQL 因网络问题失败，会自动回退到页面内嵌数据或 DOM，此时可能拿不到代码模板。
- 单页应用站内切题后，标题 / 内容会实时更新；代码模板依赖 GraphQL 保证最新。

## 资料

```markdown
https://developer.chrome.com/docs/extensions/reference/api/action?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/webNavigation?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/scripting?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/storage?hl=zh-cn
https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props
```
