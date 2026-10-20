/**
 * BCrypt
 * 目录：pages/app/bcrypt/（一个目录 = 一个工具）
 * 分类：值计算（value-calc）
 */
import { mountTool } from "../shared/page.js";

// ============================================================
// BCrypt
// ============================================================
const bcryptTool = {
    id: "bcrypt",
    name: "BCrypt",
    category: "value-calc",
    desc: "BCrypt 哈希 / 校验",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["hash", "生成哈希"], ["verify", "校验"]], default: "hash" },
        { name: "password", label: "口令", type: "text", default: "password" },
        { name: "rounds", label: "Rounds(生成)", type: "number", default: 10 },
        { name: "hash", label: "哈希(校验)", type: "text", default: "" },
    ],
    run(v) {
        const bcrypt = window.dcodeIO?.bcrypt;
        if (!bcrypt) throw new Error("BCrypt 库未加载");
        if (v.mode === "hash") {
            return bcrypt.hashSync(v.password, Math.min(15, Math.max(4, parseInt(v.rounds, 10) || 10)));
        }
        return bcrypt.compareSync(v.password, v.hash) ? "校验通过 ✓" : "校验失败 ✗";
    },
};

export default bcryptTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(bcryptTool);
