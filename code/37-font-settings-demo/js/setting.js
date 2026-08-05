// 当用户点击获取系统中的字体列表按钮时触发。
document.getElementById('get-font-list-btn').addEventListener('click', async () => {
    const fontList = await chrome.fontSettings.getFontList();
    console.log('getFontList', fontList);
    console.log('字体的显示名称: fontList[0].displayName', fontList[0].displayName);
    console.log('字体 ID: fontList[0].fontId', fontList[0].fontId); 
    document.getElementById('result-container').value = JSON.stringify(fontList, null, 2);
});

// 当用户点击获取最小字号按钮时触发。
document.getElementById('get-minimum-font-size-btn').addEventListener('click', async () => {
    const minimumFontSize = await chrome.fontSettings.getMinimumFontSize();
    console.log('getMinimumFontSize', minimumFontSize);
    document.getElementById('result-container').value = JSON.stringify(minimumFontSize, null, 2);
});

// 当用户点击获取等宽字体的默认大小时触发。
document.getElementById('get-fixed-pitch-font-size-btn').addEventListener('click', async () => {
    const fontSize = await chrome.fontSettings.getDefaultFixedFontSize();
    console.log('getDefaultFixedFontSize', fontSize);
    document.getElementById('result-container').value = JSON.stringify(fontSize, null, 2);  
});

// 当用户点击获取默认字号按钮时触发。
document.getElementById('get-default-font-size-btn').addEventListener('click', async () => {
    const fontSize = await chrome.fontSettings.getDefaultFontSize();
    console.log('getDefaultFontSize', fontSize);
    document.getElementById('result-container').value = JSON.stringify(fontSize, null, 2);  
});

// 清除此扩展程序设置的默认固定字体大小
document.getElementById('clearDefaultFixedFontSize-btn').addEventListener('click', async () => {
    await chrome.fontSettings.clearDefaultFixedFontSize();
    console.log('clearDefaultFixedFontSize');
    document.getElementById('result-container').value = '清除此扩展程序设置的默认固定字体大小';
});

// 清除此扩展程序设置的默认字号
document.getElementById('clearDefaultFontSize-btn').addEventListener('click', async () => {
    await chrome.fontSettings.clearDefaultFontSize();
    console.log('clearDefaultFontSize');
    document.getElementById('result-container').value = '清除此扩展程序设置的默认字号';
});

// 清除此扩展程序设置的最小字体大小
document.getElementById('clearMinimumFontSize-btn').addEventListener('click', async () => {
    await chrome.fontSettings.clearMinimumFontSize();
    console.log('clearMinimumFontSize');
    document.getElementById('result-container').value = '清除此扩展程序设置的最小字体大小';
});

// 设置等宽字体的默认大小
document.getElementById('set-fixed-pitch-font-size-btn').addEventListener('click', async () => {
    const pixelSize = document.getElementById('pixel-size-select').value;
    await chrome.fontSettings.setDefaultFixedFontSize({pixelSize: parseInt(pixelSize)});
    console.log('setDefaultFixedFontSize', pixelSize);
    document.getElementById('result-container').value = `设置等宽字体的默认大小为 ${pixelSize}px`;
});

// 设置默认字体大小
document.getElementById('set-default-font-size-btn').addEventListener('click', async () => {
    const pixelSize = document.getElementById('pixel-size-select').value;
    await chrome.fontSettings.setDefaultFontSize({pixelSize: parseInt(pixelSize)});
    console.log('setDefaultFontSize', pixelSize);
    document.getElementById('result-container').value = `设置默认字体大小为 ${pixelSize}px`;
});

// 设置最小字体大小
document.getElementById('set-minimum-font-size-btn').addEventListener('click', async () => {
    const pixelSize = document.getElementById('pixel-size-select').value;
    await chrome.fontSettings.setMinimumFontSize({pixelSize: parseInt(pixelSize)});
    console.log('setMinimumFontSize', pixelSize);
    document.getElementById('result-container').value = `设置最小字体大小为 ${pixelSize}px`;
});



// 当用户点击获取指定文字和通用字体系列的字体按钮时触发。
document.getElementById('get-font-btn').addEventListener('click', async () => {
    let obj = {};
    const genericFamily = document.getElementById('generic-family-select').value;
    if (genericFamily) {
        obj.genericFamily = genericFamily;
    }
    const script = document.getElementById('script-select').value;
    if (script != 'all') {
        obj.script = script;
    }

    chrome.fontSettings.getFont(obj,function(font){
        console.log('getFont', font);
        document.getElementById('result-container').value = JSON.stringify(font, null, 2);
    });  
});

// 清除此扩展程序设置的字体
document.getElementById('clearFont-btn').addEventListener('click', async () => {
    let obj = {};
    const genericFamily = document.getElementById('generic-family-select').value;
    if (genericFamily) {
        obj.genericFamily = genericFamily; // 应清除字体的通用字体系列
    }
    const script = document.getElementById('script-select').value;
    if (script != 'all') {
        obj.script = script; // 应清除字体的脚本。如果省略，则会清除全局脚本字体设置。
    }   
    chrome.fontSettings.clearFont(obj,function(){
        console.log('clearFont');
        document.getElementById('result-container').value = `清除此扩展程序设置的字体 {genericFamily: ${genericFamily}, script: ${script}}`;
    });
});

// 为给定的文字和通用字体系列设置字体
document.getElementById('set-font-btn').addEventListener('click', async () => {
    const fontId = document.getElementById('set-font-id-input').value;
    const genericFamily = document.getElementById('set-generic-family-select').value;
    let obj = {};
    if (fontId) {
        obj.fontId = fontId; // 字体 ID。空字符串表示回退到全局脚本字体设置 
    } else {
        document.getElementById('result-container').value = '请输入字体编号';
        return;
    }
    if (genericFamily) {
        obj.genericFamily = genericFamily; // 应设置的字体所对应的通用字体系列
    }
    const script = document.getElementById('set-script-select').value;
    if (script != 'all') {
        obj.script = script; // 应设置的字体所对应的脚本代码。如果省略，则会设置全局脚本（脚本代码“Zyyy”）的字体设置。
    }
    chrome.fontSettings.setFont(obj,function(){
        console.log('setFont');
        document.getElementById('result-container').value = `为 ${fontId} 设置字体 {genericFamily: ${genericFamily}}`;
    });
});