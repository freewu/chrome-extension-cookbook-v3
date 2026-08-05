// 可添加到扩展操作上下文菜单中的顶级扩展项的最大数量
document.getElementById("get-max-contexts-btn").addEventListener("click", function () {
    // ACTION_MENU_TOP_LEVEL_LIMIT 可添加到扩展操作上下文菜单中的顶级扩展项的最大数量。超出此上限的任何内容都会被忽略。
    let count = chrome.contextMenus.ACTION_MENU_TOP_LEVEL_LIMIT;
    console.log("最大右键数: " + count);
    document.getElementById("result-container").value = "最大右键数: " + count;
});

// 移除此扩展程序添加的所有上下文菜单项
document.getElementById("remove-all-btn").addEventListener("click", function () {
    chrome.contextMenus.removeAll(function () {
        document.getElementById("result-container").value = "所有上下文菜单项已移除";
    });
});

// 移除上下文菜单项
document.getElementById("remove-menu-btn").addEventListener("click", function () {
    let menuId = document.getElementById("remove-menu-id-input").value;
    if (!menuId) {
        document.getElementById("result-container").value = "请输入菜单编号";
        return;
    }
    chrome.contextMenus.remove(menuId).then(() => {
        console.log("上下文菜单项已移除: " + menuId);
        document.getElementById("result-container").value = "上下文菜单项已移除: " + menuId;
    }).catch((error) => {
        console.log("移除上下文菜单项失败: " + error.message);
        document.getElementById("result-container").value = "移除上下文菜单项失败: " + error.message;
    });
});

// 创建新的上下文菜单项。如果在创建过程中发生错误，可能要等到创建回调触发时才能检测到；详细信息将包含在 runtime.lastError 中
document.getElementById("create-menu-btn").addEventListener("click", function () {
    let menuId = document.getElementById("menu-id-input").value;
    if (!menuId) {
        document.getElementById("result-container").value = "请输入菜单编号";
        return;
    }
    let title = document.getElementById("title-input").value;
    if (!title) {
        document.getElementById("result-container").value = "请输入菜单标题";
        return;
    }
    let type = document.getElementById("type-input").value;
    if (!type) {
        document.getElementById("result-container").value = "请输入菜单类型";
        return;
    }
    let createProperties = {
        // checked: false, // 复选框或单选按钮的初始状态：true 表示选中，false 表示未选中。在给定的组中，一次只能选择一个单选按钮。
        // contexts: ["all"], // 相应菜单项将显示在其中的上下文列表。默认为 ['page']   all | page | frame | selection | link | editable | image | video | audio | launcher | browser_action | page_action | action
        // documentUrlPatterns: ["<all_urls>"], // 将相应项限制为仅适用于网址与指定格式之一匹配的文档或框架。如需详细了解格式，请参阅匹配模式。
        // enabled: true, // 此上下文菜单项处于启用还是停用状态。默认为 true
        // parentId: null, // 父菜单项的 ID；这会使相应项成为之前添加的项的子项
        // targetUrlPatterns: ["<all_urls>"], // 与 documentUrlPatterns 类似，基于 img、audio 和 video 标记的 src 属性以及 a 标记的 href 属性的过滤条件。
        id: menuId, // 要分配给相应商品的唯一 ID。对于活动网页，此属性为必需属性。不能与此扩展程序的其他 ID 相同
        title: title, // 要在商品中显示的文字；除非 type 为 separator，否则此属性为必需属性。当上下文为 selection 时，请在字符串中使用 %s 来显示所选文本。例如，如果此参数的值为“将‘%s’翻译为 Pig Latin”，并且用户选择了“cool”一词，则所选内容的上下文菜单项为“将‘cool’翻译为 Pig Latin”。
        type: type, // 菜单项的类型。默认为 normal  normal | checkbox | radio | separator
        // visible: true, // 相应项是否在菜单中可见
        // onclick: function (info, tab) { // 点击菜单项时调用的回调函数。此属性在 Service Worker 内不可用；您应改为为 contextMenus.onClicked 注册监听器
        //     console.log("点击了测试菜单");
        //     console.log("OnClickData: ",info);
        //     console.log("点击右键的所在的tab: ",tab);
        // }
    }
    let parentId = document.getElementById("parent-id-input").value;
    if (parentId) {
        createProperties.parentId = parentId;
    }
    console.log("创建上下文菜单项参数: ", createProperties);
    let result = chrome.contextMenus.create(createProperties, function () {
        document.getElementById("result-container").value = "上下文菜单项已创建: " + menuId;
    });
    if (chrome.runtime.lastError) {
        document.getElementById("result-container").value = "创建上下文菜单项失败: " + chrome.runtime.lastError.message;
        return;
    }
    console.log("创建上下文菜单项结果: ", result);
});

// 更新之前创建的上下文菜单项
document.getElementById("update-menu-btn").addEventListener("click", function () {
    let menuId = document.getElementById("menu-id-input").value;
    if (!menuId) {
        document.getElementById("result-container").value = "请输入菜单编号";
        return;
    }
    let title = document.getElementById("title-input").value;
    if (!title) {
        document.getElementById("result-container").value = "请输入菜单标题";
        return;
    }
    let type = document.getElementById("type-input").value;
    if (!type) {
        document.getElementById("result-container").value = "请输入菜单类型";
        return;
    }
    let updateProperties = {
        // checked: false, // 复选框或单选按钮的初始状态：true 表示选中，false 表示未选中。在给定的组中，一次只能选择一个单选按钮。
        // contexts: ["all"], // 相应菜单项将显示在其中的上下文列表。默认为 ['page']   all | page | frame | selection | link | editable | image | video | audio | launcher | browser_action | page_action | action
        // documentUrlPatterns: ["<all_urls>"], // 将相应项限制为仅适用于网址与指定格式之一匹配的文档或框架。如需详细了解格式，请参阅匹配模式。
        // enabled: true, // 此上下文菜单项处于启用还是停用状态。默认为 true
        // parentId: null, // 要设为相应商品父级的商品的 ID。注意：您无法将某个项目设置为其自身后代的子项。
        // targetUrlPatterns: ["<all_urls>"], // 与 documentUrlPatterns 类似，基于 img、audio 和 video 标记的 src 属性以及 a 标记的 href 属性的过滤条件。
        title: title, // 要在商品中显示的文字；除非 type 为 separator，否则此属性为必需属性。当上下文为 selection 时，请在字符串中使用 %s 来显示所选文本。例如，如果此参数的值为“将‘%s’翻译为 Pig Latin”，并且用户选择了“cool”一词，则所选内容的上下文菜单项为“将‘cool’翻译为 Pig Latin”。
        type: type, // 菜单项的类型。默认为 normal  normal | checkbox | radio | separator
        // visible: true, // 相应项是否在菜单中可见
        // onclick: function (info, tab) { // 点击菜单项时调用的回调函数。此属性在 Service Worker 内不可用；您应改为为 contextMenus.onClicked 注册监听器
        //     console.log("点击了测试菜单");
        //     console.log("OnClickData: ",info);
        //     console.log("点击右键的所在的tab: ",tab);
        // }
    }
    let parentId = document.getElementById("parent-id-input").value;
    if (parentId) {
        updateProperties.parentId = parentId;
    }
    console.log("更新上下文菜单项参数: ", updateProperties);
    let result = chrome.contextMenus.update(menuId, updateProperties).then(() => {
        document.getElementById("result-container").value = "上下文菜单项已更新: " + menuId;
        console.log("更新上下文菜单项结果: ", result);
    }).catch((error) => {
        console.log("更新上下文菜单项失败: ", error);
        document.getElementById("result-container").value = "更新上下文菜单项失败: " + error.message;
    });
    if (chrome.runtime.lastError) {
        document.getElementById("result-container").value = "更新上下文菜单项失败: " + chrome.runtime.lastError.message;
        return;
    }
    console.log("更新上下文菜单项结果: ", result);
});