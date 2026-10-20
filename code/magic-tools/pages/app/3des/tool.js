/**
 * 3DES 加解密
 * 目录：pages/app/3des/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { C, symmetricFields, runCryptoJs } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

const tripleDesTool = {
    id: "3des",
    name: "3DES 加解密",
    category: "crypto",
    desc: "Triple DES (3DES)",
    fields: symmetricFields(),
    run: (v) => runCryptoJs(C.TripleDES, v),
};

export default tripleDesTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(tripleDesTool);
