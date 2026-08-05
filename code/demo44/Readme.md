# 文本转语音(TTS) 展示 (chrome.tts && chrome.ttsEngine)

> 使用 chrome.tts API 播放合成的文字转语音 (TTS)。另请参阅相关的 ttsEngine API，该 API 允许扩展程序实现语音引擎。
> Chrome 在 Windows（使用 SAPI 5）、Mac OS X 和 ChromeOS 上提供此功能，使用操作系统提供的语音合成功能。在所有平台上，用户都可以安装将自己注册为替代语音引擎的扩展程序。

## mainifest.json 配置
```json
{
    "permissions": [
        "tts",
        "ttsEngine"
    ]
}
```

## 展示
![setting](./docs/setting.png)

## 资料
```markdown
https://developer.chrome.com/docs/extensions/reference/api/tts?hl=zh-cn
https://developer.chrome.com/docs/extensions/reference/api/ttsEngine?hl=zh-cn
```