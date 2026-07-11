"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { getPostTimeLabel, getPrimaryTag, posts, type Post } from "@/lib/blog-data";
import { usePostTagState } from "@/lib/tag-state";

const navigation = [
  { label: "首页", href: "#top", icon: "solar:home-2-linear" },
  { label: "归档", href: "/posts", icon: "solar:archive-linear" },
  { label: "专栏", href: "#columns", icon: "solar:widget-4-linear" },
  { label: "标签", href: "#tags", icon: "solar:tag-linear" },
  { label: "关于", href: "#about", icon: "solar:user-circle-linear" }
];

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
      <Link className="sakura-post-cover" href={`/posts/${post.slug}`} aria-label={`阅读 ${post.title}`}>
        <PostCover post={post} />
      </Link>
      <div className="sakura-post-copy">
        <div className="sakura-post-kicker">
          <span>{getPrimaryTag(post)}</span>
          <time dateTime={post.publishedAt}>{getPostTimeLabel(post)}</time>
        </div>
        <h3>
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        <div className="sakura-inline-tags" aria-label="文章标签">
          {post.tags.slice(0, 3).map((tag) => (
            <Link href={`/posts?tag=${encodeURIComponent(tag)}`} key={tag}>
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
      <Link className="sakura-post-arrow" href={`/posts/${post.slug}`} aria-label={`打开 ${post.title}`}>
        <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
      </Link>
    </article>
  );
}

export function BlogHome() {
  const [query, setQuery] = useState("");
  const [nightMode, setNightMode] = useState(false);
  const { posts: visiblePosts, tags } = usePostTagState(posts);
  const recentPosts = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("zh-CN");
    const matched = keyword
      ? visiblePosts.filter((post) =>
          [post.title, post.summary, ...post.tags].some((value) => value.toLocaleLowerCase("zh-CN").includes(keyword))
        )
      : visiblePosts;

    return matched.slice(0, 3);
  }, [query, visiblePosts]);

  return (
    <main className="sakura-site" data-theme={nightMode ? "night" : "day"} id="top">
      <div className="sakura-grain" aria-hidden="true" />

      <aside className="sakura-sidebar">
        <Link className="sakura-brand" href="/" aria-label="SknBlog 首页">
          <Icon icon="solar:flower-linear" aria-hidden="true" />
          <span>清樱小屋</span>
        </Link>

        <nav className="sakura-nav" aria-label="主导航">
          {navigation.map((item, index) => (
            <Link className={index === 0 ? "active" : ""} href={item.href} key={item.label}>
              <Icon icon={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sakura-now-card" aria-label="当前状态">
          <div className="sakura-disc">
            <Image src="/images/sakura-coast-hero.png" alt="樱花海岸插画局部" fill sizes="112px" priority />
          </div>
          <span>春风与代码</span>
          <small>今天也在写</small>
        </div>

        <footer className="sakura-side-footer">
          <div>
            <a href="https://github.com/sknying" aria-label="GitHub">
              <Icon icon="mdi:github" aria-hidden="true" />
            </a>
            <Link href="/posts" aria-label="文章归档">
              <Icon icon="solar:archive-linear" aria-hidden="true" />
            </Link>
            <a href="#tags" aria-label="热门标签">
              <Icon icon="solar:tag-linear" aria-hidden="true" />
            </a>
          </div>
          <p>2026 · SknBlog</p>
        </footer>
      </aside>

      <div className="sakura-workspace">
        <header className="sakura-toolbar">
          <label className="sakura-search">
            <span className="sr-only">搜索文章或标签</span>
            <Icon icon="solar:magnifer-linear" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索文章、标签..."
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">
                <Icon icon="solar:close-circle-linear" aria-hidden="true" />
              </button>
            ) : null}
          </label>
          <div className="sakura-toolbar-actions">
            <button type="button" onClick={() => setNightMode((current) => !current)} aria-label="切换明暗主题">
              <Icon icon={nightMode ? "solar:sun-2-linear" : "solar:moon-linear"} aria-hidden="true" />
            </button>
            <Link href="/posts" aria-label="查看文章">
              <Icon icon="solar:bell-linear" aria-hidden="true" />
            </Link>
            <span className="sakura-mini-avatar" aria-hidden="true">
              <Image src="/images/sakura-coast-hero.png" alt="" fill sizes="44px" priority />
            </span>
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
                  <a href="#about">关于我</a>
                </div>
              </div>
            </section>

            <section className="sakura-recent glass-panel" id="recent" aria-labelledby="recent-title">
              <div className="sakura-section-head">
                <h2 id="recent-title">
                  <Icon icon="solar:flower-linear" aria-hidden="true" />
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
                <span><b>{visiblePosts.length}</b>文章</span>
                <span><b>{tags.length}</b>标签</span>
                <span><b>1</b>专栏</span>
              </div>
            </section>
          </div>

          <aside className="sakura-right-rail" aria-label="博客侧栏">
            <section className="sakura-profile glass-panel" id="about">
              <div className="sakura-profile-avatar">
                <Image src="/images/sakura-coast-hero.png" alt="SknBlog 头像" fill sizes="88px" priority />
              </div>
              <h2>Sknying</h2>
              <p>写技术，也画界面。</p>
              <p>偶尔记录生活。</p>
              <div className="sakura-profile-stats">
                <span><b>{visiblePosts.length}</b>文章</span>
                <span><b>1</b>专栏</span>
                <span><b>{tags.length}</b>标签</span>
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
                  <Link href={`/posts?tag=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>
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
      </div>
    </main>
  );
}
