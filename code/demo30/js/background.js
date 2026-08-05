// 使用 CLD 检测所提供文本的语言
let text = '你好'; // 要翻译的用户输入字符串
chrome.i18n.detectLanguage( text, function (result) {
    console.log("使用 CLD 检测所提供文本的语言: ", text);
    console.log("使用 CLD 检测所提供文本的语言结果: ", result);
});

// 获取浏览器的 accept-languages 这与浏览器使用的语言区域不同；如需获取语言区域，请使用 i18n.getUILanguage。
chrome.i18n.getAcceptLanguages(function (languages) {
    console.log("获取浏览器的 accept-languages: ",languages);
});

// 获取浏览器的浏览器界面语言
let lang = chrome.i18n.getUILanguage();
console.log(lang); // 浏览器界面语言代码，例如 en-US 或 fr-FR。

// 获取指定消息的本地化字符串。如果缺少消息，此方法会返回空字符串 ('')。如果 getMessage() 调用的格式有误（例如，messageName 不是字符串，或者 substitutions 数组的元素超过 9 个），此方法会返回 undefined。
let msg = chrome.i18n.getMessage('extension_title');
console.log(msg); // 扩展标题的本地化字符串

let msg1 = chrome.i18n.getMessage('extension_title1');
console.log("返回undefined:", msg1); // 扩展标题的本地化字符串 undefined
