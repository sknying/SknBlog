import type { Post } from "@/lib/blog-types";

export function getPrimaryTag(post: Pick<Post, "tags">) { return post.tags[0] ?? "未标注"; }
export function getTagLabel(post: Pick<Post, "tags">) { return post.tags.join(" / "); }
export function getPostTimeLabel(post: Pick<Post, "publishedAt" | "date">) {
  const matched = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(post.publishedAt);
  return matched ? `${matched[1]}/${matched[2]}/${matched[3]} ${matched[4]}:${matched[5]}` : post.date;
}
