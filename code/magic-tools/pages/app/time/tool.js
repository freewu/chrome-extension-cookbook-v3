import { mountTool } from "../shared/page.js";

// 时间转换：时间戳 / 日期字符串 ↔ 各种时间表示（ISO / UTC / 本地 / GPS / 北斗 / 伽利略 / 儒略日…）
const WEEK_SEC = 604800;

// TAI-UTC 闰秒表（[生效 UTC 时刻, 差值秒]）
const LEAP_TAI_UTC = [
    [Date.UTC(1972, 0, 1), 10], [Date.UTC(1972, 6, 1), 11], [Date.UTC(1973, 0, 1), 12],
    [Date.UTC(1974, 0, 1), 13], [Date.UTC(1975, 0, 1), 14], [Date.UTC(1976, 0, 1), 15],
    [Date.UTC(1977, 0, 1), 16], [Date.UTC(1978, 0, 1), 17], [Date.UTC(1979, 0, 1), 18],
    [Date.UTC(1980, 0, 1), 19], [Date.UTC(1981, 6, 1), 20], [Date.UTC(1982, 6, 1), 21],
    [Date.UTC(1983, 6, 1), 22], [Date.UTC(1985, 6, 1), 23], [Date.UTC(1988, 0, 1), 24],
    [Date.UTC(1990, 0, 1), 25], [Date.UTC(1991, 0, 1), 26], [Date.UTC(1992, 6, 1), 27],
    [Date.UTC(1993, 6, 1), 28], [Date.UTC(1994, 6, 1), 29], [Date.UTC(1996, 0, 1), 30],
    [Date.UTC(1997, 6, 1), 31], [Date.UTC(1999, 0, 1), 32], [Date.UTC(2006, 0, 1), 33],
    [Date.UTC(2009, 0, 1), 34], [Date.UTC(2012, 6, 1), 35], [Date.UTC(2015, 6, 1), 36],
    [Date.UTC(2017, 0, 1), 37],
];

const taiMinusUtc = (ms) => {
    let v = 10;
    for (const [at, diff] of LEAP_TAI_UTC) {
        if (ms >= at) v = diff;
        else break;
    }
    return v;
};

const splitWeek = (total) => ({
    week: Math.floor(total / WEEK_SEC),
    tow: ((total % WEEK_SEC) + WEEK_SEC) % WEEK_SEC,
});

const pad = (n) => String(n).padStart(2, "0");

// 本地时间 YYYY-MM-DD HH:ii:ss
const formatDateTime = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

// GPS 时间（历元 1980-01-06）
const gpsTimeOf = (ms) => splitWeek(Math.floor(ms / 1000) - 315964800 + (taiMinusUtc(ms) - 19));
// 北斗时间（历元 2006-01-01）
const bdtTimeOf = (ms) => splitWeek(Math.floor(ms / 1000) - 1136073600 + (taiMinusUtc(ms) - 33));

const tool = {
    id: "time",
    name: "时间转换",
    category: "convert",
    desc: "时间戳 / 日期 ↔ ISO 8601 / UTC / 本地时间 / GPS / 北斗 / 伽利略 / 格洛纳斯 / 儒略日",
    fields: [
        {
            name: "input",
            label: "时间",
            type: "text",
            default: "",
            placeholder: "留空 = 当前时间；支持 10 位时间戳、13 位时间戳、YYYY-MM-DD HH:ii:ss、ISO 字符串",
        },
        { name: "title", label: "同时列出常用时间点", type: "checkbox", default: true },
    ],
    run(v) {
        const raw = String(v.input || "").trim();
        let date;
        if (raw === "") date = new Date();
        else if (/^\d+$/.test(raw)) date = new Date(Number(raw.length === 10 ? raw + "000" : raw));
        else {
            const normalized = raw.replace(/\//g, "-");
            date = new Date(normalized);
            // Safari/Chrome 对 "YYYY-MM-DD HH:mm:ss" 解析不一致，兜底手工解析
            if (Number.isNaN(date.getTime())) {
                const m = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
                if (!m) throw new Error("无法解析该时间格式");
                date = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
            }
        }
        if (Number.isNaN(date.getTime())) throw new Error("无法解析该时间格式");

        const ms = date.getTime();
        const g = gpsTimeOf(ms);
        const b = bdtTimeOf(ms);
        const gst = splitWeek(g.week * WEEK_SEC + g.tow - 1024 * WEEK_SEC);
        const glonass = new Date(ms + 3 * 3600 * 1000);
        const jd = ms / 86400000 + 2440587.5;

        const result = {
            "时间戳（10 位）": String(Math.round(ms / 1000)),
            "时间戳（13 位）": String(ms),
            "ISO 8601": date.toISOString(),
            "本地时间": formatDateTime(date),
            "Locale": date.toLocaleString(),
            UTC: date.toUTCString(),
            "GPS（周 + 秒）": `${g.week} 周 + ${g.tow} 秒`,
            "GPS 周, 秒": `${g.week}, ${g.tow}`,
            "北斗（周 + 秒）": `${b.week} 周 + ${b.tow} 秒`,
            "伽利略（周 + 秒）": `${gst.week} 周 + ${gst.tow} 秒`,
            "格洛纳斯（UTC+3）": `${glonass.getUTCFullYear()}-${pad(glonass.getUTCMonth() + 1)}-${pad(glonass.getUTCDate())} ${pad(glonass.getUTCHours())}:${pad(glonass.getUTCMinutes())}:${pad(glonass.getUTCSeconds())}`,
            "儒略日 JD": jd.toFixed(6),
            "简化儒略日 MJD": (jd - 2400000.5).toFixed(6),
        };

        if (v.title) {
            const now = new Date();
            const begin = (y, m) => new Date(y, m, 1, 0, 0, 0);
            const end = (y, m) => new Date(y, m + 1, 0, 23, 59, 59);
            const y = now.getFullYear();
            const m = now.getMonth();
            const day = 24 * 3600 * 1000;
            result["——— 常用时间点 ———"] = formatDateTime(now);
            result["当前时间戳"] = String(now.getTime());
            result["上周"] = formatDateTime(new Date(now.getTime() - 7 * day));
            result["下周"] = formatDateTime(new Date(now.getTime() + 7 * day));
            result["本月初"] = formatDateTime(begin(y, m));
            result["本月末"] = formatDateTime(end(y, m));
            result["上月初"] = formatDateTime(begin(y, m - 1));
            result["上月末"] = formatDateTime(end(y, m - 1));
            result["下月初"] = formatDateTime(begin(y, m + 1));
            result["下月末"] = formatDateTime(end(y, m + 1));
        }
        return result;
    },
};

export default tool;
mountTool(tool);
