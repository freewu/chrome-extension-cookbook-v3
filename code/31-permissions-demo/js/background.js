// 点击 action 图标时触发
chrome.action.onClicked.addListener((tab) => {
    console.log('点击 action 图标时触发', tab);
    // 打开配置页面 pages/setting.html
    chrome.tabs.create({ url: chrome.runtime.getURL("pages/setting.html") });
});


// 当扩展程序获得新权限时触发
chrome.permissions.onAdded.addListener((permissions) => {
    console.log("扩展程序获得新权限:", permissions);
    console.log("permissions.origins:", permissions.origins); // 主机权限列表，包括清单中 optional_permissions 或 permissions 键中指定的权限，以及与内容脚本关联的权限。
    console.log("permissions.permissions:", permissions.permissions); // 已命名的权限列表（不包括主机或来源）
});

// 当扩展程序的权限访问权限被移除时触发
chrome.permissions.onRemoved.addListener((permissions) => {
    console.log("扩展程序的权限访问权限被移除:", permissions);
});