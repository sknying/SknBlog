import type { Metadata } from "next";
import { Suspense } from "react";
import { PostsIndex } from "@/components/posts-index";
import { posts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "文章归档 | SknBlog",
  description: "按年份、月份和标签浏览 SknBlog 的技术文章。"
};

export default function PostsPage() {
  return (
    <Suspense fallback={null}>
      <PostsIndex posts={posts} />
    </Suspense>
  );
}
