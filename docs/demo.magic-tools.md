# Magic Tools for Chrome 实战

前面章节都是围绕某个 `chrome.*` API 的示例，这一章我们做一个完整的小项目：一个纯前端的
「编解码 / 加解密 / 值计算」工具箱扩展。

它不依赖任何后端，所有计算都在浏览器本地完成；点击工具栏图标后在新标签页打开界面，
左侧按分类浏览或搜索工具，右侧填参数执行，结果一键复制。

> 源码目录：`code/magic-tools`

## 一、先看效果与功能

扩展一共内置 50 个工具，分为三类：

| 分类 | 包含的工具 |
| ---- | ---------- |
| 编解码 `codec` | Base64、Base58、BaseX、BCD、HTTP Basic Auth、Gzip、JWT、摩斯码、Punycode、URL、UUencode、XXencode、Unicode |
| 加解密 `crypto` | AES、DES、3DES、RC4、Rabbit、Blowfish、SM2、SM4、SM9、RSA、凯撒、维吉尼亚、栅栏、希尔、Cisco Type 7、TEA、XTEA、XXTEA、RC5、RC6、RC2、ChaCha20 |
| 值计算 `value-calc` | Hash、HmacHash、SHA3、Keccak、KMAC、CMAC、CRC、BCC、LRC、原码/反码/补码、HKDF、PBKDF2、BCrypt、Scrypt、PPI |

## 二、目录结构

这本书里的项目都尽量贴近真实工程。工具箱一共 50 个工具，如果全塞进一个 `app.js`，
文件很快就会变成几千行。所以这里采用和主流前端项目一样的做法：**一个工具一个目录**。

```markdown
magic-tools
├── manifest.json
├── images/icon.png
├── css/app.css
├── js
│   └── background.js           // service worker：点击图标打开/聚焦首页
├── pages
│   ├── index.html              // 工具箱首页：分类导航 + 搜索 + 工具卡片
│   ├── home.js                 // 首页逻辑：按 registry 渲染导航与卡片
│   └── app                     // 工具页目录：一个目录 = 一个工具
│       ├── registry.js         // 工具清单：动态 import 各目录的 tool.js
│       ├── shared              // 公共代码
│       │   ├── page.js         // 工具页外壳：表单渲染 / 执行 / 复制
│       │   ├── utils.js        // 字节/Hex/Base64/任意进制/CRC/DOM 帮手
│       │   ├── crypto-common.js
│       │   └── valuecalc-common.js
│       ├── base64
│       │   ├── index.html      // 工具页：一个容器 + 引入 tool.js
│       │   └── tool.js         // 工具定义：id/name/category/desc/fields/run
│       ├── aes/
│       ├── rsa/
│       └── ...                 // 共 50 个目录
└── lib                         // 第三方库（本地内置，MV3 不允许远程脚本）
```

## 三、清单文件

```json
{
    "manifest_version": 3,
    "name": "Magic Tools for Chrome",
    "version": "1.0.0",
    "action": {
        "default_title": "Magic Tools for Chrome",
        "default_icon": "images/icon.png"
    },
    "background": {
        "service_worker": "js/background.js"
    },
    "permissions": ["tabs"]
}
```

两个关键点：

1. **不用 `default_popup`**。工具箱界面比较大，用整页标签页体验更好，所以只配置 `action` 的图标和标题，
   点击行为交给 `chrome.action.onClicked` 处理。
2. **`tabs` 权限**。`background.js` 需要用 `chrome.tabs.query({ url })` 查找已经打开的主界面标签页，
   读取标签页 URL 需要 `tabs` 权限。

```js
// js/background.js
chrome.action.onClicked.addListener(async () => {
    const url = chrome.runtime.getURL("pages/index.html");
    const tabs = await chrome.tabs.query({ url });        // 已打开则聚焦
    if (tabs.length > 0) {
        await chrome.tabs.update(tabs[0].id, { active: true });
        await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
        await chrome.tabs.create({ url });                // 否则新建
    }
});
```

## 四、核心设计：一个目录一个工具

整个项目的思路很简单：**把每个工具描述成一个对象，并且让它独占一个目录**，界面和执行逻辑完全解耦。

```js
// pages/app/base64/tool.js
const base64Tool = {
    id: "base64",
    name: "Base64 编解码",
    category: "codec",
    desc: "支持 UTF-8 文本、URL 安全字符",
    fields: [
        { name: "mode", label: "模式", type: "select",
          options: [["encode", "编码"], ["decode", "解码"]], default: "encode" },
        { name: "urlSafe", label: "URL 安全 (-_ 且无填充)", type: "checkbox", default: false },
        { name: "input", label: "输入", type: "textarea", default: "Hello, Magic Tools!" },
    ],
    run(v) {
        if (v.mode === "encode") {
            let b64 = bytesToBase64(utf8ToBytes(v.input));
            if (v.urlSafe) b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
            return b64;
        }
        // ... 解码
    },
};

export default base64Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(base64Tool);
```

- `fields` 描述表单有哪些输入项，`shared/page.js` 据此**动态生成表单**；
- `run(v)` 接收当前表单值 `v`，返回字符串，或返回 `{ 标签: 值 }` 对象以展示多个结果；
- 新增工具时，界面代码一行都不用改。

### 1. 工具页只是一层壳

每个工具目录里的 `index.html` 几乎是模板，只负责引入样式、需要的第三方库和一个容器：

```html
<!-- pages/app/base64/index.html -->
<main class="main">
    <div id="tool-page"></div>
</main>
<script type="module" src="./tool.js"></script>
```

这样做的好处：每个工具是**真正独立的页面**（`chrome-extension://<id>/pages/app/base64/index.html`），
可以直接收藏、刷新、用 DevTools 单独调试，也方便以后单独拆出去复用。

### 2. 首页怎么知道有哪些工具

浏览器没法列目录，所以需要一个「工具清单」：

```js
// pages/app/registry.js
export const TOOL_DIRS = [
    "base64", "base58", "basex", /* ... 50 个目录名 ... */
];

export const ALL_TOOLS = await Promise.all(
    TOOL_DIRS.map(async (dir) => (await import(`./${dir}/tool.js`)).default),
);
```

`pages/home.js` 拿到 `ALL_TOOLS` 后渲染分类导航、搜索和卡片，卡片直接是链接：

```js
el("a", { class: "tool-card", href: `./app/${tool.id}/index.html` }, [
    el("div", { class: "name", text: tool.name }),
    el("div", { class: "desc", text: tool.desc || "" }),
]);
```

> 首页会 `import` 全部 50 个 `tool.js`，所以 `mountTool()` 里要先判断 `#tool-page` 是否存在，
> 不存在就直接 return —— 避免在首页重复渲染工具界面。

### 3. 分类内共享的 helper

同一分类里被多个工具复用的代码集中放在 `pages/app/shared/`：

```js
// pages/app/shared/crypto-common.js
const MODE = { CBC: "CBC", CFB: "CFB", OFB: "OFB", CTR: "CTR", ECB: "ECB" };
function symmetricFields(extra = {}) { /* 生成「密钥/IV/填充」表单字段 */ }
function runCryptoJs(cipher, v, extra = {}) { /* 统一加解密流程 */ }
export { C, MODE, PAD, toWA, symmetricFields, runCryptoJs };
```

于是 AES 的定义可以短到十几行：

```js
// pages/app/aes/tool.js
import { C, symmetricFields, runCryptoJs } from "../shared/crypto-common.js";

const aesTool = {
    id: "aes",
    name: "AES 加解密",
    category: "crypto",
    desc: "AES-128/192/256，CBC/ECB/CFB/OFB/CTR",
    fields: symmetricFields(),
    run: (v) => runCryptoJs(C.AES, v, { keySizes: [16, 24, 32] }),
};
```

## 五、动态表单与结果渲染

### 1. 根据 `field.type` 生成控件

`mountTool(tool)` 遍历 `tool.fields`，按 `type` 生成不同控件：

```js
function buildField(field, valueSetter) {
    // text / textarea / select / checkbox ...
    if (field.type === "select") {
        input = el("select");
        for (const opt of field.options) {
            const [v, text] = Array.isArray(opt) ? opt : [opt, opt];
            // ...
        }
    }
    // ...
}
```

### 2. 执行并渲染结果

```js
runBtn.addEventListener("click", async () => {
    for (const [name, get] of Object.entries(getters)) values[name] = get();
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
        // 统一展示「错误：xxx」
    }
});
```

`renderOutput()` 把结果放进 `<pre>` 并附带一个「复制」按钮（`navigator.clipboard.writeText`）。

### 3. 分类导航与搜索

顶部的搜索框会在**所有**工具里按 `name` / `id` 过滤；不输入关键字时只展示当前分类的工具。

## 六、MV3 下如何使用第三方加密库

Manifest V3 的 CSP 不允许加载远程脚本，因此所有第三方库都必须**下载到本地**再通过
`<script>` 引入。每个工具页只引自己需要的库：

```html
<!-- pages/app/aes/index.html -->
<script src="../../../lib/crypto-js.min.js"></script>
```

```html
<!-- pages/app/rsa/index.html -->
<script src="../../../lib/crypto-js.min.js"></script>
<script src="../../../lib/jsencrypt.min.js"></script>
```

首页因为要批量 `import` 全部工具，所以把 8 个库都先加载好：

```html
<!-- pages/index.html -->
<script src="../lib/crypto-js.min.js"></script>
<script src="../lib/sha3.min.js"></script>
<script src="../lib/sm2.js"></script>
<script src="../lib/sm3.js"></script>
<script src="../lib/sm4.js"></script>
<script src="../lib/bcrypt.min.js"></script>
<script src="../lib/scrypt.js"></script>
<script src="../lib/jsencrypt.min.js"></script>
```

这些库会挂到全局对象上，业务代码里直接访问：

```js
const C = window.CryptoJS;   // AES / DES / 3DES / RC4 / Rabbit / Hash ...
```

> 小坑：`lib/sha3.min.js` 并没有提供一个 `window.sha3` 命名空间对象，而是把 `sha3_256`、
> `keccak256`、`kmac128` 等函数**直接挂到 `window` 上**。所以应该写 `const S = window;`，
> 而不是 `const S = window.sha3;`。

Blowfish 只有 ESM 版本，则通过 `import` 使用（注意相对路径要从工具目录出发）：

```js
// pages/app/blowfish/tool.js
import { Blowfish } from "../../../lib/blowfish.mjs";
```

界面逻辑本身使用原生 ES Module（模块脚本必须写在一个单独的文件里，内联模块会被 CSP 拦截）：

```html
<script type="module" src="./tool.js"></script>
```

## 七、如何新增一个工具

1. 新建目录 `pages/app/<工具id>/`；
2. 写 `tool.js`：声明 `id / name / category / desc / fields / run`，末尾 `export default` + `mountTool(tool)`；
3. 把别的工具目录里的 `index.html` 拷一份，改成新工具的标题（并引入它需要的库）；
4. 在 `pages/app/registry.js` 的 `TOOL_DIRS` 里加上目录名；
5. 在 `chrome://extensions` 重新加载扩展。

例如做一个「字符串反转」工具：

```js
// pages/app/reverse/tool.js
import { mountTool } from "../shared/page.js";

const reverseTool = {
    id: "reverse",
    name: "字符串反转",
    category: "codec",
    desc: "按字符反转输入文本",
    fields: [{ name: "input", label: "输入", type: "textarea", default: "abc" }],
    run: (v) => [...v.input].reverse().join(""),
};

export default reverseTool;
mountTool(reverseTool);
```

再去 `pages/app/registry.js` 加一行 `"reverse",`，首页就会出现这张卡片，
点进去就是 `pages/app/reverse/index.html` 这个独立页面。

## 八、小结

这个小项目串起了几个在真实扩展里很常见的做法：

- 用 `action.onClicked` + `tabs` 权限管理一个整页应用；
- 用「一个目录一个工具 + 数据描述 + 动态渲染」的方式减少重复 UI 代码；
- 在 MV3 的 CSP 约束下正确地引入本地第三方库；
- 使用原生 ES Module（静态 `import` + 动态 `import()`）组织代码。

## 资料

```markdown
https://developer.chrome.com/docs/extensions/reference/api/action?hl=zh-cn
https://developer.chrome.com/docs/extensions/develop/concepts/service-workers?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy?hl=zh-cn
```
