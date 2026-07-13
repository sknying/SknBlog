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
import { getPostTimeLabel } from "@/lib/blog-utils";
import { SITE_COPYRIGHT, SITE_NAME } from "@/lib/site-config";

function SearchCover({ post }: { post: Post }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span className="search-result-cover-fallback"><Icon icon="solar:gallery-wide-linear" aria-hidden="true" /></span>;
  }

  return <Image src={post.image} alt={`${post.title} 封面`} fill sizes="(max-width: 700px) 88vw, 180px" unoptimized onError={() => setFailed(true)} />;
}

function matchesQuery(post: Post, query: string) {
  if (!query) return false;

  return [post.title, post.summary, post.column ?? "", ...post.tags]
    .some((value) => value.toLocaleLowerCase("zh-CN").includes(query));
}

export function SearchResults({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(queryFromUrl);
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort((left, right) => left.localeCompare(right, "zh-CN")),
    [posts]
  );
  const results = useMemo(
    () => posts.filter((post) => matchesQuery(post, normalizedQuery)).sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt)),
    [normalizedQuery, posts]
  );

  useEffect(() => setQuery(queryFromUrl), [queryFromUrl]);

  return (
    <main className="search-page">
      <div className="search-grain" aria-hidden="true" />
      <SiteSidebar />

      <div className="search-workspace">
        <header className="search-toolbar">
          <SiteSearch posts={posts} value={query} onValueChange={setQuery} onSearch={setQuery} />
          <div className="search-toolbar-actions">
            <ThemeToggle />
            <Link href="/posts" aria-label="查看文章归档"><Icon icon="solar:archive-linear" aria-hidden="true" /></Link>
          </div>
        </header>

        <section className="search-heading" aria-labelledby="search-title">
          <span><Icon icon="solar:magnifer-linear" aria-hidden="true" />全站检索</span>
          <h1 id="search-title">{normalizedQuery ? `“${query.trim()}”` : "搜索文章"}</h1>
          <p>{normalizedQuery ? `找到 ${results.length} 篇相关文章。` : "输入标题、标签或专栏。"}</p>
        </section>

        <div className="search-layout">
          <section className="search-results-panel" aria-live="polite" aria-label="搜索结果">
            {normalizedQuery ? (
              results.length > 0 ? (
                <div className="search-results-list">
                  {results.map((post) => (
                    <article className="search-result-card" key={post.slug}>
                      <Link className="search-result-cover" href={`/posts/${post.slug}`} aria-label={`阅读 ${post.title}`}>
                        <SearchCover post={post} />
                      </Link>
                      <div className="search-result-copy">
                        <div className="search-result-meta">
                          <time dateTime={post.publishedAt}>{getPostTimeLabel(post)}</time>
                          {post.column ? <span>{post.column}</span> : null}
                        </div>
                        <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
                        <p>{post.summary}</p>
                        <div className="search-result-tags" aria-label="文章标签">
                          {post.tags.map((tag) => <Link href={`/search?q=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>)}
                        </div>
                      </div>
                      <Link className="search-result-open" href={`/posts/${post.slug}`} aria-label={`打开 ${post.title}`}><Icon icon="solar:arrow-right-linear" aria-hidden="true" /></Link>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="search-empty">
                  <Icon icon="solar:close-circle-linear" aria-hidden="true" />
                  <h2>未查到文章</h2>
                  <p>换个词试试。</p>
                </div>
              )
            ) : (
              <div className="search-empty">
                <Icon icon="solar:compass-linear" aria-hidden="true" />
                <h2>等你输入关键词</h2>
                <p>标题、标签都能搜。</p>
              </div>
            )}
          </section>

          <aside className="search-rail" aria-label="搜索辅助信息">
            <section className="search-rail-panel">
              <h2><Icon icon="solar:tag-linear" aria-hidden="true" />标签速查</h2>
              <div className="search-tag-cloud">
                {tags.map((tag) => <Link href={`/search?q=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>)}
              </div>
            </section>
            <section className="search-rail-panel search-tip">
              <Icon icon="solar:lightbulb-linear" aria-hidden="true" />
              <h2>搜不到？</h2>
              <p>试试文章标题。</p>
              <Link href="/posts">去文章归档<Icon icon="solar:arrow-right-linear" aria-hidden="true" /></Link>
            </section>
          </aside>
        </div>

        <footer className="search-footer">
          <Icon icon="solar:stars-line-linear" aria-hidden="true" />
          <strong>{SITE_NAME}</strong>
          <span>{SITE_COPYRIGHT}</span>
        </footer>
      </div>
    </main>
  );
}
