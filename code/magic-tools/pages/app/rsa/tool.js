/**
 * RSA 加解密
 * 目录：pages/app/rsa/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { mountTool } from "../shared/page.js";

// ============================================================
// RSA（JSEncrypt）
// ============================================================
const rsaTool = {
    id: "rsa",
    name: "RSA 加解密",
    category: "crypto",
    desc: "RSA 加密/解密/签名/验签/生成密钥",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"], ["sign", "签名"], ["verify", "验签"], ["keygen", "生成密钥对"], ["keygen2048", "生成密钥对(2048)"]], default: "keygen" },
        { name: "publicKey", label: "公钥 (PEM)", type: "textarea", default: "" },
        { name: "privateKey", label: "私钥 (PEM)", type: "textarea", default: "" },
        { name: "signature", label: "签名(Base64, 验签用)", type: "text", default: "" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools" },
    ],
    async run(v) {
        const JSEncrypt = window.JSEncrypt;
        if (!JSEncrypt) throw new Error("JSEncrypt 未加载");
        if (v.mode === "keygen" || v.mode === "keygen2048") {
            const bits = v.mode === "keygen2048" ? 2048 : 1024;
            return await new Promise((resolve, reject) => {
                const enc = new JSEncrypt({ default_key_size: bits });
                // 注意：jsencrypt 的 getKey 回调不带参数，密钥会写入实例内部
                enc.getKey(() => {
                    const publicKey = enc.getPublicKey();
                    const privateKey = enc.getPrivateKey();
                    if (!publicKey || !privateKey) return reject(new Error("密钥生成失败"));
                    resolve({ 公钥: publicKey, 私钥: privateKey });
                });
            });
        }
        const enc = new JSEncrypt();
        if (v.mode === "encrypt") {
            enc.setPublicKey(v.publicKey.trim());
            const out = enc.encrypt(v.input);
            if (out === false) throw new Error("加密失败，请检查公钥");
            return out;
        }
        if (v.mode === "decrypt") {
            enc.setPrivateKey(v.privateKey.trim());
            const out = enc.decrypt(v.input.trim());
            if (out === false) throw new Error("解密失败，请检查私钥或密文");
            return out;
        }
        if (v.mode === "sign") {
            enc.setPrivateKey(v.privateKey.trim());
            const sig = enc.sign(v.input, window.CryptoJS.SHA256, "sha256");
            if (sig === false) throw new Error("签名失败");
            return sig;
        }
        enc.setPublicKey(v.publicKey.trim());
        return enc.verify(v.input, v.signature.trim(), window.CryptoJS.SHA256) ? "验签通过 ✓" : "验签失败 ✗";
    },
};

export default rsaTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(rsaTool);
