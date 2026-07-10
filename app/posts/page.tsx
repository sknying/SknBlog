import type { Metadata } from "next";
import { PostsIndex } from "@/components/posts-index";
import { posts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "文章列表 | SknBlog",
  description: "按布局、标签和时间排序浏览 SknBlog 的技术文章。"
};

type PostsPageProps = {
  searchParams?: Promise<{
    tag?: string | string[];
  }>;
};

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = searchParams ? await searchParams : {};
  const initialTag = Array.isArray(params.tag) ? params.tag[0] : params.tag;

  return <PostsIndex posts={posts} initialTag={initialTag} />;
}
