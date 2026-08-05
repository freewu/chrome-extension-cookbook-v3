// 如果系统已锁定，则返回“locked”；如果用户在指定秒数内未生成任何输入，则返回“idle”；否则返回“active”。
document.getElementById('query-state-btn').addEventListener('click', async () => {
    console.log('查询当前系统状态');
    const second = document.getElementById('detectionIntervalInSeconds-input').value;
    const state = await chrome.idle.queryState(
        parseInt(second) // 如果自检测到上次用户输入以来已过去 detectionIntervalInSeconds 秒，则系统被视为处于空闲状态 必须大于 15
    );
    //  如果系统已锁定，则返回“locked”；如果用户在指定秒数内未生成任何输入，则返回“idle”；否则返回“active”
    document.getElementById('result-container').value = state;
});

// 设置用于确定系统何时处于 onStateChanged 事件的空闲状态的时间间隔（以秒为单位）。默认间隔为 60 秒
document.getElementById('set-interval-btn').addEventListener('click', async () => {
    console.log('设置用于确定系统何时处于 onStateChanged 事件的空闲状态的时间间隔（以秒为单位）');
    const second = document.getElementById('detectionIntervalInSeconds-input').value;
    await chrome.idle.setDetectionInterval(
        parseInt(second) // 用于确定系统何时处于空闲状态的阈值（以秒为单位）。 必须大于 15
    );
    console.log('data:', Date.now());
    document.getElementById('result-container').value = `设置成功，空闲状态检测时间间隔为 ${second} 秒`;
});