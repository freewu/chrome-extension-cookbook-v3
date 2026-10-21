import { mountTool } from "../shared/page.js";

// 字幕格式互转：SRT / VTT / SBV / SUB(MicroDVD) / SSA / ASS / LRC / JSON / SMI
// 内部统一模型 { start, end, text }（毫秒），样式指令在解析时剥离，只保留文本与时间轴
const pad2 = (n) => String(Math.floor(n)).padStart(2, "0");
const pad3 = (n) => String(Math.floor(n)).padStart(3, "0");

const msToSrt = (ms) => {
    const m = Math.max(0, Math.round(ms));
    return `${pad2(m / 3600000)}:${pad2((m % 3600000) / 60000)}:${pad2((m % 60000) / 1000)},${pad3(m % 1000)}`;
};
const srtToMs = (t) => {
    const m = /^(\d+):(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/.exec(String(t).trim());
    if (!m) throw new Error(`时间格式无法识别：${t}`);
    return (+m[1] * 3600 + +m[2] * 60 + +m[3]) * 1000 + +m[4].padEnd(3, "0");
};
const msToVtt = (ms) => msToSrt(ms).replace(",", ".");
const dotToMs = (t) => {
    const m = /^(?:(\d+):)?(\d{1,2}):(\d{1,2})[.,](\d{1,3})$/.exec(String(t).trim());
    if (!m) throw new Error(`时间格式无法识别：${t}`);
    return ((+(m[1] || 0)) * 3600 + +m[2] * 60 + +m[3]) * 1000 + +m[4].padEnd(3, "0");
};
const msToSbv = (ms) => {
    const [h, i, s] = msToSrt(ms).split(":");
    return `${+h}:${i}:${s.replace(",", ".")}`;
};
const msToCent = (ms) => {
    const m = Math.max(0, Math.round(ms));
    return `${Math.floor(m / 3600000)}:${pad2((m % 3600000) / 60000)}:${pad2((m % 60000) / 1000)}.${pad2((m % 1000) / 10)}`;
};
const centToMs = (t) => {
    const m = /^(?:(\d+):)?(\d{1,2}):(\d{1,2})\.(\d{1,2})$/.exec(String(t).trim());
    if (!m) throw new Error(`时间格式无法识别：${t}`);
    return ((+(m[1] || 0)) * 3600 + +m[2] * 60 + +m[3]) * 1000 + +m[4].padEnd(2, "0") * 10;
};
const msToLrc = (ms) => {
    const m = Math.max(0, Math.round(ms));
    return `${pad2(m / 60000)}:${pad2((m % 60000) / 1000)}.${pad2((m % 1000) / 10)}`;
};
const lrcToMs = (t) => {
    const m = /^(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?$/.exec(String(t).trim());
    if (!m) throw new Error(`时间格式无法识别：${t}`);
    return (+m[1] * 60 + +m[2]) * 1000 + +(m[3] || "").padEnd(2, "0").slice(0, 2) * 10;
};

const normalize = (s) => s.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
const stripTags = (s) => s.replace(/<[^>]*>/g, "");
const cleanCue = (s) => {
    const lines = normalize(s).split("\n").map((l) => l.replace(/\s+$/, ""));
    while (lines.length && lines[0].trim() === "") lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
    return lines.join("\n");
};
const trimBlank = (arr) => {
    const out = [...arr];
    while (out.length && out[0].trim() === "") out.shift();
    while (out.length && out[out.length - 1].trim() === "") out.pop();
    return out;
};

// ---------- 解析 ----------
const parseSrt = (input) => {
    const cues = [];
    for (const block of normalize(input).replace(/\n{3,}/g, "\n\n").split(/\n{2,}/)) {
        const lines = trimBlank(block.split("\n"));
        const idx = lines.findIndex((l) => l.includes("-->"));
        if (idx < 0) continue;
        const tm = /^(\S+)\s*-->\s*(\S+)/.exec(lines[idx]);
        if (!tm) continue;
        cues.push({ start: srtToMs(tm[1]), end: srtToMs(tm[2]), text: cleanCue(stripTags(lines.slice(idx + 1).join("\n"))) });
    }
    return cues;
};

const parseVtt = (input) => {
    const text = normalize(input);
    if (!/^WEBVTT/.test(text.trim())) throw new Error("不是有效的 WebVTT 内容（缺少 WEBVTT 头）");
    const lines = text.split("\n");
    const cues = [];
    let i = 0;
    while (i < lines.length) {
        const l = lines[i].trim();
        if (l === "") {
            i++;
            continue;
        }
        if (/^(NOTE|STYLE|REGION)\b/.test(l)) {
            while (i < lines.length && lines[i].trim() !== "") i++;
            i++;
            continue;
        }
        if (l.includes("-->")) {
            const tm = /^(\S+)\s*-->\s*(\S+)/.exec(l);
            if (tm) {
                let end = i + 1;
                while (end < lines.length && lines[end].trim() !== "") end++;
                cues.push({ start: dotToMs(tm[1]), end: dotToMs(tm[2]), text: cleanCue(stripTags(lines.slice(i + 1, end).join("\n"))) });
                i = end;
                continue;
            }
        }
        i++;
    }
    return cues;
};

const parseSbv = (input) => {
    const cues = [];
    for (const block of normalize(input).split(/\n{2,}/)) {
        const lines = trimBlank(block.split("\n"));
        if (!lines.length) continue;
        const tm = /^(\S+)\s*,\s*(\S+)/.exec(lines[0]);
        if (!tm) continue;
        cues.push({ start: dotToMs(tm[1]), end: dotToMs(tm[2]), text: cleanCue(stripTags(lines.slice(1).join("\n"))) });
    }
    return cues;
};

const parseSub = (input, fps = 25) => {
    const cues = [];
    let effFps = fps;
    let first = true;
    for (const raw of normalize(input).split("\n")) {
        const l = raw.trim();
        const m = /^\{(\d+)\}\{(\d+)\}([\s\S]*)$/.exec(l);
        if (!m) continue;
        if (first) {
            first = false;
            if (+m[1] === +m[2] && /^\d+(\.\d+)?$/.test(m[3].trim())) {
                const f = parseFloat(m[3]);
                if (f > 0) effFps = f;
                continue;
            }
        }
        const body = m[3].replace(/\{[^}]*\}/g, "");
        cues.push({
            start: Math.round((+m[1] / effFps) * 1000),
            end: Math.round((+m[2] / effFps) * 1000),
            text: cleanCue(body.replace(/\|/g, "\n")),
        });
    }
    return cues;
};

const parseSsaAss = (input) => {
    const cues = [];
    let inEvents = false;
    let fields = [];
    for (const raw of normalize(input).split("\n")) {
        const l = raw.trim();
        if (/^\[Events\]/i.test(l)) {
            inEvents = true;
            fields = [];
            continue;
        }
        if (/^\[/.test(l)) {
            inEvents = false;
            continue;
        }
        if (!inEvents) continue;
        const fmt = /^Format:\s*(.*)$/i.exec(l);
        if (fmt) {
            fields = fmt[1].split(",").map((s) => s.trim().toLowerCase());
            continue;
        }
        const dlg = /^Dialogue:\s*(.*)$/i.exec(l);
        if (!dlg) continue;
        const parts = dlg[1].split(",");
        const startIdx = fields.indexOf("start");
        const endIdx = fields.indexOf("end");
        const textIdx = fields.indexOf("text");
        if (startIdx < 0 || endIdx < 0 || textIdx < 0 || parts.length < fields.length) continue;
        const textRaw = parts.slice(textIdx).join(",");
        const cueText = textRaw.replace(/\\N|\\n/g, "\n").replace(/\\,/g, ",").replace(/\{[^}]*\}/g, "");
        cues.push({ start: centToMs(parts[startIdx].trim()), end: centToMs(parts[endIdx].trim()), text: cleanCue(cueText) });
    }
    return cues;
};

const parseLrc = (input) => {
    const tagged = [];
    for (const raw of normalize(input).split("\n")) {
        const l = raw.trim();
        if (!l || /^\[(ar|ti|al|by|offset|length|re|ve|au)\s*:/i.test(l)) continue;
        const tags = [...l.matchAll(/\[(\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?)\]/g)];
        if (!tags.length) continue;
        const content = l.replace(/\[[^\]]*\]/g, "").trim();
        for (const tg of tags) tagged.push({ t: lrcToMs(tg[1]), text: content });
    }
    tagged.sort((a, b) => a.t - b.t);
    return tagged.map((item, i) => ({
        start: item.t,
        end: tagged[i + 1] ? tagged[i + 1].t : item.t + 5000,
        text: cleanCue(item.text),
    }));
};

const parseJson = (input) => {
    let data;
    try {
        data = JSON.parse(input.trim());
    } catch {
        throw new Error("不是有效的 JSON");
    }
    if (!Array.isArray(data)) throw new Error('JSON 顶层需为数组：[{"start":毫秒,"end":毫秒,"text":"..."}]');
    return data.map((item, i) => {
        const num = (v) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(+v) ? +v : null);
        const start = num(item.start ?? item.startTime ?? item.from);
        const end = num(item.end ?? item.endTime ?? item.to);
        if (start === null || end === null) throw new Error(`JSON 第 ${i + 1} 项缺少 start/end（毫秒）`);
        return { start: Math.round(start), end: Math.round(end), text: cleanCue(String(item.text ?? item.content ?? "")) };
    });
};

const parseSmi = (input) => {
    const text = normalize(input);
    if (!/<\s*SAMI\b/i.test(text)) throw new Error("不是有效的 SAMI 内容");
    const starts = [];
    const texts = [];
    const re = /<\s*SYNC\s+Start\s*=\s*(\d+)\s*>/gi;
    let m;
    while ((m = re.exec(text)) !== null) {
        starts.push(+m[1]);
        const from = m.index + m[0].length;
        const next = text.slice(from).search(/<\s*SYNC\b/i);
        const bodyEnd = text.slice(from).search(/<\/\s*BODY\s*>/i);
        const cands = [next, bodyEnd].filter((n) => n >= 0).map((n) => from + n);
        const to = cands.length ? Math.min(...cands) : text.length;
        texts.push(
            text
                .slice(from, to)
                .replace(/<\/?P[^>]*>/gi, "")
                .replace(/<\s*br\s*\/?>/gi, "\n")
                .replace(/<\s*\/?SYNC[^>]*>/gi, "")
                .replace(/&nbsp;/gi, " ")
                .replace(/&lt;/gi, "<")
                .replace(/&gt;/gi, ">")
                .replace(/&quot;/gi, '"')
                .replace(/&amp;/gi, "&")
        );
    }
    return starts.map((s, i) => {
        let end = s + 4000;
        for (const other of starts) if (other > s && other < end) end = other;
        return { start: s, end, text: cleanCue(texts[i]) };
    });
};

// ---------- 输出 ----------
const toSrt = (cues) => cues.map((c, i) => `${i + 1}\n${msToSrt(c.start)} --> ${msToSrt(c.end)}\n${c.text}`).join("\n\n") + "\n";
const toVtt = (cues) => "WEBVTT\n\n" + cues.map((c) => `${msToVtt(c.start)} --> ${msToVtt(c.end)}\n${c.text}`).join("\n\n") + "\n";
const toSbv = (cues) => cues.map((c) => `${msToSbv(c.start)},${msToSbv(c.end)}\n${c.text}`).join("\n\n") + "\n";
const toSub = (cues, fps) =>
    `{1}{1}${fps.toFixed(3)}\n` +
    cues.map((c) => `{${Math.round((c.start / 1000) * fps)}}{${Math.round((c.end / 1000) * fps)}}${c.text.replace(/\n/g, "|")}`).join("\n") + "\n";
const toLrc = (cues) => cues.map((c) => `[${msToLrc(c.start)}]${c.text.replace(/\n/g, " ")}`).join("\n") + "\n";
const toJson = (cues) => JSON.stringify(cues, null, 2);
const toSmi = (cues) =>
    '<SAMI>\n<BODY>\n' +
    cues.map((c) => `<SYNC Start=${Math.max(0, Math.round(c.start))}><P>${c.text.replace(/\n/g, "<br>")}</P></SYNC>`).join("\n") +
    "\n</BODY>\n</SAMI>\n";
const toSsaAss = (cues, isAss) => {
    const head = isAss
        ? "[Script Info]\nScriptType: v4.00+\nPlayResX: 1280\nPlayResY: 720\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,22,&H00FFFFFF,0,0,1,2,1,2,10,10,10,1\n\n"
        : "[Script Info]\nScriptType: v4.00\nPlayResX: 1280\nPlayResY: 720\n\n[V4 Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,22,16777215,1,2,2,2,10,10,10,0\n\n";
    const evHead = isAss
        ? "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
        : "[Events]\nFormat: Marked, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n";
    const body = cues
        .map((c) => {
            const txt = c.text.replace(/\n/g, "\\N").replace(/,/g, "\\,");
            return `Dialogue: ${isAss ? "0" : "Marked=0"},${msToCent(c.start)},${msToCent(c.end)},Default,,0,0,0,,${txt}`;
        })
        .join("\n");
    return head + evHead + body + "\n";
};

const FORMATS = ["srt", "vtt", "sbv", "sub", "ssa", "ass", "smi", "lrc", "json"];
const LABELS = {
    srt: "SRT (SubRip)",
    vtt: "VTT (WebVTT)",
    sbv: "SBV (YouTube)",
    sub: "SUB (MicroDVD)",
    ssa: "SSA (SubStation Alpha)",
    ass: "ASS (Advanced SSA)",
    smi: "SMI (SAMI)",
    lrc: "LRC (歌词)",
    json: "JSON",
};

const PARSERS = { srt: parseSrt, vtt: parseVtt, sbv: parseSbv, ssa: parseSsaAss, ass: parseSsaAss, lrc: parseLrc, json: parseJson, smi: parseSmi };

// 自动识别输入格式
function detect(text) {
    const t = normalize(text).trim();
    if (/^WEBVTT/.test(t)) return "vtt";
    if (/<\s*SAMI\b/i.test(t)) return "smi";
    if (/^\[Script Info\]/i.test(t) || /\[V4\+? Styles\]/i.test(t)) return /v4\.00\+/i.test(t) ? "ass" : "ssa";
    if (/^\{1\}\{1\}/.test(t) || /^\{\d+\}\{\d+\}/.test(t)) return "sub";
    const lrcTag = t
        .split("\n")
        .map((l) => l.trim())
        .find((l) => /^\[\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?\]/.test(l));
    if (lrcTag) return "lrc";
    if (/^\s*[[{]/.test(t)) {
        try {
            const d = JSON.parse(t);
            if (Array.isArray(d)) return "json";
        } catch {
            /* 不是 JSON，继续判断 */
        }
    }
    if (/-->/.test(t)) return t.split("\n")[0].includes("-->") || /\d\d:\d\d:\d\d,\d{3}/.test(t) ? "srt" : "vtt";
    if (/^\d+:\d{2}:\d{2}\.\d{3},/.test(t)) return "sbv";
    throw new Error("无法识别字幕格式，请手动指定输入格式");
}

const tool = {
    id: "subtitle-convert",
    name: "字幕格式转换",
    category: "convert",
    desc: "SRT / VTT / SBV / SUB / SSA / ASS / SMI / LRC / JSON 字幕互转",
    fields: [
        {
            name: "from",
            label: "输入格式",
            type: "select",
            options: [["auto", "自动识别"], ...FORMATS.map((f) => [f, LABELS[f]])],
            default: "auto",
        },
        { name: "to", label: "输出格式", type: "select", options: FORMATS.map((f) => [f, LABELS[f]]), default: "vtt" },
        { name: "fps", label: "MicroDVD 帧率", type: "number", default: 25, step: 0.001 },
        {
            name: "input",
            label: "字幕内容",
            type: "textarea",
            default: "1\n00:00:01,000 --> 00:00:03,000\n你好，世界\n\n2\n00:00:04,000 --> 00:00:06,500\n字幕格式转换",
        },
    ],
    run(v) {
        const text = String(v.input || "");
        if (text.trim() === "") throw new Error("请输入字幕内容");
        const from = v.from === "auto" ? detect(text) : v.from;
        const fps = Number(v.fps) > 0 ? Number(v.fps) : 25;
        let cues;
        if (from === "sub") cues = parseSub(text, fps);
        else if (from === "ssa") cues = parseSsaAss(text, false);
        else if (from === "ass") cues = parseSsaAss(text, true);
        else cues = PARSERS[from](text);
        if (!cues.length) throw new Error("没有解析到任何字幕条目，请检查输入格式");
        let out;
        switch (v.to) {
            case "srt": out = toSrt(cues); break;
            case "vtt": out = toVtt(cues); break;
            case "sbv": out = toSbv(cues); break;
            case "sub": out = toSub(cues, fps); break;
            case "ssa": out = toSsaAss(cues, false); break;
            case "ass": out = toSsaAss(cues, true); break;
            case "smi": out = toSmi(cues); break;
            case "lrc": out = toLrc(cues); break;
            default: out = toJson(cues);
        }
        return {
            识别格式: LABELS[from],
            输出格式: LABELS[v.to],
            字幕条数: String(cues.length),
            转换结果: out,
        };
    },
};

export default tool;
mountTool(tool);
