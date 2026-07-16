import type { Post } from "@/lib/blog-types";

export type ColumnDefinition = {
  name: string;
  slug?: string;
  coverImage?: string;
  summary?: string;
  intro?: string;
  mood?: string;
  order?: number;
};

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
  order: number;
};

export function sortPostsByDate(items: Post[]) {
  // Copy before sorting because JavaScript's `sort()` mutates its array.
  return [...items].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

export function sortPostsByColumnOrder(items: Post[]) {
  // Manual `columnOrder` is primary inside a column. Articles without it come
  // after ordered articles, then use publish time as a stable fallback.
  return [...items].sort((left, right) => {
    const leftOrder = left.columnOrder;
    const rightOrder = right.columnOrder;

    if (leftOrder !== undefined && rightOrder !== undefined) return leftOrder - rightOrder || Date.parse(left.publishedAt) - Date.parse(right.publishedAt);
    if (leftOrder !== undefined) return -1;
    if (rightOrder !== undefined) return 1;
    return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
  });
}

export function columnNameToSlug(name: string) {
  // A column can be Chinese. Convert non-ASCII characters to a stable URL-safe
  // base-36 form when the column definition does not provide an explicit slug.
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

export function getColumnGroups(posts: Post[], definitions: ColumnDefinition[] = []): ColumnGroup[] {
  const grouped = new Map<string, Post[]>();
  const definitionsByName = new Map(definitions.map((definition) => [definition.name, definition]));

  // A `Map` groups only columns that actually contain at least one article.
  posts.forEach((post) => {
    if (!post.column) return;
    grouped.set(post.column, [...(grouped.get(post.column) ?? []), post]);
  });

  return Array.from(grouped, ([name, items]) => {
    const orderedPosts = sortPostsByColumnOrder(items);
    const latestPost = sortPostsByDate(items)[0];
    const definition = definitionsByName.get(name);

    return {
      slug: definition?.slug || columnNameToSlug(name),
      name,
      posts: orderedPosts,
      latestPost,
      coverImage: definition?.coverImage || latestPost.image,
      summary: definition?.summary || latestPost.summary,
      intro: definition?.intro || latestPost.intro,
      mood: definition?.mood || latestPost.mood,
      topTags: getTopTags(orderedPosts),
      totalWords: orderedPosts.reduce((total, post) => total + post.wordCount, 0),
      updatedAt: latestPost.publishedAt,
      order: definition?.order ?? Number.MAX_SAFE_INTEGER
    };
  }).sort((left, right) => left.order - right.order || Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export function getColumnBySlug(posts: Post[], slug: string, definitions: ColumnDefinition[] = []) {
  const decodedSlug = decodeURIComponent(slug);
  return getColumnGroups(posts, definitions).find((group) => group.slug === decodedSlug);
}

export function formatCompactNumber(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}
