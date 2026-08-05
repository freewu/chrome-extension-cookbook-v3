// 点击 action 图标时,打开 setting.html
chrome.action.onClicked.addListener(function (tab) {
    console.log('点击 action 图标时,打开 setting.html', tab);
    chrome.tabs.create({ url: "pages/setting.html" });
});

// 插件安装完成后，创建一个闹钟
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason !== 'install') { return; }

    console.log("插件安装完成");

    // Create an alarm so we have something to look at in the demo
    // when 和 delayInMinutes 不能同时使用
    await chrome.alarms.create('demo-default-alarm', {
        delayInMinutes: 1, //  onAlarm 事件应触发的时间长度（以分钟为单位） 延迟1分钟后触发第一次闹钟
        periodInMinutes: 0.5, //  periodInMinutes 每1分钟触发一次闹钟  支持 30 秒
        // when: Date.now() + 1000 * 10//  什么时间触发 10秒后触发第一次闹钟
    }).catch((error) => {
        console.error('创建闹钟失败:', error);
    });
    console.log("创建闹钟成功");
});

// 处理 闹钟触发事件 闹钟只会触发一次
chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("闹钟触发了", alarm);
    // {
    //     "name": "demo-default-alarm",
    //     "periodInMinutes": 1,
    //     "scheduledTime": 1759218545676.386
    // }
    console.log("闹钟名称:", alarm.name); // 相应闹钟的名称。
    console.log("间隔时间(分):", alarm.periodInMinutes); // 如果不为 null，则表示闹钟为重复闹钟，将在 periodInMinutes 分钟后再次触发
    console.log("触发时间:", new Date(alarm.scheduledTime).toLocaleString()); // 相应闹钟计划触发的时间，以自纪元以来的毫秒数表示（例如 Date.now() + n）。出于性能方面的考虑，闹钟可能会延迟任意时长。
});