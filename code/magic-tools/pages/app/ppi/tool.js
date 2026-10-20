/**
 * PPI计算
 * 目录：pages/app/ppi/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { mountTool } from "../shared/page.js";

// ============================================================
// PPI 计算
// ============================================================
const ppiTool = {
    id: "ppi",
    name: "PPI计算",
    category: "value-calc",
    desc: "由分辨率与对角线尺寸计算像素密度",
    fields: [
        { name: "width", label: "横向像素", type: "number", default: 1920 },
        { name: "height", label: "纵向像素", type: "number", default: 1080 },
        { name: "diagonal", label: "对角线(英寸)", type: "number", default: 24 },
    ],
    run(v) {
        const w = Number(v.width), h = Number(v.height), d = Number(v.diagonal);
        if (d <= 0) throw new Error("对角线尺寸必须大于 0");
        const ppi = Math.sqrt(w * w + h * h) / d;
        const dotPitch = d * 25.4 / Math.sqrt(w * w + h * h);
        return {
            PPI: ppi.toFixed(2),
            点距mm: dotPitch.toFixed(4),
            总像素: String(w * h),
        };
    },
};

export default ppiTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(ppiTool);
