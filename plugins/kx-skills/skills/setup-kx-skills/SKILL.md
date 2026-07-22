---
name: setup-kx-skills
description: Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills.
---

# Setup KX Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker** — where issues live (GitHub by default; local markdown is also supported out of the box)
- **Triage labels** — the strings used for the five canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config` — is this a GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at the repo root — does either exist? Are they **the same file** (one a symlink to the other, or the same inode), **two independent files**, or is **only one** present? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/` — does this skill's prior output already exist?
- `.scratch/` — sign that a local-markdown issue tracker convention is already in use
- Is the `triage` skill installed? (a `triage` skill folder alongside this one, or `triage` in your available skills.) This decides whether Section B runs at all.
- Monorepo signals — a `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. Present only in a genuinely large multi-package repo; their absence means single-context, which is almost every repo.

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order — one section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a word. Give a one-line explainer only when the choice genuinely branches; skip the section entirely when exploration already settled it (Section B when `triage` isn't installed, Section C when there's no monorepo).

**Section A — Issue tracker.**

> Explainer: The "issue tracker" is where issues live for this repo. Skills like `to-tickets`, `triage`, `to-spec`, and `qa` read from and write to it — they need to know whether to use an available tracker connector, use an authenticated tracker CLI, write markdown under `.scratch/`, or follow some other workflow you describe. Pick the place you actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote` points at GitHub, propose that. If a `git remote` points at GitLab (`gitlab.com` or a self-hosted host), propose GitLab. Otherwise (or if the user prefers), offer:

- **GitHub** — issues live in the repo's GitHub Issues (prefer an available connector, otherwise use an authenticated `gh` CLI)
- **GitLab** — issues live in the repo's GitLab Issues (prefer an available connector, otherwise use an authenticated [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown** — issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.) — ask the user to describe the workflow in one paragraph; the skill will record it as freeform prose

Record the choice in `docs/agents/issue-tracker.md`. The GitHub and GitLab templates carry a "PRs as a request surface" flag, defaulted **off** — leave it off and don't raise it; a user who wants external PRs in the triage queue can flip the flag in the file later.

**Section B — Triage label vocabulary.** Skip this section entirely if the `triage` skill isn't installed (exploration told you) — an uninstalled skill needs no labels.

If it is installed, ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are the five canonical roles, each label string equal to its name: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. On **yes**, write them as-is. Only if the user says no — usually because their tracker already uses other names (e.g. `bug:triage` for `needs-triage`) — collect the overrides so `triage` applies existing labels instead of creating duplicates.

**Section C — Domain docs.** Default to **single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root. This fits almost every repo; write it without asking.

Offer **multi-context** — a root `CONTEXT-MAP.md` pointing to per-context `CONTEXT.md` files — only when exploration found monorepo signals. Then confirm which layout they want.

### 3. Confirm and edit

Show the user a draft of:

- The `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md` is being edited (see step 4 for selection rules)
- Whether to unify the two root instruction files into a single source of truth so both harnesses read the same config (see step 4) — surface this recommendation here so the user decides before anything is written
- The contents of `docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and `docs/agents/triage-labels.md` (the last only when `triage` is installed)

Let them edit before writing.

### 4. Write

**先定单一事实来源（single source of truth）。** Claude Code 读 `CLAUDE.md`，Codex 读 `AGENTS.md`。若两者是各自独立的实体，同一份配置就要维护两次、迟早漂移。因此本 skill 的推荐姿态是：**让两个名字指向同一份文件**（其中一个做成另一个的 symlink），一次编辑两端都读到。这样用户不必在每个项目里手动同步。

按探索出的文件关系分情况处理。**建 symlink、合并两份、创建第二份独立文件，都必须先展示具体方案（涉及的文件、命令、写入内容）并取得用户明确确认，绝不静默执行；** 也始终保留权威文件中已有的用户指令：

- **两个名字已指向同一文件**（其一是 symlink，或同一 inode）：理想状态，无需改动结构。只编辑那一份共享目标一次。
- **只有一个文件存在**：编辑它写入配置块；然后**推荐**为缺失的另一个名字建一个指向它的 symlink（`ln -s <已存在的实体> <另一个名字>`，方向以已存在的实体为准），让另一端零维护地读到同一份。用户同意则建立；拒绝则维持单份，并明确告知另一端读不到这份配置。
- **两个文件都不存在**：默认创建 `CLAUDE.md` 作为实体（写入前展示草稿并确认），并在同一步**推荐**建 `AGENTS.md -> CLAUDE.md` 的 symlink，使 Codex 也读到。
- **两个独立文件都存在**：**推荐**收敛为单一源——把非权威那份中 `## Agent skills` 以外的用户内容并入权威份，再用指向权威份的 symlink 替换非权威份。这一步有覆盖风险，需逐项确认。用户若不愿合并，退回到「只编辑当前 harness 的权威文件，并把这段 block 原样同步进另一份」，绝不静默同时改。

**Symlink 不可用时的退路**（如 Windows 对 symlink 支持差，或用户明确拒绝 symlink）：保留两个独立文件，把 `## Agent skills` 这段**完全相同地**写进两者，并提醒用户此后需手动保持两份一致。

If an `## Agent skills` block already exists in the chosen file, update its contents in-place rather than appending a duplicate. Don't overwrite user edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Include the `### Triage labels` sub-block, and write `docs/agents/triage-labels.md`, only when `triage` is installed and Section B ran. When it isn't, both are omitted.

Then write the docs files using the seed templates in this skill folder as a starting point:

- [issue-tracker-github.md](./issue-tracker-github.md) — GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) — GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md) — local-markdown issue tracker
- [triage-labels.md](./triage-labels.md) — label mapping (only if `triage` is installed)
- [domain.md](./domain.md) — domain doc consumer rules + layout

For "other" issue trackers, write `docs/agents/issue-tracker.md` from scratch using the user's description.

For every remote tracker, record this operation priority in the generated tracker doc: use an available connector first, then an authenticated CLI, then offer the local-markdown backend if neither is usable. Never claim a remote write succeeded when no authenticated backend is available, and never switch the configured tracker silently.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files. Mention they can edit `docs/agents/*.md` directly later — re-running this skill is only necessary if they want to switch issue trackers or restart from scratch.
