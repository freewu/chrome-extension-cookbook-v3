import { unitTool } from "../shared/unitconv.js";
import { mountTool } from "../shared/page.js";

// 各单位 → 克的换算系数（与 React 版 WEIGHT_FACTORS 一致）
const factors = {
    kt: [1000000000, 1],
    t: [1000000, 1],
    kg: [1000, 1],
    g: [1, 1],
    mg: [1, 1000],
    mcg: [1, 1000000],
    ng: [1, 1000000000],
    ct: [2, 10],
    oz: [28349523125, 1000000000],
    lb: [45359237, 100000],
    st: [6350, 1],
    gr: [6479891, 100000000],
    dr: [177, 100],
    qr: [12700, 1],
    hw: [50800, 1],
    md: [45359237, 1000],
    longton: [1016000, 1],
    shortton: [907000, 1],
    dan: [50000, 1],
    jin: [500, 1],
    liang: [50, 1],
    qian: [5, 1],
    fen: [5, 10],
    li: [5, 100],
};

const units = [
    { sys: "公制", value: "kt", label: "千吨 kt" },
    { sys: "公制", value: "t", label: "吨 t" },
    { sys: "公制", value: "kg", label: "千克 kg" },
    { sys: "公制", value: "g", label: "克 g" },
    { sys: "公制", value: "mg", label: "毫克 mg" },
    { sys: "公制", value: "mcg", label: "微克 μg" },
    { sys: "公制", value: "ng", label: "纳克 ng" },
    { sys: "公制", value: "ct", label: "克拉 ct" },
    { sys: "英制", value: "oz", label: "盎司 oz" },
    { sys: "英制", value: "lb", label: "磅 lb" },
    { sys: "英制", value: "st", label: "英石 st" },
    { sys: "英制", value: "gr", label: "格令 gr" },
    { sys: "英制", value: "dr", label: "打兰 dr" },
    { sys: "英制", value: "qr", label: "夸特 qr" },
    { sys: "英制", value: "hw", label: "英担 cwt" },
    { sys: "英制", value: "md", label: "美担" },
    { sys: "英制", value: "longton", label: "英吨（长吨）" },
    { sys: "英制", value: "shortton", label: "美吨（短吨）" },
    { sys: "市制", value: "dan", label: "担" },
    { sys: "市制", value: "jin", label: "斤" },
    { sys: "市制", value: "liang", label: "两" },
    { sys: "市制", value: "qian", label: "钱" },
    { sys: "市制", value: "fen", label: "分" },
    { sys: "市制", value: "li", label: "厘" },
];

const tool = unitTool({
    id: "weight-convert",
    name: "重量转换",
    desc: "公制 / 英制 / 市制重量单位互转（以克为基准）",
    units,
    factors,
    base: "克 g",
    defaultUnit: "kg",
});

export default tool;
mountTool(tool);
