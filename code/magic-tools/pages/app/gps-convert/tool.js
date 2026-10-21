import { mountTool } from "../shared/page.js";

// 坐标系互转：WGS84（GPS）/ GCJ02（火星坐标）/ BD09（百度坐标）
const xPi = (3.14159265358979324 * 3000.0) / 180.0;
const pi = 3.14159265358979324;
const a = 6378245.0;
const ee = 0.00669342162296594323;

const outOfChina = (lng, lat) => lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;

const transformLat = (x, y) => {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += ((20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(y * pi) + 40.0 * Math.sin((y / 3.0) * pi)) * 2.0) / 3.0;
    ret += ((160.0 * Math.sin((y / 12.0) * pi) + 320 * Math.sin((y * pi) / 30.0)) * 2.0) / 3.0;
    return ret;
};

const transformLng = (x, y) => {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += ((20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(x * pi) + 40.0 * Math.sin((x / 3.0) * pi)) * 2.0) / 3.0;
    ret += ((150.0 * Math.sin((x / 12.0) * pi) + 300.0 * Math.sin((x / 30.0) * pi)) * 2.0) / 3.0;
    return ret;
};

const wgs84ToGcj02 = ({ lng, lat }) => {
    if (outOfChina(lng, lat)) return { lng, lat };
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = (lat / 180.0) * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * pi);
    dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * pi);
    return { lng: lng + dLng, lat: lat + dLat };
};

const gcj02ToWgs84 = ({ lng, lat }) => {
    if (outOfChina(lng, lat)) return { lng, lat };
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = (lat / 180.0) * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * pi);
    dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * pi);
    return { lng: lng - dLng, lat: lat - dLat };
};

const gcj02ToBd09 = ({ lng, lat }) => {
    const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * xPi);
    const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * xPi);
    return { lng: z * Math.cos(theta) + 0.0065, lat: z * Math.sin(theta) + 0.006 };
};

const bd09ToGcj02 = ({ lng, lat }) => {
    const x = lng - 0.0065;
    const y = lat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * xPi);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * xPi);
    return { lng: z * Math.cos(theta), lat: z * Math.sin(theta) };
};

const bd09ToWgs84 = (p) => gcj02ToWgs84(bd09ToGcj02(p));
const wgs84ToBd09 = (p) => gcj02ToBd09(wgs84ToGcj02(p));

const TO_WGS84 = {
    WGS84: (p) => p,
    GCJ02: gcj02ToWgs84,
    BD09: bd09ToWgs84,
};

const fmt = (p) => `${p.lng.toFixed(6)}, ${p.lat.toFixed(6)}`;

const tool = {
    id: "gps-convert",
    name: "GPS 坐标转换",
    category: "convert",
    desc: "WGS84（GPS 设备）/ GCJ02（高德、腾讯）/ BD09（百度）坐标系互转",
    fields: [
        {
            name: "from",
            label: "输入坐标系",
            type: "select",
            options: [
                ["WGS84", "WGS84（GPS 原始坐标）"],
                ["GCJ02", "GCJ02（火星坐标 / 高德 / 腾讯）"],
                ["BD09", "BD09（百度坐标）"],
            ],
            default: "WGS84",
        },
        { name: "input", label: "坐标", type: "text", default: "116.404, 39.915", placeholder: "经度, 纬度（lng, lat）" },
    ],
    run(v) {
        const raw = String(v.input || "").replace(/[，;；、]/g, ",").trim();
        const nums = raw.split(",").map((s) => Number(s.trim()));
        if (nums.length < 2 || nums.some((n) => Number.isNaN(n))) throw new Error("请输入「经度, 纬度」，如 116.404, 39.915");
        const [lng, lat] = nums;
        if (Math.abs(lng) > 180 || Math.abs(lat) > 90) throw new Error("经纬度超出范围，请确认顺序是否为「经度, 纬度」");
        const wgs = TO_WGS84[v.from]({ lng, lat });
        const gcj = wgs84ToGcj02(wgs);
        const bd = gcj02ToBd09(gcj);
        return {
            "WGS84（GPS）": fmt(wgs),
            "GCJ02（高德 / 腾讯）": fmt(gcj),
            "BD09（百度）": fmt(bd),
            "腾讯地图（纬度在前）": `${gcj.lat.toFixed(6)}, ${gcj.lng.toFixed(6)}`,
            "百度地图（纬度在前）": `${bd.lat.toFixed(6)}, ${bd.lng.toFixed(6)}`,
            "是否在中国境外（不做偏移）": outOfChina(lng, lat) ? "是" : "否",
        };
    },
};

export default tool;
mountTool(tool);
