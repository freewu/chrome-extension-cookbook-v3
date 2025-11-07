# chrome.browsingData 管理浏览数据功能展示

> 使用 chrome.browsingData API 从用户的本地个人资料中移除浏览数据

## 数据类型
```
- appcache                  网站的应用缓存。
- cache                     浏览器的缓存。
- cacheStorage              stroge 缓存
- Cookie                    浏览器的 Cookie。
- downloads                 浏览器的下载列表。
- fileSystems               网站的文件系统。
- formData                  浏览器存储的表单数据。
- history                   浏览器的历史记录。
- indexedDB                 网站的 IndexedDB 数据。
- localStorage              网站的本地存储数据。
- passwords                 储的密码。
- pluginData                插件的数据 已移除对 Flash 的支持。系统将忽略此数据类型。
- serverBoundCertificates   与服务器绑定的证书。 已移除对服务器绑定证书的支持。系统将忽略此数据类型。
- serviceWorkers            Service Worker。
- webSQL                    网站的 WebSQL 数据。
```

## manifest.json 设置
```json
{
    "permissions": [
        "browsingData"
    ]
}
```

## 方法
### remove()
> 清除用户个人资料中存储的各种类型的浏览数据
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
let dataToRemove = { // 要移除的数据类型集 缺失的数据类型会被解读为 false 详细看 数据类型
    appcache: true,
    cache: true,
    cacheStorage: true,
    cookies: true,
    downloads: true,
    fileSystems: true,
    formData: true,
    history: true,
    indexedDB: true,
    localStorage: true,
    serverBoundCertificates: true,
    serviceWorkers: true,
    pluginData: true,
    passwords: true,
    webSQL: true
}
chrome.browsingData.remove(removalOptions, dataToRemove, function () {
    console.log('清除网站的应用缓存数据!');
});
```

### removeAppcache()
> 清除网站的应用缓存数据
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeAppcache(removalOptions,function () {
    console.log('清除网站的应用缓存数据!');
});
```

### removeCache()
> 清除浏览器的缓存
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeCache(removalOptions,function () {
    console.log('清除浏览器的缓存!');
});
```

### removeCacheStorage()
> 清除网站的缓存存储数据
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeCacheStorage(removalOptions,function () {
    console.log('清除网站的缓存存储数据!');
});
```

### removeCookies()
> 清除浏览器在特定时间范围内修改的 Cookie 和与服务器绑定的证书
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeCookies(removalOptions,function () {
    console.log('清除网站的 Cookies 数据!');
});
```

### removeDownloads()
> 清除浏览器中已下载文件的列表（不清除已下载的文件本身）
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeDownloads(removalOptions,function () {
    console.log('清除下载记录!');
});
```

### removeFileSystems()
> 清除网站的文件系统数据
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeFileSystems(removalOptions,function () {
    console.log('清除网站的文件系统数据!');
});
```

### removeFormData()
> 清除浏览器存储的表单数据（自动填充）
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeFormData(removalOptions,function () {
    console.log('清除浏览器存储的自动填充表单数据!');
});
```

### removeHistory()
> 清除浏览器的历史记录
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeHistory(removalOptions,function () {
    console.log('清除浏览器的历史记录!');
});
```

### removeIndexedDB()
> 清除网站的 IndexedDB 数据
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeIndexedDB(removalOptions,function () {
    console.log('清除网站的 IndexedDB 数据!');
});
```

### removeLocalStorage()
> 清除网站的本地存储数据
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeLocalStorage(removalOptions,function () {
    console.log('清除网站的本地存储数据!');
});
```

### removePasswords()
> 清除浏览器存储的密码
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removePasswords(removalOptions,function () {
    console.log('清除浏览器存储的密码!');
});
```

### removeServiceWorkers()
> 清除网站的服务工作线程
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeServiceWorkers(removalOptions,function () {
    console.log('清除网站的服务工作线程!');
});
```

### removeWebSQL()
> 清除网站的 WebSQL 数据
```javascript
let removalOptions = {
    // excludeOrigins: [], // 如果存在，则此列表中的来源对应的数据不会被删除。不能与 origins 结合使用。仅支持 Cookie、存储空间和缓存。系统会排除整个可注册网域的 Cookie。
    // originTypes: { // 其属性用于指定应清除哪些来源类型。如果未指定此对象，则默认仅清除“不受保护”的来源。在添加“protectedWeb”或“extensions”之前，请确保您确实要移除应用数据。
    //     extension: false, // 用户已安装的扩展程序和打包应用（请务必谨慎使用！）
    //     protectedWeb: false, // 已安装为托管应用的网站（请谨慎操作！）。
    //     unprotectedWeb: true // 普通网站。
    // },
    // origins: [], // 如果存在，则仅删除此列表中的来源的数据。仅支持 Cookie、存储空间和缓存。系统会清除整个可注册网域的 Cookie。
    since: (new Date("2025-11-01")).getTime() // 移除自此日期（以自纪元开始算起的毫秒数表示，可通过 JavaScript Date 对象的 getTime 方法访问）起累积的数据。如果缺省，则默认为 0（这将移除所有浏览数据）。
};
chrome.browsingData.removeWebSQL(removalOptions,function () {
    console.log('清除网站的 WebSQL 数据!');
});
```

### settings() 
> 报告“清除浏览数据”设置界面中当前选择了哪些类型的数据。注意：此 API 中包含的某些数据类型在设置界面中不可用，并且某些界面设置可控制此处列出的多种数据类型。
```javascript
chrome.browsingData.settings(function (settings) {
    // {
    //     "dataRemovalPermitted": {
    //         "cache": true,
    //         "cacheStorage": true,
    //         "cookies": true,
    //         "downloads": true,
    //         "fileSystems": true,
    //         "formData": true,
    //         "history": true,
    //         "indexedDB": true,
    //         "localStorage": true,
    //         "passwords": true,
    //         "pluginData": true,
    //         "serviceWorkers": true
    //     },
    //     "dataToRemove": {
    //         "cache": true,
    //         "cacheStorage": true,
    //         "cookies": true,
    //         "downloads": false,
    //         "fileSystems": true,
    //         "formData": false,
    //         "history": true,
    //         "indexedDB": true,
    //         "localStorage": true,
    //         "passwords": false,
    //         "pluginData": false,
    //         "serviceWorkers": true
    //     },
    //     "options": {
    //         "originTypes": {
    //         "extension": false,
    //         "protectedWeb": false,
    //         "unprotectedWeb": true
    //         },
    //         "since": 1762388722545.764
    //     }
    // }
    console.log('settings:', settings);
});
```

## 项目
> https://github.com/freewu/plugin-demo/blob/main/chrome-extension-demo/demo21/
![setting](./images/api/browsingData-setting.png)

## 资料
```markdown
https://developer.chrome.com/docs/extensions/reference/api/browsingData?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/browsingData
```