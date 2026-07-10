"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { getPrimaryTag, getTagLabel, posts, type Post } from "@/lib/blog-data";

const ALL_TAG = "全部";
const filters = [ALL_TAG, ...Array.from(new Set(posts.flatMap((post) => post.tags)))];

const snippets = [
  { label: "已写", value: "42 篇" },
  { label: "草稿", value: "9 份" },
  { label: "最长", value: "18 分钟" }
];

function MeteorCursor() {
  const [points, setPoints] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    let id = 0;
    const onMove = (event: PointerEvent) => {
      const next = { id: id++, x: event.clientX, y: event.clientY };
      setPoints((current) => [...current.slice(-8), next]);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="cursor-trail" aria-hidden="true">
      {points.map((point, index) => (
        <span
          key={point.id}
          style={{
            left: point.x,
            top: point.y,
            opacity: (index + 1) / points.length
          }}
        />
      ))}
    </div>
  );
}

function IconBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="icon-badge">
      <Icon icon={icon} aria-hidden="true" />
      {label}
    </span>
  );
}

function PostImage({ post, index }: { post: Post; index: number }) {
  const [failed, setFailed] = useState(false);
  const sizes = index === 0 ? "(max-width: 900px) 92vw, 44vw" : "(max-width: 900px) 92vw, 24vw";

  if (failed) {
    const primaryTag = getPrimaryTag(post);

    return (
      <div className="post-image-fallback" role="img" aria-label={`${primaryTag} fallback visual`}>
        <Icon icon="solar:gallery-wide-linear" aria-hidden="true" />
        <span>{primaryTag}</span>
      </div>
    );
  }

  return (
    <Image
      className="post-image"
      src={post.image}
      alt={`${post.title} 配图`}
      fill
      sizes={sizes}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export function BlogHome() {
  const [active, setActive] = useState(ALL_TAG);
  const [subscribed, setSubscribed] = useState(false);
  const visiblePosts = useMemo(
    () => (active === ALL_TAG ? posts : posts.filter((post) => post.tags.includes(active))),
    [active]
  );

  return (
    <main className="site-shell">
      <MeteorCursor />
      <div className="noise" aria-hidden="true" />
      <div className="meteor-field" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="回到首页">
          <span className="brand-mark">S</span>
          <span>SknBlog</span>
        </a>
        <nav aria-label="主导航">
          <Link href="/posts">文章</Link>
          <a href="#lab">实验室</a>
          <a href="#about">关于</a>
        </nav>
        <a className="write-link" href="#submit">
          <Icon icon="solar:pen-new-square-linear" aria-hidden="true" />
          投一篇
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <IconBadge icon="solar:stars-line-duotone" label="凌晨 1 点更新" />
          <h1>代码写累了，就来这里喘口气。</h1>
          <p>
            踩坑放这里。样式也放。Markdown 也放。
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#posts">
              <Icon icon="solar:book-2-linear" aria-hidden="true" />
              看最近文章
            </a>
            <a className="ghost-action" href="#lab">
              <Icon icon="solar:code-square-linear" aria-hidden="true" />
              翻实验记录
            </a>
          </div>
        </div>

        <aside className="hero-panel" aria-label="今日状态">
          <div className="hero-image">
            <div className="editor-visual" role="img" aria-label="夜间代码编辑器预览">
              <div className="editor-top">
                <span />
                <span />
                <span />
                <b>notes/sknblog.tsx</b>
              </div>
              <div className="editor-body">
                <div className="line-numbers">
                  <span>01</span>
                  <span>02</span>
                  <span>03</span>
                  <span>04</span>
                  <span>05</span>
                </div>
                <pre>
                  <code>{`const note = {
  mood: "midnight",
  stack: "Next.js",
  coffee: 2,
};`}</code>
                </pre>
              </div>
              <div className="editor-orbit">
                <Icon icon="solar:star-fall-bold-duotone" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="status-strip">
            {snippets.map((item) => (
              <span key={item.label}>
                <b>{item.value}</b>
                {item.label}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <section className="content-grid" id="posts" aria-labelledby="posts-title">
        <div className="section-kicker">
          <Icon icon="solar:folder-with-files-linear" aria-hidden="true" />
          最近归档
        </div>
        <div className="section-head">
          <h2 id="posts-title">这周先看这些。</h2>
          <div className="section-actions">
            <div className="filter-row" aria-label="文章标签筛选">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={active === filter ? "active" : ""}
                  type="button"
                  onClick={() => setActive(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <Link className="section-more" href="/posts">
              更多
              <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="post-board">
          {visiblePosts.map((post, index) => (
            <article className={index === 0 ? "post-card featured" : "post-card"} key={post.title}>
              <div className="post-media">
                <PostImage post={post} index={index} />
              </div>
              <div className="post-body">
                <span className="post-meta">
                  {getTagLabel(post)} / {post.date} / {post.read}
                </span>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <Link href={`/posts/${post.slug}`} aria-label={`阅读 ${post.title}`}>
                  读这篇
                  <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-strip" id="lab" aria-labelledby="lab-title">
        <div>
          <IconBadge icon="solar:cpu-bolt-linear" label="实验室" />
          <h2 id="lab-title">这里专收怪点子。</h2>
        </div>
        <div className="lab-list">
          <article>
            <Icon icon="solar:document-add-linear" aria-hidden="true" />
            <h3>Markdown 入库</h3>
            <p>拖进去，立刻预览。</p>
          </article>
          <article>
            <Icon icon="solar:palette-linear" aria-hidden="true" />
            <h3>专栏换皮</h3>
            <p>每个主题一张图。</p>
          </article>
          <article>
            <Icon icon="solar:magic-stick-3-linear" aria-hidden="true" />
            <h3>代码块拟物</h3>
            <p>像编辑器截图。</p>
          </article>
        </div>
      </section>

      <section className="about-band" id="about">
        <div className="avatar-card" aria-label="站长剪影">
          <Image
            src="https://picsum.photos/id/119/720/900"
            alt="夜色中的个人工作角落"
            fill
            sizes="(max-width: 760px) 82vw, 22vw"
          />
        </div>
        <div className="about-copy">
          <IconBadge icon="solar:gamepad-charge-linear" label="站长自述" />
          <h2>写博客，也写点奇怪 UI。</h2>
          <p>喜欢深色、毛玻璃、流星。</p>
          <p>也喜欢把坑写明白。</p>
          <form
            className="subscribe"
            id="submit"
            onSubmit={(event) => {
              event.preventDefault();
              setSubscribed(true);
            }}
          >
            <label htmlFor="email">收新文章</label>
            <div>
              <input id="email" type="email" placeholder="you@example.com" />
              <button type="submit">
                <Icon icon="solar:letter-linear" aria-hidden="true" />
                订阅
              </button>
            </div>
            {subscribed ? <p role="status">收到。别鸽。</p> : null}
          </form>
        </div>
      </section>
    </main>
  );
}
