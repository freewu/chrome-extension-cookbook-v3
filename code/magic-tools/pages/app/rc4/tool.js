/**
 * RC4 加解密
 * 目录：pages/app/rc4/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { C, symmetricFields, runCryptoJs } from "../shared/crypto-common.js";
import { mountTool } from "../shared/page.js";

const rc4Tool = {
    id: "rc4",
    name: "RC4 加解密",
    category: "crypto",
    desc: "RC4 流密码",
    fields: symmetricFields({ noMode: true, noIv: true }),
    run: (v) => runCryptoJs(C.RC4, v, { noMode: true, noIv: true }),
};

export default rc4Tool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(rc4Tool);
