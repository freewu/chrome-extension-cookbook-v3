/**
 * Keccak Hash 值计算
 * 目录：pages/app/keccak/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { S } from "../shared/valuecalc-common.js";
import { mountTool } from "../shared/page.js";

const keccakTool = {
    id: "keccak",
    name: "Keccak Hash 值计算",
    category: "value-calc",
    desc: "原始 Keccak（以太坊使用 keccak256）",
    fields: [
        {
            name: "algorithm", label: "算法", type: "select",
            options: ["keccak224", "keccak256", "keccak384", "keccak512"], default: "keccak256",
        },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        return S[v.algorithm](v.input);
    },
};

export default keccakTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(keccakTool);
