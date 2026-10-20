/**
 * DES 加解密
 * 目录：pages/app/des/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { C, symmetricFields, runCryptoJs } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

const desTool = {
    id: "des",
    name: "DES 加解密",
    category: "crypto",
    desc: "DES 对称加密",
    fields: symmetricFields(),
    run: (v) => runCryptoJs(C.DES, v),
};

export default desTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(desTool);
