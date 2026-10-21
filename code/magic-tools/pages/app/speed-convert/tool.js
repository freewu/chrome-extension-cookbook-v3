import { unitTool } from "../shared/unitconv.js";
import { mountTool } from "../shared/page.js";

// 各单位 → 千米每时的换算系数（与 React 版 SPEED_FACTORS 一致）
const factors = {
    cms: [36, 1000],
    ms: [36, 10],
    kms: [3600, 1],
    kmh: [1, 1],
    mach: [1224, 1],
    knot: [1852, 1000],
    mph: [16093, 10000],
    fts: [109728, 100000],
    ftmin: [18288, 1000000],
    ins: [9144, 100000],
};

const units = [
    { sys: "公制", value: "cms", label: "厘米每秒 cm/s" },
    { sys: "公制", value: "ms", label: "米每秒 m/s" },
    { sys: "公制", value: "kms", label: "千米每秒 km/s" },
    { sys: "公制", value: "kmh", label: "千米每时 km/h" },
    { sys: "公制", value: "mach", label: "马赫 Mach" },
    { sys: "公制", value: "knot", label: "节 knot" },
    { sys: "英制", value: "mph", label: "英里每时 mph" },
    { sys: "英制", value: "fts", label: "英尺每秒 ft/s" },
    { sys: "英制", value: "ftmin", label: "英尺每分钟 ft/min" },
    { sys: "英制", value: "ins", label: "英寸每秒 in/s" },
];

const tool = unitTool({
    id: "speed-convert",
    name: "速度转换",
    desc: "公制 / 英制速度单位互转（以 km/h 为基准）",
    units,
    factors,
    base: "千米每时 km/h",
    defaultUnit: "kmh",
    defaultValue: "100",
});

export default tool;
mountTool(tool);
