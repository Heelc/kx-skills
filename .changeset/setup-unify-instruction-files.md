---
"kx-skills": minor
---

`setup-kx-skills` 现在会主动把两端的根指令文件统一为单一事实来源。检测到 `CLAUDE.md`（Claude Code 读）与 `AGENTS.md`（Codex 读）为两份独立文件、或只存在一份时，skill 会推荐把其中一个做成另一个的 symlink，使一次编辑两端都读到，免去在每个项目里手动同步那段 `## Agent skills` 配置；symlink 不可用时（如 Windows）退回到两份内容保持一致。建 symlink、合并两份或创建文件均先展示方案并征得确认，绝不静默执行。
