// 处理选择框变化事件
let incognito;
let url;

function settingChanged() {
    let type = this.id;
    let setting = this.value;
    let pattern = /^file:/.test(url) ? url : url.replace(/\/[^/]*?$/, '/*');
    console.log(type + ' setting for ' + pattern + ': ' + setting);
    // HACK: [type] is not recognised by the docserver's sample crawler, so
    // mention an explicit
    // type: chrome.contentSettings.cookies.set - See http://crbug.com/299634
    chrome.contentSettings[type].set({
        primaryPattern: pattern,
        setting: setting,
        // regular: 常规个人资料的设置（如果未在其他位置被覆盖，则无痕式个人资料会继承此设置 
        // incognito_session_only: 无痕式个人资料的设置，只能在无痕式会话期间设置，并在无痕式会话结束时删除（会覆盖常规设置）。
        scope: incognito ? 'incognito_session_only' : 'regular'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let current = tabs[0];
        incognito = current.incognito;
        url = current.url;
        let types = [
            'cookies',
            'images',
            'javascript',
            'location',
            'popups',
            'notifications',
            'microphone',
            'camera',
            'automaticDownloads'
        ];
        types.forEach(function (type) {
            // HACK: [type] is not recognised by the docserver's sample crawler, so
            // mention an explicit
            // type: chrome.contentSettings.cookies.get - See http://crbug.com/299634
            chrome.contentSettings[type] &&
            chrome.contentSettings[type].get(
                {
                primaryUrl: url,
                incognito: incognito
                },
                function (details) {
                document.getElementById(type).disabled = false;
                document.getElementById(type).value = details.setting;
                }
            );
        });
    });

    let selects = document.querySelectorAll('select');
    for (let i = 0; i < selects.length; i++) {
        selects[i].addEventListener('change', settingChanged);
    }
});