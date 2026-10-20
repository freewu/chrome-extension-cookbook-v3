/**
 * 希尔加解密
 * 目录：pages/app/hill/（一个目录 = 一个工具）
 * 分类：加解密（crypto）
 */
import { mountTool } from "../shared/page.js";

const hillTool = {
    id: "hill",
    name: "希尔加解密",
    category: "crypto",
    desc: "Hill 矩阵密码（2x2 / 3x3）",
    fields: [
        { name: "mode", label: "模式", type: "select", options: [["encrypt", "加密"], ["decrypt", "解密"]], default: "encrypt" },
        { name: "size", label: "矩阵阶数", type: "select", options: [["2", "2x2"], ["3", "3x3"]], default: "2" },
        { name: "key", label: "密钥矩阵(行优先, 空格分隔)", type: "text", default: "3 3 2 5" },
        { name: "input", label: "输入(字母)", type: "textarea", default: "HELP" },
    ],
    run(v) {
        const n = parseInt(v.size, 10);
        const nums = v.key.trim().split(/\s+/).map(Number);
        if (nums.length !== n * n) throw new Error(`密钥需要 ${n * n} 个数字`);
        let m = [];
        for (let i = 0; i < n; i++) m.push(nums.slice(i * n, i * n + n));

        const mod = (x, p = 26) => ((x % p) + p) % p;
        const det = (mat) => {
            if (n === 2) return mod(mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0]);
            return mod(
                mat[0][0] * (mat[1][1] * mat[2][2] - mat[1][2] * mat[2][1]) -
                mat[0][1] * (mat[1][0] * mat[2][2] - mat[1][2] * mat[2][0]) +
                mat[0][2] * (mat[1][0] * mat[2][1] - mat[1][1] * mat[2][0])
            );
        };
        const modInverse = (a) => {
            a = mod(a);
            for (let x = 1; x < 26; x++) if (mod(a * x) === 1) return x;
            throw new Error("密钥矩阵不可逆（行列式与 26 不互质）");
        };
        let use = m.map((r) => r.slice());
        if (v.mode === "decrypt") {
            const d = det(m);
            const inv = modInverse(d);
            if (n === 2) {
                use = [
                    [mod(m[1][1] * inv), mod(-m[0][1] * inv)],
                    [mod(-m[1][0] * inv), mod(m[0][0] * inv)],
                ];
            } else {
                const cof = [];
                for (let i = 0; i < 3; i++) {
                    cof.push([]);
                    for (let j = 0; j < 3; j++) {
                        const sub = m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
                        const minor = sub[0][0] * sub[1][1] - sub[0][1] * sub[1][0];
                        cof[i].push(mod(((i + j) % 2 ? -1 : 1) * minor));
                    }
                }
                use = [];
                for (let i = 0; i < 3; i++) {
                    use.push([]);
                    for (let j = 0; j < 3; j++) use[i].push(mod(cof[j][i] * inv));
                }
            }
        }

        const letters = v.input.toUpperCase().replace(/[^A-Z]/g, "");
        const padded = letters.padEnd(Math.ceil(letters.length / n) * n, "X");
        let out = "";
        for (let i = 0; i < padded.length; i += n) {
            const vec = [];
            for (let j = 0; j < n; j++) vec.push(padded.charCodeAt(i + j) - 65);
            for (let r = 0; r < n; r++) {
                let sum = 0;
                for (let k = 0; k < n; k++) sum += use[r][k] * vec[k];
                out += String.fromCharCode(mod(sum) + 65);
            }
        }
        return out;
    },
};

export default hillTool;

// 工具页里有 #tool-page 容器时才挂载；首页批量 import 时不会执行任何 DOM 操作
mountTool(hillTool);
