Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=to-spec
```

```bash
npx skills update to-spec
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/to-spec)

## What it does

`to-spec` 将当前对话和代码库理解合成为规格（也称 PRD）。本地 tracker 会写入明确的 Markdown 路径；远端 tracker 会先展示完整草稿、目标和标签变更，只有获得明确授权才发布。

It does **not** interview you again. By the time you reach for it, the alignment work is done — `to-spec` synthesises what is already known rather than asking a fresh round of questions.

## When to reach for it

在 Codex 中输入 `$` 并选择 `kx-skills:to-spec`；在 Claude Code 中输入 `/to-spec`。该 skill 只能由用户显式启动。

Reach for it once a change has been talked through and the domain language is settled, and you want that shared understanding written down before any code is written. If you *haven't* aligned yet, grill first — for that, use [grill-with-docs](https://aihero.dev/skills-grill-with-docs). To split the finished spec into tickets, use [to-tickets](https://aihero.dev/skills-to-tickets).

## Prerequisites

`to-spec` 依赖 [setup-kx-skills](https://aihero.dev/skills-setup-kx-skills) 配置 tracker 与标签。缺少配置是硬停止条件，不代表自动选择本地 backend；此时会提示用户显式运行 setup，并且不会写规格。只有已经配置远端 tracker、但 connector 和已认证 CLI 均不可用时，才可经确认降级为本地 Markdown。

## What the spec includes

- **Problem statement** — what is broken or missing, and why it's worth solving, in the project's own vocabulary.
- **Solution** — the shape of the fix at a high level, before any implementation detail.
- **User stories** — an extensive, numbered list of the concrete behaviours the change must support, each one independently checkable.
- **Implementation decisions** — the choices already settled during the conversation, so they aren't relitigated later.
- **Testing decisions** — the seams the feature will be tested at, and what "done" looks like.
- **Out-of-scope items** — what this change deliberately does *not* cover, to keep the ticket bounded.
- **Further notes** — anything else worth carrying forward that doesn't fit the sections above.

## Deep modules

Before writing the spec, `to-spec` sketches the **seams** at which the feature will be tested and looks for **deep module** opportunities — a lot of functionality hidden behind a small, stable interface. It prefers existing seams to new ones and the highest seam possible, ideally just one across the whole change.

That matters for agentic development: a good interface gives tests something durable to target, so the code underneath can change without the tests moving.

## It's working if

- It starts writing the spec instead of asking you a fresh round of questions.
- It checks the seams with you before writing, and proposes as few as possible.
- The spec comes back in your project's domain vocabulary, not generic boilerplate.

## Where it fits

`to-spec` is a step in the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Reach for it after the plan and domain language are resolved, and before you break the work into implementation tickets. Its key neighbours are [grill-with-docs](https://aihero.dev/skills-grill-with-docs), which sharpens the context so the spec is precise, and [to-tickets](https://aihero.dev/skills-to-tickets), which turns the spec into a set of tickets for [implement](https://aihero.dev/skills-implement) to build. When you're unsure which skill or flow fits, [ask-kx](https://aihero.dev/skills-ask-kx) routes you.
