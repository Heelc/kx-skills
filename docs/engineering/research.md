Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=research
```

```bash
npx skills update research
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/research)

## What it does

`research` answers a question by reading the sources that own the answer and leaving a cited Markdown file behind. It works only from **primary sources** — official docs, source code, specs, first-party APIs — never a secondary write-up of them, so what it saves is traceable back to something authoritative rather than a summary of a summary.

## When to reach for it

在 Codex 中可输入 `$` 并选择 `kx-skills:research`，在 Claude Code 中可输入 `/research`；任务匹配时，模型也可以隐式触发该 skill。

Reach for it when the next step is *finding something out* — how an API behaves, what a spec actually says, whether a claim holds — and you'd rather not stall your own thread doing the reading. For sharpening a plan by interview instead of by reading, use [grilling](https://aihero.dev/skills-grilling); for exploring what to build with throwaway code, use [prototype](https://aihero.dev/skills-prototype).

## Delegated legwork

核心动作是把阅读交给独立的 Codex 子代理，并让主任务继续推进；若当前环境不支持协作，则在主任务中以隔离的串行步骤完成同样的研究。每项结论都追溯到一手来源，最终在仓库约定位置落下一份带引用的 Markdown。委托的是取证工作，不是判断责任。

## Where it fits

A reach-for-it-anytime standalone that feeds the thinking skills: the file it produces is something to grill, plan, or design against, so it sits upstream of work like [grilling](https://aihero.dev/skills-grilling) and [to-prd](https://aihero.dev/skills-to-prd) rather than in the build chain. For the whole map, see [ask-kx](https://aihero.dev/skills-ask-kx).
