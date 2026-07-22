#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buckets = ["engineering", "productivity"];
const expected = [
  "ask-kx",
  "code-review",
  "codebase-design",
  "diagnosing-bugs",
  "domain-modeling",
  "grill-with-docs",
  "implement",
  "improve-codebase-architecture",
  "prototype",
  "research",
  "resolving-merge-conflicts",
  "setup-kx-skills",
  "tdd",
  "to-spec",
  "to-tickets",
  "triage",
  "wayfinder",
  "grill-me",
  "grilling",
  "handoff",
  "teach",
  "writing-great-skills",
];
const userInvoked = new Set([
  "ask-kx",
  "grill-with-docs",
  "implement",
  "improve-codebase-architecture",
  "setup-kx-skills",
  "to-spec",
  "to-tickets",
  "triage",
  "wayfinder",
  "grill-me",
  "handoff",
  "teach",
  "writing-great-skills",
]);

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function canonicalPath(name, suffix = "SKILL.md") {
  for (const bucket of buckets) {
    const candidate = `skills/${bucket}/${name}/${suffix}`;
    if (existsSync(join(root, candidate))) return candidate;
  }
  throw new Error(`找不到 promoted skill：${name}`);
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(target);
    return entry.isFile() && entry.name.endsWith(".md") ? [target] : [];
  });
}

const discovered = buckets.flatMap((bucket) =>
  readdirSync(join(root, "skills", bucket), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(root, "skills", bucket, entry.name, "SKILL.md")))
    .map((entry) => entry.name),
);
assert.deepEqual([...discovered].sort(), [...expected].sort(), "promoted skill 清单必须恰好为 22 个");

for (const name of expected) {
  const yaml = read(canonicalPath(name, "agents/openai.yaml"));
  const defaultPrompt = yaml.match(/^\s*default_prompt:\s*["']([^"']+)["']\s*$/m)?.[1];
  assert.ok(defaultPrompt?.includes(`$${name}`), `${name} 的 default_prompt 必须引用自身`);
  assert.equal(
    /^\s*allow_implicit_invocation:\s*false\s*$/m.test(yaml),
    userInvoked.has(name),
    `${name} 的显式/隐式调用策略不一致`,
  );

  const generated = read(`plugins/kx-skills/skills/${name}/SKILL.md`);
  const frontmatter = generated.match(/^---\n([\s\S]*?)\n---/)?.[1];
  assert.ok(frontmatter, `${name} 的生成版缺少 frontmatter`);
  const keys = frontmatter.split("\n").map((line) => line.slice(0, line.indexOf(":")));
  assert.deepEqual(keys, ["name", "description"], `${name} 的生成版只能保留 name 与 description`);
}

const promotedNames = [...expected].sort((left, right) => right.length - left.length);
const retiredSetupPattern = /setup-matt-pocock-skills/i;
const retiredRouterPattern = /ask-matt/i;
const forbidden = [
  [/\bAgent tool\b/i, "Claude Agent tool"],
  [/\bTask tool\b/i, "Claude Task tool"],
  [/subagent_type\s*[=:]/i, "Claude subagent_type"],
  [new RegExp(`/(?:${promotedNames.join("|")})(?![a-z0-9-])`, "i"), "裸 /skill 调用"],
  [/\bCodex sub-?agents?\b/i, "平台专属 Codex 子代理称呼"],
];
for (const name of expected) {
  for (const file of markdownFiles(dirname(join(root, canonicalPath(name))))) {
    const content = readFileSync(file, "utf8");
    assert.doesNotMatch(content, retiredSetupPattern, `${file} 仍包含已退役的 setup skill 名称`);
    assert.doesNotMatch(content, retiredRouterPattern, `${file} 仍包含已退役的 router skill 名称`);
    for (const [pattern, label] of forbidden) {
      assert.doesNotMatch(content, pattern, `${file} 仍包含${label}`);
    }
  }
}

const docs = buckets.flatMap((bucket) =>
  readdirSync(join(root, "docs", bucket))
    .filter((name) => name.endsWith(".md"))
    .map((name) => `docs/${bucket}/${name}`),
);
assert.equal(docs.length, 22, "正式 docs 页面必须恰好为 22 个");
for (const doc of docs) {
  const content = read(doc);
  assert.ok(content.includes("npx skills add Heelc/kx-skills"), `${doc} 缺少当前仓库的 editable-copy 命令`);
  assert.ok(content.includes("https://github.com/Heelc/kx-skills/tree/main/"), `${doc} 的 Source 未指向当前仓库`);
  assert.ok(content.includes("codex plugin add kx-skills@heelc"), `${doc} 缺少 Codex 安装说明`);
  assert.ok(content.includes("kx-skills:"), `${doc} 缺少 Codex selector 说明`);
  assert.doesNotMatch(content, retiredSetupPattern, `${doc} 仍包含已退役的 setup skill 名称`);
  assert.doesNotMatch(content, retiredRouterPattern, `${doc} 仍包含已退役的 router skill 名称`);
}

for (const file of ["CONTEXT.md", ".agents/writing-docs.md", ".claude-plugin/plugin.json"]) {
  assert.doesNotMatch(read(file), retiredSetupPattern, `${file} 仍包含已退役的 setup skill 名称`);
  assert.doesNotMatch(read(file), retiredRouterPattern, `${file} 仍包含已退役的 router skill 名称`);
}
assert.equal(
  read("README.md").match(/setup-matt-pocock-skills/gi)?.length,
  1,
  "README 只能在迁移说明中提及一次已退役的 setup skill 名称",
);
assert.equal(
  read("README.md").match(/ask-matt/gi)?.length,
  1,
  "README 只能在迁移说明中提及一次已退役的 router skill 名称",
);

const versions = [
  JSON.parse(read("package.json")).version,
  JSON.parse(read(".claude-plugin/plugin.json")).version,
  JSON.parse(read("plugins/kx-skills/.codex-plugin/plugin.json")).version,
];
assert.ok(versions[0], "发布版本不能为空");
assert.equal(new Set(versions).size, 1, `三处版本号不一致：${versions.join(", ")}`);
assert.doesNotMatch(read("CLAUDE.md"), /not \(yet\) a Codex|Codex plugin.*roadmap/i, "项目指令仍声称 Codex plugin 尚未提供");

console.log("Codex 静态兼容检查通过：22 个 skill，13 个仅显式调用，9 个可隐式调用。");
