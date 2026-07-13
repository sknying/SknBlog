import type { Metadata } from "next";
import { Suspense } from "react";
import { TagsIndex } from "@/components/tags-index";
import { posts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "标签 | SknBlog",
  description: "按标签浏览 SknBlog 的文章。"
};

export default function TagsPage() {
  return (
    <Suspense fallback={null}>
      <TagsIndex posts={posts} />
    </Suspense>
  );
}
