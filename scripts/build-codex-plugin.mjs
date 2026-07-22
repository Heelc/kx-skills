#!/usr/bin/env node

import { createHash } from "node:crypto";
import { cp, lstat, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = join(repoRoot, "plugins", "kx-skills");
const generatedSkillsRoot = join(pluginRoot, "skills");
const bucketRoots = [
  ["engineering", join(repoRoot, "skills", "engineering")],
  ["productivity", join(repoRoot, "skills", "productivity")],
];
const expectedBucketCounts = new Map([
  ["engineering", 17],
  ["productivity", 5],
]);
const checkMode = process.argv.includes("--check");

function fail(message) {
  throw new Error(message);
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function promotedSkills() {
  const result = [];
  const names = new Set();

  for (const [bucket, root] of bucketRoots) {
    const entries = await readdir(root, { withFileTypes: true });
    const skills = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillRoot = join(root, entry.name);
      if (!(await pathExists(join(skillRoot, "SKILL.md")))) continue;
      if (names.has(entry.name)) fail(`promoted skill 名称重复：${entry.name}`);
      names.add(entry.name);
      skills.push({ bucket, name: entry.name, source: skillRoot });
    }
    skills.sort((left, right) => left.name.localeCompare(right.name));
    if (skills.length !== expectedBucketCounts.get(bucket)) {
      fail(`${bucket} 应包含 ${expectedBucketCounts.get(bucket)} 个 skill，实际为 ${skills.length}`);
    }
    result.push(...skills);
  }

  if (result.length !== 22) fail(`promoted skill 总数应为 22，实际为 ${result.length}`);
  return result;
}

function frontmatterParts(content, sourcePath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) fail(`${sourcePath} 缺少合法 YAML frontmatter`);
  return { frontmatter: match[1], body: content.slice(match[0].length) };
}

function frontmatterValue(frontmatter, key, sourcePath) {
  const line = frontmatter.split(/\r?\n/).find((item) => item.startsWith(`${key}:`));
  if (!line) fail(`${sourcePath} 缺少 frontmatter 字段 ${key}`);
  return line.slice(key.length + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
}

function normalizeSkillMarkdown(content, sourcePath, expectedName) {
  const { frontmatter, body } = frontmatterParts(content, sourcePath);
  const name = frontmatterValue(frontmatter, "name", sourcePath);
  const descriptionLine = frontmatter
    .split(/\r?\n/)
    .find((line) => line.startsWith("description:"));
  if (name !== expectedName) fail(`${sourcePath} 的 name=${name} 与目录名 ${expectedName} 不一致`);
  if (!descriptionLine || !descriptionLine.slice("description:".length).trim()) {
    fail(`${sourcePath} 缺少非空 description`);
  }
  return `---\nname: ${name}\n${descriptionLine}\n---\n${body}`;
}

async function validateCanonicalMetadata(skill) {
  const skillPath = join(skill.source, "SKILL.md");
  const content = await readFile(skillPath, "utf8");
  const { frontmatter } = frontmatterParts(content, skillPath);
  const userInvoked = /^disable-model-invocation:\s*true\s*$/m.test(frontmatter);
  const metadataPath = join(skill.source, "agents", "openai.yaml");
  if (!(await pathExists(metadataPath))) fail(`${skill.name} 缺少 agents/openai.yaml`);
  const metadata = await readFile(metadataPath, "utf8");
  if (!/^\s*default_prompt:\s*["'].*\$[^"']+.*["']\s*$/m.test(metadata)) {
    fail(`${skill.name} 的 openai.yaml 缺少引用 $skill 的 default_prompt`);
  }
  const implicitDisabled = /^\s*allow_implicit_invocation:\s*false\s*$/m.test(metadata);
  if (userInvoked !== implicitDisabled) {
    fail(`${skill.name} 的 Claude/Codex 调用策略不一致`);
  }
  return userInvoked;
}

async function validatePlatformNeutralText(skills) {
  const skillNames = skills.map((skill) => skill.name).sort((a, b) => b.length - a.length);
  const slashPattern = new RegExp(`/(?:${skillNames.join("|")})(?![a-z0-9-])`, "i");
  const forbiddenPatterns = [
    [slashPattern, "裸 /skill 调用"],
    [/\bAgent tool\b/i, "Claude Agent tool"],
    [/\bTask tool\b/i, "Claude Task tool"],
    [/subagent_type\s*=|subagent_type:/i, "Claude subagent_type"],
    [/\bCodex sub-?agents?\b/i, "平台专属 Codex 子代理称呼"],
    [/setup-matt-pocock-skills/i, "已退役的 setup skill 名称"],
    [/mattpocock\/skills/i, "已退役的分发品牌名称"],
  ];

  for (const skill of skills) {
    const files = await listFiles(skill.source);
    for (const file of files.filter((path) => path.endsWith(".md"))) {
      const content = await readFile(file, "utf8");
      for (const [pattern, label] of forbiddenPatterns) {
        if (pattern.test(content)) fail(`${relative(repoRoot, file)} 仍包含 ${label}`);
      }
    }
  }
}

async function listFiles(root) {
  const result = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isSymbolicLink()) fail(`插件源中不允许软链接：${relative(repoRoot, path)}`);
    if (entry.isDirectory()) result.push(...(await listFiles(path)));
    else if (entry.isFile()) result.push(path);
  }
  return result.sort();
}

async function buildTo(destination, skills) {
  await mkdir(destination, { recursive: true });
  for (const skill of skills) {
    const target = join(destination, skill.name);
    await cp(skill.source, target, { recursive: true, dereference: true, force: true });
    const targetSkillPath = join(target, "SKILL.md");
    const normalized = normalizeSkillMarkdown(
      await readFile(targetSkillPath, "utf8"),
      targetSkillPath,
      skill.name,
    );
    await writeFile(targetSkillPath, normalized, "utf8");
  }
}

async function fileMap(root) {
  if (!(await pathExists(root))) return new Map();
  const files = await listFiles(root);
  const result = new Map();
  for (const file of files) {
    const key = relative(root, file).split(sep).join("/");
    const hash = createHash("sha256").update(await readFile(file)).digest("hex");
    result.set(key, hash);
  }
  return result;
}

async function compareTrees(expectedRoot, actualRoot) {
  const expected = await fileMap(expectedRoot);
  const actual = await fileMap(actualRoot);
  const keys = [...new Set([...expected.keys(), ...actual.keys()])].sort();
  const differences = keys.filter((key) => expected.get(key) !== actual.get(key));
  if (differences.length) {
    fail(`Codex 插件生成目录存在漂移：\n${differences.map((key) => `- ${key}`).join("\n")}`);
  }
}

async function validateVersions() {
  const packageJson = JSON.parse(await readFile(join(repoRoot, "package.json"), "utf8"));
  const claudeManifest = JSON.parse(
    await readFile(join(repoRoot, ".claude-plugin", "plugin.json"), "utf8"),
  );
  const codexManifest = JSON.parse(
    await readFile(join(pluginRoot, ".codex-plugin", "plugin.json"), "utf8"),
  );
  const versions = new Set([packageJson.version, claudeManifest.version, codexManifest.version]);
  if (versions.size !== 1) {
    fail(
      `版本不一致：package=${packageJson.version}, Claude=${claudeManifest.version}, Codex=${codexManifest.version}`,
    );
  }
}

async function main() {
  const skills = await promotedSkills();
  let userInvokedCount = 0;
  for (const skill of skills) {
    if (await validateCanonicalMetadata(skill)) userInvokedCount += 1;
  }
  if (userInvokedCount !== 13) {
    fail(`user-invoked skill 应为 13 个，实际为 ${userInvokedCount}`);
  }
  await validatePlatformNeutralText(skills);
  await validateVersions();

  if (checkMode) {
    const temporaryRoot = await mkdtemp(join(tmpdir(), "kx-skills-codex-check-"));
    const expectedRoot = join(temporaryRoot, "skills");
    try {
      await buildTo(expectedRoot, skills);
      await compareTrees(expectedRoot, generatedSkillsRoot);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
    console.log("Codex 插件检查通过：22 个 skill，13 个仅显式调用，9 个可隐式调用，生成目录无漂移。");
    return;
  }

  await rm(generatedSkillsRoot, { recursive: true, force: true });
  await buildTo(generatedSkillsRoot, skills);
  console.log(`已生成 ${skills.length} 个 Codex plugin skills：${relative(repoRoot, generatedSkillsRoot)}`);
}

main().catch((error) => {
  console.error(`Codex 插件构建失败：${error.message}`);
  process.exitCode = 1;
});
