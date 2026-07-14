import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/article-page";
import { columnDefinitions, getPostBySlug, posts } from "@/lib/blog-data";
import { getColumnGroups } from "@/lib/column-data";
import { getPostNavigation, getPrimaryTag } from "@/lib/blog-utils";

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

  const { previousPost, nextPost } = getPostNavigation(posts, post);
  const column = post.column
    ? getColumnGroups(posts, columnDefinitions).find((item) => item.name === post.column)
    : undefined;
  const primaryContext = column
    ? { label: column.name, href: `/columns/${column.slug}` }
    : { label: getPrimaryTag(post), href: `/tags?tag=${encodeURIComponent(getPrimaryTag(post))}` };

  return <ArticlePage post={post} posts={posts} previousPost={previousPost} nextPost={nextPost} primaryContext={primaryContext} />;
}
