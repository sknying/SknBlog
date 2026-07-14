import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/search-results";
import { posts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "搜索文章 | SknBlog",
  description: "搜索 SknBlog 的文章、标签与专栏。"
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResults posts={posts} />
    </Suspense>
  );
}
