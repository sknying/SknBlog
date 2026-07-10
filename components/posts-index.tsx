"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { getPrimaryTag, getTagLabel, type Post } from "@/lib/blog-data";

type ViewMode = "grid" | "list";
type SortMode = "newest" | "oldest" | "tag";

type PostsIndexProps = {
  posts: Post[];
};

const ALL_TAG = "全部";
const CUSTOM_TAG_KEY = "sknblog.customTags";
const LEGACY_CUSTOM_CATEGORY_KEY = "sknblog.customCategories";

function getDateScore(date: string) {
  const [month, day] = date.split(".").map(Number);
  return month * 100 + day;
}

export function PostsIndex({ posts }: PostsIndexProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTag, setSelectedTag] = useState(ALL_TAG);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [customTagInput, setCustomTagInput] = useState("");
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagMessage, setTagMessage] = useState("还没创建标签。");
  const [hasLoadedCustomTags, setHasLoadedCustomTags] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CUSTOM_TAG_KEY) ?? window.localStorage.getItem(LEGACY_CUSTOM_CATEGORY_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setCustomTags(parsed.filter((item): item is string => typeof item === "string"));
        }
      } catch {
        setTagMessage("旧标签坏了。已忽略。");
      }
    }

    setHasLoadedCustomTags(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedCustomTags) {
      return;
    }

    window.localStorage.setItem(CUSTOM_TAG_KEY, JSON.stringify(customTags));
  }, [customTags, hasLoadedCustomTags]);

  const postTags = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.tags))), [posts]);

  const tags = useMemo(() => [ALL_TAG, ...Array.from(new Set([...postTags, ...customTags]))], [customTags, postTags]);

  const visiblePosts = useMemo(() => {
    const filtered = selectedTag === ALL_TAG ? posts : posts.filter((post) => post.tags.includes(selectedTag));

    return [...filtered].sort((left, right) => {
      if (sortMode === "oldest") {
        return getDateScore(left.date) - getDateScore(right.date);
      }

      if (sortMode === "tag") {
        return getPrimaryTag(left).localeCompare(getPrimaryTag(right), "zh-CN") || getDateScore(right.date) - getDateScore(left.date);
      }

      return getDateScore(right.date) - getDateScore(left.date);
    });
  }, [posts, selectedTag, sortMode]);

  function createTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTag = customTagInput.trim().replace(/\s+/g, " ");

    if (!nextTag) {
      setTagMessage("先写个名字。");
      return;
    }

    if (nextTag.length > 16) {
      setTagMessage("名字太长了。");
      return;
    }

    if (tags.includes(nextTag)) {
      setSelectedTag(nextTag);
      setTagMessage("已有这个标签。");
      setCustomTagInput("");
      return;
    }

    setCustomTags((current) => [...current, nextTag]);
    setSelectedTag(nextTag);
    setTagMessage(`已创建 ${nextTag}。`);
    setCustomTagInput("");
  }

  function deleteCustomTag(tag: string) {
    if (!window.confirm(`删除标签 ${tag}？`)) {
      return;
    }

    setCustomTags((current) => current.filter((item) => item !== tag));
    setSelectedTag((current) => (current === tag ? ALL_TAG : current));
    setTagMessage(`已删除 ${tag}。`);
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
        <p>标签能自定义。排序也能换。要找坑，别靠玄学。</p>
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
            <button className={sortMode === "tag" ? "active" : ""} type="button" onClick={() => setSortMode("tag")}>
              按标签
            </button>
          </div>
        </div>

        <div className="archive-control-group archive-tag-control">
          <span>标签</span>
          <div className="tag-chips" aria-label="文章标签">
            {tags.map((item) => {
              const isCustom = customTags.includes(item);

              return (
                <span className={selectedTag === item ? "tag-chip active" : "tag-chip"} key={item}>
                  <button className="tag-chip-filter" type="button" onClick={() => setSelectedTag(item)}>
                    {item}
                  </button>
                  {isCustom ? (
                    <button className="tag-chip-delete" type="button" onClick={() => deleteCustomTag(item)} aria-label={`删除标签 ${item}`}>
                      <Icon icon="solar:trash-bin-minimalistic-linear" aria-hidden="true" />
                    </button>
                  ) : null}
                </span>
              );
            })}
          </div>
          <form className="tag-create" onSubmit={createTag}>
            <label htmlFor="tag-name">创建标签</label>
            <div>
              <input
                id="tag-name"
                type="text"
                maxLength={16}
                value={customTagInput}
                onChange={(event) => setCustomTagInput(event.target.value)}
                placeholder="比如：Rust"
              />
              <button type="submit">
                <Icon icon="solar:add-circle-linear" aria-hidden="true" />
                创建
              </button>
            </div>
            <p role="status">{tagMessage}</p>
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
                  {getTagLabel(post)} / {post.date} / {post.read}
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
            <h2>这个标签还空着。</h2>
            <p>先记着。以后再塞文章。</p>
          </div>
        )}
      </section>
    </main>
  );
}
