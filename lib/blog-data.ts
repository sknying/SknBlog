import { readFileSync, readdirSync } from "node:fs";
import { join, parse } from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { ArticleBlock, Post } from "@/lib/blog-types";
import type { ColumnDefinition } from "@/lib/column-data";

type MdNode = {
  type: string;
  value?: string;
  url?: string;
  alt?: string | null;
  lang?: string | null;
  meta?: string | null;
  depth?: number;
  ordered?: boolean;
  children?: MdNode[];
};

type Frontmatter = {
  title?: string;
  publishedAt?: string | Date;
  tags?: string[];
  column?: string;
  columnOrder?: number;
  summary?: string;
  image?: string;
  mood?: string;
  intro?: string;
  read?: string;
  draft?: boolean;
};

// This module runs during static generation. Node's `fs` API is safe here,
// but this file must never be imported into a Client Component.
const contentDirectory = join(process.cwd(), "content", "posts");
const columnsDirectory = join(process.cwd(), "content", "columns");
const processor = remark().use(remarkGfm).use(remarkMath);

function inlineMarkdown(nodes: MdNode[] = []): string {
  // The page renderer consumes explicit article blocks, not raw HTML. Rebuild
  // inline Markdown so links, emphasis, and math survive the conversion.
  return nodes.map((node) => {
    const value = node.value ?? "";
    const children = inlineMarkdown(node.children);

    if (node.type === "inlineCode") return `\`${value}\``;
    if (node.type === "link") return `[${children}](${node.url ?? ""})`;
    if (node.type === "strong") return `**${children}**`;
    if (node.type === "emphasis") return `*${children}*`;
    if (node.type === "delete") return `~~${children}~~`;
    if (node.type === "inlineMath") return `$${value}$`;
    if (node.type === "break") return "\n";
    return value || children;
  }).join("");
}

function paragraphText(node: MdNode) {
  return inlineMarkdown(node.children).trim();
}

function parseBlocks(source: string): ArticleBlock[] {
  // remark parses Markdown into an abstract syntax tree (AST). `flatMap`
  // converts each top-level AST node into zero or more display blocks.
  const tree = processor.parse(source) as unknown as { children: MdNode[] };

  return tree.children.flatMap((node): ArticleBlock[] => {
    if (node.type === "heading") {
      const level = Math.min(Math.max(node.depth ?? 2, 2), 4) as 2 | 3 | 4;
      return [{ type: "heading", text: paragraphText(node), level }];
    }

    if (node.type === "paragraph") {
      const image = node.children?.find((child) => child.type === "image");
      if (image) return [{ type: "image", src: image.url ?? "", alt: image.alt ?? "", caption: paragraphText(node).replace(/^!\[[^\]]*\]\([^)]*\)\s*/, "") || undefined }];
      return [{ type: "paragraph", text: paragraphText(node) }];
    }

    if (node.type === "blockquote") {
      const lines = (node.children ?? []).map(paragraphText).filter(Boolean);
      return [{ type: "quote", text: lines.join("\n") }];
    }

    if (node.type === "code") {
      return [{ type: "code", title: node.meta || node.lang || "代码", language: node.lang || undefined, code: node.value ?? "" }];
    }

    if (node.type === "list") {
      const items = (node.children ?? []).map((item) => inlineMarkdown(item.children?.flatMap((child) => child.children ?? [child]))).filter(Boolean);
      return [{ type: "list", items, ordered: Boolean(node.ordered) }];
    }

    if (node.type === "table") {
      const rows = (node.children ?? []).map((row) => (row.children ?? []).map(paragraphText));
      const [headers = [], ...body] = rows;
      return [{ type: "table", headers, rows: body }];
    }

    if (node.type === "math") return [{ type: "math", formula: node.value ?? "" }];
    return [];
  });
}

function countWords(source: string) {
  // CJK text normally has no spaces, so count Han characters and Latin words
  // separately. Markdown syntax and fenced code are removed first.
  const withoutSyntax = source.replace(/```[\s\S]*?```|`[^`]*`|!?(\[[^\]]*\]\([^)]*\))/g, " ").replace(/[#>*_~|\\]/g, " ");
  const cjk = withoutSyntax.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latin = withoutSyntax.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0;
  return cjk + latin;
}

function dateLabel(publishedAt: string) {
  const parts = publishedAt.match(/\d{4}-(\d{2})-(\d{2})/);
  return parts ? `${parts[1]}.${parts[2]}` : "未定";
}

function getMarkdownFiles(directory = contentDirectory, relativeDirectory = ""): string[] {
  // Recursion keeps content organized as `posts/YYYY/*.md` without changing
  // the loader whenever a new year folder is added.
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = join(relativeDirectory, entry.name);

    if (entry.isDirectory()) return getMarkdownFiles(join(directory, entry.name), relativePath);
    return entry.isFile() && entry.name.endsWith(".md") ? [relativePath] : [];
  });
}

function readPost(fileName: string): Post | null {
  const slug = parse(fileName).name;
  const parsed = matter(readFileSync(join(contentDirectory, fileName), "utf8"));
  const frontmatter = parsed.data as Frontmatter;
  // Drafts and incomplete files remain on disk but do not enter static pages.
  if (frontmatter.draft || !frontmatter.title || !frontmatter.publishedAt) return null;

  const publishedAt = frontmatter.publishedAt instanceof Date
    ? frontmatter.publishedAt.toISOString()
    : String(frontmatter.publishedAt);
  const folderYear = fileName.split(/[\\/]/)[0];

  // Fail the build early instead of silently putting an article in a wrong year.
  if (/^\d{4}$/.test(folderYear) && !publishedAt.startsWith(`${folderYear}-`)) {
    throw new Error(`文章 ${fileName} 的目录年份与 publishedAt 不一致。`);
  }

  const wordCount = countWords(parsed.content);
  const blocks = parseBlocks(parsed.content);
  const fallbackText = blocks.find((block): block is Extract<ArticleBlock, { type: "paragraph" }> => block.type === "paragraph")?.text ?? "";

  return {
    slug,
    title: frontmatter.title,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : [],
    column: frontmatter.column?.trim() || undefined,
    columnOrder: typeof frontmatter.columnOrder === "number" && Number.isFinite(frontmatter.columnOrder)
      ? frontmatter.columnOrder
      : undefined,
    publishedAt,
    date: dateLabel(publishedAt),
    read: frontmatter.read?.trim() || `${Math.max(1, Math.ceil(wordCount / 350))} 分钟`,
    wordCount,
    summary: frontmatter.summary?.trim() || fallbackText.slice(0, 72),
    image: frontmatter.image?.trim() || "/images/sakura-coast-hero.png",
    mood: frontmatter.mood?.trim() || "写作记录",
    intro: frontmatter.intro?.trim() || fallbackText.slice(0, 72),
    blocks
  };
}

function loadPosts() {
  const loadedPosts = getMarkdownFiles()
    .map(readPost)
    .filter((post): post is Post => Boolean(post));
  // Slugs become `/posts/<slug>` paths. Duplicates would create ambiguous
  // static routes, so detect them before Next.js renders pages.
  const duplicateSlug = loadedPosts.find((post, index) => loadedPosts.findIndex((item) => item.slug === post.slug) !== index);

  if (duplicateSlug) {
    throw new Error(`文章 slug 重复：${duplicateSlug.slug}`);
  }

  return loadedPosts.sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

function loadColumnDefinitions(): ColumnDefinition[] {
  return readdirSync(columnsDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => matter(readFileSync(join(columnsDirectory, fileName), "utf8")).data as Partial<ColumnDefinition>)
    .filter((definition): definition is ColumnDefinition => Boolean(definition.name))
    .map((definition) => ({
      name: definition.name.trim(),
      slug: definition.slug?.trim() || undefined,
      coverImage: definition.coverImage?.trim() || undefined,
      summary: definition.summary?.trim() || undefined,
      intro: definition.intro?.trim() || undefined,
      mood: definition.mood?.trim() || undefined,
      order: typeof definition.order === "number" ? definition.order : undefined
    }));
}

// These values are calculated once per build and reused by every page.
export const posts = loadPosts();
export const columnDefinitions = loadColumnDefinitions();
export const columns = Array.from(new Set(posts.flatMap((post) => post.column ? [post.column] : []))).sort((left, right) => left.localeCompare(right, "zh-CN"));

export function getPostBySlug(slug: string) { return posts.find((post) => post.slug === slug); }

export type { ArticleBlock, Post } from "@/lib/blog-types";
