import { unitTool, fmtNumber, parseNumber } from "../shared/unitconv.js";
import { mountTool } from "../shared/page.js";

// 字节单位（1024 进制，从 B 到 YB），与 React 版 BYTE_UNITS 一致
const names = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const labels = ["字节 B", "千字节 KB", "兆字节 MB", "吉字节 GB", "太字节 TB", "拍字节 PB", "艾字节 EB", "泽字节 ZB", "尧字节 YB"];
const units = names.map((n, i) => ({ sys: "二进制", value: n, label: labels[i] }));
const factors = {};
names.forEach((n, i) => (factors[n] = Math.pow(1024, i)));

// 转成可读字节：1024 => 1.00 KB
function bytesToSize(bytes) {
    if (bytes === 0) return "0 B";
    const i = Math.min(names.length - 1, Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + names[i];
}

const base = unitTool({
    id: "byte-convert",
    name: "字节转换",
    desc: "字节 / KB / MB / GB / TB / PB 等 1024 进制容量互转",
    units,
    factors,
    base: "字节 B",
    defaultUnit: "MB",
    defaultValue: "1024",
});

base.fields.push({ name: "bits", label: "同时显示比特（bit）", type: "checkbox", default: true });

base.run = (v) => {
    const n = parseNumber(v.input);
    const bytes = n * factors[v.unit];
    const result = {};
    for (const u of units) result[u.label] = fmtNumber(bytes / factors[u.value], 12);
    result["可读大小"] = bytesToSize(bytes);
    if (v.bits) result["比特 bit"] = fmtNumber(bytes * 8, 12);
    return result;
};

export default base;
mountTool(base);
