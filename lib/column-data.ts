import type { Post } from "@/lib/blog-types";

export type ColumnGroup = {
  slug: string;
  name: string;
  posts: Post[];
  latestPost: Post;
  coverImage: string;
  summary: string;
  intro: string;
  mood: string;
  topTags: string[];
  totalWords: number;
  updatedAt: string;
};

export function sortPostsByDate(items: Post[]) {
  return [...items].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

export function columnNameToSlug(name: string) {
  const normalized = name
    .trim()
    .toLocaleLowerCase("zh-CN")
    .replace(/\s+/g, " ");

  return Array.from(normalized)
    .map((char) => {
      if (/^[a-z0-9]$/.test(char)) return char;
      if (char === " ") return "-";
      return char.codePointAt(0)?.toString(36) ?? "";
    })
    .join("-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "column";
}

function getTopTags(items: Post[]) {
  const counts = new Map<string, number>();
  items.flatMap((post) => post.tags).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));

  return Array.from(counts, ([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag, "zh-CN"))
    .slice(0, 6)
    .map((item) => item.tag);
}

export function getColumnGroups(posts: Post[]): ColumnGroup[] {
  const grouped = new Map<string, Post[]>();

  posts.forEach((post) => {
    if (!post.column) return;
    grouped.set(post.column, [...(grouped.get(post.column) ?? []), post]);
  });

  return Array.from(grouped, ([name, items]) => {
    const orderedPosts = sortPostsByDate(items);
    const latestPost = orderedPosts[0];

    return {
      slug: columnNameToSlug(name),
      name,
      posts: orderedPosts,
      latestPost,
      coverImage: latestPost.image,
      summary: latestPost.summary,
      intro: latestPost.intro,
      mood: latestPost.mood,
      topTags: getTopTags(orderedPosts),
      totalWords: orderedPosts.reduce((total, post) => total + post.wordCount, 0),
      updatedAt: latestPost.publishedAt
    };
  }).sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export function getColumnBySlug(posts: Post[], slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return getColumnGroups(posts).find((group) => group.slug === decodedSlug);
}

export function formatCompactNumber(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}
