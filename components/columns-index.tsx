"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Post } from "@/lib/blog-types";
import { getPostTimeLabel, getPrimaryTag } from "@/lib/blog-utils";

type SortMode = "latest" | "articles";
type ColumnGroup = { name: string; posts: Post[] };

function sortPosts(items: Post[]) {
  return [...items].sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

function groupPosts(posts: Post[]) {
  const groups = new Map<string, Post[]>();
  posts.forEach((post) => {
    if (!post.column) return;
    groups.set(post.column, [...(groups.get(post.column) ?? []), post]);
  });
  return Array.from(groups, ([name, items]) => ({ name, posts: sortPosts(items) }));
}

function formatCount(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

function ColumnCover({ post }: { post: Post }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="columns-cover-fallback"><Icon icon="solar:gallery-wide-linear" aria-hidden="true" /></span>;
  return <Image src={post.image} alt={`${post.title} 封面`} fill sizes="(max-width: 760px) 88vw, 220px" unoptimized onError={() => setFailed(true)} />;
}

function ColumnCard({ group }: { group: ColumnGroup }) {
  const latest = group.posts[0];
  if (!latest) return null;

  return (
    <article className="columns-card">
      <Link className="columns-card-cover" href={`/posts/${latest.slug}`} aria-label={`阅读 ${group.name} 最新文章`}><ColumnCover post={latest} /></Link>
      <div className="columns-card-copy"><h3>{group.name}</h3><p>{latest.summary}</p><span>{getPrimaryTag(latest)}</span></div>
      <footer><b>{group.posts.length} 篇文章</b><time dateTime={latest.publishedAt}>{getPostTimeLabel(latest).slice(0, 10)} 更新</time></footer>
      <Link className="columns-card-link" href={`/columns?column=${encodeURIComponent(group.name)}`}>查看专栏<Icon icon="solar:arrow-right-linear" aria-hidden="true" /></Link>
    </article>
  );
}

function ColumnArticle({ post }: { post: Post }) {
  return (
    <article className="columns-article-row">
      <Link className="columns-article-cover" href={`/posts/${post.slug}`} aria-label={`阅读 ${post.title}`}><ColumnCover post={post} /></Link>
      <div className="columns-article-copy">
        <div><time dateTime={post.publishedAt}>{getPostTimeLabel(post)}</time><span>{post.column ?? "未加入专栏"}</span></div>
        <h3><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
        <p>{post.summary}</p>
        <footer><span>{post.tags.slice(0, 2).join(" · ") || "未标注"}</span><span><Icon icon="solar:text-linear" aria-hidden="true" />{formatCount(post.wordCount)} 字</span><span><Icon icon="solar:clock-circle-linear" aria-hidden="true" />{post.read}</span></footer>
      </div>
      <Link className="columns-article-open" href={`/posts/${post.slug}`} aria-label={`打开 ${post.title}`}><Icon icon="solar:arrow-right-linear" aria-hidden="true" /></Link>
    </article>
  );
}

export function ColumnsIndex({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const queryColumn = searchParams.get("column") ?? "all";
  const [activeColumn, setActiveColumn] = useState(queryColumn);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const groups = useMemo(() => groupPosts(posts), [posts]);
  const orderedGroups = useMemo(() => [...groups].sort((left, right) => {
    if (sortMode === "articles") return right.posts.length - left.posts.length || left.name.localeCompare(right.name, "zh-CN");
    return Date.parse(right.posts[0]?.publishedAt ?? "") - Date.parse(left.posts[0]?.publishedAt ?? "");
  }), [groups, sortMode]);
  const selectedGroup = activeColumn === "all" ? undefined : groups.find((group) => group.name === activeColumn);
  const visiblePosts = useMemo(() => sortPosts(selectedGroup ? selectedGroup.posts : posts), [posts, selectedGroup]);
  const totalWords = posts.reduce((total, post) => total + post.wordCount, 0);
  const tagCount = new Set(posts.flatMap((post) => post.tags)).size;
  const recentPosts = sortPosts(posts).slice(0, 4);

  useEffect(() => {
    setActiveColumn(queryColumn);
  }, [queryColumn]);

  return (
    <main className="columns-page">
      <div className="columns-grain" aria-hidden="true" />
      <SiteSidebar active="columns" />
      <div className="columns-workspace">
        <header className="columns-toolbar"><SiteSearch posts={posts} /><div className="columns-toolbar-actions"><ThemeToggle /><Link href="/posts" aria-label="查看文章归档"><Icon icon="solar:archive-linear" aria-hidden="true" /></Link><span className="columns-mini-avatar"><Image src="/images/sakura-coast-hero.png" alt="" fill sizes="44px" priority /></span></div></header>

        <section className="columns-hero" aria-labelledby="columns-title"><Image src="/images/sakura-coast-hero.png" alt="樱花下整理文章的女孩" fill sizes="(max-width: 980px) 100vw, 78vw" priority /><div className="columns-hero-wash" aria-hidden="true" /><div className="columns-hero-copy"><span>从一篇写到一组</span><h1 id="columns-title">专栏小屋</h1><p>把零散思考。</p><p>整理成主题故事。</p><div><span><Icon icon="solar:book-bookmark-linear" aria-hidden="true" />主题连载</span><span><Icon icon="solar:refresh-circle-linear" aria-hidden="true" />持续更新</span></div></div></section>

        <div className="columns-filter-bar" aria-label="专栏筛选与排序"><div className="columns-tabs" role="tablist" aria-label="专栏筛选"><button className={activeColumn === "all" ? "active" : ""} type="button" role="tab" aria-selected={activeColumn === "all"} onClick={() => setActiveColumn("all")}>全部</button>{orderedGroups.map((group) => <button className={activeColumn === group.name ? "active" : ""} type="button" role="tab" aria-selected={activeColumn === group.name} key={group.name} onClick={() => setActiveColumn(group.name)}>{group.name}</button>)}</div><label className="columns-sort"><span className="sr-only">排序方式</span><select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}><option value="latest">最近更新</option><option value="articles">文章数量</option></select><Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" /></label></div>

        <div className="columns-layout">
          <div className="columns-main">
            <section className="columns-featured columns-panel" aria-labelledby="featured-columns-title"><header><h2 id="featured-columns-title"><Icon icon="solar:stars-line-linear" aria-hidden="true" />精选专栏</h2><span>{groups.length} 个主题</span></header>{orderedGroups.length > 0 ? <div className="columns-card-grid">{orderedGroups.slice(0, 4).map((group) => <ColumnCard group={group} key={group.name} />)}</div> : <p className="columns-empty">暂时还没有专栏。</p>}</section>
            <section className="columns-detail columns-panel" aria-labelledby="column-articles-title"><header className="columns-detail-header"><div><span>{selectedGroup ? "当前专栏" : "全部文章"}</span><h2 id="column-articles-title">{selectedGroup?.name ?? "专栏文章"}</h2><p>{selectedGroup ? `收录 ${selectedGroup.posts.length} 篇文章。` : "所有文章都在这里。"}</p></div><Icon icon="solar:book-2-linear" aria-hidden="true" /></header><div className="columns-detail-stats"><span><b>{visiblePosts.length}</b>文章数</span><span><b>{formatCount(visiblePosts.reduce((total, post) => total + post.wordCount, 0))}</b>字符数</span><span><b>{selectedGroup ? new Set(selectedGroup.posts.flatMap((post) => post.tags)).size : tagCount}</b>关联标签</span></div><div className="columns-article-list">{visiblePosts.map((post) => <ColumnArticle post={post} key={post.slug} />)}</div>{visiblePosts.length === 0 ? <p className="columns-empty">这里还没有文章。</p> : null}</section>
          </div>
          <aside className="columns-rail" aria-label="专栏信息"><section className="columns-stats columns-panel"><h2><Icon icon="solar:chart-square-linear" aria-hidden="true" />专栏统计</h2><dl><div><dt>专栏总数</dt><dd>{groups.length}</dd></div><div><dt>收录文章</dt><dd>{posts.filter((post) => Boolean(post.column)).length}</dd></div><div><dt>累计字数</dt><dd>{formatCount(totalWords)}</dd></div><div><dt>全部标签</dt><dd>{tagCount}</dd></div></dl></section><section className="columns-popular columns-panel"><h2><Icon icon="solar:fire-linear" aria-hidden="true" />热门专栏</h2><ol>{[...groups].sort((left, right) => right.posts.length - left.posts.length).slice(0, 4).map((group, index) => <li key={group.name}><button type="button" onClick={() => setActiveColumn(group.name)}><b>{index + 1}</b><span>{group.name}</span><em>{formatCount(group.posts.reduce((total, post) => total + post.wordCount, 0))}</em></button></li>)}</ol></section><section className="columns-recent columns-panel"><h2><Icon icon="solar:history-linear" aria-hidden="true" />最近更新</h2><div>{recentPosts.map((post) => <Link href={`/posts/${post.slug}`} key={post.slug}><span><ColumnCover post={post} /></span><div><strong>{post.title}</strong><small>{getPostTimeLabel(post).slice(0, 10)}</small></div></Link>)}</div></section><blockquote className="columns-quote columns-panel"><Icon icon="solar:chat-round-line-linear" aria-hidden="true" /><p>把每个小方向。</p><p>都写成自己的章节。</p><cite>Sknying</cite></blockquote></aside>
        </div>
        <footer className="columns-footer"><Icon icon="solar:stars-line-linear" aria-hidden="true" /><strong>清樱小屋</strong><span>记录美好 · 分享热爱</span></footer>
      </div>
    </main>
  );
}
