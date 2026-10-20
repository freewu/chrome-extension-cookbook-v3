/**
 * AES 加解密
 * 目录：pages/app/aes/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { C, symmetricFields, runCryptoJs } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

const aesTool = {
    id: "aes",
    name: "AES 加解密",
    category: "crypto",
    desc: "AES-128/192/256，CBC/ECB/CFB/OFB/CTR",
    fields: symmetricFields(),
    run: (v) => runCryptoJs(C.AES, v, { keySizes: [16, 24, 32] }),
};

export default aesTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(aesTool);
