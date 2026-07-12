"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Post } from "@/lib/blog-types";
import { formatCompactNumber, getColumnGroups, type ColumnDefinition, type ColumnGroup } from "@/lib/column-data";
import { getPostTimeLabel, getPrimaryTag } from "@/lib/blog-utils";

function ColumnCover({ group }: { group: ColumnGroup }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="columns-cover-fallback">
        <Icon icon="solar:gallery-wide-linear" aria-hidden="true" />
      </span>
    );
  }

  return (
    <Image
      src={group.coverImage}
      alt={`${group.name} 专栏封面`}
      fill
      sizes="(max-width: 760px) 88vw, 260px"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

function ColumnCard({ group }: { group: ColumnGroup }) {
  return (
    <article className="columns-card columns-cover-card">
      <Link className="columns-card-cover" href={`/columns/${encodeURIComponent(group.slug)}`} aria-label={`打开 ${group.name} 专栏`}>
        <ColumnCover group={group} />
      </Link>
      <div className="columns-card-copy">
        <h3>{group.name}</h3>
        <p>{group.summary}</p>
        <span>{group.topTags[0] ?? getPrimaryTag(group.latestPost)}</span>
      </div>
      <footer>
        <b>{group.posts.length} 篇文章</b>
        <time dateTime={group.updatedAt}>{getPostTimeLabel(group.latestPost).slice(0, 10)} 更新</time>
      </footer>
      <Link className="columns-card-link" href={`/columns/${encodeURIComponent(group.slug)}`}>
        进入专栏
        <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
      </Link>
    </article>
  );
}

export function ColumnsIndex({ posts, columnDefinitions }: { posts: Post[]; columnDefinitions: ColumnDefinition[] }) {
  const groups = useMemo(() => getColumnGroups(posts, columnDefinitions), [columnDefinitions, posts]);
  const totalWords = groups.reduce((total, group) => total + group.totalWords, 0);
  const latestGroups = groups.slice(0, 3);

  return (
    <main className="columns-page">
      <div className="columns-grain" aria-hidden="true" />
      <SiteSidebar active="columns" />

      <div className="columns-workspace">
        <header className="columns-toolbar">
          <SiteSearch posts={posts} />
          <div className="columns-toolbar-actions">
            <ThemeToggle />
            <Link href="/posts" aria-label="查看文章归档">
              <Icon icon="solar:archive-linear" aria-hidden="true" />
            </Link>
            <span className="columns-mini-avatar">
              <Image src="/images/sakura-coast-hero.png" alt="" fill sizes="44px" priority />
            </span>
          </div>
        </header>

        <section className="columns-hero" aria-labelledby="columns-title">
          <Image src="/images/sakura-coast-hero.png" alt="樱花窗边的写作桌" fill sizes="(max-width: 980px) 100vw, 78vw" priority />
          <div className="columns-hero-wash" aria-hidden="true" />
          <div className="columns-hero-copy">
            <span>先选一个坑</span>
            <h1 id="columns-title">专栏小屋</h1>
            <p>主题先摆好。</p>
            <p>文章慢慢填。</p>
            <div>
              <span><Icon icon="solar:widget-4-linear" aria-hidden="true" />{groups.length} 个专栏</span>
              <span><Icon icon="solar:text-linear" aria-hidden="true" />{formatCompactNumber(totalWords)} 字</span>
            </div>
          </div>
        </section>

        <div className="columns-layout columns-cover-layout">
          <section className="columns-featured columns-panel" aria-labelledby="featured-columns-title">
            <header>
              <h2 id="featured-columns-title">
                <Icon icon="solar:stars-line-linear" aria-hidden="true" />
                专栏封面
              </h2>
              <span>{groups.length} 个主题</span>
            </header>

            {groups.length > 0 ? (
              <div className="columns-card-grid columns-cover-grid">
                {groups.map((group) => <ColumnCard group={group} key={group.slug} />)}
              </div>
            ) : (
              <p className="columns-empty">还没有专栏。</p>
            )}
          </section>

          <aside className="columns-rail" aria-label="专栏概览">
            <section className="columns-stats columns-panel">
              <h2><Icon icon="solar:chart-2-linear" aria-hidden="true" />小屋统计</h2>
              <dl>
                <div><dt>专栏数</dt><dd>{groups.length}</dd></div>
                <div><dt>文章数</dt><dd>{posts.filter((post) => Boolean(post.column)).length}</dd></div>
                <div><dt>累计字数</dt><dd>{formatCompactNumber(totalWords)}</dd></div>
              </dl>
            </section>

            <section className="columns-recent columns-panel">
              <h2><Icon icon="solar:clock-circle-linear" aria-hidden="true" />最近更新</h2>
              <div>
                {latestGroups.map((group) => (
                  <Link href={`/columns/${encodeURIComponent(group.slug)}`} key={group.slug}>
                    <span><ColumnCover group={group} /></span>
                    <div>
                      <strong>{group.name}</strong>
                      <small>{getPostTimeLabel(group.latestPost).slice(0, 10)}</small>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <blockquote className="columns-quote columns-panel">
              <Icon icon="solar:chat-round-line-linear" aria-hidden="true" />
              <p>别把坑挖太散。</p>
              <p>先挖 3 个就够。</p>
              <cite>Sknying</cite>
            </blockquote>
          </aside>
        </div>

        <footer className="columns-footer">
          <Icon icon="solar:stars-line-linear" aria-hidden="true" />
          <strong>清樱小屋</strong>
          <span>记录美好 · 分享热爱</span>
        </footer>
      </div>
    </main>
  );
}
