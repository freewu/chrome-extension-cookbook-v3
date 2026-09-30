# chrome.types 定义 Chrome 扩展程序的类型

> `chrome.types` 定义了一组通用类型，其中最常用的是 `ChromeSetting`。
> `ChromeSetting` 为一系列「浏览器设置类」API（`chrome.privacy`、`chrome.fontSettings`、`chrome.proxy`、`chrome.contentSettings` 等）提供了统一的 `get()` / `set()` / `clear()` 方法与 `onChange` 事件。
> 理解 `ChromeSetting` 有助于统一处理这些设置类 API。

## ChromeSetting 通用接口

每个 `ChromeSetting` 对象（例如 `chrome.privacy.websites.thirdPartyCookiesAllowed`）都暴露以下方法：

```javascript
// 读取设置
chrome.privacy.websites.thirdPartyCookiesAllowed.get(
    { incognito: false },
    (details) => {
        console.log(details.value);           // 当前值
        console.log(details.levelOfControl);  // 控制级别
    }
);
```

### get()
> 获取当前设置值
```javascript
chrome.fontSettings.defaultFontSize.get({}, (details) => {
    console.log("字号:", details.pixelSize);
    console.log("控制级别:", details.levelOfControl);
});
```

### set()
> 修改设置值
```javascript
chrome.fontSettings.defaultFontSize.set(
    { pixelSize: 16 },      // 要设置的值
    () => {
        if (chrome.runtime.lastError) {
            console.error("设置失败:", chrome.runtime.lastError.message);
        }
    }
);
```

### clear()
> 清除设置，恢复为默认值
```javascript
chrome.fontSettings.defaultFontSize.clear({}, () => {
    console.log("已恢复默认");
});
```

## LevelOfControl（控制级别）

```
not_controllable                  不可控制
controlled_by_other_extensions    被其他扩展程序控制
controllable_by_this_extension    可由本扩展程序控制
controlled_by_this_extension      已被本扩展程序控制
```

## Scope（作用范围）

设置类 API 的 `set()` / `clear()` 支持 `scope` 参数：

```
regular                    普通模式
regular_only               仅普通模式
incognito_persistent       无痕模式（持久化）
incognito_session_only     无痕模式（仅本次会话）
```

## onChange 事件

每个 `ChromeSetting` 都有 `onChange` 事件：
```javascript
chrome.privacy.services.safeBrowsingEnabled.onChange.addListener((details) => {
    console.log("设置变化:", details.value);
    console.log("控制级别:", details.levelOfControl);
});
```

## 综合示例：统一读取并强制启用某项设置

```javascript
async function ensureSetting(setting, desiredValue) {
    const details = await setting.get({});
    if (details.value === desiredValue) {
        return true;
    }
    if (
        details.levelOfControl === "controllable_by_this_extension" ||
        details.levelOfControl === "controlled_by_this_extension"
    ) {
        await setting.set({ value: desiredValue, scope: "regular" });
        return true;
    }
    return false;
}

// 例如强制允许第三方 Cookie
ensureSetting(chrome.privacy.websites.thirdPartyCookiesAllowed, true);
```

## 使用 chrome.types 的 API

| API | 说明 |
| --- | ---- |
| `chrome.privacy` | 隐私相关设置 |
| `chrome.fontSettings` | 字体相关设置 |
| `chrome.proxy.settings` | 代理设置 |
| `chrome.contentSettings` | 内容设置（部分使用 ChromeSetting） |

## 说明

- `chrome.types` 本身没有独立的运行时方法，它主要作为类型定义存在。
- `levelOfControl` 决定了扩展程序能否修改某项设置，某些设置可能被企业策略或其他扩展程序锁定。

## 项目
> 参考 `api.privacy.md`、`api.fontSettings.md`、`api.proxy.md`、`api.contentSettings.md`。

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/types?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/types?hl=zh-cn#type-ChromeSetting
```
