#!/usr/bin/env node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rootDirectory = process.cwd();
const postsDirectory = join(rootDirectory, "content", "posts");
const columnsDirectory = join(rootDirectory, "content", "columns");

function printUsage() {
  console.log(`
SknBlog Markdown 创建工具

用法：
  pnpm new:post       创建一篇文章
  pnpm new:column     创建一个专栏
  pnpm new:content -- post|column
`);
}

function getLocalDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const timezone = `${sign}${pad(Math.floor(absoluteOffset / 60))}:${pad(absoluteOffset % 60)}`;

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${timezone}`;
}

function parseFrontmatterValue(source, key) {
  const match = source.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return "";

  const value = match[1].trim();
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }

  return value.replace(/^['"]|['"]$/g, "");
}

function getColumns() {
  if (!existsSync(columnsDirectory)) return [];

  return readdirSync(columnsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const source = readFileSync(join(columnsDirectory, fileName), "utf8");
      return {
        name: parseFrontmatterValue(source, "name"),
        order: Number(parseFrontmatterValue(source, "order")) || 0
      };
    })
    .filter((column) => column.name);
}

function getNextColumnOrder() {
  const largestOrder = Math.max(0, ...getColumns().map((column) => column.order));
  return Math.ceil((largestOrder + 10) / 10) * 10;
}

function requireSafeSlug(value, label) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`${label} 只能使用小写英文、数字和连字符，例如 rust-async-intro。`);
  }
}

function requireYear(value) {
  if (!/^\d{4}$/.test(value)) throw new Error("年份必须是四位数字，例如 2026。");
}

function yamlString(value) {
  return JSON.stringify(value.trim());
}

async function ask(terminal, label, defaultValue = "", required = false) {
  while (true) {
    const suffix = defaultValue ? ` [${defaultValue}]` : "";
    const answer = (await terminal.question(`${label}${suffix}: `)).trim();
    const value = answer || defaultValue;

    if (value || !required) return value;
    console.log("此项不能为空，请重新输入。");
  }
}

function writeNewFile(filePath, source) {
  if (existsSync(filePath)) {
    throw new Error(`文件已存在：${relative(rootDirectory, filePath)}`);
  }

  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, source, { encoding: "utf8", flag: "wx" });
  console.log(`\n已创建：${relative(rootDirectory, filePath)}`);
}

async function createPost(terminal) {
  const now = new Date();
  const title = await ask(terminal, "文章标题", "", true);
  const dateSlug = `post-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const slug = await ask(terminal, "文章 slug", dateSlug, true);
  requireSafeSlug(slug, "文章 slug");

  const year = await ask(terminal, "目录年份", String(now.getFullYear()), true);
  requireYear(year);
  const publishedAt = await ask(terminal, "发布时间", getLocalDateTime(now), true);
  if (!publishedAt.startsWith(`${year}-`)) {
    throw new Error("发布时间的年份必须与目录年份一致。");
  }

  const columns = getColumns();
  if (columns.length > 0) console.log(`可选专栏：${columns.map((column) => column.name).join("、")}`);
  const column = await ask(terminal, "所属专栏（留空表示无专栏）");
  if (column && !columns.some((item) => item.name === column)) {
    throw new Error("所属专栏不存在。请使用上方名称，或先执行 pnpm new:column。");
  }

  const columnOrder = column ? await ask(terminal, "专栏内排序（越小越靠前）", "10", true) : "";
  if (columnOrder && !/^\d+$/.test(columnOrder)) throw new Error("专栏内排序必须是整数。");

  const tagsInput = await ask(terminal, "标签（用逗号分隔）");
  const tags = tagsInput.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean);
  const summary = await ask(terminal, "摘要", "", true);
  const image = await ask(terminal, "封面路径", "/themes/spring/sknblog.jpg", true);
  const mood = await ask(terminal, "文章心情", "写作记录", true);
  const intro = await ask(terminal, "开头引言", summary, true);

  const frontmatter = [
    "---",
    `title: ${yamlString(title)}`,
    `publishedAt: ${yamlString(publishedAt)}`,
    ...(column ? [`column: ${yamlString(column)}`, `columnOrder: ${columnOrder}`] : []),
    `tags: ${JSON.stringify(tags)}`,
    `summary: ${yamlString(summary)}`,
    `image: ${yamlString(image)}`,
    `mood: ${yamlString(mood)}`,
    `intro: ${yamlString(intro)}`,
    "---",
    "",
    "## 开始写作",
    "",
    "在这里开始正文。",
    ""
  ].join("\n");

  writeNewFile(join(postsDirectory, year, `${slug}.md`), frontmatter);
}

async function createColumn(terminal) {
  const name = await ask(terminal, "专栏名称", "", true);
  const slug = await ask(terminal, "专栏 slug", "", true);
  requireSafeSlug(slug, "专栏 slug");
  if (getColumns().some((column) => column.name === name)) throw new Error("专栏名称已存在，请换一个名称。");

  const coverImage = await ask(terminal, "专栏封面路径", "/themes/spring/sknblog.jpg", true);
  const summary = await ask(terminal, "专栏摘要", "", true);
  const intro = await ask(terminal, "专栏介绍", summary, true);
  const mood = await ask(terminal, "专栏签名", "持续整理中。", true);
  const quoteAuthor = await ask(terminal, "签名署名", "Sknying", true);
  const order = await ask(terminal, "展示排序（越小越靠前）", String(getNextColumnOrder()), true);
  if (!/^\d+$/.test(order)) throw new Error("展示排序必须是整数。");

  const frontmatter = [
    "---",
    `name: ${yamlString(name)}`,
    `slug: ${yamlString(slug)}`,
    `coverImage: ${yamlString(coverImage)}`,
    `summary: ${yamlString(summary)}`,
    `intro: ${yamlString(intro)}`,
    `mood: ${yamlString(mood)}`,
    `quoteAuthor: ${yamlString(quoteAuthor)}`,
    `order: ${order}`,
    "---",
    ""
  ].join("\n");

  writeNewFile(join(columnsDirectory, `${slug}.md`), frontmatter);
}

async function main() {
  // pnpm forwards a standalone `--` to Node. Ignore it so both
  // `pnpm new:content -- post` and the direct scripts work the same way.
  const argumentsList = process.argv.slice(2).filter((argument) => argument !== "--");
  const command = argumentsList[0];
  if (!command || argumentsList.includes("--help") || argumentsList.includes("-h")) {
    printUsage();
    return;
  }

  const terminal = createInterface({ input, output });
  try {
    if (command === "post") await createPost(terminal);
    else if (command === "column") await createColumn(terminal);
    else throw new Error(`未知命令：${command}`);
  } finally {
    terminal.close();
  }
}

main().catch((error) => {
  console.error(`\n创建失败：${error.message}`);
  process.exitCode = 1;
});
