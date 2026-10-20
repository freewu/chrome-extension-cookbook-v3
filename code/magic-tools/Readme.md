# Magic Tools for Chrome 实战

> 一个纯前端的「编解码 / 加解密 / 值计算」三大类工具箱扩展。
>
> 点击工具栏图标后在新标签页打开完整界面，左侧按分类列出工具，右侧填写参数并执行，结果支持一键复制。
> 所有计算都在本地完成，不依赖任何网络请求。

## 功能概览

| 分类 | 说明 | 工具数 |
| ---- | ---- | ------ |
| 编解码 (codec) | Base64 / URL / Unicode / 摩斯码 等 | 13 |
| 加解密 (crypto) | AES / RSA / 国密 SM 系列 / 古典密码 等 | 22 |
| 值计算 (value-calc) | Hash / CRC / HMAC / 进制 / 密钥派生 等 | 15 |

### 编解码 (codec)

| 工具 | 说明 |
| ---- | ---- |
| Base64 编解码 | 支持 UTF-8 文本、URL 安全字符 (`-_` 且无填充) |
| Base58 编解码 | 比特币字母表 |
| BaseX 编解码 | 自定义字母表的任意进制转换 |
| BCD 编解码 | 8421 码，十进制 <-> 十六进制 |
| HTTP Basic Auth 编解码 | `Authorization: Basic base64(user:pass)` |
| Gzip 编解码 | 文本 <-> gzip 压缩数据的 Base64/Hex |
| JWT 编解码器 | 解码 JWT 的 Header / Payload（不校验签名） |
| 摩斯码编解码 | 字母间用空格，单词间用 `/` |
| Punycode 编解码 | 国际化域名 <-> Punycode (`xn--`) |
| URL 编解码 | `encodeURIComponent` / `decodeURIComponent` |
| UUencode 编解码 | Unix-to-Unix 编码 |
| XXencode 编解码 | XXencode 编码 |
| Unicode 编解码 | 文本 <-> `\uXXXX` 转义 |

### 加解密 (crypto)

| 工具 | 说明 |
| ---- | ---- |
| AES 加解密 | AES-128/192/256，CBC/ECB/CFB/OFB/CTR |
| DES 加解密 | DES 对称加密 |
| 3DES 加解密 | Triple DES |
| RC4 加解密 | RC4 流密码 |
| Rabbit 加解密 | Rabbit 流密码 |
| Blowfish 加解密 | Blowfish (ECB/CBC) |
| SM2 加解密 | 国密 SM2 非对称加密（加密/解密/生成密钥对） |
| SM4 加解密 | 国密 SM4 对称加密 |
| SM9 加解密 | 国密 SM9 标识密码（暂未内置完整实现） |
| RSA 加解密 | 加密/解密/签名/验签/生成密钥 |
| 凯撒加解密 | 移位替换密码 |
| 维吉尼亚加解密 | 多表替换密码 |
| 栅栏加解密 | 栅栏（W 型）换位密码 |
| 希尔加解密 | Hill 矩阵密码（2x2 / 3x3） |
| Cisco Type 7 | Cisco Type 7 口令（可逆混淆） |
| TEA / XTEA / XXTEA 加解密 | Tiny / eXtended / Corrected Block TEA |
| RC5 / RC6 / RC2 加解密 | 经典分组密码 |
| ChaCha20 加解密 | RFC 8439 ChaCha20 流密码 |

### 值计算 (value-calc)

| 工具 | 说明 |
| ---- | ---- |
| Hash 值计算 | MD5 / SHA-1 / SHA-2 / RIPEMD160 摘要 |
| HmacHash 值计算 | HMAC-MD5 / SHA-1 / SHA-2 |
| SHA3 Hash 值计算 | NIST SHA-3（FIPS 202） |
| Keccak Hash 值计算 | 原始 Keccak（以太坊使用 keccak256） |
| KMAC 计算 | SP 800-185 KMAC128 / KMAC256 |
| CMAC 计算 | 基于 AES 的消息认证码（RFC 4493） |
| CRC 校验 | CRC-8 / CRC-16 / CRC-32 多种参数 |
| BCC 校验 | 逐字节异或校验 |
| LRC 校验 | 纵向冗余校验（补码和） |
| 原码/反码/补码计算 | 整数的机器表示 |
| HKDF 计算 | 基于 HMAC 的密钥派生（RFC 5869） |
| PBKDF2 值计算 | 基于口令的密钥派生 |
| BCrypt | BCrypt 哈希 / 校验 |
| Scrypt | scrypt KDF |
| PPI 计算 | 由分辨率与对角线尺寸计算像素密度 |

## 目录结构

```markdown
magic-tools
├── Readme.md
├── manifest.json              // 清单文件 (MV3)
├── images
│   └── icon.png               // 扩展图标
├── pages
│   ├── index.html             // 工具箱首页：分类导航 + 搜索 + 工具卡片
│   ├── home.js                // 首页逻辑：按 registry 渲染导航与卡片
│   └── app                    // 工具页，一个目录 = 一个工具
│       ├── registry.js        // 工具清单：动态 import 各目录的 tool.js
│       ├── shared             // 公共代码
│       │   ├── page.js        // 工具页外壳：按 fields 渲染表单 / 执行 / 复制
│       │   ├── utils.js       // 通用工具：字节/Hex/Base64/任意进制/CRC/DOM 帮手
│       │   ├── crypto-common.js    // 加解密分类共享 helper
│       │   └── valuecalc-common.js // 值计算分类共享 helper
│       ├── base64
│       │   ├── index.html     // 工具页(只放一个容器 + 引入 tool.js)
│       │   └── tool.js        // 工具定义：id/name/category/desc/fields/run
│       ├── aes
│       │   └── ...            // 同上，每个工具一个目录
│       └── ...                // 共 50 个工具目录
├── css
│   └── app.css                // 界面样式
├── js
│   └── background.js          // service worker：点击图标打开/聚焦首页
└── lib                        // 第三方库(本地内置，MV3 不允许加载远程脚本)
    ├── crypto-js.min.js
    ├── sha3.min.js
    ├── sm2.js / sm3.js / sm4.js
    ├── bcrypt.min.js
    ├── scrypt.js
    ├── jsencrypt.min.js
    └── blowfish.mjs
```

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "Magic Tools for Chrome",
    "version": "1.0.0",
    "description": "编解码 / 加解密 / 值计算 三大类工具箱，点击扩展图标进入。",
    "icons": {
        "16": "images/icon.png",
        "48": "images/icon.png",
        "128": "images/icon.png"
    },
    "action": {
        "default_title": "Magic Tools for Chrome",
        "default_icon": "images/icon.png"
    },
    "background": {
        "service_worker": "js/background.js"
    },
    "permissions": [
        "tabs"
    ]
}
```

> - 这里使用 `action.onClicked` 而不是 `default_popup`，因为工具箱界面较大，适合用标签页展示。
> - `tabs` 权限用于 `chrome.tabs.query({ url })` 判断主界面是否已经打开，从而聚焦已有标签页。

## 运行扩展

1. 打开 `chrome://extensions` 并开启「开发者模式」。
2. 点击「加载已解压的扩展程序」，选择本目录（包含 `manifest.json` 的目录）。
3. 点击工具栏中的 Magic Tools 图标，会在新标签页打开工具界面。
4. 左侧选择分类或搜索工具，右侧填写参数后点击「执行」，结果可一键复制。

## 技术要点

### 1. 工具即数据，一个目录一个工具

每个工具都放在 `pages/app/<工具id>/` 下，目录里只有两个文件：`tool.js`（工具定义）与 `index.html`（工具页）。

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
        { name: "input", label: "输入", type: "textarea", default: "Hello, Magic Tools!" },
    ],
    run(v) {
        // v 为表单当前值，返回字符串或 { 标签: 值 } 对象
        return v.mode === "encode" ? encode(v.input) : decode(v.input);
    },
};

export default base64Tool;
mountTool(base64Tool); // 工具页里有 #tool-page 容器时自动挂载
```

工具页 `index.html` 只留一个容器，其余交给 `tool.js`：

```html
<main class="main">
    <div id="tool-page"></div>
</main>
<script type="module" src="./tool.js"></script>
```

`pages/app/shared/page.js` 的 `mountTool()` 负责：

- 根据 `fields` 声明自动生成表单（text / textarea / select / checkbox）；
- 调用 `tool.run(values)` 并把结果（字符串或对象）渲染成带「复制」按钮的结果块；
- 渲染标题、分类标签、`← 返回工具箱` 链接。

首页则通过 `pages/app/registry.js` 汇总所有工具：

```js
// pages/app/registry.js
export const TOOL_DIRS = [
    "base64", "base58", /* ... */,
];

export const ALL_TOOLS = await Promise.all(
    TOOL_DIRS.map(async (dir) => (await import(`./${dir}/tool.js`)).default),
);
```

`mountTool()` 在没有 `#tool-page` 容器时直接 return，所以首页批量 import 各个 `tool.js` 不会产生任何副作用。

### 2. 分类共享代码放在 shared/

同一分类里被多个工具复用的 helper（例如 AES / DES / RC4 共用的 `symmetricFields()`、`runCryptoJs()`）集中在 `pages/app/shared/crypto-common.js`、`valuecalc-common.js`，各工具目录按需 `import`，避免每个工具各写一份。

### 3. MV3 下使用本地第三方库

Manifest V3 的内容安全策略（CSP）不允许加载远程脚本，因此 `crypto-js`、`jsencrypt`、`sm2` / `sm3` / `sm4` 等库都以本地文件形式放在 `lib/` 下，由页面用 `<script>` 引入，再用 `window.CryptoJS` 等方式访问；只有 ESM 版本的 `blowfish.mjs` 通过 `import` 使用。

每个工具页只引入自己需要的库（例如 Base64 页不加载 crypto-js），首页为了方便批量 `import`，会把全部库都先加载好。

### 4. ES Modules

界面逻辑使用原生 ES Module（`<script type="module">` + `import` / `export`），每个 `tool.js` 默认导出单个工具对象，`registry.js` 用动态 `import()` 汇总。

### 5. Service Worker 与图标点击

```js
chrome.action.onClicked.addListener(async () => {
    const url = chrome.runtime.getURL("pages/index.html");
    const tabs = await chrome.tabs.query({ url });
    if (tabs.length > 0) {
        await chrome.tabs.update(tabs[0].id, { active: true });
        await chrome.windows.update(tabs[0].windowId, { focused: true });
    } else {
        await chrome.tabs.create({ url });
    }
});
```

## 如何新增一个工具

1. 新建目录 `pages/app/<工具id>/`；
2. 写 `tool.js`：声明 `id / name / category / desc / fields / run`，末尾 `export default` + `mountTool(tool)`；
3. 复制一份 `index.html`（改标题即可），保证里面引入了需要的第三方库；
4. 在 `pages/app/registry.js` 的 `TOOL_DIRS` 中登记目录名；
5. 多个工具共用的 helper 放到 `pages/app/shared/` 下，不要复制粘贴；
6. 重新加载扩展，首页就会出现新卡片，点击进入独立页面。

## 资料

```markdown
https://developer.chrome.com/docs/extensions/reference/api/action?hl=zh-cn
https://developer.chrome.com/docs/extensions/develop/concepts/service-workers?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy?hl=zh-cn
```
