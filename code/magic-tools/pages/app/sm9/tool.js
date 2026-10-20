/**
 * SM9 加解密
 * 目录：pages/app/sm9/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { mountTool } from "../shared/page.js";

const sm9Tool = {
    id: "sm9",
    name: "SM9 加解密",
    category: "crypto",
    desc: "国密 SM9（标识密码，暂未内置完整实现）",
    fields: [
        { name: "input", label: "输入", type: "textarea", default: "" },
    ],
    run() {
        throw new Error("SM9 属于标识密码体系，实现较为复杂，本示例暂未内置。可参考 sm-crypto / GmSSL 的 SM9 实现。");
    },
};

export default sm9Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(sm9Tool);
