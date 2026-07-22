Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=code-review
```

```bash
npx skills update code-review
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/code-review)

## What it does

`code-review` 从你提供的固定点（commit、branch、tag 或 merge-base）审查到 `HEAD` 的差异，并沿两条独立轴线给出结论：**Standards** 检查仓库规范，**Spec** 检查原始 issue 或规格。Codex 支持协作时，两条轴线由独立子代理并行执行；不支持时，使用隔离上下文串行执行。结果始终分开呈现，避免一条轴线掩盖另一条。

## When to reach for it

在 Codex 中可输入 `$` 并选择 `kx-skills:code-review`，在 Claude Code 中可输入 `/code-review`；任务匹配时，模型也可以隐式触发该 skill。

当你需要相对已知良好点判断一份 diff，并独立回答“实现方式是否正确”和“实现目标是否正确”时使用它。它位于构建循环末尾；测试先行编码使用 [tdd](https://aihero.dev/skills-tdd)，按完整规格构建则使用 [implement](https://aihero.dev/skills-implement)。`implement` 会调用名为 `code-review` 的 skill，并在请求 commit 授权前展示审查结果。

## Prerequisites

The **Spec** axis needs somewhere to find the originating spec — an issue reference in the commit messages, a path you pass in, or a spec under `docs/`/`specs/`. That issue-tracker wiring comes from [setup-kx-skills](https://aihero.dev/skills-setup-kx-skills); without a spec the Spec axis simply skips and says so. The **Standards** axis needs nothing set up — it always carries a built-in Fowler smell baseline even in a repo that documents no conventions.

## Two axes, never merged

The defining idea is the **two axes**. **Standards** asks whether the diff conforms to how this repo writes code — its `CODING_STANDARDS.md` or `CONTRIBUTING.md`, plus a fixed baseline of ~12 Fowler code smells (Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, …). Two rules keep the baseline safe: a documented repo standard always overrides it, and every smell is a judgement call, never a hard violation. **Spec** asks the orthogonal question — does the code do what the issue or spec actually asked, without missing requirements or smuggling in scope creep?

两条轴线优先由相互隔离的 Codex 子代理并行执行；受限环境下则以隔离的串行检查降级。最终报告分别使用 `## Standards` 和 `## Spec` 标题，不合并为单一总分。

## It's working if

- It pins and confirms the fixed point first (`git rev-parse`), failing fast on a bad ref or empty diff rather than inside the sub-agents.
- Standards and Spec findings arrive in two distinct blocks, each citing its source — a repo standard or baseline smell for one, a quoted spec line for the other.
- When no spec can be found, the Spec axis reports "no spec available" instead of inventing requirements.

## Where it fits

`code-review` is the review step at the tail of the main build chain:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

它最接近 [implement](https://aihero.dev/skills-implement)：后者驱动构建，并在展示状态、请求 commit 授权前调用本 skill。上游规格来自 [to-spec](https://aihero.dev/skills-to-spec) 与 [to-tickets](https://aihero.dev/skills-to-tickets)。不确定流程时，可用 [ask-kx](https://aihero.dev/skills-ask-kx) 路由。
