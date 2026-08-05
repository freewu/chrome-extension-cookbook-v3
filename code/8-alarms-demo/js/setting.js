// 获取所有闹钟
document.getElementById('get-all-btn').addEventListener('click', async () => {
    const alarms = await chrome.alarms.getAll();
    console.log("所有闹钟:", alarms);
    document.getElementById('result-container').value = "所有闹钟:" + JSON.stringify(alarms, null, 2);
});

// 清除所有闹钟
document.getElementById('clear-all-btn').addEventListener('click', async () => {
    let result = await chrome.alarms.clearAll();
    console.log("清除所有闹钟: ", result);
    document.getElementById('result-container').value = "清除所有闹钟: " + result;
});

// 获取指定闹钟
document.getElementById('get-btn').addEventListener('click', async () => {
    let alarmName = document.getElementById('alarm-name-input').value;
    if (!alarmName) {
        document.getElementById('result-container').value = "请输入闹钟名称";
        return;
    }
    let alarm = await chrome.alarms.get(alarmName);
    console.log("获取闹钟: ", alarm);
    console.log("Alarm.name: ", alarm.name); // 相应闹钟的名称。
    console.log("Alarm.periodInMinutes: ", alarm.periodInMinutes); // 如果不为 null，则表示闹钟为重复闹钟，将在 periodInMinutes 分钟后再次触发。
    console.log("Alarm.scheduledTime: ", alarm.scheduledTime); // 相应闹钟计划触发的时间，以自纪元以来的毫秒数表示（例如 Date.now() + n）。出于性能方面的考虑，闹钟可能会延迟任意时长。 
    document.getElementById('result-container').value = "获取闹钟: " + JSON.stringify(alarm, null, 2);
});

// 清除指定闹钟
document.getElementById('clear-btn').addEventListener('click', async () => {
    let alarmName = document.getElementById('alarm-name-input').value;
    if (!alarmName) {
        document.getElementById('result-container').value = "请输入闹钟名称";
        return;
    }
    let result = await chrome.alarms.clear(alarmName);
    console.log("清除闹钟: ", result);
    document.getElementById('result-container').value = "清除闹钟: " + result;
});

// 创建闹钟。在 alarmInfo 指定的时间附近，系统会触发 onAlarm 事件。如果存在另一个同名（或未指定名称）的闹钟，则该闹钟将被取消并替换为此闹钟。
// 为了减轻用户机器的负载，Chrome 将闹钟限制为最多每 30 秒响一次，但可能会将闹钟延迟任意时长。也就是说，如果将 delayInMinutes 或 periodInMinutes 设置为小于 0.5 的值，系统将不会接受该值，并会发出警告。when 可以设置为“现在”之后的不到 30 秒，而不会发出警告，但实际上至少要过 30 秒才会触发闹钟。
// 为了帮助您调试应用或扩展程序，当您以未打包的方式加载应用或扩展程序时，闹钟的触发频率不受限制。
document.getElementById('create-btn').addEventListener('click', async () => {
    let alarmCreateInfo = {
        //delayInMinutes: 0.5, //  onAlarm 事件应触发的时间长度（以分钟为单位）。
        // periodInMinutes: 0.5, //  如果设置了该值，则在 when 或 delayInMinutes 指定的初始事件之后，每隔 periodInMinutes 分钟应触发一次 onAlarm 事件。如果未设置，闹钟将仅响铃一次。
        // when: Date.now() + 1000 * 10 //  闹钟应响铃的时间，以自纪元以来的毫秒数表示（例如 Date.now() + n）
    }
    let alarmName = document.getElementById('create-alarm-name-input').value;
    let periodInMinutes = document.getElementById('create-alarm-period-select').value;
    if (periodInMinutes) {
        alarmCreateInfo.periodInMinutes = Number(periodInMinutes);
    }
    let delayInMinutes = document.getElementById('create-alarm-delay-select').value;
    if (delayInMinutes) {
        alarmCreateInfo.delayInMinutes = Number(delayInMinutes);
    }
    console.log("闹钟名称: ", alarmName); // 用于标识相应闹钟的可选名称。默认为空字符串 chrome 会随机生成一个
    console.log("alarmCreateInfo: ", alarmCreateInfo);
    chrome.alarms.create(alarmName, alarmCreateInfo).then((result) => {
        console.log("创建闹钟: ", result);
        document.getElementById('result-container').value = "创建闹钟: " + result;
    });
});