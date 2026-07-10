import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/article-page";
import { getPostBySlug, posts } from "@/lib/blog-data";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章没找到 | SknBlog"
    };
  }

  return {
    title: `${post.title} | SknBlog`,
    description: post.summary
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const index = posts.findIndex((item) => item.slug === post.slug);

  return <ArticlePage post={post} previousPost={posts[index - 1]} nextPost={posts[index + 1]} />;
}
