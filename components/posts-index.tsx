"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/blog-data";

type ViewMode = "grid" | "list";
type SortMode = "newest" | "oldest" | "category";

type PostsIndexProps = {
  posts: Post[];
};

const CUSTOM_CATEGORY_KEY = "sknblog.customCategories";

function getDateScore(date: string) {
  const [month, day] = date.split(".").map(Number);
  return month * 100 + day;
}

export function PostsIndex({ posts }: PostsIndexProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [category, setCategory] = useState("全部");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [categoryMessage, setCategoryMessage] = useState("还没创建分类。");
  const [hasLoadedCustomCategories, setHasLoadedCustomCategories] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CUSTOM_CATEGORY_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setCustomCategories(parsed.filter((item): item is string => typeof item === "string"));
        }
      } catch {
        setCategoryMessage("旧分类坏了。已忽略。");
      }
    }

    setHasLoadedCustomCategories(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedCustomCategories) {
      return;
    }

    window.localStorage.setItem(CUSTOM_CATEGORY_KEY, JSON.stringify(customCategories));
  }, [customCategories, hasLoadedCustomCategories]);

  const categories = useMemo(
    () => ["全部", ...Array.from(new Set([...posts.map((post) => post.tag), ...customCategories]))],
    [customCategories, posts]
  );

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

  function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextCategory = customCategoryInput.trim().replace(/\s+/g, " ");

    if (!nextCategory) {
      setCategoryMessage("先写个名字。");
      return;
    }

    if (nextCategory.length > 12) {
      setCategoryMessage("名字太长了。");
      return;
    }

    if (categories.includes(nextCategory)) {
      setCategory(nextCategory);
      setCategoryMessage("已有这个分类。");
      setCustomCategoryInput("");
      return;
    }

    setCustomCategories((current) => [...current, nextCategory]);
    setCategory(nextCategory);
    setCategoryMessage(`已创建 ${nextCategory}。`);
    setCustomCategoryInput("");
  }

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
          <form className="category-create" onSubmit={createCategory}>
            <label htmlFor="category-name">创建分类</label>
            <div>
              <input
                id="category-name"
                type="text"
                maxLength={12}
                value={customCategoryInput}
                onChange={(event) => setCustomCategoryInput(event.target.value)}
                placeholder="比如：Rust"
              />
              <button type="submit">
                <Icon icon="solar:add-circle-linear" aria-hidden="true" />
                创建
              </button>
            </div>
            <p role="status">{categoryMessage}</p>
          </form>
        </div>
      </section>

      <section className={`archive-posts ${viewMode}`} aria-live="polite">
        {visiblePosts.length > 0 ? (
          visiblePosts.map((post) => (
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
          ))
        ) : (
          <div className="archive-empty">
            <Icon icon="solar:folder-open-linear" aria-hidden="true" />
            <h2>这个分类还空着。</h2>
            <p>先记着。以后再塞文章。</p>
          </div>
        )}
      </section>
    </main>
  );
}
