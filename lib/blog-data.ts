import { readFileSync, readdirSync } from "node:fs";
import { join, parse } from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { ArticleBlock, Post } from "@/lib/blog-types";

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
  summary?: string;
  image?: string;
  mood?: string;
  intro?: string;
  read?: string;
  draft?: boolean;
};

const contentDirectory = join(process.cwd(), "content", "posts");
const processor = remark().use(remarkGfm).use(remarkMath);

function inlineMarkdown(nodes: MdNode[] = []): string {
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
  const withoutSyntax = source.replace(/```[\s\S]*?```|`[^`]*`|!?(\[[^\]]*\]\([^)]*\))/g, " ").replace(/[#>*_~|\\]/g, " ");
  const cjk = withoutSyntax.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const latin = withoutSyntax.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0;
  return cjk + latin;
}

function dateLabel(publishedAt: string) {
  const parts = publishedAt.match(/\d{4}-(\d{2})-(\d{2})/);
  return parts ? `${parts[1]}.${parts[2]}` : "未定";
}

function readPost(fileName: string): Post | null {
  const slug = parse(fileName).name;
  const parsed = matter(readFileSync(join(contentDirectory, fileName), "utf8"));
  const frontmatter = parsed.data as Frontmatter;
  if (frontmatter.draft || !frontmatter.title || !frontmatter.publishedAt) return null;

  const publishedAt = frontmatter.publishedAt instanceof Date
    ? frontmatter.publishedAt.toISOString()
    : String(frontmatter.publishedAt);

  const wordCount = countWords(parsed.content);
  const blocks = parseBlocks(parsed.content);
  const fallbackText = blocks.find((block): block is Extract<ArticleBlock, { type: "paragraph" }> => block.type === "paragraph")?.text ?? "";

  return {
    slug,
    title: frontmatter.title,
    tags: Array.isArray(frontmatter.tags) && frontmatter.tags.length > 0 ? frontmatter.tags.map(String) : ["其他"],
    column: frontmatter.column?.trim() || "随笔",
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
  return readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map(readPost)
    .filter((post): post is Post => Boolean(post))
    .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

export const posts = loadPosts();
export const columns = Array.from(new Set(posts.map((post) => post.column))).sort((left, right) => left.localeCompare(right, "zh-CN"));

export function getPostBySlug(slug: string) { return posts.find((post) => post.slug === slug); }

export type { ArticleBlock, Post } from "@/lib/blog-types";
