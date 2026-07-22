Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=ask-kx
```

```bash
npx skills update ask-kx
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/ask-kx)

## What it does

`ask-kx` is the router over the skills in this repo. You describe the situation you're in; it tells you which skill or flow fits and in what order to run them.

It **does no work itself**. It doesn't grill, write a spec, or fix anything — it only orients. It exists for the **user-invoked** skills above all: nothing fires those for you, so *you* have to remember they exist, and `ask-kx` is the memory you offload that to. It also points at the model-invoked skills you'd reach for by name — `/tdd`, `/diagnosing-bugs`, `/prototype`, `/code-review`, and the two vocabulary references, `/domain-modeling` and `/codebase-design`. It answers "which one, and when", then hands you off to the skill that actually does the job.

## When to reach for it

在 Codex 中输入 `$` 并选择 `kx-skills:ask-kx`；在 Claude Code 中输入 `/ask-kx`。该 skill 只能由用户显式启动。

Reach for it whenever you're unsure which skill or flow a situation calls for: you have an idea and don't know where to start, a pile of bug reports and don't know if they're for `/triage`, or two skills that look interchangeable and you can't tell them apart. If you already know the skill you want, skip the router and invoke it directly.

## Flows, not just skills

The idea `ask-kx` gives you to think with is the **flow** — a path *through* the skills rather than a single one. Most work runs along one **main flow** (idea → ship: grill → spec → tickets → implement → review), two **on-ramps** merge onto it (a triage lane for incoming bugs and requests; a codebase-health lane that generates ideas), and everything else is a **standalone** you reach for on its own. Ask a question and you get placed on the right flow, at the right step — not just handed a tool.

## Where it fits

`ask-kx` is the **router** — the standalone map that sits over the whole set. It is the node every other docs page links back to as [ask-kx](https://aihero.dev/skills-ask-kx), so it never sits *in* a chain; it points *into* every chain. From here you'll most often land on [grill-with-docs](https://aihero.dev/skills-grill-with-docs), the head of the main flow, or [triage](https://aihero.dev/skills-triage), the on-ramp for work you didn't create. When even the router's own picture is stale, its [Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/ask-kx) is the map of record.
