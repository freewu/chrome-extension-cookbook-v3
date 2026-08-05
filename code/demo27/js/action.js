// 点击获取配置按钮
document.getElementById('get-config-btn').addEventListener('click', async () => {
    const config = document.getElementById('config').value;
    // 用.分隔配置项，获取配置项的最后一个部分作为显示的配置项名称
    const arr = config.split('.')

    // 自行使用 set 去做设置处理
    chrome.privacy[arr[0]][arr[1]].get({}, function(details) {
        // {levelOfControl: 'controllable_by_this_extension', value: true}
        console.log(details);
        document.getElementById('config-result').value = config + ":"  + details.value;
    });
});