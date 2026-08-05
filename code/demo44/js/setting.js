// 获取所有可用语音的数组
document.getElementById('get-voices-btn').addEventListener('click', () => {
    chrome.tts.getVoices((voices) => {
        console.log(voices);
        let voice = voices[0];
        console.log("TtsVoice.eventTypes", voice.eventTypes); // EventTypeEventType[] 相应语音能够发送的所有回调事件类型 start | end | word | sentence | marker | interrupted | cancelled | error | pause | resume
        console.log("TtsVoice.extensionId", voice.extensionId); // 提供相应语音的扩展服务的 ID。
        // console.log("TtsVoice.gender", voice.gender);  // 自 Chrome 70 起已弃用 性别已被弃用，系统将忽略此属性。 male | female
        console.log("TtsVoice.lang", voice.lang); // 相应语音支持的语言，格式为 language-region。示例： en en-US en-GB zh-CN
        console.log("TtsVoice.remote", voice.remote); // 如果为 true，则表示合成引擎是远程网络资源。延迟时间可能会更长，并且可能会产生带宽费用。
        console.log("TtsVoice.voiceName", voice.voiceName); // 语音的名称。
        document.getElementById('result-container').value = JSON.stringify(voices, null, 2);
    });
});

// 检查引擎当前是否正在说话。在 Mac OS X 上，只要系统语音引擎正在说话，结果就为 true，即使语音不是由 Chrome 发起的也是如此。
document.getElementById('is-speaking-btn').addEventListener('click', () => {
    chrome.tts.isSpeaking((isSpeaking) => {
        console.log("引擎当前是否正在说话:",isSpeaking);
        document.getElementById('result-container').value = "引擎当前是否正在说话:" + isSpeaking;
    });
});

// 使用文字转语音引擎朗读文本
document.getElementById('speak-btn').addEventListener('click', () => {
    let text = document.getElementById('text-input').value;
    if (!text) {
        document.getElementById('result-container').value = "请输入要合成的文本";
        return;
    }
    let ttsOptions = { //  TtsOptions TTS 引擎的语音选项
        // requiredEventTypes:['start', 'end', 'word', 'sentence', 'marker', 'interrupted', 'cancelled', 'error', 'pause', 'resume'], // 语音必须支持的 TTS 事件类型。
        // desiredEventTypes: ['start', 'end', 'word', 'sentence', 'marker', 'interrupted', 'cancelled', 'error', 'pause', 'resume'],  // 感兴趣的要监听的 TTS 事件类型。如果缺少此参数，则可能会发送所有事件类型。
        enqueue: true, // 如果为 true，则在 TTS 正在进行时将此话语加入队列。如果为 false（默认值），则在说出此新话语之前，会中断任何当前语音并清空语音队列。
        //extensionId: chrome.runtime.id, // 要使用的语音引擎的扩展程序 ID（如果已知）。
        //gender: 'female', // 合成语音的性别 自 Chrome 77 起已弃用 性别已被弃用，系统将忽略此属性。 male | female
        //lang: 'zh-CN', // 用于合成的语言，格式为语言-地区。示例： en | en-US | en-GB | zh-CN    
        pitch: parseFloat(document.getElementById('pitch-select').value), // 说话音调介于 0 到 2 之间（含），其中 0 为最低，2 为最高。1.0 对应于语音的默认音高。
        rate: parseFloat(document.getElementById('rate-select').value), // 相对于此语音的默认语速的语速。1.0 是默认速率，通常约为每分钟 180 到 220 个字。2.0 表示快一倍的速度，0.5 则表示原有速度的一半。严格禁止使用低于 0.1 或高于 10.0 的值，但许多语音会进一步限制最低和最高速率，例如，即使您指定的值大于 3.0，特定语音实际上也可能不会以超过正常速度 3 倍的速度说话。  
        //voiceName: "", // 要用于合成的语音的名称。如果为空，则使用任何可用的声音。
        volume: parseFloat(document.getElementById('volume-select').value), // 说话音量，介于 0 到 1 之间（含 0 和 1），其中 0 为最低音量，1 为最高音量，默认值为 1.0。
        onEvent: (event) => { // TtsEvent 来自文字转语音引擎的更新事件，用于指示相应朗读的状态。
            console.log("事件:", event); // TtsEvent 来自 TTS 引擎的事件，用于传达朗读的状态。
            console.log("TtsEvent.charIndex", event.charIndex); // 话语中当前字符的索引。对于字词事件，该事件会在一个字词结束时触发，并在下一个字词开始之前触发。charIndex 表示文本中下一个要朗读的字词的开头位置。
            console.log("TtsEvent.errorMessage", event.errorMessage); // 如果事件类型为 error，则为错误说明。
            console.log("TtsEvent.length", event.length); // 话语下一部分的长度。例如，在 word 事件中，这是接下来要朗读的字词的长度。如果语音引擎未设置此值，则会将其设置为 -1。
            // start（语音开始后立即）
            // word（到达字词边界时）
            // sentence（到达句子边界时）
            // marker（到达 SSML mark 元素时）
            // end（到达话语末尾时）
            // interrupted（在到达末尾之前停止或中断话语时）
            // cancelled（在合成之前从队列中移除时）
            // error（发生任何其他错误时）。
            // 暂停语音时，如果特定话语在中间暂停，则会触发 pause 事件
            // 如果话语恢复语音，则会触发 resume 事件。
            // 请注意，如果在话语之间暂停语音，可能不会触发暂停和恢复事件。
            console.log("TtsEvent.type", event.type); // EventType 类型
        }
    };
    let voiceName = document.getElementById('voiceName-input').value;
    if (voiceName) {
        ttsOptions.voiceName = voiceName;
    }   
    console.log("ttsOptions:", ttsOptions);
    chrome.tts.speak(text, ttsOptions).catch((error) => {
        console.error("朗读文本时出错:", error);
        document.getElementById('result-container').value = "朗读文本时出错:" + error.message;
    });
});

// 暂停语音合成，可能会在话语中间暂停。调用以恢复或停止将取消暂停语音
document.getElementById('pause-btn').addEventListener('click', () => {
    chrome.tts.pause().catch((error) => {
        console.error("暂停语音合成时出错:", error);
        document.getElementById('result-container').value = "暂停语音合成时出错:" + error.message;
    });
});

// 如果语音之前处于暂停状态，则从上次中断的位置继续朗读
document.getElementById('resume-btn').addEventListener('click', () => {
    chrome.tts.resume().catch((error) => {
        console.error("恢复语音合成时出错:", error);
        document.getElementById('result-container').value = "恢复语音合成时出错:" + error.message;
    });
});

// 停止任何当前语音，并清空所有待处理话语的队列。此外，如果之前暂停了语音，现在会取消暂停，以便在下次调用 speak 时继续朗读
document.getElementById('stop-btn').addEventListener('click', () => {
    chrome.tts.stop().catch((error) => {
        console.error("停止语音合成时出错:", error);
        document.getElementById('result-container').value = "停止语音合成时出错:" + error.message;
    });
});
