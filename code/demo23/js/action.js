let id = null;

// 取消选择
document.getElementById('cancel-btn').addEventListener('click', () => {
    console.log('cancel-btn click');
    if (id) {
        chrome.desktopCapture.cancelChooseDesktopMedia(id).then(() => {
            console.log('cancelChooseDesktopMedia success');
        }).catch((error) => {
            console.log('cancelChooseDesktopMedia error: ', error);
        });
        id = null;
    }
});

// 选择
document.getElementById('choose-btn').addEventListener('click', () => {
    console.log('choose-btn click');
    let type = document.getElementById('type').value;
    chrome.desktopCapture.chooseDesktopMedia([type], (streamId,options) => {
        if (streamId) {
            // 一个不透明的字符串，可传递给 getUserMedia() API 以生成与用户选择的来源对应的媒体流。
            // 如果用户未选择任何来源（即取消了提示），则系统会使用空的 streamId 调用回调。创建的 streamId 只能使用一次，如果未使用，会在几秒后过期
            console.log('chooseDesktopMedia success: ', streamId);  // 
            id = streamId;

            // options.canRequestAudioTrack 如果“audio”包含在参数来源中，并且最终用户未取消选中“分享音频”复选框，则为 true。否则为 false，在这种情况下，不应通过 getUserMedia 调用请求音频流
            console.log('chooseDesktopMedia options: ', options);
        } else {
            console.log('chooseDesktopMedia failed');
        }
    });
});