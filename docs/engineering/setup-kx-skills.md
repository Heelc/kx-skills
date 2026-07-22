Quickstart:

```bash
npx skills add Heelc/kx-skills --skill=setup-kx-skills
```

```bash
npx skills update setup-kx-skills
```

Codex 原生插件用户先安装 marketplace 与插件：

```bash
codex plugin marketplace add Heelc/kx-skills
codex plugin add kx-skills@heelc
```

[Source](https://github.com/Heelc/kx-skills/tree/main/skills/engineering/setup-kx-skills)

## What it does

`setup-kx-skills` teaches one repo how the engineering skills should behave in it — where issues live, what the triage labels are called, and where the domain docs sit — and records those answers as **config** the other skills read.

It writes config, it does not hard-code behaviour. The engineering chain assumes three files under `docs/agents/` exist; this skill is the one-time bootstrap that produces them, discovered from your actual repo (`git remote`, existing labels, existing `CONTEXT.md`) and confirmed with you rather than guessed. It is prompt-driven — explore, present what it found, confirm, then write — not a deterministic scaffold.

## When to reach for it

在 Codex 中输入 `$` 并选择 `kx-skills:setup-kx-skills`；在 Claude Code 中输入 `/setup-kx-skills`。该 skill 只能由用户显式启动。

Reach for it **once per repo, before the first use of any other engineering skill**. If [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) start guessing where your issues live or applying labels that don't exist, they haven't been set up here yet. Re-run it only to switch issue trackers or start over — day-to-day tweaks are just edits to `docs/agents/*.md`.

## The three decisions

It leads each with a recommended answer you can accept in a word, and skips whatever it can already infer — so most runs are a couple of quick confirmations:

- **Issue tracker** — 工作记录在哪里。远端操作优先使用可用 connector，其次使用已认证的 `gh`/`glab` CLI；两者都不可用时，使用 `.scratch/` 下的本地 Markdown 保底。它根据 `git remote` 提出建议，但不会静默切换后端。
- **Triage labels** — asked only if the `triage` skill is installed, and then just: keep the default labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)? Say no only if your tracker already uses other names, so `triage` applies real ones instead of creating duplicates.
- **Domain docs** — assumed single-context (one `CONTEXT.md` + `docs/adr/` at the root), which fits almost every repo; it only raises a multi-context map when it spots monorepo signals.

输出包括 `docs/agents/issue-tracker.md`、`domain.md`，以及安装了 `triage` 时的 `triage-labels.md`。Codex 始终以 `AGENTS.md` 为权威文件，Claude Code 始终以 `CLAUDE.md` 为权威文件；权威文件缺失时会先展示草稿并请求创建。若两份独立文件并存，skill 会询问是否同步，不会静默同时修改。

## It's working if

- `issue-tracker.md` and `domain.md` land under `docs/agents/` (plus `triage-labels.md` when `triage` is installed), and an `## Agent skills` section appears in your `CLAUDE.md` or `AGENTS.md`.
- The tracker it proposes matches your real `git remote`, and the labels match strings that already exist in your repo.
- Afterwards, `triage` and `to-tickets` act on the right place with the right labels instead of asking or guessing.

## Where it fits

`setup-kx-skills` is a **run-once setup** — the foundation the whole engineering set stands on, not a step you repeat. Its neighbours are the skills that read what it writes: [triage](https://aihero.dev/skills-triage), because it applies the label vocabulary configured here, and [to-spec](https://aihero.dev/skills-to-spec) / [to-tickets](https://aihero.dev/skills-to-tickets), because they publish into the issue tracker configured here. Run it first; everything downstream assumes it has. When you're unsure which skill or flow fits, [ask-kx](https://aihero.dev/skills-ask-kx) routes you.
