// offscreen.js（离屏文档的脚本）
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// 绘制逻辑...
ctx.fillRect(0, 0, 100, 100);
const dataUrl = canvas.toDataURL();

// 发送结果到服务工作线程或其他页面
chrome.runtime.sendMessage({ type: 'CANVAS_RESULT', data: dataUrl });