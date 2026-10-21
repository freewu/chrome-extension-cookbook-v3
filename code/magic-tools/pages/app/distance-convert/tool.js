import { unitTool } from "../shared/unitconv.js";
import { mountTool } from "../shared/page.js";

// 各单位 → 米的换算系数（与 React 版 DISTANCE_FACTORS 一致）
const factors = {
    km: [1000, 1],
    m: [1, 1],
    dm: [1, 10],
    cm: [1, 100],
    mm: [1, 1000],
    "μm": [1, 1000000],
    nm: [1, 1000000000],
    pm: [1, 1000000000000],
    nmile: [1852, 1],
    inch: [254, 10000],
    foot: [3048, 10000],
    yard: [9144, 10000],
    mile: [1609344, 1000],
    fathom: [1829, 1000],
    chain: [201168, 10000],
    furlong: [201168, 1000],
    li: [500, 1],
    ying: [500, 15],
    zhang: [50, 15],
    chi: [5, 15],
    cun: [5, 150],
    fen: [5, 1500],
    l: [5, 15000],
    hao: [5, 150000],
    si: [5, 15000000],
};

const units = [
    { sys: "公制", value: "km", label: "千米 km" },
    { sys: "公制", value: "m", label: "米 m" },
    { sys: "公制", value: "dm", label: "分米 dm" },
    { sys: "公制", value: "cm", label: "厘米 cm" },
    { sys: "公制", value: "mm", label: "毫米 mm" },
    { sys: "公制", value: "μm", label: "微米 μm" },
    { sys: "公制", value: "nm", label: "纳米 nm" },
    { sys: "公制", value: "pm", label: "皮米 pm" },
    { sys: "公制", value: "nmile", label: "海里 nmi" },
    { sys: "英制", value: "inch", label: "英寸 in" },
    { sys: "英制", value: "foot", label: "英尺 ft" },
    { sys: "英制", value: "yard", label: "码 yd" },
    { sys: "英制", value: "mile", label: "英里 mi" },
    { sys: "英制", value: "fathom", label: "英寻 fathom" },
    { sys: "英制", value: "chain", label: "链 chain" },
    { sys: "英制", value: "furlong", label: "化朗 furlong" },
    { sys: "市制", value: "li", label: "里" },
    { sys: "市制", value: "ying", label: "引" },
    { sys: "市制", value: "zhang", label: "丈" },
    { sys: "市制", value: "chi", label: "尺" },
    { sys: "市制", value: "cun", label: "寸" },
    { sys: "市制", value: "fen", label: "分" },
    { sys: "市制", value: "l", label: "厘" },
    { sys: "市制", value: "hao", label: "毫" },
    { sys: "市制", value: "si", label: "丝" },
];

const tool = unitTool({
    id: "distance-convert",
    name: "距离转换",
    desc: "公制 / 英制 / 市制长度单位互转（以米为基准）",
    units,
    factors,
    base: "米 m",
    defaultUnit: "m",
});

export default tool;
mountTool(tool);
