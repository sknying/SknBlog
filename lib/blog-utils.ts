import type { Post } from "@/lib/blog-types";
import { sortPostsByColumnOrder, sortPostsByDate } from "@/lib/column-data";

export function getPrimaryTag(post: Pick<Post, "tags">) { return post.tags[0] ?? "未标注"; }
export function getTagLabel(post: Pick<Post, "tags">) { return post.tags.join(" / "); }
export function getPostTimeLabel(post: Pick<Post, "publishedAt" | "date">) {
  const matched = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(post.publishedAt);
  return matched ? `${matched[1]}/${matched[2]}/${matched[3]} ${matched[4]}:${matched[5]}` : post.date;
}

export function getPostNavigation(posts: Post[], currentPost: Post) {
  const sequence = currentPost.column
    ? sortPostsByColumnOrder(posts.filter((post) => post.column === currentPost.column))
    : sortPostsByDate(posts.filter((post) => !post.column));
  const index = sequence.findIndex((post) => post.slug === currentPost.slug);

  return {
    previousPost: index > 0 ? sequence[index - 1] : undefined,
    nextPost: index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : undefined
  };
}
