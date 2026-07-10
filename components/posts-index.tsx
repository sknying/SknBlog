"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { getPostTimeLabel, getPrimaryTag, type Post } from "@/lib/blog-data";
import { DEFAULT_TAG, usePostTagState } from "@/lib/tag-state";

type ViewMode = "grid" | "list";
type SortMode = "newest" | "oldest" | "tag";
type ControlPanel = "search" | "layout" | "sort" | "tags";

type PostsIndexProps = {
  posts: Post[];
  initialTag?: string;
};

const ALL_TAG = "全部";

function getDateScore(date: string) {
  const [month, day] = date.split(".").map(Number);
  return month * 100 + day;
}

function getSortLabel(sortMode: SortMode) {
  if (sortMode === "oldest") {
    return "旧到新";
  }

  if (sortMode === "tag") {
    return "按标签";
  }

  return "新到旧";
}

function parseSearchQuery(query: string) {
  const tags: string[] = [];
  const tagPattern = /(?:^|\s)(?:#|tag:)(?:"([^"]+)"|(\S+))/g;
  const title = query
    .replace(tagPattern, (_match, quotedTag: string | undefined, plainTag: string | undefined) => {
      const tag = (quotedTag ?? plainTag ?? "").trim();

      if (tag) {
        tags.push(tag);
      }

      return " ";
    })
    .replace(/\s+/g, " ")
    .trim();

  return { title, tags: Array.from(new Set(tags)) };
}

export function PostsIndex({ posts, initialTag }: PostsIndexProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [openPanels, setOpenPanels] = useState<ControlPanel[]>(["search"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tagMessage, setTagMessage] = useState("还没创建标签。");
  const { addTag, deleteTags, posts: taggedPosts, tags: editableTags } = usePostTagState(posts);

  const tags = useMemo(() => [ALL_TAG, ...editableTags], [editableTags]);

  const selectedEditableTags = useMemo(
    () => selectedTags.filter((tag) => editableTags.includes(tag) && tag !== DEFAULT_TAG),
    [editableTags, selectedTags]
  );

  const parsedSearch = useMemo(() => parseSearchQuery(searchQuery), [searchQuery]);

  const activeFilterTags = useMemo(
    () => Array.from(new Set([...selectedTags, ...parsedSearch.tags])),
    [parsedSearch.tags, selectedTags]
  );

  const visiblePosts = useMemo(() => {
    const normalizedTitle = parsedSearch.title.toLowerCase();
    const filtered = taggedPosts.filter((post) => {
      const matchesTags = activeFilterTags.length === 0 || activeFilterTags.every((tag) => post.tags.includes(tag));
      const matchesTitle = !normalizedTitle || post.title.toLowerCase().includes(normalizedTitle);

      return matchesTags && matchesTitle;
    });

    return [...filtered].sort((left, right) => {
      if (sortMode === "oldest") {
        return getDateScore(left.date) - getDateScore(right.date);
      }

      if (sortMode === "tag") {
        return getPrimaryTag(left).localeCompare(getPrimaryTag(right), "zh-CN") || getDateScore(right.date) - getDateScore(left.date);
      }

      return getDateScore(right.date) - getDateScore(left.date);
    });
  }, [activeFilterTags, parsedSearch.title, sortMode, taggedPosts]);

  function isPanelOpen(panel: ControlPanel) {
    return openPanels.includes(panel);
  }

  function togglePanel(panel: ControlPanel) {
    setOpenPanels((current) => (current.includes(panel) ? current.filter((item) => item !== panel) : [...current, panel]));
  }

  function toggleTag(tag: string) {
    if (tag === ALL_TAG) {
      setSelectedTags([]);
      return;
    }

    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  }

  function removeSelectedTag(tag: string) {
    setSelectedTags((current) => current.filter((item) => item !== tag));
  }

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
      setSelectedTags((current) => (current.includes(nextTag) ? current : [...current, nextTag]));
      setTagMessage("已有这个标签。");
      setCustomTagInput("");
      return;
    }

    addTag(nextTag);
    setSelectedTags((current) => [...current, nextTag]);
    setTagMessage(`已创建 ${nextTag}。`);
    setCustomTagInput("");
  }

  function deleteTag(tag: string) {
    if (tag === DEFAULT_TAG) {
      setTagMessage("其他标签别删。它兜底用。");
      return;
    }

    if (!window.confirm(`删除标签 ${tag}？会从文章里移除。`)) {
      return;
    }

    deleteTags([tag]);
    setSelectedTags((current) => current.filter((item) => item !== tag));
    setTagMessage(`已删除 ${tag}。`);
  }

  function deleteSelectedTags() {
    if (selectedEditableTags.length === 0) {
      setTagMessage("先选标签。");
      return;
    }

    if (!window.confirm(`删除 ${selectedEditableTags.length} 个标签？会从文章里移除。`)) {
      return;
    }

    deleteTags(selectedEditableTags);
    setSelectedTags((current) => current.filter((tag) => !selectedEditableTags.includes(tag)));
    setTagMessage(`已删除 ${selectedEditableTags.length} 个标签。`);
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
        <div className={isPanelOpen("search") ? "archive-control-group archive-search-control expanded" : "archive-control-group archive-search-control"}>
          <button
            className="archive-control-toggle"
            type="button"
            onClick={() => togglePanel("search")}
            aria-expanded={isPanelOpen("search")}
            aria-controls="archive-search-panel"
          >
            <span>
              <Icon icon="solar:magnifer-linear" aria-hidden="true" />
              搜索
            </span>
            <small>{searchQuery || "标题 / #标签"}</small>
            <Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" />
          </button>
          {isPanelOpen("search") ? (
            <div className="archive-control-panel" id="archive-search-panel">
              <label htmlFor="archive-search">标题搜索</label>
              {selectedTags.length > 0 ? (
                <div className="search-tag-chips" aria-label="已选搜索标签">
                  {selectedTags.map((tag) => (
                    <span className="search-tag-chip" key={tag}>
                      {tag}
                      <button type="button" onClick={() => removeSelectedTag(tag)} aria-label={`取消标签 ${tag}`}>
                        <Icon icon="solar:close-circle-linear" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="archive-search-box">
                <input
                  id="archive-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder='比如：缓存 #Next.js 或 tag:"Glass UI"'
                />
                <button type="button" onClick={() => setSearchQuery("")} disabled={!searchQuery}>
                  <Icon icon="solar:close-circle-linear" aria-hidden="true" />
                  清空
                </button>
              </div>
              <p>普通文字搜标题。#标签 或 tag:"标签名" 指定标签。</p>
            </div>
          ) : null}
        </div>

        <div className={isPanelOpen("layout") ? "archive-control-group archive-layout-control expanded" : "archive-control-group archive-layout-control"}>
          <button
            className="archive-control-toggle"
            type="button"
            onClick={() => togglePanel("layout")}
            aria-expanded={isPanelOpen("layout")}
            aria-controls="archive-layout-panel"
          >
            <span>
              <Icon icon="solar:widget-4-linear" aria-hidden="true" />
              布局
            </span>
            <small>{viewMode === "grid" ? "平铺" : "列表"}</small>
            <Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" />
          </button>
          {isPanelOpen("layout") ? (
            <div className="archive-control-panel" id="archive-layout-panel">
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
          ) : null}
        </div>

        <div className={isPanelOpen("sort") ? "archive-control-group archive-sort-control expanded" : "archive-control-group archive-sort-control"}>
          <button
            className="archive-control-toggle"
            type="button"
            onClick={() => togglePanel("sort")}
            aria-expanded={isPanelOpen("sort")}
            aria-controls="archive-sort-panel"
          >
            <span>
              <Icon icon="solar:sort-linear" aria-hidden="true" />
              排序
            </span>
            <small>{getSortLabel(sortMode)}</small>
            <Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" />
          </button>
          {isPanelOpen("sort") ? (
            <div className="archive-control-panel" id="archive-sort-panel">
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
          ) : null}
        </div>

        <div className={isPanelOpen("tags") ? "archive-control-group archive-tag-control expanded" : "archive-control-group archive-tag-control"}>
          <button
            className="archive-control-toggle"
            type="button"
            onClick={() => togglePanel("tags")}
            aria-expanded={isPanelOpen("tags")}
            aria-controls="archive-tags-panel"
          >
            <span>
              <Icon icon="solar:tag-linear" aria-hidden="true" />
              标签
            </span>
            <small>{selectedTags.length > 0 ? `已选 ${selectedTags.length}` : `${editableTags.length} 个`}</small>
            <Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" />
          </button>
          {isPanelOpen("tags") ? (
            <div className="archive-control-panel" id="archive-tags-panel">
              <div className="tag-chips" aria-label="文章标签">
                {tags.map((item) => {
                  const isSelected = item === ALL_TAG ? selectedTags.length === 0 : selectedTags.includes(item);
                  const canDelete = item !== ALL_TAG && item !== DEFAULT_TAG;

                  return (
                    <span className={isSelected ? "tag-chip active" : "tag-chip"} key={item}>
                      <button className="tag-chip-filter" type="button" onClick={() => toggleTag(item)} aria-pressed={isSelected}>
                        {item}
                      </button>
                      {canDelete ? (
                        <button className="tag-chip-delete" type="button" onClick={() => deleteTag(item)} aria-label={`删除标签 ${item}`}>
                          <Icon icon="solar:trash-bin-minimalistic-linear" aria-hidden="true" />
                        </button>
                      ) : null}
                    </span>
                  );
                })}
              </div>
              <div className="tag-bulk-actions">
                <span>已选标签 {selectedEditableTags.length}</span>
                <button type="button" onClick={deleteSelectedTags} disabled={selectedEditableTags.length === 0}>
                  <Icon icon="solar:trash-bin-trash-linear" aria-hidden="true" />
                  删除已选
                </button>
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
          ) : null}
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
                <span className="archive-card-time">{getPostTimeLabel(post)}</span>
                <h2>{post.title}</h2>
                <div className="archive-card-tags" aria-label="文章标签">
                  {post.tags.map((tag) => (
                    <span className="article-tag-pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
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
