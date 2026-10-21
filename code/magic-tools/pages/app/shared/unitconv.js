// 单位换算类工具的公共实现（面积 / 字节 / 距离 / 速度 / 容量 / 重量）
// 各工具只需要提供「单位表」和「各单位 → 基准单位的换算系数」，其余交给 unitTool()

// 数字格式化：最多保留 12 位有效数字，去掉多余的 0；过大/过小时用科学计数法
export function fmtNumber(n, digits = 12) {
    if (typeof n === "string") return n;
    if (!isFinite(n)) return String(n);
    if (n === 0) return "0";
    const abs = Math.abs(n);
    if (abs >= 1e15 || abs < 1e-9) return n.toExponential(8).replace(/(\.\d*?)0+e/, "$1e").replace(/\.e/, "e");
    let s = n.toPrecision(digits);
    if (s.includes("e")) return Number(s).toExponential(8);
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s;
}

// 解析用户输入的数字（支持 1,234 千分位、全角数字、中文单位符号等常见写法）
export function parseNumber(input) {
    const text = String(input ?? "")
        .trim()
        .replace(/[，,\s]/g, "")
        .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
        .replace(/。|．/g, ".");
    if (text === "") throw new Error("请输入数值");
    const n = Number(text);
    if (!isFinite(n)) throw new Error(`无法解析数值：${input}`);
    return n;
}

// 系数写法兼容：数字、[分子, 分母]、{ mul, div }
function factorOf(f) {
    if (f === undefined) return 1;
    if (typeof f === "number") return f;
    if (Array.isArray(f)) return Number(f[0]) / Number(f[1]);
    if (typeof f === "object") return Number(f.mul ?? 1) / Number(f.div ?? 1);
    return 1;
}

/**
 * 创建一个单位换算工具
 * @param {object} config
 * @param {string} config.id       工具 id（与目录名一致）
 * @param {string} config.name     工具名
 * @param {string} config.desc     说明
 * @param {Array}  config.units    [{ value, label, sys }]，sys 为制式（公制/英制/…）
 * @param {object} config.factors  各单位 → 基准单位的系数，如 { km2: 1e6, m2: 1 }
 * @param {string} config.base     基准单位名称，用于提示文案，如 "平方米 m²"
 * @param {object} [config.scopes] 制式列表（默认由 units 自动汇总）
 * @param {number} [config.digits] 有效数字位数
 */
export function unitTool(config) {
    const { id, name, desc, units, factors, base } = config;
    const digits = config.digits ?? 12;

    const scopes = config.scopes || [...new Set(units.map((u) => u.sys))];
    const scopeOptions = scopes.map((s) => [s, s]);
    const unitOptions = units.map((u) => [u.value, `${u.sys} · ${u.label}`]);
    const scopeOf = (value) => units.find((u) => u.value === value)?.sys;
    const labelOf = (value) => units.find((u) => u.value === value)?.label ?? value;

    return {
        id,
        name,
        category: "convert",
        desc,
        fields: [
            { name: "unit", label: "输入单位", type: "select", options: unitOptions, default: config.defaultUnit || units[0].value },
            { name: "input", label: "数值", type: "text", default: config.defaultValue ?? "1", placeholder: `以${base}为基准换算` },
            {
                name: "scope",
                label: "输出范围",
                type: "select",
                options: [["same", "仅同制式单位"], ["all", "全部单位"]],
                default: "same",
            },
        ],
        run(v) {
            const n = parseNumber(v.input);
            const baseValue = n * factorOf(factors[v.unit]);
            const result = {};
            const targetScope = v.scope === "all" ? null : scopeOf(v.unit);
            for (const u of units) {
                if (targetScope && u.sys !== targetScope) continue;
                result[`${labelOf(u.value)} (${u.value})`] = fmtNumber(baseValue / factorOf(factors[u.value]), digits);
            }
            return result;
        },
    };
}

// 温度换算：以摄氏度为基准，公式与 React 版 lib.ts 一致
export function temperatureTool(config = {}) {
    const units = [
        { value: "c", label: "摄氏度 °C" },
        { value: "f", label: "华氏度 °F" },
        { value: "k", label: "开尔文 K" },
        { value: "r", label: "兰金温标 °R" },
        { value: "d", label: "德利尔温标 °De" },
        { value: "n", label: "牛顿温标 °N" },
        { value: "re", label: "列氏温标 °Ré" },
        { value: "ra", label: "罗氏温标 °Rø" },
    ];
    const toC = (v, type) => {
        switch (type) {
            case "f": return ((v - 32) * 5) / 9;
            case "k": return v - 273.15;
            case "r": return ((v - 491.67) * 5) / 9;
            case "d": return 100 - (v * 2) / 3;
            case "n": return (v * 100) / 33;
            case "re": return (v * 5) / 4;
            case "ra": return ((v - 7.5) * 40) / 21;
            default: return v;
        }
    };
    const fromC = (c, type) => {
        switch (type) {
            case "f": return (c * 9) / 5 + 32;
            case "k": return c + 273.15;
            case "r": return ((c + 273.15) * 9) / 5;
            case "d": return ((100 - c) * 3) / 2;
            case "n": return (c * 33) / 100;
            case "re": return (c * 4) / 5;
            case "ra": return (c * 21) / 40 + 7.5;
            default: return c;
        }
    };
    return {
        id: config.id || "temperature",
        name: config.name || "温度转换",
        category: "convert",
        desc: config.desc || "摄氏度 / 华氏度 / 开尔文 / 兰金 / 德利尔 / 牛顿 / 列氏 / 罗氏",
        fields: [
            { name: "unit", label: "输入温标", type: "select", options: units.map((u) => [u.value, u.label]), default: "c" },
            { name: "input", label: "数值", type: "text", default: "25" },
        ],
        run(v) {
            const c = toC(parseNumber(v.input), v.unit);
            const result = {};
            for (const u of units) result[u.label] = fmtNumber(fromC(c, u.value), 12);
            return result;
        },
    };
}
