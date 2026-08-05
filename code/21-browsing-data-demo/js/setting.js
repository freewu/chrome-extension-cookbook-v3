
function parseMilliseconds(timeframe) {
    let now = new Date().getTime();
    let milliseconds = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        '4weeks': 4 * 7 * 24 * 60 * 60 * 1000
    };
    if (milliseconds[timeframe]) return now - milliseconds[timeframe];
    if (timeframe === 'forever') return 0;
    return null;
}

function buttonClicked(event) {
    event.preventDefault();
    const option = document.getElementById('timeframe');
    let selectedTimeframe = option.value;
    let removal_start = parseMilliseconds(selectedTimeframe);
    if (removal_start == undefined) {
        return null;
    }
    chrome.browsingData.remove(
        { since: removal_start },
        {
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
    );
    const success = document.createElement('div');
    success.classList.add('overlay');
    success.setAttribute('role', 'alert');
    success.textContent = 'Data has been cleared.';
    document.body.appendChild(success);

    setTimeout(function () {
        success.classList.add('visible');
    }, 10);
    setTimeout(function () {
        if (close === false) success.classList.remove('visible');
        else window.close();
    }, 4000);
}

window.addEventListener('DOMContentLoaded', function () {
    document.getElementById('clear-all-btn').addEventListener('click', buttonClicked);
});

// 报告“清除浏览数据”设置界面中当前选择了哪些类型的数据。注意：此 API 中包含的某些数据类型在设置界面中不可用，并且某些界面设置可控制此处列出的多种数据类型。
document.getElementById('settings-btn').addEventListener('click', function () {
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
        document.getElementById('result-container').value = JSON.stringify(settings, null, 2);
    });
});

// 清除网站的应用缓存数据。
document.getElementById('removeAppcache-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeAppcache(removalOptions,function () {
        console.log('清除网站的应用缓存数据!');
    });
});

// 清除浏览器的缓存。
document.getElementById('removeCache-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeCache(removalOptions,function () {
        console.log('清除浏览器的缓存!');
    });
});

// 清除网站的缓存存储数据
document.getElementById('removeCacheStorage-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeCacheStorage(removalOptions,function () {
        console.log('清除网站的缓存存储数据!');
    });
});

// 清除浏览器在特定时间范围内修改的 Cookie 和与服务器绑定的证书
document.getElementById('removeCookies-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeCookies(removalOptions,function () {
        console.log('清除网站的 Cookies 数据!');
    });
});

// 清除浏览器中已下载文件的列表（不清除已下载的文件本身）。
document.getElementById('removeDownloads-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeDownloads(removalOptions,function () {
        console.log('清除浏览器下载记录!');
    });
});

// 清除网站的文件系统数据
document.getElementById('removeFileSystems-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeFileSystems(removalOptions,function () {
        console.log('清除网站的文件系统数据!');
    });
});

// 清除浏览器存储的表单数据（自动填充）。
document.getElementById('removeFormData-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeFormData(removalOptions,function () {
        console.log('清除自动填充表单缓存!');
    });
});

// 清除浏览器的历史记录
document.getElementById('removeHistory-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeHistory(removalOptions,function () {
        console.log('清除浏览器的历史记录!');
    });
});

// 清除网站的 IndexedDB 数据
document.getElementById('removeIndexedDB-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeIndexedDB(removalOptions,function () {
        console.log('清除网站的 IndexedDB 数据!');
    });
});

// 清除网站的本地存储数据
document.getElementById('removeLocalStorage-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeLocalStorage(removalOptions,function () {
        console.log('清除网站的本地存储数据!');
    });
});

// 清除浏览器存储的密码
document.getElementById('removePasswords-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removePasswords(removalOptions,function () {
        console.log('清除浏览器存储的密码!');
    });
});

// 清除网站的服务工作线程
document.getElementById('removeServiceWorkers-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeServiceWorkers(removalOptions,function () {
        console.log('清除网站的服务工作线程!');
    });
});

// 清除网站的 WebSQL 数据
document.getElementById('removeWebSQL-btn').addEventListener('click', function () { 
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
    console.log('removalOptions:', removalOptions);
    chrome.browsingData.removeWebSQL(removalOptions,function () {
        console.log('清除网站的 WebSQL 数据!');
    });
});