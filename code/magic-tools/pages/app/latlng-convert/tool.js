import { mountTool } from "../shared/page.js";

// 经纬度格式互转：十进制 DD / 度分秒 DMS / 度分 DM / 国家标准 NMEA（DDMM.mm）

const trimZeros = (s) => (s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s);
const padNum = (n, digits) => {
    const out = trimZeros(n.toFixed(digits));
    const [i, f] = out.split(".");
    return f ? `${i.padStart(2, "0")}.${f}` : i.padStart(2, "0");
};
const hemiOf = (v, isLat) => (isLat ? (v < 0 ? "S" : "N") : v < 0 ? "W" : "E");

const formatDD = (v, digits = 6) => trimZeros(v.toFixed(digits));

const formatDMS = (v, isLat, secDigits = 2) => {
    const hemi = hemiOf(v, isLat);
    const a = Math.abs(v);
    let deg = Math.floor(a);
    let min = Math.floor((a - deg) * 60);
    let sec = Number((((a - deg) * 60 - min) * 60).toFixed(secDigits));
    if (sec >= 60) {
        sec -= 60;
        min += 1;
    }
    if (min >= 60) {
        min -= 60;
        deg += 1;
    }
    return `${deg}°${padNum(min, 0)}′${padNum(sec, secDigits)}″${hemi}`;
};

const formatDM = (v, isLat, minDigits = 4) => {
    const hemi = hemiOf(v, isLat);
    const a = Math.abs(v);
    let deg = Math.floor(a);
    let min = Number(((a - deg) * 60).toFixed(minDigits));
    if (min >= 60) {
        min -= 60;
        deg += 1;
    }
    return `${deg}°${padNum(min, minDigits)}′${hemi}`;
};

const formatNMEA = (v, isLat, minDigits = 4) => {
    const hemi = hemiOf(v, isLat);
    const a = Math.abs(v);
    let deg = Math.floor(a);
    let min = Number(((a - deg) * 60).toFixed(minDigits));
    if (min >= 60) {
        min -= 60;
        deg += 1;
    }
    const degWidth = isLat ? 2 : 3;
    const minInt = String(Math.floor(min)).padStart(2, "0");
    const minFrac = min.toFixed(minDigits).split(".")[1] || "".padEnd(minDigits, "0");
    return `${String(deg).padStart(degWidth, "0")}${minInt}.${minFrac}${hemi}`;
};

const FORMATS = { DD: (v) => formatDD(v), DMS: formatDMS, DM: formatDM, NMEA: formatNMEA };

// 解析一个坐标文本 → 有符号十进制度
function parseCoord(token, format) {
    const hemiMatch = token.trim().match(/[NSEWnsew]/g);
    const hemi = hemiMatch ? hemiMatch[hemiMatch.length - 1].toUpperCase() : null;
    const nums = (token.replace(/[NSEWnsew]/g, " ").split(/[^0-9.+-]+/).filter((s) => /[0-9]/.test(s))).map(Number);
    if (!nums.length) throw new Error(`无法识别坐标：${token}`);
    const negative = /[-−]/.test(token.replace(/[NSEWnsew]/g, " "));
    const sign = hemi === "S" || hemi === "W" ? -1 : hemi === "N" || hemi === "E" ? 1 : negative ? -1 : 1;
    let mag;
    switch (format) {
        case "DMS":
            mag = Math.abs(nums[0]) + (nums[1] || 0) / 60 + (nums[2] || 0) / 3600;
            break;
        case "DM":
            mag = Math.abs(nums[0]) + (nums[1] || 0) / 60;
            break;
        case "NMEA": {
            const a = Math.abs(nums[0]);
            const deg = Math.floor(a / 100);
            mag = deg + (a - deg * 100) / 60;
            break;
        }
        default:
            mag = Math.abs(nums[0]);
    }
    return { value: sign * mag, hemi };
}

function detectFormat(token) {
    const cleaned = token.replace(/[NSEWnsew]/g, " ");
    const nums = cleaned.split(/[^0-9.+-]+/).filter((s) => /[0-9]/.test(s));
    if (nums.length >= 3) return "DMS";
    if (nums.length === 2) return "DM";
    const hemi = /[NSEWnsew]/.test(token);
    const i = Math.floor(Math.abs(Number(nums[0])));
    if (hemi && /[NSEWnsew]/.test(token) && ((/[NSns]/.test(token) && i >= 100) || (/[EWew]/.test(token) && i > 180))) return "NMEA";
    return "DD";
}

// 切分一对坐标
function splitPair(raw) {
    const s = raw.replace(/[，;；、]/g, ",").trim();
    if (s === "") return [];
    if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
    const byHemi = s.match(/[^NSEW]*[NSEW]/g);
    if (byHemi && byHemi.length === 2) return byHemi.map((x) => x.trim()).filter(Boolean);
    return s.split(/\s+/).filter(Boolean);
}

const tool = {
    id: "latlng-convert",
    name: "经纬度转换",
    category: "convert",
    desc: "十进制 DD / 度分秒 DMS / 度分 DM / 国家标准 NMEA（DDMM.mm）互转",
    fields: [
        {
            name: "format",
            label: "输入格式",
            type: "select",
            options: [
                ["AUTO", "自动识别"],
                ["DD", "十进制 DD（39.9042）"],
                ["DMS", "度分秒 DMS（39°54′15″N）"],
                ["DM", "度分 DM（39°54.25′N）"],
                ["NMEA", "国家标准 NMEA（3954.2520N）"],
            ],
            default: "AUTO",
        },
        { name: "input", label: "坐标", type: "text", default: "39.9042, 116.4074", placeholder: "纬度, 经度（或用 N/S/E/W 标注方向）" },
        { name: "order", label: "输入顺序", type: "select", options: [["latlng", "纬度在前（lat, lng）"], ["lnglat", "经度在前（lng, lat）"]], default: "latlng" },
    ],
    run(v) {
        const parts = splitPair(String(v.input || ""));
        if (parts.length < 2) throw new Error("请给出两个坐标值，如 39.9042, 116.4074");
        const format = v.format === "AUTO" ? detectFormat(parts[0]) : v.format;
        let lat = parseCoord(parts[0], format).value;
        let lng = parseCoord(parts[1], format === "AUTO" ? detectFormat(parts[1]) : format).value;
        if (v.order === "lnglat") [lat, lng] = [lng, lat];
        if (Math.abs(lat) > 90) throw new Error(`纬度超出范围：${lat}`);
        if (Math.abs(lng) > 180) throw new Error(`经度超出范围：${lng}`);
        const result = { "识别格式": format };
        for (const [key, fn] of Object.entries(FORMATS)) {
            const latText = fn(lat, true);
            const lngText = fn(lng, false);
            result[`${key}`] = `${latText}, ${lngText}`;
        }
        return result;
    },
};

export default tool;
mountTool(tool);
