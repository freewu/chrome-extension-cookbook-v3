# AGENTS.md

面向在本仓库中工作的 AI / 协作者的约定。

## 开发完成后的 Git 流程（必须执行）

**每次开发任务完成后，都要提交到 git 并推送到远程仓库**，不需要再额外询问：

```bash
git add -A
git commit -m "<简洁的中文提交说明>"
git push origin main
```

要求：

1. **粒度**：一个完整的功能 / 修复 / 文档改动 = 一次提交，不要把多个不相关改动混在一个 commit 里。
2. **提交信息**：使用简洁的中文说明，描述「做了什么」，例如：
   - `新增 Magic Tools 工具箱实战项目`
   - `修复 XTEA 加解密括号优先级问题`
   - `补充 chrome.identity 文档`
3. **提交前自检**：
   - 确认改动文件符合预期，`git status` 无遗漏、无多余文件（勿提交 `node_modules`、临时调试脚本等）。
   - 有测试 / 语法检查的，先跑通再提交。
4. **推送**：提交后必须 `git push` 到远程 `origin`，保持远程与本地一致。
5. **冲突处理**：`push` 被拒绝时先 `git pull --rebase origin main` 解决冲突，再重新 push；不要使用 `--force`（除非用户明确要求）。
6. 若本次改动很大或涉及敏感内容，先向用户确认再提交/推送。

## 远程仓库

- remote：`origin` = https://github.com/freewu/chrome-extension-cookbook-v3.git
- 主分支：`main`

## 项目约定

- 文档为中文 Markdown。
- demo 目录命名：`code/<序号>-<名称>-demo/`，并在 `code/Readme.md` 中登记。
- 文档中的 API 说明放在 `docs/`，侧边栏为 `docs/_sidebar.md`。
