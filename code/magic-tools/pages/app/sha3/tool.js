/**
 * SHA3 Hash 值计算
 * 目录：pages/app/sha3/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { S } from "../shared/valuecalc-common.js";
import { mountTool } from "../shared/page.js";

// ============================================================
// SHA3 / Keccak
// ============================================================
const sha3Tool = {
    id: "sha3",
    name: "SHA3 Hash 值计算",
    category: "value-calc",
    desc: "NIST SHA-3（FIPS 202）",
    fields: [
        {
            name: "algorithm", label: "算法", type: "select",
            options: ["sha3_224", "sha3_256", "sha3_384", "sha3_512"], default: "sha3_256",
        },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        return S[v.algorithm](v.input);
    },
};

export default sha3Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(sha3Tool);
