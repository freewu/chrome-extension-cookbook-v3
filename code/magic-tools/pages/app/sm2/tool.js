/**
 * SM2 加解密
 * 目录：pages/app/sm2/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { mountTool } from "../shared/page.js";

// ============================================================
// SM2 / SM4 / SM9
// ============================================================
const sm2Tool = {
    id: "sm2",
    name: "SM2 加解密",
    category: "crypto",
    desc: "国密 SM2 非对称加密",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"], ["keygen", "生成密钥对"]], default: "keygen" },
        { name: "cipherMode", label: "密文格式", type: "select", options: [["1", "C1C3C2"], ["0", "C1C2C3"]], default: "1" },
        { name: "publicKey", label: "公钥(Hex)", type: "textarea", default: "" },
        { name: "privateKey", label: "私钥(Hex)", type: "textarea", default: "" },
        { name: "input", label: "明文/密文", type: "textarea", default: "Magic Tools" },
    ],
    run(v) {
        const sm2 = window.sm2;
        if (!sm2) throw new Error("sm-crypto 未加载");
        if (v.mode === "keygen") {
            const kp = sm2.generateKeyPairHex();
            return { 公钥: kp.publicKey, 私钥: kp.privateKey };
        }
        if (v.mode === "encrypt") {
            if (!v.publicKey.trim()) throw new Error("请填写公钥");
            return sm2.doEncrypt(v.input, v.publicKey.trim(), parseInt(v.cipherMode, 10));
        }
        if (!v.privateKey.trim()) throw new Error("请填写私钥");
        return sm2.doDecrypt(v.input.trim(), v.privateKey.trim(), parseInt(v.cipherMode, 10));
    },
};

export default sm2Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(sm2Tool);
