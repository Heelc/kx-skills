Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=handoff
```

```bash
npx skills update handoff
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/productivity/handoff)

## What it does

`handoff` compacts the current conversation into a **handoff document** — a single write-up a fresh agent can read to pick up the work where you left off.

它不会重复已经存在于 spec、plan、ADR、issue、commit 或 diff 中的内容，只保留引用。默认保存到操作系统临时目录，因此不会污染当前仓库；若 sandbox 无法写入临时目录，则返回完整的脱敏文档和预期绝对路径，不会改写 workspace。

## When to reach for it

在 Codex 中输入 `$` 并选择 `kx-skills:handoff`；在 Claude Code 中输入 `/handoff`。该 skill 只能由用户显式启动。

Reach for this when a conversation has gone long enough that its context is at risk — you're near a context limit, wrapping for the day, or deliberately handing the work to another agent — and you want the thread preserved without dragging the whole transcript along.

## What the document carries

- **The live thread** — what's in flight and why, in the conversation's own terms, minus anything already written down elsewhere.
- **Suggested skills** — a pointer to the skills the next agent should reach for to continue.
- **References, not copies** — links and paths to the specs, plans, ADRs, issues, and diffs that hold the settled detail.
- **Redacted secrets** — API keys, passwords, and PII become forbidden output tokens before any content is composed. Status messages use only “sensitive data redacted”; the original value never appears in the document, filename, action list, progress message, or final response.

The idea to hold onto is **compaction**: a handoff is the conversation squeezed down to just its resumable core, so a fresh agent inherits the momentum, not the noise.

## Where it fits

`handoff` is a reach-for-it-anytime standalone — it sits at the seam between two sessions rather than inside a build chain. It pairs naturally with the artifact-producing skills whose output it points at: [to-spec](https://aihero.dev/skills-to-spec), because a finished spec is exactly the kind of settled detail a handoff references instead of repeating. When you're unsure which skill fits the moment, [ask-kx](https://aihero.dev/skills-ask-kx) routes you.
