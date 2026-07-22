Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=writing-great-skills
```

```bash
npx skills update writing-great-skills
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/productivity/writing-great-skills)

## What it does

`writing-great-skills` is the reference you write and edit skills against — the shared vocabulary and principles that make a skill predictable.

A skill's job is to wrangle determinism out of a stochastic system, so the goal is not the same *output* every run but the same *process*. **Predictability** is the root virtue, and every design choice is judged against it — not against how clever, complete, or exhaustive the skill reads.

## When to reach for it

在 Codex 中输入 `$` 并选择 `kx-skills:writing-great-skills`；在 Claude Code 中输入 `/writing-great-skills`。该 skill 只能由用户显式启动。

Reach for it whenever you're authoring a new skill or editing an existing one and want it to behave the same way every time: deciding invocation mode, writing a description, choosing what lives in `SKILL.md` versus a linked file, or diagnosing why a skill misfires.

## Cognitive load

The concept the whole reference turns on is **cognitive load** — and its counterpart, **context load**. Every skill spends one or the other:

- **Model-invoked** skill 的描述会暴露给模型，因此消耗 **context load**，但可以自动触发。Claude Code 通过省略 `disable-model-invocation` 表达；Codex 通过省略 `policy.allow_implicit_invocation: false` 表达。
- **User-invoked** skill 仍保留必需的 `description` 作为选择器元数据，但平台策略禁止隐式触发。Claude Code 设置 `disable-model-invocation: true`，Codex 在 `agents/openai.yaml` 设置 `policy.allow_implicit_invocation: false`；此时由用户承担记忆它的 **cognitive load**。

Most of these skills are user-invoked, which is why cognitive load is the pressure the whole system is built to manage: when user-invoked skills multiply past what you can hold in your head, the cure is a **router skill** that names the others and when to reach for each. Once you're thinking in these two loads, most authoring decisions — split or don't, inline or disclose, model- or user-invoked — become the same trade made in different places.

## The other levers

The rest of the reference is the toolkit for spending those loads well:

- **Leading words** — a compact concept already in the model's pretraining (_tight_, _red_, _tracer bullet_) that the agent thinks with while running the skill. It anchors execution *and* invocation in the fewest tokens; hunt restatements that a single word can retire.
- **Information hierarchy** — the ladder from in-skill step, to in-skill reference, to external reference behind a **context pointer**. **Progressive disclosure** is the move down that ladder so the top stays legible.
- **Pruning** — single source of truth, relevance, and the no-op test applied sentence by sentence, against **sediment** and **sprawl**.
- **Failure modes** — **premature completion**, **duplication**, **sediment**, **sprawl**, **no-op** — to diagnose a skill that isn't behaving.

## Where it fits

This is a reach-for-it-anytime standalone reference — the meta-skill you consult while building the rest of the set, not a step in a chain. Its natural neighbour is any router you maintain, because a router is the direct cure for the cognitive load that user-invoked skills pile up; when you're unsure which skill or flow fits a task, [ask-kx](https://aihero.dev/skills-ask-kx) routes you over the whole set.
