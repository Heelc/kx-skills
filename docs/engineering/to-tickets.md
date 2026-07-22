Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=to-tickets
```

```bash
npx skills update to-tickets
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/to-tickets)

## What it does

`to-tickets` 将计划、规格或当前对话拆成一组 **tickets**，每个 ticket 都是 tracer-bullet 垂直切片，并声明阻塞关系。它先让用户批准拆分结果和目标后端；远端创建、标签与依赖写入必须再次展示并取得明确授权。

Every ticket is a **tracer bullet** — a thin *vertical* slice that cuts through all integration layers end-to-end (schema, API, UI, tests), never a horizontal slice of one layer. A completed slice is demoable or verifiable on its own, which is what makes each ticket safe to hand to an agent.

## When to reach for it

在 Codex 中输入 `$` 并选择 `kx-skills:to-tickets`；在 Claude Code 中输入 `/to-tickets`。该 skill 只能由用户显式启动。

Reach for it once you have an agreed plan or a written spec and you want it split into tickets. Point it at the conversation, or pass a spec or issue reference and it fetches the body and comments first. If the change hasn't been written up as a spec yet, produce one first — for that, use [to-spec](https://aihero.dev/skills-to-spec).

## Prerequisites

`to-tickets` 依赖 [setup-kx-skills](https://aihero.dev/skills-setup-kx-skills) 配置 tracker 和标签。缺少配置时会停止并提示用户显式运行 setup。远端后端按 connector→已认证 CLI 选择；均不可用时，经用户确认后为每个 ticket 写一个本地 Markdown 文件。

## One artifact, two readings

The blocking edges are the whole point. They make one set of tickets read two ways, depending on the tracker:

- **Local files** → one file per ticket under `.scratch/<feature>/issues/`, numbered blockers-first, the edges written as text. You work them top-to-bottom, by hand, staying in the loop.
- **A real tracker (GitHub, Linear)** → one issue per ticket, the edges as native blocking links (or sub-issues). Any ticket whose blockers are all done is on the **frontier** and can be grabbed — so several agents can run at once.

The edges live in the ticket regardless of medium; the medium only decides whether anything acts on them in parallel. `to-tickets` produces the artifact — how you run it (sequential by hand, or a parallel fleet) is up to you.

## Vertical slices, not horizontal ones

The whole skill turns on one distinction. A **horizontal** slice ships one layer of the change — all the schema, or all the API — and nothing works until every layer lands. A **vertical** slice, the tracer bullet, ships one narrow path through *every* layer at once, so it can be demoed the moment it's done.

Before slicing, `to-tickets` looks for prefactoring — "make the change easy, then make the easy change" — and orders that work first. It then quizzes you on the breakdown (granularity, blocking edges, what to merge or split) before publishing anything, and publishes blockers first so each ticket's "Blocked by" can reference a real ticket.

## The wide-refactor exception

One shape breaks the tracer-bullet rule: a **wide refactor** — a single mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so one edit breaks thousands of call sites at once and no vertical slice can land green. `to-tickets` slices it as **expand–contract** instead: expand (add the new form beside the old so nothing breaks), migrate (move call sites over in batches sized by blast radius, one ticket per batch, CI green throughout because the old form still exists), then contract (delete the old form once no caller remains). When even the batches can't stay green alone, they share an integration branch that all block a final integrate-and-verify ticket, and green is promised only there.

## Where it fits

`to-tickets` is a step in the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

它位于 [to-spec](https://aihero.dev/skills-to-spec) 与 [implement](https://aihero.dev/skills-implement) 之间。每个 frontier ticket 都应在 fresh task 中由用户显式选择 user-only 的 `implement`，本 skill 不会自动启动它；`implement` 再调用 [tdd](https://aihero.dev/skills-tdd) 和 [code-review](https://aihero.dev/skills-code-review)。不确定流程时由 [ask-kx](https://aihero.dev/skills-ask-kx) 路由。
