# JSON Viewer 实战

> 一个「打开 JSON 页面就自动美化」的扩展。
>
> Chrome 打开 JSON 接口 / `.json` 文件时只会显示一大坨纯文本，这个扩展会自动识别这类页面，
> 用一个全屏浮层把它渲染成**带语法高亮、可逐层折叠**的树，并附带搜索、复制、原始视图切换。
> 原始文本始终保留在页面里，关掉浮层就回到 Chrome 的默认显示。

## 功能概览

| 功能 | 说明 |
| ---- | ---- |
| 自动识别 | `Content-Type` 含 `json`，或「极简页面 + 内容能 `JSON.parse`」才生效，普通网页零干扰 |
| 语法高亮 | 键名 / 字符串 / 数字 / 布尔 / `null` / 标点 各自配色 |
| 树形折叠 | 点击箭头逐层折叠；折叠时显示 `{…} 3 个键`、`[…] 5 项` 摘要 |
| 展开 / 折叠全部 | 只切 CSS 类，不重建 DOM，超大文件也几乎瞬间完成 |
| 搜索 | `Ctrl/Cmd + F` 聚焦搜索框，输入即搜，`Enter` / `Shift + Enter` 上下跳转，自动展开祖先节点 |
| 缩进切换 | 2 空格 / 4 空格 / Tab，立即生效 |
| 复制 JSON | 按当前缩进重新 `JSON.stringify` 后复制（`navigator.clipboard` + `execCommand` 兜底） |
| 原始视图 | 一键看服务器返回的原文，再切回格式化视图 |
| 主题 | 跟随系统 / 浅色 / 深色，偏好写入 `chrome.storage.local` |
| 解析失败提示 | 非法 JSON 给一条红色横幅显示错误信息，并自动停在原始视图 |
| 工具栏图标 | 点击在「格式化视图 / 原始视图」之间切换；不是 JSON 页面时闪一个 `✕` 角标 |
| 大文件保护 | 超过 8 MB 直接跳过；超长字符串先截断，点击展开全文 |

## 目录结构

```markdown
json-viewer
├── Readme.md
├── manifest.json          // 清单文件 (MV3)
├── images
│   └── icon.png           // 扩展图标
├── css
│   └── viewer.css         // 浮层 + 树 + 主题 + 搜索高亮 样式
└── js
    ├── background.js      // service worker：图标点击 → 通知内容脚本切换视图
    ├── content.js         // 内容脚本：识别页面、浮层、工具栏、搜索、主题、偏好
    └── tree.js            // 纯渲染：把 JS 值渲染成可折叠 DOM 树（window.JsonTree）
```

分工：

- **tree.js** 只负责「把数据渲染成树」，不知道自己在哪个页面；
- **content.js** 负责一切交互（识别、工具栏、搜索、主题、快捷键）；
- **background.js** 只转发一次「切换视图」的消息。

## manifest.json 配置

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

几个关键点：

1. **没有 `default_popup`**。点图标直接在当前页面切换视图，比弹窗更顺手。
2. **只有 `storage` 权限**。不读 `tabs`、不发请求，扩展本身不做任何网络访问。
3. **`js` 顺序有讲究**。`tree.js` 必须在 `content.js` 之前注入，后者才能直接用
   `window.JsonTree`（MV3 的 `content_scripts` 不支持 ES Module）。
4. **`matches: <all_urls>` + 自我把关**。脚本注入到所有页面，但 `readJsonText()` 返回
   `null` 时立刻退出，不创建任何 DOM。

## 运行扩展

1. 打开 `chrome://extensions`，开启「开发者模式」；
2. 点击「加载已解压的扩展程序」，选择 `code/json-viewer` 目录；
3. 打开任意返回 JSON 的地址，例如：
   - <https://jsonplaceholder.typicode.com/todos/1>
   - <https://api.github.com/repos/chromium/chromium>
   - 本地保存的 `data.json` 文件（`file://` 需在扩展详情里勾选「允许访问文件网址」）
4. 页面会自动变成树形视图；点击工具栏图标可在「格式化 / 原始」之间切换；
5. 按 `Ctrl/Cmd + F` 搜键名或值，`Esc` 清空搜索，再按一次 `Esc` 关闭浮层。

## 技术要点

### 1. 怎么判断「这是 JSON 页面」

误伤普通网页是最忌讳的事，所以判定分两条路径：

```js
// js/content.js
const looksLikeJsonType = /json/i.test(document.contentType || "");   // a) 响应头说了算
const simpleDoc = /* body 里没有元素子节点，或只有一个 <pre> */;        // b) 结构极简

if (!looksLikeJsonType && !simpleDoc) return null;                    // 普通网页直接退出
if (!/^[{\[]/.test(trimmed)) return null;                             // 只认对象 / 数组
if (looksLikeJsonType) return text;                                   // 响应头可信，交给后面报错
try { JSON.parse(trimmed); return text; } catch { return null; }       // 否则必须真能解析
```

- `Content-Type: application/json` → 直接认定（哪怕内容非法，也要显示错误信息）；
- `text/plain` 返回 JSON 的接口 → 靠「页面极简 + 能解析」兜底。

### 2. 为什么用浮层盖住，而不是替换页面

浮层（`position: fixed; inset: 0`）不碰原始 `<pre>`，所以：

- 「关闭」只要 `app.remove()`，页面立刻恢复原样，不存在「渲染坏了回不去」；
- 「原始视图」其实就是把同一份文本再显示一遍；
- 刷新页面、前进后退都不受扩展影响。

### 3. 折叠靠 CSS 类，不靠重建 DOM

所有节点一次性渲染完，折叠只是给节点加 `is-collapsed`：

```css
/* css/viewer.css */
.jv-node.is-collapsed > .jv-children,
.jv-node.is-collapsed > .jv-row--close {
    display: none;
}
```

所以「展开全部 / 折叠全部」只遍历 class，几万个节点也不会卡。

### 4. 搜索：DOM 里全都在，只是被 CSS 藏起来了

折叠节点仍然存在于 DOM 中，搜索可以直接在 `.jv-row` 上跑，命中后再把祖先逐层展开：

```js
// js/tree.js
expandAncestors(element) {
    let current = element;
    while (current && current !== root) {
        if (current.classList?.contains("jv-node")) setCollapsed(current, false);
        current = current.parentElement;
    }
}
```

输入用 200ms 防抖，避免每敲一个字符就扫一遍整棵树。

### 5. 安全：全程 `textContent`

JSON 内容是不可信的（可能来自任意接口），所以渲染时不碰 `innerHTML`：

```js
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;   // 绝不当 HTML 解析
    return node;
}
```

### 6. 性能兜底

- 超过 8 MB 的文本直接跳过（塞进 DOM 会让标签页卡死）；
- 单个字符串超过 2000 字符先截断成 `"…"` ，点击才展开全文；
- 折叠状态下不渲染多行文本，滚动只在 `.jv-content` 里进行。

## 键盘快捷键

| 快捷键 | 作用 |
| ---- | ---- |
| `Ctrl / Cmd + F` | 聚焦到扩展的搜索框（浏览器自带查找只能匹配纯文本） |
| `Enter` / `Shift + Enter` | 下一个 / 上一个匹配项 |
| `Esc` | 有搜索内容时清空搜索；否则关闭浮层 |

## 资料

```markdown
https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/action?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/storage?hl=zh-cn
```
