"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import type { FormEvent, KeyboardEvent } from "react";
import { useMemo, useState } from "react";
import { getPostTimeLabel, type Post } from "@/lib/blog-data";
import { DEFAULT_TAG, usePostTagState } from "@/lib/tag-state";

type ViewMode = "grid" | "list";
type SortMode = "newest" | "oldest";
type ControlPanel = "layout" | "sort" | "tags";

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

  return "新到旧";
}

function matchesPost(post: Post, title: string, tags: string[]) {
  const normalizedTitle = title.toLowerCase();
  const matchesTags = tags.length === 0 || tags.every((tag) => post.tags.includes(tag));
  const matchesTitle = !normalizedTitle || post.title.toLowerCase().includes(normalizedTitle);

  return matchesTags && matchesTitle;
}

export function PostsIndex({ posts, initialTag }: PostsIndexProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [committedTitle, setCommittedTitle] = useState("");
  const [committedTags, setCommittedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [openPanels, setOpenPanels] = useState<ControlPanel[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tagMessage, setTagMessage] = useState("还没创建标签。");
  const [searchNotice, setSearchNotice] = useState("");
  const { addTag, deleteTags, posts: taggedPosts, tags: editableTags } = usePostTagState(posts);

  const tags = useMemo(() => [ALL_TAG, ...editableTags], [editableTags]);

  const visiblePosts = useMemo(() => {
    const filtered = taggedPosts.filter((post) => matchesPost(post, committedTitle, committedTags));

    return [...filtered].sort((left, right) => {
      if (sortMode === "oldest") {
        return getDateScore(left.date) - getDateScore(right.date);
      }

      return getDateScore(right.date) - getDateScore(left.date);
    });
  }, [committedTags, committedTitle, sortMode, taggedPosts]);

  const hasCommittedSearch = committedTitle.trim().length > 0 || committedTags.length > 0;

  function isPanelOpen(panel: ControlPanel) {
    return openPanels.includes(panel);
  }

  function togglePanel(panel: ControlPanel) {
    setOpenPanels((current) => (current.includes(panel) ? [] : [panel]));
  }

  function closePanels() {
    setOpenPanels([]);
  }

  function toggleTag(tag: string) {
    if (tag === ALL_TAG) {
      setDraftTags([]);
      closePanels();
      return;
    }

    setDraftTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
    closePanels();
  }

  function selectViewMode(mode: ViewMode) {
    setViewMode(mode);
    closePanels();
  }

  function selectSortMode(mode: SortMode) {
    setSortMode(mode);
    closePanels();
  }

  function removeDraftTag(tag: string) {
    setDraftTags((current) => current.filter((item) => item !== tag));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTitle = draftTitle.trim();
    const nextTags = [...draftTags];
    const resultCount = taggedPosts.filter((post) => matchesPost(post, nextTitle, nextTags)).length;

    setCommittedTitle(nextTitle);
    setCommittedTags(nextTags);
    setSearchNotice(resultCount === 0 ? "×未查到文章" : "");
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Backspace" || draftTitle.length > 0 || draftTags.length === 0) {
      return;
    }

    event.preventDefault();
    setDraftTags((current) => current.slice(0, -1));
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
      setDraftTags((current) => (current.includes(nextTag) ? current : [...current, nextTag]));
      setTagMessage("已有这个标签。");
      setCustomTagInput("");
      closePanels();
      return;
    }

    addTag(nextTag);
    setDraftTags((current) => [...current, nextTag]);
    setTagMessage(`已创建 ${nextTag}。`);
    setCustomTagInput("");
    closePanels();
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
    setDraftTags((current) => current.filter((item) => item !== tag));
    setCommittedTags((current) => current.filter((item) => item !== tag));
    setTagMessage(`已删除 ${tag}。`);
    closePanels();
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
            <small>{draftTags.length > 0 ? `已选 ${draftTags.length}` : `${editableTags.length} 个`}</small>
            <Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" />
          </button>
          {isPanelOpen("tags") ? (
            <div className="archive-control-panel" id="archive-tags-panel">
              <div className="tag-chips" aria-label="文章标签">
                {tags.map((item) => {
                  const isSelected = item === ALL_TAG ? draftTags.length === 0 : draftTags.includes(item);
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
                <button className={viewMode === "grid" ? "active" : ""} type="button" onClick={() => selectViewMode("grid")}>
                  <Icon icon="solar:widget-4-linear" aria-hidden="true" />
                  平铺
                </button>
                <button className={viewMode === "list" ? "active" : ""} type="button" onClick={() => selectViewMode("list")}>
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
                <button className={sortMode === "newest" ? "active" : ""} type="button" onClick={() => selectSortMode("newest")}>
                  新到旧
                </button>
                <button className={sortMode === "oldest" ? "active" : ""} type="button" onClick={() => selectSortMode("oldest")}>
                  旧到新
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="archive-control-group archive-search-control">
          <form className="archive-search-form" onSubmit={submitSearch} aria-label="搜索文章">
            <div className="archive-search-box">
              {draftTags.map((tag) => (
                <span className="search-tag-chip" key={tag}>
                  {tag}
                  <button type="button" onClick={() => removeDraftTag(tag)} aria-label={`取消标签 ${tag}`}>
                    <Icon icon="solar:close-circle-linear" aria-hidden="true" />
                  </button>
                </span>
              ))}
              <input
                id="archive-search"
                type="search"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={draftTags.length > 0 ? "继续输入标题" : "输入标题，或点标签"}
                aria-label="按标题搜索文章"
              />
            </div>
            <button className="archive-search-submit" type="submit">
              <Icon icon="solar:check-circle-linear" aria-hidden="true" />
              确认
            </button>
          </form>
        </div>
      </section>

      {searchNotice ? (
        <div className="archive-message" role="status" aria-live="polite">
          <span aria-hidden="true">×</span>
          未查到文章
        </div>
      ) : null}

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
            <h2>{hasCommittedSearch ? "没搜到。" : "这个标签还空着。"}</h2>
            <p>{hasCommittedSearch ? "换个词再试。" : "先记着。以后再塞文章。"}</p>
          </div>
        )}
      </section>
    </main>
  );
}
