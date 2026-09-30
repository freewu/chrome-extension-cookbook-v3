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

```markdown
magic-tools
├── manifest.json          // 清单文件 (MV3)
├── images/icon.png
├── pages/index.html       // 工具主界面(整页)
├── css/app.css
├── js
│   ├── background.js      // service worker：点击图标打开/聚焦主界面
│   ├── app.js             // 界面逻辑：分类导航、搜索、表单、结果渲染
│   └── utils.js           // 通用工具：字节/Hex/Base64/任意进制/CRC
├── tools
│   ├── codec.js           // 编解码工具集
│   ├── crypto.js          // 加解密工具集
│   └── valuecalc.js       // 值计算工具集
└── lib                    // 第三方库（本地内置，MV3 不允许远程脚本）
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

## 四、核心设计：工具即数据

整个项目的思路很简单：**把每个工具描述成一个对象**，界面和执行逻辑完全解耦。

```js
// tools/codec.js
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
```

- `fields` 描述表单有哪些输入项，`app.js` 据此**动态生成表单**；
- `run(v)` 接收当前表单值 `v`，返回字符串，或返回 `{ 标签: 值 }` 对象以展示多个结果；
- 新增工具时，界面代码一行都不用改。

`tools/*.js` 默认导出一个工具数组：

```js
export default [base64Tool, base58Tool, /* ... */ unicodeTool];
```

`js/app.js` 把它们汇总起来：

```js
import codecTools from "../tools/codec.js";
import cryptoTools from "../tools/crypto.js";
import valueCalcTools from "../tools/valuecalc.js";

const ALL_TOOLS = [...codecTools, ...cryptoTools, ...valueCalcTools];
const byId = new Map(ALL_TOOLS.map((t) => [t.id, t]));
```

## 五、动态表单与结果渲染

### 1. 根据 `field.type` 生成控件

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
`<script>` 引入：

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
const S = window.sha3;       // SHA-3 / Keccak
```

Blowfish 只有 ESM 版本，则通过 `import` 使用：

```js
// tools/crypto.js
import { Blowfish } from "../lib/blowfish.mjs";
```

界面逻辑本身使用原生 ES Module：

```html
<script type="module" src="../js/app.js"></script>
```

## 七、如何新增一个工具

1. 在 `tools/` 下对应文件里增加一个工具对象（或新建文件）；
2. 声明 `id / name / category / desc / fields / run`；
3. 若新建文件，记得在 `js/app.js` 里 `import` 并加入 `ALL_TOOLS`；
4. 在 `chrome://extensions` 重新加载扩展。

例如做一个「字符串反转」工具：

```js
const reverseTool = {
    id: "reverse",
    name: "字符串反转",
    category: "codec",
    desc: "按字符反转输入文本",
    fields: [{ name: "input", label: "输入", type: "textarea", default: "abc" }],
    run: (v) => [...v.input].reverse().join(""),
};
```

## 八、小结

这个小项目串起了几个在真实扩展里很常见的做法：

- 用 `action.onClicked` + `tabs` 权限管理一个整页应用；
- 用「数据描述 + 动态渲染」的方式减少重复 UI 代码；
- 在 MV3 的 CSP 约束下正确地引入本地第三方库；
- 使用原生 ES Module 组织代码。

## 资料

```markdown
https://developer.chrome.com/docs/extensions/reference/api/action?hl=zh-cn
https://developer.chrome.com/docs/extensions/develop/concepts/service-workers?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy?hl=zh-cn
```
