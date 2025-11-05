# chrome.action 管理工具栏中的扩展程序图标

> 使用 chrome.action API 控制 Google Chrome 工具栏中的扩展程序图标
> 操作图标显示在浏览器工具栏中的 omnibox 旁边。安装后，这些扩展程序会显示在扩展程序菜单（拼图图标）中。用户可以将您的扩展程序图标固定到工具栏。

## manifest.json 设置
```json
{
    "action": {
        "default_popup": "pages/action.html",
        "default_icon": "images/icon.png",
        "default_title": "chrome.action 效果演示"
    },
}
```
-  default_icon 图标

    图标推荐使用宽高都为 19 像素的图片，更大的图标会被缩小，格式随意，一般推荐 png 
    ```json
    {
        "action": {
            "default_icon": {
                "16": "images/icon16.png",
                "24": "images/icon24.png",
                "32": "images/icon32.png"
            }
        }
    }
    ```
        
    由于具有 1.5 倍或 1.2 倍等不太常见缩放比例的设备越来越普遍，我们建议您为图标提供多种尺寸。
    这还可以确保您的扩展程序在未来能够应对潜在的图标显示大小变化。
    不过，如果只提供一种尺寸，也可以将 "default_icon" 键设置为指向单个图标路径的字符串，而不是字典。

    可以调用 setIcon() 方法设置 chrome.action.setIcon({path: "images/icon.png"});
    action.setIcon() API 旨在设置静态图片。请勿为图标使用动画图片。

-  default_title 提示（标题）

    当用户将鼠标指针悬停在工具栏中的扩展程序图标上时，系统会显示提示或标题。
    当按钮获得焦点时，屏幕阅读器朗读的无障碍文本中也会包含该文本。

    可以调用 setTitle() 方法设置 chrome.action.setTitle({title: "新标题"});

- default_popup 弹出式窗口
 
    弹出式窗口是一个 HTML 文件，当用户点击图标时会打开。
    也可以不配置，直接配置图标的点击事件
    可以使用 action.setPopup() 方法动态更新该属性，使其指向其他相对路径


- badge 徽章

    所谓badge就是在图标上显示一些文本，可以用来更新一些小的扩展状态提示信息。
    因为badge空间有限，所以只支持4个以下的字符（英文4个，中文2个）。
    badge无法通过配置文件来指定，必须通过代码实现，
    设置badge文字和颜色可以分别使用 setBadgeText() 和 setBadgeBackgroundColor()
    ```javascript
        chrome.action.setBadgeText({text: "新"});
        chrome.action.setBadgeBackgroundColor({color: "#FF0000"});
    ```

## 方法
### disable() 
> 停用标签页
```javascript
    chrome.action.enable(
        // tabId: 0, // 要启用操作的标签页的 ID。如果未指定任何标签页，则启用所有标签页的操作。
    ).then(() => {
        console.log("操作已启用");
    }).catch((error) => {
        console.error("启用操作时出错:", error);
    });
```

### enable()
> 为标签页启用操作。默认情况下，操作处于启用状态
```javascript
chrome.action.disable(
    // tabId: 0, // 要停用操作的标签页的 ID。如果未指定任何标签页，则停用所有标签页的操作。
).then(() => {
    console.log("操作已停用");
}).catch((error) => {
    console.error("停用操作时出错:", error);
});
```

### getBadgeBackgroundColor()
> 获取 action 图片 badge 的背景颜色
```javascript
chrome.action.getBadgeBackgroundColor({
    // tabId: 0, // TabDetails.tabId 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
}, function(color) {
    console.log("徽章背景颜色:", color); // [number, number, number, number] RGBA 数组
});
```

### getBadgeText()
> 获取 action 的 badge 文本。如果未指定任何标签页，则返回非标签页特定的徽章文字。
> 如果启用了 displayActionCountAsBadgeText，则除非存在 declarativeNetRequestFeedback 权限或提供了标签页专用徽章文本，否则系统会返回占位文本。
```javascript
chrome.action.getBadgeText({
    // tabId: 0, // TabDetails.tabId 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
}, function(text) {
    console.log("徽章文本:", text);
});
```

### getBadgeTextColor()
> 获取 action 的 badge 文字颜色
```javascript
chrome.action.getBadgeTextColor({
    // tabId: 0, // TabDetails.tabId 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
}, function(color) {
    console.log("徽章文字颜色:", color); // [number, number, number, number] RGBA 数组
});
```

### getPopup()
> 获取 action 弹出式窗口的 HTML 文档路径
```javascript
chrome.action.getPopup({
    // tabId: 0, // TabDetails.tabId 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
}, function(path) {
    console.log("弹出式窗口文件路径:", path);
});
```

### getTitle()
> 获取 action 的标题
```javascript
chrome.action.getTitle({
    // tabId: 0, // TabDetails.tabId 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
}, function(title) {
    console.log("action 标题:", title);
});
```

### getUserSettings()
> 返回与扩展程序 action 相关的用户指定设置
```javascript
chrome.action.getUserSettings(function(setting) {
    console.log("操作设置:", setting); 
    console.log("UserSettings.isOnToolbar:", setting.isOnToolbar); // isOnToolbar扩展程序的 action 图标是否显示在浏览器窗口的顶级工具栏上（即，用户是否已“固定”该扩展程序）
});
```

### isEnabled()
> 指示扩展程序操作是否已针对某个标签页启用（如果未提供 tabId，则表示已全局启用）。仅使用 declarativeContent 启用的操作始终返回 false。
```javascript
chrome.action.isEnabled({
    // tabId: 0, // TabDetails.tabId 要查询状态的标签页的 ID。如果未指定任何标签页，则返回非标签页专用状态。
}, function(isEnabled) {
    console.log("操作是否已启用:", isEnabled);
});
```

### openPopup()
> 打开扩展程序的弹出式窗口。在 Chrome 118 和 Chrome 126 之间，此功能仅适用于根据政策安装的扩展程序
```javascript
chrome.action.openPopup({
    // windowId: chrome.windows.WINDOW_ID_CURRENT, // 要在其中打开操作弹出式窗口的窗口的 ID。如果未指定，则默认为当前活跃窗口。
}).then(() => {
    console.log("弹出式窗口已打开");
}).catch((error) => {
    console.error("打开弹出式窗口时出错:", error);
});
```

### setBadgeBackgroundColor()
> 设置 badge 的背景颜色
```javascript
chrome.action.setBadgeBackgroundColor({
    color: [255, 0, 0, 255], // 要设置的背景颜色。 也可以为字符串格式  #FF0000
    // color: "#FF0000", // 字符串格式
    // tabId: 0, // TabDetails.tabId 要设置状态的标签页的 ID。如果未指定任何标签页，则将非标签页专用状态设置为指定值。
}).then(() => {
    console.log("徽章背景颜色已设置");
}).catch((error) => {
    console.error("设置徽章背景颜色时出错:", error);
});
``` 

### setBadgeText()
> 为 action 设置 badge 文本。badge 显示在图标上方
```javascript
// 可以传递任意数量的字符，但空间中只能容纳大约 4 个字符。
// 如果传递的是空字符串 ('')，则会清除标记文本。如果指定了 tabId，但 text 为 null，则指定标签页的文字会被清除，并默认设为全局徽章文字。
chrome.action.setBadgeText({
    text: "123", // 要设置的文本。如果为空字符串，则会清除徽章。
    // tabId: 0, // TabDetails.tabId 要设置状态的标签页的 ID。如果未指定任何标签页，则将非标签页专用状态设置为指定值。
}).then(() => {
    console.log("徽章文本已设置");
}).catch((error) => {
    console.error("设置徽章文本时出错:", error);
});
``` 

### setBadgeTextColor()
> 设置 badge 的文字颜色
```javascript
chrome.action.setBadgeTextColor({
    color: [255, 0, 0, 255], // 要设置的文字颜色。 也可以为字符串格式  #FF0000
    // color: "#FF0000", // 字符串格式
    // tabId: 0, // TabDetails.tabId 要设置状态的标签页的 ID。如果未指定任何标签页，则将非标签页专用状态设置为指定值。
}).then(() => {
    console.log("徽章文字颜色已设置");
}).catch((error) => {
    console.error("设置徽章文字颜色时出错:", error);
});
``` 

### setIcon()
> 为操作设置图标。图标可以指定为图片文件的路径、画布元素的像素数据，也可以指定为包含其中任一信息的字典。必须指定 path 或 imageData 属性
```javascript
chrome.action.setIcon({
    // imageData: {} // 要设置的图标，可以是 ImageData 对象，也可以是表示图标的字典 {size -> ImageData}。如果图标指定为字典，则会根据屏幕的像素密度选择要使用的实际图片。
    path: "icon.png", // 相对图片路径或指向要设置的图标的字典 {size -> relative image path}。如果图标指定为字典，则会根据屏幕的像素密度选择要使用的实际图片。
    // tabId: 0, // TabDetails.tabId 要设置状态的标签页的 ID。如果未指定任何标签页，则将非标签页专用状态设置为指定值。
}).then(() => {
    console.log("图标已设置");
}).catch((error) => {
    console.error("设置图标时出错:", error);
});
``` 

### setPopup()
> 设置 HTML 文档，以便在用户点击操作的图标时将其作为弹出式窗口打开
```javascript
chrome.action.setPopup({
    popup: "popup.html", // 要在弹出式窗口中显示的 HTML 文件的相对路径。如果设置为空字符串 ('')，则不显示任何弹出式窗口。
    // tabId: 0, // TabDetails.tabId 要设置状态的标签页的 ID。如果未指定任何标签页，则将非标签页专用状态设置为指定值。
}).then(() => {
    console.log("弹出式窗口已设置");
}).catch((error) => {
    console.error("设置弹出式窗口时出错:", error);
});
``` 

### setTitle()
> 设置操作的标题。标题显示在用户将鼠标悬停在操作图标上时
```javascript
chrome.action.setTitle({
    title: "我的扩展", // 鼠标悬停时操作应显示的字符串。
    // tabId: 0, // TabDetails.tabId 要设置状态的标签页的 ID。如果未指定任何标签页，则将非标签页专用状态设置为指定值。
}).then(() => {
    console.log("标题已设置");
}).catch((error) => {
    console.error("设置标题时出错:", error);
});
``` 

## 事件
### onClicked 
> 在用户点击操作图标时触发。如果操作具有弹出式窗口，则不会触发此事件
```javascript
// 在用户点击操作图标时触发。如果操作具有弹出式窗口，则不会触发此事件。
chrome.action.onClicked.addListener(function(tab) {
    console.log("用户点击了操作图标:",tab); // 
    console.log("Tab.active:",tab.active); // 相应标签页在其窗口中是否处于活动状态。不一定表示窗口已聚焦。
    console.log("Tab.audible:",tab.audible); // 相应标签页在过去几秒内是否发出过声音（但如果同时处于静音状态，则可能听不到声音）。相当于“扬声器音频”指示器是否显示。
    console.log("Tab.autoDiscardable:",tab.autoDiscardable); // 当资源不足时，浏览器是否可以自动舍弃相应标签页。
    console.log("Tab.discarded:",tab.discarded); // 标签页是否已舍弃。舍弃的标签页是指其内容已从内存中卸载，但仍显示在标签页栏中的标签页。下次激活时，其内容会重新加载。
    console.log("Tab.favIconUrl:",tab.favIconUrl); // 相应标签页的网站图标的网址。仅当扩展程序具有 "tabs" 权限或具有网页的宿主权限时，才会显示此属性。如果标签页正在加载，该值也可能为空字符串。
    console.log("Tab.frozen:",tab.frozen); // 标签页是否处于冻结状态。冻结的标签页无法执行任务，包括事件处理脚本或计时器。它会显示在标签页栏中，并且其内容会加载到内存中。激活后，会员资格将恢复正常。
    console.log("Tab.groupId:",tab.groupId); // 相应标签页所属群组的 ID。
    console.log("Tab.height:",tab.height); // 标签页的高度（以像素为单位）。
    console.log("Tab.highlighted:",tab.highlighted); // 标签页是否突出显示。
    console.log("Tab.id:",tab.id); // 标签页的 ID。标签页 ID 在浏览器会话中是唯一的。在某些情况下，标签页可能未分配 ID；例如，使用 sessions API 查询外部标签页时，可能会出现会话 ID。对于应用和开发者工具窗口，标签页 ID 也可以设置为 chrome.tabs.TAB_ID_NONE。 
    console.log("Tab.incognito:",tab.incognito); // 相应标签页是否位于无痕式窗口中。`
    console.log("Tab.index:",tab.index); // 相应标签页在其窗口中的索引（从零开始）。
    console.log("Tab.lastAccessed:",tab.lastAccessed); // 相应标签页上次在其窗口中变为活动状态的时间（以自纪元以来经过的毫秒数表示）。
    console.log("Tab.mutedInfo:",tab.mutedInfo); // 相应标签页的静音状态以及上次状态更改的原因。
    console.log("Tab.mutedInfo.extensionId:",tab.mutedInfo.extensionId); // 相应标签页的静音状态以及上次状态更改的原因。
    console.log("Tab.mutedInfo.muted:",tab.mutedInfo.muted); // 标签页是否处于静音状态（无法播放声音）。即使标签页尚未播放或当前未播放声音，也可能会处于静音状态。相当于是否显示“静音”音频指示器。
    console.log("Tab.mutedInfo.reason:",tab.mutedInfo.reason); // 相应标签页静音或取消静音的原因。如果相应标签页的静音状态从未更改过，则不设置。
    console.log("Tab.openerTabId:",tab.openerTabId); // 打开此标签页的标签页的 ID（如果有）。仅当打开程序标签页仍然存在时，此属性才会存在。
    console.log("Tab.pendingUrl:",tab.pendingUrl); // 标签页正在前往的网址（在提交之前）。仅当扩展程序具有 "tabs" 权限或具有网页的宿主权限，并且存在待处理的导航时，才会显示此属性。
    console.log("Tab.pinned:",tab.pinned); // 标签页是否已固定。
    // console.log("Tab.selected:",tab.selected); // 标签页是否处于选中状态。 已弃用 请使用 tabs.Tab.highlighted。
    console.log("Tab.sessionId:",tab.sessionId); // 用于唯一标识从 sessions API 获取的标签页的会话 ID。
    console.log("Tab.status:",tab.status); // 标签页的加载状态。 unloaded | loading | complete
    console.log("Tab.title:",tab.title); // 标签页的标题。仅当扩展程序具有 "tabs" 权限或具有网页的宿主权限时，此属性才会存在。
    console.log("Tab.url:",tab.url); // 相应标签页主框架的上次已提交网址。仅当扩展程序具有 "tabs" 权限或具有网页的宿主权限时，才会显示此属性。如果标签页尚未提交，则可能为空字符串。另请参阅 Tab.pendingUrl。
    console.log("Tab.width:",tab.width); // 标签页的宽度（以像素为单位）。
    console.log("Tab.windowId:",tab.windowId); // 包含相应标签页的窗口的 ID。
});
```

### onUserSettingsChanged 
> 在与扩展程序操作相关的用户指定设置发生更改时触发
```javascript
// 在与扩展程序操作相关的用户指定设置发生更改时触发。
// 例如，用户在扩展程序的选项页面中更改了某些设置。
chrome.action.onUserSettingsChanged.addListener(function(change) {
    console.log("用户更改了扩展程序操作的设置:",change);
    console.log(change.isOnToolbar); // 扩展程序的 action 图标是否显示在浏览器窗口的顶级工具栏上（即，用户是否已“固定”该扩展程序）
});
```

## 项目
> https://github.com/freewu/plugin-demo/blob/main/chrome-extension-demo/demo2/
![action](./images/api/action-setting.png)


## 资料
```
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/action
https://developer.chrome.com/docs/extensions/reference/api/action?hl=zh-cn
```