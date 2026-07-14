import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ColumnDetail } from "@/components/column-detail";
import { columnDefinitions, posts } from "@/lib/blog-data";
import { getColumnBySlug, getColumnGroups } from "@/lib/column-data";

type ColumnPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getColumnGroups(posts, columnDefinitions).map((column) => ({ slug: column.slug }));
}

export async function generateMetadata({ params }: ColumnPageProps): Promise<Metadata> {
  const { slug } = await params;
  const column = getColumnBySlug(posts, slug, columnDefinitions);

  if (!column) return {};

  return {
    title: `${column.name} | 专栏小屋 | SknBlog`,
    description: column.summary,
    openGraph: {
      title: `${column.name} | SknBlog`,
      description: column.summary,
      images: [column.coverImage]
    }
  };
}

export default async function ColumnPage({ params }: ColumnPageProps) {
  const { slug } = await params;
  const column = getColumnBySlug(posts, slug, columnDefinitions);

  if (!column) notFound();

  return <ColumnDetail column={column} columns={getColumnGroups(posts, columnDefinitions)} posts={posts} />;
}
