/**
 * Gzip 编解码
 * 目录：pages/app/gzip/（一个目录 = 一个工具）
 * 分类：编解码（codec）
 */
import {
    utf8ToBytes, bytesToUtf8, bytesToHex, hexToBytes, bytesToBase64, base64ToBytes
} from "../shared/utils.js";
import { mountTool } from "../shared/page.js";

// ---------- Gzip ----------
async function gzipBytes(bytes) {
    const cs = new CompressionStream("gzip");
    const stream = new Blob([bytes]).stream().pipeThrough(cs);
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzipBytes(bytes) {
    const ds = new DecompressionStream("gzip");
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

const gzipTool = {
    id: "gzip",
    name: "Gzip 编解码",
    category: "codec",
    desc: "文本 <-> gzip 压缩数据的 Base64/Hex",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["compress", "压缩"], ["decompress", "解压"]], default: "compress" },
        { name: "format", label: "输出格式", type: "select", options: [["base64", "Base64"], ["hex", "Hex"]], default: "base64" },
        { name: "input", label: "输入", type: "textarea", default: "Magic Tools for Chrome" },
    ],
    async run(v) {
        if (v.mode === "compress") {
            const out = await gzipBytes(utf8ToBytes(v.input));
            return v.format === "hex" ? bytesToHex(out) : bytesToBase64(out);
        }
        const bytes = v.format === "hex" ? hexToBytes(v.input) : base64ToBytes(v.input);
        return bytesToUtf8(await gunzipBytes(bytes));
    },
};

export default gzipTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(gzipTool);
