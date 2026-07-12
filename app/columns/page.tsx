import type { Metadata } from "next";
import { Suspense } from "react";
import { ColumnsIndex } from "@/components/columns-index";
import { posts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "专栏小屋 | SknBlog",
  description: "按专栏阅读 SknBlog 的系列文章。"
};

export default function ColumnsPage() {
  return <Suspense fallback={null}><ColumnsIndex posts={posts} /></Suspense>;
}
