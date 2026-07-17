"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteFooterBrand } from "@/components/site-footer-brand";
import { SakuraFall } from "@/components/sakura-fall";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Post } from "@/lib/blog-types";
import { formatCompactNumber, sortPostsByDate, type ColumnGroup } from "@/lib/column-data";
import { getPostTimeLabel, getPrimaryTag } from "@/lib/blog-utils";
import { SITE_COPYRIGHT } from "@/lib/site-config";

type ColumnDetailProps = {
  column: ColumnGroup;
  columns: ColumnGroup[];
  posts: Post[];
};

function SafeImage({
  src,
  alt,
  sizes,
  priority = false
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="column-detail-image-fallback" role="img" aria-label={alt}>
        <Icon icon="solar:gallery-wide-linear" aria-hidden="true" />
      </div>
    );
  }

  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized onError={() => setFailed(true)} />;
}

function getMonthLabel(post: Post) {
  return getPostTimeLabel(post).slice(0, 10);
}

function getColumnSpan(column: ColumnGroup) {
  const oldest = [...column.posts].sort((left, right) => Date.parse(left.publishedAt) - Date.parse(right.publishedAt))[0];
  if (!oldest) return "刚开坑";

  const days = Math.max(1, Math.ceil((Date.parse(column.updatedAt) - Date.parse(oldest.publishedAt)) / 86_400_000) + 1);
  return `${days} 天`;
}

function ArticleRow({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`column-detail-article ${featured ? "is-featured" : ""}`}>
      <Link className="column-detail-article-overlay" href={`/posts/${post.slug}`} aria-label={`阅读 ${post.title}`} />
      <div className="column-detail-article-cover">
        <SafeImage src={post.image} alt={`${post.title} 封面`} sizes="(max-width: 420px) 100px, (max-width: 700px) 112px, 150px" />
      </div>
      <div className="column-detail-article-copy">
        {featured ? <span className="column-detail-featured-mark">推荐阅读</span> : null}
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
        <div className="column-detail-article-tags">
          {post.tags.slice(0, 3).map((tag) => <Link href={`/tags?tag=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>)}
        </div>
        <footer>
          <time dateTime={post.publishedAt}><Icon icon="solar:calendar-linear" aria-hidden="true" />{getMonthLabel(post)}</time>
          <span><Icon icon="solar:text-linear" aria-hidden="true" />{formatCompactNumber(post.wordCount)} 字</span>
          <span><Icon icon="solar:clock-circle-linear" aria-hidden="true" />{post.read}</span>
        </footer>
      </div>
      <span className="column-detail-article-open" aria-hidden="true">
        <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
      </span>
    </article>
  );
}

export function ColumnDetail({ column, columns, posts }: ColumnDetailProps) {
  const relatedColumns = columns.filter((item) => item.slug !== column.slug).slice(0, 4);
  const latestPosts = useMemo(() => sortPostsByDate(posts).slice(0, 4), [posts]);
  const routeSteps = column.topTags;
  const primaryPost = column.posts[0];

  return (
    <main className="column-detail-page">
      <SakuraFall />
      <div className="column-detail-grain" aria-hidden="true" />
      <SiteSidebar active="columns" />

      <div className="column-detail-workspace">
        <header className="column-detail-toolbar">
          <nav className="column-detail-breadcrumb" aria-label="面包屑">
            <Link href="/"><Icon icon="solar:home-2-linear" aria-hidden="true" />首页</Link>
            <span>/</span>
            <Link href="/columns">专栏</Link>
            <span>/</span>
            <b>{column.name}</b>
          </nav>
          <SiteSearch posts={posts} />
          <div className="column-detail-actions">
            <ThemeToggle />
            <Link href="/" aria-label="返回首页"><Icon icon="solar:home-2-linear" aria-hidden="true" /></Link>
            <Link href="/tags" aria-label="标签页"><Icon icon="solar:tag-linear" aria-hidden="true" /></Link>
          </div>
        </header>

        <div className="column-detail-home-grid">
          <div className="column-detail-main-column">
        <section className="column-detail-hero" aria-labelledby="column-detail-title">
          <div className="column-detail-hero-copy">
            <span>{primaryPost ? getPrimaryTag(primaryPost) : "准备中"}</span>
            <h1 id="column-detail-title">{column.name}</h1>
            <p>{column.intro}</p>
            {routeSteps.length > 0 ? <div>
              {routeSteps.slice(0, 3).map((tag) => (
                <Link href={`/tags?tag=${encodeURIComponent(tag)}`} key={tag}>
                  <Icon icon="solar:tag-linear" aria-hidden="true" />
                  {tag}
                </Link>
              ))}
            </div> : null}
          </div>
          <figure className="column-detail-hero-portrait">
            <SafeImage src={column.coverImage} alt={`${column.name} 专栏封面`} sizes="(max-width: 420px) 102px, (max-width: 700px) 132px, 220px" priority />
          </figure>
        </section>

        <section className="column-detail-stat-strip" aria-label="专栏统计">
          <div><Icon icon="solar:document-text-linear" aria-hidden="true" /><span>文章数</span><b>{column.posts.length}</b></div>
          <div><Icon icon="solar:text-linear" aria-hidden="true" /><span>总字数</span><b>{formatCompactNumber(column.totalWords)}</b></div>
          <div><Icon icon="solar:tag-linear" aria-hidden="true" /><span>标签数</span><b>{column.topTags.length}</b></div>
          <div><Icon icon="solar:clock-circle-linear" aria-hidden="true" /><span>跨度</span><b>{getColumnSpan(column)}</b></div>
        </section>

          <div className="column-detail-main">
            <section className="column-detail-panel column-detail-articles" id="column-articles" aria-labelledby="column-articles-title">
              <header>
                <div>
                  <span>文章列表</span>
                  <h2 id="column-articles-title">按特定顺序排</h2>
                </div>
                {primaryPost ? <Link href={`/tags?tag=${encodeURIComponent(getPrimaryTag(primaryPost))}`}>看相关标签</Link> : null}
              </header>
              <div>
                {column.posts.length > 0 ? column.posts.map((post, index) => <ArticleRow post={post} featured={index === 0} key={post.slug} />) : (
                  <div className="column-detail-empty">
                    <Icon icon="solar:document-add-linear" aria-hidden="true" />
                    <p>这个专栏还没有文章。</p>
                  </div>
                )}
              </div>
            </section>
          </div>
          </div>

          <aside className="column-detail-rail" aria-label="专栏侧栏">
            <section className="column-detail-panel column-detail-intro">
              <span>专栏简介</span>
              <h2>这组文章写什么</h2>
              <p>{column.summary}</p>
            </section>

            <section className="column-detail-panel column-detail-directory">
              <h2><Icon icon="solar:list-check-linear" aria-hidden="true" />系列目录</h2>
              {column.posts.length > 0 ? <ol>
                {column.posts.map((post, index) => (
                  <li key={post.slug}>
                    <Link href={`/posts/${post.slug}`}>
                      <b>{String(index + 1).padStart(2, "0")}</b>
                      <span>{post.title}</span>
                      <em>{getMonthLabel(post)}</em>
                    </Link>
                  </li>
                ))}
              </ol> : <p className="column-detail-directory-empty">目录将在第一篇文章发布后出现。</p>}
            </section>

            <section className="column-detail-panel column-detail-latest">
              <h2><Icon icon="solar:clock-circle-linear" aria-hidden="true" />最近更新</h2>
              <div>
                {latestPosts.map((post) => (
                  <Link href={`/posts/${post.slug}`} key={post.slug}>
                    <span><SafeImage src={post.image} alt={`${post.title} 封面`} sizes="50px" /></span>
                    <div><strong>{post.title}</strong><small>{getMonthLabel(post)}</small></div>
                  </Link>
                ))}
              </div>
            </section>

            {relatedColumns.length > 0 ? (
              <section className="column-detail-panel column-detail-related">
                <h2><Icon icon="solar:widget-4-linear" aria-hidden="true" />相关专栏</h2>
                <div>
                  {relatedColumns.map((item) => (
                    <Link href={`/columns/${encodeURIComponent(item.slug)}`} key={item.slug}>
                      <span>{item.name}</span>
                      <b>{item.posts.length} 篇</b>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            <blockquote className="column-detail-panel column-detail-quote">
              <Icon icon="solar:chat-round-line-linear" aria-hidden="true" />
              <p>{column.mood}</p>
              <cite>{column.quoteAuthor}</cite>
            </blockquote>
          </aside>
        </div>

        <footer className="column-detail-footer">
          <SiteFooterBrand />
          <span>{SITE_COPYRIGHT}</span>
        </footer>
      </div>
    </main>
  );
}
