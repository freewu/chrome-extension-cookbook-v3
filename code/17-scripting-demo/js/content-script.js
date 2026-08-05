//document.writeln('Hello World!');
const div = document.createElement('div');
div.style.cssText = 'position: fixed; top: 10px; left: 10px; background-color: rgba(237, 64, 64, 0.5); color: #fff; padding: 5px;z-index: 9999;';
div.textContent = '插件注入的脚本!';
// 向 body 开头 元素添加 div 元素
document.body.appendChild(div);
alert('Hello World!');

// 获取 class chat-input-container 元素,并设置元素 backgroundColor 为 #29cd68
const input = document.querySelector('.chat-input-container');
console.log('input:', input);
input.style.backgroundColor = 'red';
