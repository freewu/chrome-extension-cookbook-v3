/**
 * 原码/反码/补码计算
 * 目录：pages/app/complement/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { mountTool } from "../shared/page.js";

// ============================================================
// 原码 / 反码 / 补码
// ============================================================
const complementTool = {
    id: "complement",
    name: "原码/反码/补码计算",
    category: "value-calc",
    desc: "整数的机器表示",
    fields: [
        { name: "value", label: "整数", type: "text", default: "-5" },
        { name: "bits", label: "位宽", type: "number", default: 8 },
    ],
    run(v) {
        const bits = Math.max(2, parseInt(v.bits, 10));
        let n = BigInt(v.value.trim());
        const mask = (1n << BigInt(bits)) - 1n;
        const negative = n < 0n;
        const abs = negative ? -n : n;
        if (abs > (1n << BigInt(bits - 1)) - 1n) throw new Error("数值超出该位宽的可表示范围");
        // 原码
        let signMagnitude = abs;
        if (negative) signMagnitude |= 1n << BigInt(bits - 1);
        // 反码
        let onesComplement = negative ? ((~abs) & ((1n << BigInt(bits - 1)) - 1n)) | (1n << BigInt(bits - 1)) : abs;
        // 补码
        const twos = n & mask;
        const fmt = (x) => x.toString(2).padStart(bits, "0");
        return {
            原码: fmt(signMagnitude),
            反码: fmt(onesComplement),
            补码: fmt(twos),
            无符号值: (twos & mask).toString(10),
        };
    },
};

export default complementTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(complementTool);
