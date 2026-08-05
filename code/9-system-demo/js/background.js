// 点击 action 图标时,打开 setting.html
chrome.action.onClicked.addListener(function (tab) {
    console.log('点击 action 图标时,打开 setting.html', tab);
    chrome.tabs.create({ url: "pages/setting.html" });
});


// == chrome.system.storage 事件 ============================================================================
// 当新的可移除存储设备连接到系统时触发
chrome.system.storage.onAttached.addListener((info) => {
    console.log("=== 新的可移除存储设备连接到系统时触发 chrome.system.storage.onAttached ================================");
    console.log("StorageUnitInfo:", info);
    console.log("StorageUnitInfo.capacity:", info.capacity, "字节", info.capacity / 1024 / 1024 / 1024, "GB"); // 存储空间总量（以字节为单位）
    console.log("StorageUnitInfo.id:", info.id); // 唯一标识存储设备的临时 ID。此 ID 在单个应用的同一运行期间将保持不变。它不会成为应用的不同运行之间或不同应用之间的持久性标识符。
    console.log("StorageUnitInfo.name:", info.name); // 存储单元的名称。
    console.log("StorageUnitInfo.type:", info.type); // 存储单元的媒体类型。  fixed 存储介质固定，例如硬盘或 SSD | removable 存储设备可移除，例如 U 盘 | unknown  存储类型未知
});

// 当可移除存储设备从系统分离时触发
chrome.system.storage.onDetached.addListener((id) => {
    console.log("=== 可移除存储设备从系统分离时触发 chrome.system.storage.onDetached ================================");
    console.log("StorageUnitInfo:", id); // 退出的  唯一标识存储设备的临时 ID
});

// == chrome.system.display 事件 ============================================================================

// 当显示配置发生任何变化时触发。
chrome.system.display.onDisplayChanged.addListener(() => {
    console.log("=== 当显示配置发生任何变化时触发 chrome.system.display.onDisplayChanged ================================");
});
