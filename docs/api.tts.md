# chrome.tts 播放合成的文字转语音 (TTS)

> 使用 `chrome.tts` API 播放合成的文字转语音（Text-To-Speech）。
> 该 API 可以使用系统自带的 TTS 引擎，也可以使用通过 `chrome.ttsEngine` 实现的扩展程序 TTS 引擎。
> 该 API 需要 `tts` 权限。

## manifest.json 配置

```json
{
    "manifest_version": 3,
    "name": "文本转语音(TTS) 展示 (chrome.tts && chrome.ttsEngine)",
    "permissions": [
        "tts",
        "ttsEngine"
    ],
    "background": {
        "service_worker": "js/background.js"
    }
}
```

## 方法

### speak()
> 朗读指定文本
```javascript
chrome.tts.speak(
    "你好，世界！Hello world!",
    {
        lang: "zh-CN",          // 语言
        rate: 1.0,              // 语速，0.1 ~ 10，默认 1
        pitch: 1.0,             // 音高，0 ~ 2，默认 1
        volume: 1.0,            // 音量，0 ~ 1，默认 1
        voiceName: "Google 普通话", // 指定语音
        enqueue: false,         // true 时排队播放，false 时中断当前语音
        onEvent: (event) => {
            console.log("TTS 事件:", event.type);
            // start / end / word / sentence / mark / interrupt / cancel / error
            if (event.type === "end") {
                console.log("朗读完成");
            }
        }
    },
    () => {
        if (chrome.runtime.lastError) {
            console.error("朗读失败:", chrome.runtime.lastError.message);
        }
    }
);
```

### stop()
> 停止当前朗读
```javascript
chrome.tts.stop();
```

### pause() / resume()
> 暂停 / 继续朗读
```javascript
chrome.tts.pause();
chrome.tts.resume();
```

### isSpeaking()
> 查询当前是否正在朗读
```javascript
chrome.tts.isSpeaking((speaking) => {
    console.log("是否正在朗读:", speaking);
});
```

### getVoices()
> 获取可用的语音列表
```javascript
chrome.tts.getVoices((voices) => {
    for (const voice of voices) {
        console.log("语音名称:", voice.voiceName);
        console.log("语言:", voice.lang);
        console.log("是否远程:", voice.remote);
        console.log("是否默认:", voice.default);
        console.log("性别:", voice.gender); // male | female | neutral
        console.log("事件类型:", voice.eventTypes); // 该语音支持的事件类型
    }
});
```

## TtsEvent 类型

```
start        开始朗读
end          朗读结束
word         朗读到一个单词（需要引擎支持）
sentence     朗读到一个句子
mark         SSML mark 标记
interrupt    被其他 speak() 中断
cancel       被 stop() 取消
pause        暂停
resume       继续
error        出错
```

## 使用示例

```javascript
// 朗读选中的文本
chrome.tts.speak("当前时间：" + new Date().toLocaleTimeString(), {
    lang: "zh-CN",
    rate: 1.2
});
```

## 项目
> https://github.com/freewu/plugin-demo/blob/main/chrome-extension-demo/demo44/
![setting](./images/api/tts-setting.png)

## 资料
```
https://developer.chrome.com/docs/extensions/reference/api/tts?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/ttsEngine?hl=zh-cn
https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/api-samples/tts
```
