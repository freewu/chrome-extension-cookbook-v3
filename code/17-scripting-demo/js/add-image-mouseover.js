alert('所有链接加移动事件脚本注入成功!');



// 遍历所有的链接元素
const links = document.querySelectorAll('a');
links.forEach(link => {
    console.log('link:', link);
    // 为每个链接元素添加 mouseover 事件监听器
    link.addEventListener('mouseover', () => {
        // 当鼠标悬停在链接上时，将链接的边框颜色设置为红色
        link.style.border = `2px solid red`
    });
    link.addEventListener('mouseout', () => {
        // 当鼠标移出链接时，将链接的边框颜色重置为默认值
        link.style.border = 'none';
    });
});
