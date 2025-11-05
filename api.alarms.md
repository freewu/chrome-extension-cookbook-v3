# chrome.alarms 管理闹钟功能展示 

> 使用 chrome.alarms API 安排代码在指定时间或未来某个时间定期运行
> Chrome 120：从 Chrome 120 开始，闹钟的最小间隔已从 1 分钟缩短到 30 秒。如需在 30 秒后触发闹钟，请将 periodInMinutes: 0.5 设置为 30。
> Chrome 117：从 Chrome 117 开始，有效闹铃的数量限制为 500。达到此限制后，chrome.alarms.create() 将失败。使用回调时，系统会设置 chrome.runtime.lastError。使用 promise 时，promise 将被拒绝

## 闹钟行为

- 设备休眠
    
    设备处于休眠状态时，闹钟会继续运行。不过，闹钟不会唤醒设备。当设备唤醒时，所有错过的闹钟都会响铃。 重复闹钟最多会响铃一次，
    然后会根据指定周期重新安排响铃时间，从设备唤醒时开始计算，不考虑自最初设置闹钟响铃以来已经过去的时间。

- 持久性

    闹钟通常会一直存在，直到扩展程序更新。不过，我们无法保证这一点，并且在浏览器重启时闹钟可能会被清除。
    因此，请考虑在创建闹钟时在存储空间中设置一个值，然后确保每次服务工作线程启动时该值都存在

## manifest.json 配置
```json
{
    "permissions": [
        "alarms"
    ]
}
```

## 方法
### clear()
> 清除具有指定名称的闹钟
```javascript
let alarmName = "demo-default-alarm"; // 要清除的闹钟的名称。默认为空字符串。
let result = await chrome.alarms.clear(alarmName);
console.log("清除闹钟: ", result);
```

### clearAll()
> 清除所有闹钟
```javascript
let result = await chrome.alarms.clearAll();
console.log("清除所有闹钟: ", result);
```

### create()
> 创建闹钟。在 alarmInfo 指定的时间附近，系统会触发 onAlarm 事件。如果存在另一个同名（或未指定名称）的闹钟，则该闹钟将被取消并替换为此闹钟
> 为了减轻用户机器的负载，Chrome 将闹钟限制为最多每 30 秒响一次，但可能会将闹钟延迟任意时长。
> 将 delayInMinutes 或 periodInMinutes 设置为小于 0.5 的值，系统将不会接受该值，并会发出警告。
> when 可以设置为“现在”之后的不到 30 秒，而不会发出警告，但实际上至少要过 30 秒才会触发闹钟。
> 为了帮助您调试应用或扩展程序，当您以未打包的方式加载应用或扩展程序时，闹钟的触发频率不受限制。
```javascript
let alarmName = "demo-default-alarm"; // 闹钟的名称。默认为空字符串。
let alarmCreateInfo = {
    //delayInMinutes: 0.5, //  onAlarm 事件应触发的时间长度（以分钟为单位）。
    // periodInMinutes: 0.5, //  如果设置了该值，则在 when 或 delayInMinutes 指定的初始事件之后，每隔 periodInMinutes 分钟应触发一次 onAlarm 事件。如果未设置，闹钟将仅响铃一次。
    // when: Date.now() + 1000 * 10 //  闹钟应响铃的时间，以自纪元以来的毫秒数表示（例如 Date.now() + n）
}
chrome.alarms.create(alarmName, alarmCreateInfo).then(() => {
    console.log("创建闹钟成功");
});
```

### get()
> 检索指定闹钟的详细信息
```javascript
let alarmName = "demo-default-alarm"; // 要检索的闹钟的名称。默认为空字符串。
let alarm = await chrome.alarms.get(alarmName);
console.log("获取闹钟: ", alarm);
console.log("Alarm.name: ", alarm.name); // 相应闹钟的名称。
console.log("Alarm.periodInMinutes: ", alarm.periodInMinutes); // 如果不为 null，则表示闹钟为重复闹钟，将在 periodInMinutes 分钟后再次触发。
console.log("Alarm.scheduledTime: ", alarm.scheduledTime); // 相应闹钟计划触发的时间，以自纪元以来的毫秒数表示（例如 Date.now() + n）。出于性能方面的考虑，闹钟可能会延迟任意时长。 
```

### getAll()
> 获取所有闹钟的数组
```javascript
let alarms = await chrome.alarms.getAll();
console.log("获取所有闹钟: ", alarms);
for (let alarm of alarms) {
    console.log("Alarm.name: ", alarm.name); // 相应闹钟的名称。
    console.log("Alarm.periodInMinutes: ", alarm.periodInMinutes); // 如果不为 null，则表示闹钟为重复闹钟，将在 periodInMinutes 分钟后再次触发。
    console.log("Alarm.scheduledTime: ", alarm.scheduledTime); // 相应闹钟计划触发的时间，以自纪元以来的毫秒数表示（例如 Date.now() + n）。出于性能方面的考虑，闹钟可能会延迟任意时长。 
}
```

## 事件
### onAlarm
> 当闹钟时间已过时触发
```javascript
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
```

## 项目
> https://github.com/freewu/plugin-demo/blob/main/chrome-extension-demo/demo8/
![action](./images/api/alarms-setting.png)


## 资料
```
https://developer.chrome.google.cn/docs/extensions/reference/api/alarms
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/alarms
```