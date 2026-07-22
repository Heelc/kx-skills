Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=implement
```

```bash
npx skills update implement
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/implement)

## What it does

`implement` 按规格或 tickets 实现工作：通过测试驱动开发、类型检查和完整测试套件完成构建，再交给独立审查。它会先展示 diff、验证状态与建议的提交信息；只有获得用户明确授权后才 commit 到当前分支。

It does **not** decide what to build. The spec is already settled and the seams are already agreed; `implement` executes that plan rather than reopening it. It is the hands, not the head — the thinking happened upstream.

## When to reach for it

在 Codex 中输入 `$` 并选择 `kx-skills:implement`；在 Claude Code 中输入 `/implement`。该 skill 只能由用户显式启动。

Reach for it once the work is written down as a spec or split into tickets and you're ready to turn that into code. If the spec doesn't exist yet, write it first — for that, use [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) to break a spec into tickets. If you just want to build something test-first without a full spec, drop to [tdd](https://aihero.dev/skills-tdd) directly.

## Pre-agreed seams

The idea `implement` runs on is the **seam** — the stable interface a feature is tested at, chosen before any code is written. It doesn't invent seams mid-build; it uses the ones already picked (during [to-spec](https://aihero.dev/skills-to-spec)) and writes tests against them via [tdd](https://aihero.dev/skills-tdd). Working at pre-agreed seams is what keeps the implementation honest: the tests target something durable, so the code underneath can move without the tests moving.

围绕这个核心，它保持紧密反馈循环：频繁执行类型检查、增量运行单个测试文件，并在最后运行完整测试套件。随后调用名为 `code-review` 的 skill，展示最终状态；未获授权时保留为未提交改动并给出建议的提交信息。

## Where it fits

`implement` is the build step near the end of the main chain, just before the review:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

在工作已经规格化、排好顺序后使用它。关键邻居是生成阻塞关系 tickets 的 [to-tickets](https://aihero.dev/skills-to-tickets)，以及由它内部调用、在各 seam 上先写测试的 [tdd](https://aihero.dev/skills-tdd)。完成 [code-review](https://aihero.dev/skills-code-review) 后仍需用户授权才会 commit。不确定流程时，可用 [ask-kx](https://aihero.dev/skills-ask-kx) 路由。
