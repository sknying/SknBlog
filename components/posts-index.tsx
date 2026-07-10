"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import type { Post } from "@/lib/blog-data";

type ViewMode = "grid" | "list";
type SortMode = "newest" | "oldest" | "category";

type PostsIndexProps = {
  posts: Post[];
};

function getDateScore(date: string) {
  const [month, day] = date.split(".").map(Number);
  return month * 100 + day;
}

export function PostsIndex({ posts }: PostsIndexProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [category, setCategory] = useState("全部");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  const categories = useMemo(() => ["全部", ...Array.from(new Set(posts.map((post) => post.tag)))], [posts]);

  const visiblePosts = useMemo(() => {
    const filtered = category === "全部" ? posts : posts.filter((post) => post.tag === category);

    return [...filtered].sort((left, right) => {
      if (sortMode === "oldest") {
        return getDateScore(left.date) - getDateScore(right.date);
      }

      if (sortMode === "category") {
        return left.tag.localeCompare(right.tag, "zh-CN") || getDateScore(right.date) - getDateScore(left.date);
      }

      return getDateScore(right.date) - getDateScore(left.date);
    });
  }, [category, posts, sortMode]);

  return (
    <main className="archive-shell">
      <div className="noise" aria-hidden="true" />
      <div className="meteor-field" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <header className="article-topbar">
        <Link className="brand" href="/" aria-label="回到首页">
          <span className="brand-mark">S</span>
          <span>SknBlog</span>
        </Link>
        <Link className="article-back" href="/">
          <Icon icon="solar:arrow-left-linear" aria-hidden="true" />
          回首页
        </Link>
      </header>

      <section className="archive-hero">
        <div>
          <span className="article-kicker">文章仓库 / {posts.length} 篇</span>
          <h1>别乱翻。先筛一下。</h1>
        </div>
        <p>分类能自定义。排序也能换。要找坑，别靠玄学。</p>
      </section>

      <section className="archive-controls" aria-label="文章筛选与排序">
        <div className="archive-control-group">
          <span>布局</span>
          <div className="segmented-control">
            <button className={viewMode === "grid" ? "active" : ""} type="button" onClick={() => setViewMode("grid")}>
              <Icon icon="solar:widget-4-linear" aria-hidden="true" />
              平铺
            </button>
            <button className={viewMode === "list" ? "active" : ""} type="button" onClick={() => setViewMode("list")}>
              <Icon icon="solar:list-linear" aria-hidden="true" />
              列表
            </button>
          </div>
        </div>

        <div className="archive-control-group">
          <span>排序</span>
          <div className="segmented-control">
            <button className={sortMode === "newest" ? "active" : ""} type="button" onClick={() => setSortMode("newest")}>
              新到旧
            </button>
            <button className={sortMode === "oldest" ? "active" : ""} type="button" onClick={() => setSortMode("oldest")}>
              旧到新
            </button>
            <button className={sortMode === "category" ? "active" : ""} type="button" onClick={() => setSortMode("category")}>
              按类别
            </button>
          </div>
        </div>

        <div className="archive-control-group archive-category-control">
          <span>分类</span>
          <div className="category-chips" aria-label="自定义分类">
            {categories.map((item) => (
              <button key={item} className={category === item ? "active" : ""} type="button" onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={`archive-posts ${viewMode}`} aria-live="polite">
        {visiblePosts.map((post) => (
          <article className="archive-card" key={post.slug}>
            <div className="archive-card-mark" aria-hidden="true">
              <Icon icon="solar:document-text-linear" />
            </div>
            <div className="archive-card-main">
              <span>
                {post.tag} / {post.date} / {post.read}
              </span>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
            </div>
            <Link href={`/posts/${post.slug}`} aria-label={`阅读 ${post.title}`}>
              <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
