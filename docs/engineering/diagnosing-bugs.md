Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=diagnosing-bugs
```

```bash
npx skills update diagnosing-bugs
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/diagnosing-bugs)

## What it does

`diagnosing-bugs` runs a disciplined diagnosis loop for hard bugs and performance regressions — building a repro, minimising it, ranking hypotheses, instrumenting, then fixing with a regression test.

It refuses to hypothesise before you have a **tight feedback loop** — one runnable command that already goes red on *this* bug. Reading code to build a theory before that command exists is the exact failure this skill prevents. No red-capable loop, no diagnosis.

## When to reach for it

在 Codex 中可输入 `$` 并选择 `kx-skills:diagnosing-bugs`，在 Claude Code 中可输入 `/diagnosing-bugs`；任务匹配时，模型也可以隐式触发该 skill。

Reach for it on the hard ones: the bug that resists a first glance, the intermittent flake, the regression that crept in between two known-good states. For a quick throwaway to sanity-check a design question rather than chase a defect, use [prototype](https://aihero.dev/skills-prototype) instead.

## The tight loop is the skill

Everything else — bisection, hypothesis-testing, instrumentation — is mechanical once you have the signal. So the skill spends disproportionate effort on Phase 1: constructing a pass/fail command that drives the actual bug code path and asserts the user's exact symptom, then **tightening** it until it is fast, deterministic, and agent-runnable. A 30-second flaky loop is barely better than none; a 2-second deterministic one is a debugging superpower.

它提供一组建立反馈循环的方法：失败测试、curl 脚本、CLI diff、无头浏览器、trace 重放、throwaway harness、fuzz loop、`git bisect run`、差分运行，最后才是 HITL bash 脚本。`git bisect` 会改变 `HEAD` 和 refs，因此 skill 会先展示工作树、good/bad revision 与清理路径，获得明确授权后才执行。非确定性 bug 的目标不是一次完美复现，而是提高复现率。

## It's working if

- It builds and runs a repro command *before* theorising — and pastes the invocation and its red output.
- The loop asserts the symptom you actually reported, not a nearby failure.
- Hypotheses arrive as a ranked, falsifiable list shown to you before any are tested.
- Debug instrumentation is tagged (`[DEBUG-...]`) and grepped away before it declares done.

## Where it fits

`diagnosing-bugs` is a reach-for-it-anytime standalone — you drop into it the moment something is broken, and drop out once the fix and its regression test are in. Its post-mortem hands off to [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) when the real finding is that there's no good seam to lock the bug down — the code, not the bug, is the problem. When you're unsure which skill fits, [ask-kx](https://aihero.dev/skills-ask-kx) routes you.
