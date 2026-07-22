# 以生成式镜像发布 Codex 原生插件

## 状态

已接受，取代 [ADR 0002](./0002-ship-as-a-claude-code-plugin.md) 中“暂缓 Codex plugin”的决定。ADR 0002 作为历史决策保留，不改写。

## 背景

仓库把正式发布的 skills 分在 `skills/engineering/` 与 `skills/productivity/`，同时把草稿、个人和废弃 skills 保留在其他 bucket。Codex plugin manifest 只接受一个 `skills` 根路径，不能直接表达两个 promoted bucket；symlink 又不会可靠地进入安装缓存。

维护两份手写 skill 会产生第二事实来源，而重构现有 bucket 会破坏 Claude Code、skills.sh 和本地开发习惯。

## 决策

- `skills/engineering/` 与 `skills/productivity/` 是唯一可编辑源码。
- `scripts/build-codex-plugin.mjs` 将 17 个 engineering 和 5 个 productivity skill 物理复制、平铺到 `plugins/kx-skills/skills/`。
- 生成版 `SKILL.md` frontmatter 只保留 Codex 需要的 `name` 与 `description`；正文和其他资源保持一致。
- `.agents/plugins/marketplace.json` 发布名为 `heelc` 的仓库 marketplace，插件名为 `kx-skills`。
- `--check` 在临时目录重建并比较全部文件，阻止手工修改生成目录、重名、数量错误、非 promoted skill 混入、版本漂移与调用策略漂移。
- Claude Code plugin 继续从 canonical bucket 读取，Codex plugin 从生成镜像读取；两者共享同一行为源码。

## 后果

发布前必须先运行构建和防漂移检查。生成目录会增加仓库体积，但换来可安装的真实文件、单一源码和可验证的 22-skill 边界。任何 promoted skill 的新增、删除、重命名或行为变化，都必须同步 manifest、文档、路由和生成产物。
