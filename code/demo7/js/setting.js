// "basic"
//     Contains an icon, title, message, expandedMessage, and up to two buttons.
// "image"
//     Contains an icon, title, message, expandedMessage, image, and up to two buttons.
// "list"
//     Contains an icon, title, message, items, and up to two buttons. Users on Mac OS X only see the first item.
// "progress"
//     Contains an icon, title, message, progress, and up to two buttons.

// 绑定 基本通知按钮
document.getElementById('notify-basic-btn').addEventListener('click', () => {
    console.log("点击基本通知按钮");
    // 发送通知 type = basic   icon, title, message, expandedMessage
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '../images/icon.png', // 
        //eventTime: Date.now() + 1000, // 通知创建时间 
        title: '点击了基本通知按钮',
        message: "点击了基本通知按钮 mesaage",
        expandedMessage: "点击了基本通知按钮 expandedMessage",
        // priority: 1, // 通知优先级 -2 到 2，0 为默认优先级
        // requireInteraction: true, // 是否需要用户交互后才清除通知,
        // silent: true, // 是否静音播放通知声音
    });
});

// 绑定 进度通知按钮
document.getElementById('notify-progress-btn').addEventListener('click', () => {
    console.log("点击进度通知按钮");
    // 发送通知 type = progress   icon, title, message, progress, and up to two buttons.
    chrome.notifications.create({
        type: 'progress',
        iconUrl: '../images/icon.png', // 
        eventTime: Date.now() + 1000, // 通知创建时间 1秒后显示
        title: '安装成功',
        message: "这条通知只在安装成功后弹出1次",
        progress: 80, // 进度条进度，0 到 100
        priority: 1, // 通知优先级 -2 到 2，0 为默认优先级
        requireInteraction: true, // 是否需要用户交互后才清除通知,
        silent: true, // 是否静音播放通知声音
        buttons: [{ title: '哈哈哈' }],
    }).catch((error) => {
        console.error('创建通知失败:', error);
    });
});

// 绑定 图片通知按钮
document.getElementById('notify-image-btn').addEventListener('click', () => {
    console.log("点击图片通知按钮");
    // 发送通知 type = image   icon, title, message, expandedMessage, image, and up to two buttons.
    chrome.notifications.create({
        type: 'image',
        iconUrl: '../images/icon.png', // 
        eventTime: Date.now() + 1000, // 通知创建时间 1秒后显示
        title: '点击了图片通知按钮',
        message: "点击了图片通知按钮 mesaage",
        expandedMessage: "点击了图片通知按钮 expandedMessage",
        imageUrl: '../images/icon.png', // 图片 URL
        priority: 1, // 通知优先级 -2 到 2，0 为默认优先级
        requireInteraction: true, // 是否需要用户交互后才清除通知,
        silent: true, // 是否静音播放通知声音
    });
});

// 绑定 列表通知按钮
document.getElementById('notify-list-btn').addEventListener('click', () => {
    console.log("点击列表通知按钮");
    // 发送通知 type = list   icon, title, message, items, and up to two buttons.
    chrome.notifications.create({
        type: 'list',
        iconUrl: '../images/icon.png', // 
        eventTime: Date.now() + 1000, // 通知创建时间 1秒后显示
        title: '点击了列表通知按钮',
        message: "点击了列表通知按钮 mesaage",
        items: [{
            title: '列表项1',
            message: '这是列表项1的详细信息'
        }, {
            title: '列表项2',
            message: '这是列表项2的详细信息'
        }],
        priority: 1, // 通知优先级 -2 到 2，0 为默认优先级
        requireInteraction: true, // 是否需要用户交互后才清除通知,
        silent: true, // 是否静音播放通知声音
    });
});

// 检索用户是否已启用来自相应应用或扩展程序的通知
document.getElementById('check-permission-btn').addEventListener('click', () => {
    console.log("点击检查通知权限按钮");
    // 发送通知 type = basic   icon, title, message, expandedMessage
    chrome.notifications.getPermissionLevel((permissionLevel) => {
        // granted  指定用户已选择显示来自应用或扩展程序的通知。这是安装时的默认设置。
        // denied 指定用户已选择不显示来自应用或扩展程序的通知。
        console.log("通知权限级别:", permissionLevel);
        document.getElementById('result-container').value = "通知权限级别: " + permissionLevel;
    });
});

// 检索相应应用或扩展程序的所有通知
document.getElementById('get-all-btn').addEventListener('click', () => {
    console.log("点击获取所有通知按钮");
    // 发送通知 type = basic   icon, title, message, expandedMessage
    chrome.notifications.getAll((notifications) => {
        console.log("所有通知:", notifications);
        // {
        //   "1d344abc-ece3-4b15-8377-75f426c2efdc": true,
        //   "41960bd8-cd10-4b62-b73a-7e060a0a4694": true
        // }
        document.getElementById('result-container').value = "所有通知:" + JSON.stringify(notifications, null, 2);
    });
});

// 清除指定通知
document.getElementById('clear-btn').addEventListener('click', () => {
    console.log("点击清除指定通知按钮");
    const notificationId = document.getElementById('notification-id-input').value.trim();
    if (!notificationId) {
        document.getElementById('result-container').value = "请输入通知ID";
        return;
    }
    // 发送通知 type = basic   icon, title, message, expandedMessage
    chrome.notifications.clear(notificationId, (wasCleared) => {
        console.log("清除通知结果:", wasCleared);
        document.getElementById('result-container').value = "清除通知结果: " + wasCleared;
    })
});

// 清除所有通知
document.getElementById('clear-all-btn').addEventListener('click', () => {
    console.log("点击清除所有通知按钮");
    // 获取所有的通知
    chrome.notifications.getAll((notifications) => {
        console.log("所有通知:", notifications);
        // 遍历所有通知并清除
        let notice = [];
        for (const notificationId in notifications) {
            chrome.notifications.clear(notificationId, (wasCleared) => {
                console.log("清除通知结果: notificationId ", notificationId, " wasCleared:", wasCleared);
                notice.push("清除通知结果: notificationId " + notificationId + " wasCleared: " + wasCleared);
            });
        }
        document.getElementById('result-container').value = notice.join("\n");
    });
});