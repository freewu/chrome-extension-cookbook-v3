// 创建窗口
document.getElementById('create-window-btn').addEventListener('click', async () => {
    console.log('创建窗口');
    win = chrome.windows.create({
        focused: false, // 如果值为 true，则打开一个活动窗口。如果值为 false，则打开一个闲置窗口
        incognito: true, // 新窗口是否应为无痕式窗口。
        url: 'https://www.baidu.com', // 要在窗口中作为标签页打开的网址或网址数组。完全限定网址必须包含架构，例如 “http://www.google.com”，而不是“www.google.com”。非完全限定网址会被视为扩展程序中的相对网址。默认为“新标签页”。
        setSelfAsOpener: true, // 如果值为 true，则新创建的窗口的“window.opener”会设置为调用方，并且与调用方位于同一相关浏览上下文单元中。
        state: 'normal', // 窗口的初始状态。minimized、maximized 和 fullscreen 状态不能与 left、top、width 或 height 状态组合使用。 
        type: 'popup', // 指定要创建的浏览器窗口的类型  normal / popup / panel / app / devtools / extension
        left: 100, // 新窗口与屏幕左边缘之间的像素数。如果未指定，新窗口会自然地从上次聚焦的窗口偏移。对于面板，此值会被忽略。
        top: 100, // 新窗口与屏幕上边缘的距离（以像素为单位）。如果未指定，新窗口会自然地从上次聚焦的窗口偏移。对于面板，此值会被忽略。 
        width: 800,
        height: 600, // 新窗口的高度（以像素为单位），包括边框。如果未指定，则默认为自然高度。
        //tabId: 9527, // 要添加到新窗口的标签页的 ID。
    }).then(() => {
        console.log('窗口创建成功:');
    }).catch((error) => {
        console.error('窗口创建失败:', error);
    });
});

// 修改当前窗口的大小和位置
document.getElementById('update-window-btn').addEventListener('click', async () => {
     console.log('修改窗口大小和位置');
    // 获取当前活动窗口
    const win = await chrome.windows.getCurrent();
    await chrome.windows.update(win.id, {
        left: 200, // 窗口要移动到的位置与屏幕左边缘的偏移量（以像素为单位）。对于面板，此值会被忽略。
        top: 200, // 窗口要移动到的位置与屏幕上边缘的偏移量（以像素为单位）。对于面板，此值会被忽略。
        width: 1000, // 要将窗口调整为的宽度（以像素为单位）。对于面板，此值会被忽略。
        height: 800, // 要将窗口调整为的高度（以像素为单位）。对于面板，此值会被忽略。
        focused: true, // 如果为 true，则将窗口置于前台；不能与“最小化”状态组合使用。如果值为 false，则将 z 顺序中的下一个窗口移到前面；不能与“全屏”或“最大化”状态结合使用。
        drawAttention: true, // 如果值为 true，则会导致窗口以吸引用户注意的方式显示，而不会更改聚焦窗口。此效果会一直持续，直到用户将焦点移至相应窗口。如果窗口已获得焦点，此选项不会产生任何影响。设置为 false 可取消之前的 drawAttention 请求。   
        state: 'normal', // 窗口的新状态。“minimized”“maximized”和“fullscreen”状态不能与“left”“top”“width”或“height”结合使用。
    }).then((window) => {
        console.log('窗口修改成功:', window);
    }).catch((error) => {
        console.error('窗口修改失败:', error);
    });
});

// 关闭当前窗口
document.getElementById('close-window-btn').addEventListener('click', async () => {
     console.log('关闭窗口');
    // 获取当前活动窗口
    const win = await chrome.windows.getCurrent();
    await chrome.windows.remove(win.id).then(() => {
        console.log('窗口关闭成功');
    }).catch((error) => {
        console.error('窗口关闭失败:', error);
    });
});