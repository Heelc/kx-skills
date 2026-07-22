Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=resolving-merge-conflicts
```

```bash
npx skills update resolving-merge-conflicts
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/resolving-merge-conflicts)

## What it does

`resolving-merge-conflicts` 逐个 hunk 解决进行中的 git merge 或 rebase 冲突，并完成验证。它可以编辑冲突内容，但会在 stage、commit 或继续 rebase 之前展示状态与命令，等待用户明确授权。

It resolves by **intent**, not by text. Before touching a hunk it traces each side back to its **primary source** — the commit message, the PR, the original issue — to understand why the change was made, then preserves both intents where they're compatible. It never invents new behaviour to paper over a clash, and it never reaches for `--abort`: the merge always gets finished.

## When to reach for it

在 Codex 中可输入 `$` 并选择 `kx-skills:resolving-merge-conflicts`，在 Claude Code 中可输入 `/resolving-merge-conflicts`；任务匹配时，模型也可以隐式触发该 skill。

Reach for this when you're mid-merge or mid-rebase and git has stopped on conflicts it can't resolve itself. It's for the conflict in front of you — not for planning the merge or for debugging behaviour that broke afterwards. If the merge is done but something's now failing for reasons you can't see, use [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) instead.

## Resolving by intent

The trap in a conflict is treating it as a text problem — picking "ours" or "theirs" to make the markers go away. This skill treats it as an **intent** problem. Each side of a hunk exists because someone wanted something; the resolution has to honour both wants where it can, and where they're genuinely incompatible, pick the one that matches the merge's stated goal and note the trade-off out loud.

That's why the primary sources matter. You can't preserve an intent you haven't read, so the work starts in the history — commits, PRs, tickets — not in the diff.

## It's working if

- Each resolved hunk keeps both sides' behaviour, or names the trade-off where it couldn't.
- No new behaviour appears that wasn't on either branch.
- 项目的类型检查、测试和格式化检查在请求后续 Git 授权前全部通过。
- 未授权时停在“冲突已解决但未 stage/未继续”的可检查状态；授权后才完成 commit 或 rebase continuation，且不会自动 `--abort`。

## Where it fits

这是 merge 或 rebase 停在冲突时随时可用的独立 skill。它会交付已解决、已验证的工作树，并由用户决定是否授权 stage、commit 或继续 rebase。若合并后出现行为问题，应使用 [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs)；不确定时由 [ask-kx](https://aihero.dev/skills-ask-kx) 路由。
