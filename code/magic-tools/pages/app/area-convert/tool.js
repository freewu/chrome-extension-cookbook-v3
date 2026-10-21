import { unitTool } from "../shared/unitconv.js";
import { mountTool } from "../shared/page.js";

// 各单位 → 平方米的换算系数（与 React 版 AREA_FACTORS 一致）
const factors = {
    km2: [1000000, 1],
    gq: [10000, 1],
    gm: [100, 1],
    m2: [1, 1],
    dm2: [1, 100],
    cm2: [1, 10000],
    mm2: [1, 1000000],
    mile2: [2590000, 1],
    ym: [404685642, 100000],
    ld: [10117136203, 10000000],
    g: [252928469, 10000000],
    yard2: [83612736, 100000000],
    foot2: [9290304, 100000000],
    inch2: [64516, 100000000],
    "jp-ping": [330578622, 100000000],
    "jp-die": [162, 100],
    "jp-ding": [991736, 100000000],
    "jp-duan": [99174, 100000000],
    "jp-mu": [9917, 100000000],
    qin: [66666, 1],
    mu: [66666, 100],
    fen: [66666, 1000],
    li: [66666, 10000],
    hao: [66666, 100000],
    zhuang2: [1111, 100],
    chi2: [1111, 10000],
    cun2: [1111, 1000000],
};

const units = [
    { sys: "公制", value: "km2", label: "平方公里 km²" },
    { sys: "公制", value: "gq", label: "公顷 ha" },
    { sys: "公制", value: "gm", label: "公亩 a" },
    { sys: "公制", value: "m2", label: "平方米 m²" },
    { sys: "公制", value: "dm2", label: "平方分米 dm²" },
    { sys: "公制", value: "cm2", label: "平方厘米 cm²" },
    { sys: "公制", value: "mm2", label: "平方毫米 mm²" },
    { sys: "英制", value: "mile2", label: "平方英里 mile²" },
    { sys: "英制", value: "ym", label: "英亩 acre" },
    { sys: "英制", value: "ld", label: "路得 rood" },
    { sys: "英制", value: "g", label: "平方杆 rod²" },
    { sys: "英制", value: "yard2", label: "平方码 yard²" },
    { sys: "英制", value: "foot2", label: "平方英尺 foot²" },
    { sys: "英制", value: "inch2", label: "平方英寸 inch²" },
    { sys: "日式", value: "jp-ping", label: "坪" },
    { sys: "日式", value: "jp-die", label: "叠" },
    { sys: "日式", value: "jp-ding", label: "町" },
    { sys: "日式", value: "jp-duan", label: "段" },
    { sys: "日式", value: "jp-mu", label: "亩（日）" },
    { sys: "市制", value: "qin", label: "顷" },
    { sys: "市制", value: "mu", label: "亩" },
    { sys: "市制", value: "fen", label: "分" },
    { sys: "市制", value: "li", label: "厘" },
    { sys: "市制", value: "hao", label: "毫" },
    { sys: "市制", value: "zhuang2", label: "平方丈" },
    { sys: "市制", value: "chi2", label: "平方尺" },
    { sys: "市制", value: "cun2", label: "平方寸" },
];

const tool = unitTool({
    id: "area-convert",
    name: "面积转换",
    desc: "公制 / 英制 / 市制 / 日式面积单位互转（以平方米为基准）",
    units,
    factors,
    base: "平方米 m²",
    defaultUnit: "m2",
});

export default tool;
mountTool(tool);
