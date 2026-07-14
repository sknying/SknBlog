"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteFooterBrand } from "@/components/site-footer-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMemo, useState } from "react";
import type { Post } from "@/lib/blog-types";
import { getPostTimeLabel, getPrimaryTag } from "@/lib/blog-utils";
import { GITHUB_AVATAR, SITE_COPYRIGHT, SITE_NAME } from "@/lib/site-config";

const RECENT_POST_LIMIT = 3;

function PostCover({ post }: { post: Post }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="sakura-cover-fallback" role="img" aria-label={`${post.title} 封面占位`}>
        <Icon icon="solar:gallery-wide-linear" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={post.image}
      alt={`${post.title} 配图`}
      fill
      sizes="(max-width: 760px) 88vw, 240px"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

function HomeArticle({ post }: { post: Post }) {
  return (
    <article className="sakura-post-card">
      <Link className="sakura-post-overlay" href={`/posts/${post.slug}`} aria-label={`阅读 ${post.title}`} />
      <div className="sakura-post-cover">
        <PostCover post={post} />
      </div>
      <div className="sakura-post-copy">
        <div className="sakura-post-kicker">
          <span>{getPrimaryTag(post)}</span>
          <time dateTime={post.publishedAt}>{getPostTimeLabel(post)}</time>
        </div>
        <h3>{post.title}</h3>
        <div className="sakura-inline-tags" aria-label="文章标签">
          {post.tags.slice(0, 3).map((tag) => (
            <Link href={`/tags?tag=${encodeURIComponent(tag)}`} key={tag}>
              {tag}
            </Link>
          ))}
        </div>
        <p>{post.summary}</p>
        <span className="sakura-read-meta">
          <Icon icon="solar:clock-circle-linear" aria-hidden="true" />
          {post.read}
        </span>
      </div>
      <span className="sakura-post-arrow" aria-hidden="true">
        <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
      </span>
    </article>
  );
}

export function BlogHome({ posts }: { posts: Post[] }) {
  const tags = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.tags))).sort((left, right) => left.localeCompare(right, "zh-CN")), [posts]);
  const columns = useMemo(() => Array.from(new Set(posts.flatMap((post) => post.column ? [post.column] : []))).sort((left, right) => left.localeCompare(right, "zh-CN")), [posts]);
  const visiblePosts = posts;
  const recentPosts = visiblePosts.slice(0, RECENT_POST_LIMIT);

  return (
    <main className="sakura-site" id="top">
      <div className="sakura-grain" aria-hidden="true" />

      <SiteSidebar active="home" />

      <div className="sakura-workspace">
        <header className="sakura-toolbar">
          <SiteSearch posts={visiblePosts} />
          <div className="sakura-toolbar-actions">
            <ThemeToggle />
            <Link href="/posts" aria-label="文章归档">
              <Icon icon="solar:archive-linear" aria-hidden="true" />
            </Link>
            <Link href="/tags" aria-label="标签页"><Icon icon="solar:tag-linear" aria-hidden="true" /></Link>
          </div>
        </header>

        <div className="sakura-home-grid">
          <div className="sakura-main-column">
            <section className="sakura-hero" aria-labelledby="home-title">
              <Image
                src="/images/sakura-coast-hero.png"
                alt="樱花树下眺望海岸的银发女孩"
                fill
                sizes="(max-width: 980px) 100vw, 70vw"
                priority
              />
              <div className="sakura-hero-wash" aria-hidden="true" />
              <div className="sakura-hero-copy">
                <span className="sakura-hero-eyebrow">写于春日 · 也写深夜</span>
                <h1 id="home-title">
                  记录美好
                  <br />
                  分享与<span>热爱</span>
                </h1>
                <p>代码会过期。</p>
                <p>踩坑要留下。</p>
                <div className="sakura-hero-actions">
                  <a href="#recent">阅读文章</a>
                  <button type="button" onClick={() => window.dispatchEvent(new Event("sknblog:open-about"))}>关于我</button>
                </div>
              </div>
            </section>

            <section className="sakura-recent glass-panel" id="recent" aria-labelledby="recent-title">
              <div className="sakura-section-head">
                <h2 id="recent-title">
                  <Icon icon="solar:stars-line-linear" aria-hidden="true" />
                  最近文章
                </h2>
                <Link href="/posts">
                  查看全部
                  <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                </Link>
              </div>
              <div className="sakura-post-list">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => <HomeArticle post={post} key={post.slug} />)
                ) : (
                  <p className="sakura-empty">没有匹配文章。</p>
                )}
              </div>
            </section>

            <section className="sakura-notes glass-panel" id="columns" aria-labelledby="notes-title">
              <div>
                <span>创作手记</span>
                <h2 id="notes-title">代码，也要有温度。</h2>
                <p>Rust、Next.js、设计。</p>
              </div>
              <div className="sakura-note-stats">
                <Link href="/posts"><b>{visiblePosts.length}</b>文章</Link>
                <Link href="/columns"><b>{columns.length}</b>专栏</Link>
                <Link href="/tags"><b>{tags.length}</b>标签</Link>
              </div>
            </section>
          </div>

          <aside className="sakura-right-rail" aria-label="博客侧栏">
            <section className="sakura-profile glass-panel" id="about">
              <div className="sakura-profile-avatar">
                <Image src={GITHUB_AVATAR} alt={`${SITE_NAME} GitHub 头像`} fill sizes="88px" priority unoptimized />
              </div>
              <h2>Sknying</h2>
              <p>写技术，也画界面。</p>
              <p>偶尔记录生活。</p>
              <div className="sakura-profile-stats">
                <Link href="/posts"><b>{visiblePosts.length}</b>文章</Link>
                <Link href="/columns"><b>{columns.length}</b>专栏</Link>
                <Link href="/tags"><b>{tags.length}</b>标签</Link>
              </div>
            </section>

            <section className="sakura-notice glass-panel">
              <h2><Icon icon="solar:chat-round-line-linear" aria-hidden="true" />小公告</h2>
              <p>博客刚翻新。</p>
              <p>旧文章还在。</p>
            </section>

            <section className="sakura-tags glass-panel" id="tags">
              <div className="sakura-rail-title">
                <h2><Icon icon="solar:tag-linear" aria-hidden="true" />热门标签</h2>
                <Link href="/posts">更多</Link>
              </div>
              <div>
                {tags.slice(0, 9).map((tag) => (
                  <Link href={`/tags?tag=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>
                ))}
              </div>
            </section>

            <section className="sakura-timeline glass-panel">
              <h2><Icon icon="solar:calendar-linear" aria-hidden="true" />时间轴</h2>
              <ol>
                {visiblePosts.slice(0, 3).map((post) => (
                  <li key={post.slug}>
                    <time dateTime={post.publishedAt}>{getPostTimeLabel(post).slice(0, 10)}</time>
                    <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        <footer className="sakura-footer">
          <SiteFooterBrand />
          <span>{SITE_COPYRIGHT}</span>
        </footer>
      </div>
    </main>
  );
}
