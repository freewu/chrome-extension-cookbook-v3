import { mountTool } from "../shared/page.js";

// IPv4 ↔ 整数 / 十六进制 / 二进制 / IPv6 各种写法
const IP_INT_MAX = 0xffffffff;

const ipv4ToInt = (ip) => {
    const parts = String(ip).trim().split(".");
    if (parts.length !== 4) throw new Error("IPv4 需为 4 段，如 192.168.1.1");
    let v = 0;
    for (const p of parts) {
        if (!/^\d{1,3}$/.test(p)) throw new Error(`非法网段「${p}」：需为 0~255 的整数`);
        const n = parseInt(p, 10);
        if (n > 255) throw new Error(`非法网段「${p}」：超出 255`);
        v = v * 256 + n;
    }
    return v;
};

const intToIpv4 = (v) => `${v >>> 24}.${(v >>> 16) & 0xff}.${(v >>> 8) & 0xff}.${v & 0xff}`;

const parseIntText = (text) => {
    const s = String(text).trim();
    if (s === "") throw new Error("整数不能为空");
    let v;
    if (/^0x[0-9a-f]+$/i.test(s)) v = parseInt(s.slice(2), 16);
    else if (/^0b[01]+$/i.test(s)) v = parseInt(s.slice(2), 2);
    else if (/^\d+$/.test(s)) v = parseInt(s, 10);
    else throw new Error("整数需为十进制、0x 十六进制或 0b 二进制");
    if (!Number.isInteger(v) || v < 0 || v > IP_INT_MAX) throw new Error(`整数需在 0 ~ ${IP_INT_MAX} 范围内`);
    return v;
};

const groupHex = (v) => (v & 0xffff).toString(16);

const longestZeroRun = (groups) => {
    let best = { start: -1, len: 0 };
    let i = 0;
    while (i < groups.length) {
        if (groups[i] !== 0) {
            i += 1;
            continue;
        }
        let j = i;
        while (j < groups.length && groups[j] === 0) j += 1;
        if (j - i > best.len) best = { start: i, len: j - i };
        i = j;
    }
    return best.len >= 2 ? best : { start: -1, len: 0 };
};

const compressIpv6 = (groups) => {
    const hex = groups.map(groupHex);
    const run = longestZeroRun(groups);
    if (run.start < 0) return hex.join(":");
    const head = hex.slice(0, run.start).join(":");
    const tail = hex.slice(run.start + run.len).join(":");
    return `${head}::${tail}`;
};

const dottedOf = (groups) =>
    `${(groups[6] >> 8) & 0xff}.${groups[6] & 0xff}.${(groups[7] >> 8) & 0xff}.${groups[7] & 0xff}`;

const formatIpv6 = (groups, style = "compressed") => {
    const g = groups.slice(0, 8).map((v) => v & 0xffff);
    while (g.length < 8) g.push(0);
    if (style === "full") return g.map((v) => groupHex(v).padStart(4, "0")).join(":");
    if (style === "mixed") {
        const head = compressIpv6(g.slice(0, 6));
        return head.endsWith("::") ? `${head}${dottedOf(g)}` : `${head}:${dottedOf(g)}`;
    }
    return compressIpv6(g);
};

// IPv6 文本 → 8 组 16 位整数（支持 :: 缩写、末尾点分 IPv4、%scope 后缀）
const parseIpv6 = (text) => {
    let s = String(text).trim().replace(/^\[|\]$/g, "").replace(/%.*$/, "");
    if (!s.includes(":")) throw new Error("不是 IPv6 地址");
    // 末尾的 IPv4 写法转成两组十六进制
    const dotted = /\./.test(s);
    if (dotted) {
        const idx = s.lastIndexOf(":");
        const tail = s.slice(idx + 1);
        const v = ipv4ToInt(tail);
        s = `${s.slice(0, idx + 1)}${((v >>> 16) & 0xffff).toString(16)}:${(v & 0xffff).toString(16)}`;
    }
    const halves = s.split("::");
    if (halves.length > 2) throw new Error("IPv6 中只能出现一次 ::");
    const parse = (part) =>
        part === ""
            ? []
            : part.split(":").map((h) => {
                  if (!/^[0-9a-fA-F]{1,4}$/.test(h)) throw new Error(`非法 IPv6 分组「${h}」`);
                  return parseInt(h, 16);
              });
    const head = parse(halves[0]);
    const tail = halves.length === 2 ? parse(halves[1]) : [];
    if (halves.length === 2) {
        if (head.length + tail.length > 7) throw new Error(":: 缩写后至少省略 1 组");
        return [...head, ...new Array(8 - head.length - tail.length).fill(0), ...tail];
    }
    if (head.length !== 8) throw new Error("IPv6 应为 8 组（可用 :: 缩写）");
    return head;
};

const classifyIpv6 = (g) => {
    const all = (from, to, v) => g.slice(from, to).every((x) => x === v);
    if (all(0, 5, 0) && g[5] === 0xffff) return "IPv4 映射地址（::ffff:0:0/96）";
    if (all(0, 5, 0) && g[5] === 0) return "IPv4 兼容地址（::/96，已废弃）";
    if (g[0] === 0x64 && g[1] === 0xff9b && all(2, 6, 0)) return "NAT64 / DNS64（64:ff9b::/96）";
    if (g[0] === 0x2002) return "6to4（2002::/16）";
    if ((g[0] & 0xffc0) === 0xfe80) return "链路本地地址（fe80::/10）";
    if ((g[0] & 0xfe00) === 0xfc00) return "唯一本地地址（fc00::/7）";
    if ((g[0] & 0xff00) === 0xff00) return "组播地址（ff00::/8）";
    if (all(0, 8, 0)) return "未指定地址（::）";
    if (all(0, 7, 0) && g[7] === 1) return "环回地址（::1）";
    if ((g[0] & 0xe000) === 0x2000) return "全球单播地址（2000::/3）";
    return "其它";
};

const ipv6Result = (text) => {
    const g = parseIpv6(text);
    const kind = classifyIpv6(g);
    // 末 32 位内嵌 IPv4 的地址（映射 / 兼容 / NAT64）与 6to4（IPv4 在第 2、3 组）分开处理
    const lastBitsIpv4 = (g.slice(0, 5).every((x) => x === 0) && (g[5] === 0 || g[5] === 0xffff)) || (g[0] === 0x64 && g[1] === 0xff9b);
    const embedded = lastBitsIpv4 || g[0] === 0x2002;
    const out = {
        "IPv6 压缩写法": formatIpv6(g, "compressed"),
        "IPv6 完整写法": formatIpv6(g, "full"),
        地址类型: kind,
    };
    // 只有末 32 位是 IPv4 的地址，混合写法才有意义
    if (lastBitsIpv4) out["IPv6 混合写法"] = formatIpv6(g, "mixed");
    if (embedded) {
        const ip = g[0] === 0x2002 ? intToIpv4(((g[1] << 16) | g[2]) >>> 0) : intToIpv4(((g[6] << 16) | g[7]) >>> 0);
        out["内嵌 IPv4"] = ip;
        out["内嵌 IPv4 整数"] = String(ipv4ToInt(ip));
    }
    return out;
};

const ipv4ToIpv6Forms = (ip) => {
    const v = ipv4ToInt(ip);
    const hi = (v >>> 16) & 0xffff;
    const lo = v & 0xffff;
    const zero5 = [0, 0, 0, 0, 0];
    return {
        "IPv6 映射地址 ::ffff:0:0/96": formatIpv6([...zero5, 0xffff, hi, lo], "mixed"),
        "IPv6 映射（纯十六进制）": formatIpv6([...zero5, 0xffff, hi, lo], "compressed"),
        "IPv6 兼容地址 ::/96（已废弃）": formatIpv6([...zero5, 0, hi, lo], "mixed"),
        "6to4 2002::/16": formatIpv6([0x2002, hi, lo, 0, 0, 0, 0, 0], "compressed"),
        "NAT64 / DNS64 64:ff9b::/96": formatIpv6([0x64, 0xff9b, 0, 0, 0, 0, hi, lo], "mixed"),
        "IPv6 完整展开": formatIpv6([...zero5, 0xffff, hi, lo], "full"),
    };
};

const tool = {
    id: "ip-convert",
    name: "IP 转换",
    category: "convert",
    desc: "IPv4 ↔ 整数 / 十六进制 / 二进制，并给出 IPv4 对应的 IPv6 各种写法；也支持解析 IPv6",
    fields: [
        {
            name: "mode",
            label: "输入类型",
            type: "select",
            options: [
                ["ip", "IPv4 / IPv6 地址"],
                ["int", "整数（支持 0x / 0b）"],
                ["hex", "十六进制"],
                ["bin", "二进制"],
            ],
            default: "ip",
        },
        { name: "input", label: "输入值", type: "text", default: "192.168.1.1", placeholder: "如 192.168.1.1 / 3232235777 / 0xC0A80101" },
    ],
    run(v) {
        const raw = String(v.input || "").trim();
        if (raw === "") throw new Error("请输入内容");
        let value;
        if (v.mode === "ip" && raw.includes(":")) return ipv6Result(raw);
        if (v.mode === "ip") value = ipv4ToInt(raw);
        else if (v.mode === "int") value = parseIntText(raw);
        else if (v.mode === "hex") value = parseIntText("0x" + raw.replace(/^0x/i, ""));
        else value = parseIntText("0b" + raw.replace(/\s/g, ""));
        const ip = intToIpv4(value);
        return {
            "IPv4": ip,
            "整数（十进制）": String(value),
            "十六进制": "0x" + value.toString(16).toUpperCase().padStart(8, "0"),
            "二进制": value.toString(2).padStart(32, "0"),
            "8 位十六进制": value.toString(16).toUpperCase().padStart(8, "0"),
            ...ipv4ToIpv6Forms(ip),
        };
    },
};

export default tool;
mountTool(tool);
