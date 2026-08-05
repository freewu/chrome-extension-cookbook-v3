// 因为badge空间有限，所以只支持4个以下的字符（英文4个，中文2个）。
// badge无法通过配置文件来指定，必须通过代码实现，
// 设置 badge 文字和颜色可以分别使用 setBadgeText() 和 setBadgeBackgroundColor()
chrome.action.setBadgeText({text: "新"});
chrome.action.setBadgeBackgroundColor({color: "#FF0000"});

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

// 在与扩展程序操作相关的用户指定设置发生更改时触发。
// 例如，用户在扩展程序的选项页面中更改了某些设置。
chrome.action.onUserSettingsChanged.addListener(function(change) {
    console.log("用户更改了扩展程序操作的设置:",change);
    console.log(change.isOnToolbar); // 扩展程序的 action 图标是否显示在浏览器窗口的顶级工具栏上（即，用户是否已“固定”该扩展程序）
});