"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteFooterBrand } from "@/components/site-footer-brand";
import { SakuraFall } from "@/components/sakura-fall";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/blog-types";
import { getPostTimeLabel } from "@/lib/blog-utils";
import { SITE_COPYRIGHT } from "@/lib/site-config";

const MONTH_LABELS = ["12", "11", "10", "09", "08", "07", "06", "05", "04", "03", "02", "01"];

function getYearMonth(post: Post) {
  const [year = "未知", month = "00"] = post.publishedAt.slice(0, 7).split("-");
  return { year, month };
}

function countCharacters(post: Post) {
  return post.wordCount;
}

function formatCharacterCount(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

export function PostsIndex({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const taggedPosts = posts;
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [committedQuery, setCommittedQuery] = useState(initialQuery);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [randomIndex, setRandomIndex] = useState(0);

  useEffect(() => {
    setDraftQuery(initialQuery);
    setCommittedQuery(initialQuery);
    setSelectedMonth("");
  }, [initialQuery]);

  const searchedPosts = useMemo(() => {
    const query = committedQuery.trim().toLocaleLowerCase("zh-CN");

    return taggedPosts
      .filter((post) => {
        return !query || post.title.toLocaleLowerCase("zh-CN").includes(query);
      })
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }, [committedQuery, taggedPosts]);

  const years = useMemo(() => {
    const sourceYears = Array.from(new Set(taggedPosts.map((post) => getYearMonth(post).year))).sort((a, b) => b.localeCompare(a));

    return sourceYears.map((year) => {
      const yearPosts = searchedPosts.filter((post) => getYearMonth(post).year === year);
      return {
        year,
        posts: yearPosts,
        monthCounts: Object.fromEntries(MONTH_LABELS.map((month) => [month, yearPosts.filter((post) => getYearMonth(post).month === month).length]))
      };
    });
  }, [searchedPosts, taggedPosts]);

  const totalCharacters = useMemo(() => taggedPosts.reduce((sum, post) => sum + countCharacters(post), 0), [taggedPosts]);
  const newestPost = [...taggedPosts].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
  const oldestPost = [...taggedPosts].sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))[0];
  const runningDays = oldestPost && newestPost
    ? Math.max(1, Math.ceil((Date.parse(newestPost.publishedAt) - Date.parse(oldestPost.publishedAt)) / 86_400_000) + 1)
    : 0;
  const randomPost = taggedPosts[randomIndex % Math.max(taggedPosts.length, 1)];

  return (
    <main className="archive-page">
      <SakuraFall />
      <div className="archive-grain" aria-hidden="true" />

      <SiteSidebar active="archive" />

      <div className="archive-workspace">
        <header className="archive-toolbar">
          <SiteSearch
            posts={taggedPosts}
            value={draftQuery}
            onValueChange={setDraftQuery}
            onSearch={(value) => {
              setCommittedQuery(value);
              setSelectedMonth("");
            }}
          />
          <div className="archive-toolbar-icons">
            <ThemeToggle />
            <Link href="/" aria-label="返回首页"><Icon icon="solar:home-2-linear" aria-hidden="true" /></Link>
            <Link href="/tags" aria-label="标签页"><Icon icon="solar:tag-linear" aria-hidden="true" /></Link>
          </div>
        </header>

        <section className="archive-banner" aria-labelledby="archive-title">
          <Image src="/images/sakura-coast-hero.png" alt="樱花海岸与写作女孩" fill sizes="(max-width: 900px) 100vw, 75vw" priority />
          <div aria-hidden="true" />
          <div className="archive-banner-copy">
            <span>从第一篇开始</span>
            <h1 id="archive-title">文章归档</h1>
            <p><Icon icon="solar:stars-line-linear" aria-hidden="true" />记录每一刻的思考</p>
          </div>
        </section>

        <div className="archive-content-grid">
          <section className="archive-years archive-panel" id="years" aria-label="按年份浏览文章">
            {years.map((group) => {
              const displayedPosts = selectedMonth.startsWith(`${group.year}-`)
                ? group.posts.filter((post) => getYearMonth(post).month === selectedMonth.slice(-2))
                : selectedMonth ? [] : group.posts;

              return (
                <section className="archive-year" key={group.year}>
                  <div className="archive-year-heading">
                    <span aria-hidden="true" />
                    <div><h2>{group.year} 年</h2><p>共 {group.posts.length} 篇文章</p></div>
                  </div>
                  <div className="archive-months">
                    {MONTH_LABELS.map((month) => {
                      const key = `${group.year}-${month}`;
                      const count = group.monthCounts[month] ?? 0;
                      return (
                        <button className={selectedMonth === key ? "active" : ""} type="button" key={key} disabled={count === 0} onClick={() => setSelectedMonth((current) => current === key ? "" : key)} aria-pressed={selectedMonth === key}>
                          <strong>{month} 月</strong><span>{count} 篇文章</span>
                        </button>
                      );
                    })}
                  </div>
                  {displayedPosts.length > 0 ? (
                    <div className="archive-year-posts">
                      {displayedPosts.map((post) => (
                        <Link href={`/posts/${post.slug}`} key={post.slug}>
                          <time dateTime={post.publishedAt}>{getPostTimeLabel(post)}</time>
                          <strong>{post.title}</strong>
                          <span>{post.tags.slice(0, 3).join(" · ")}</span>
                          <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
            {searchedPosts.length === 0 ? <div className="archive-no-results" role="status"><Icon icon="solar:close-circle-linear" aria-hidden="true" />未查到文章</div> : null}
            <p className="archive-year-quote"><Icon icon="solar:stars-line-linear" aria-hidden="true" />时光会走，文字留下。</p>
          </section>

          <aside className="archive-insights" id="archive-stats">
            <section className="archive-stats archive-panel">
              <h2><Icon icon="solar:archive-linear" aria-hidden="true" />归档统计</h2>
              <dl>
                <div><dt><Icon icon="solar:document-text-linear" aria-hidden="true" />文章总数</dt><dd>{taggedPosts.length} 篇</dd></div>
                <div><dt><Icon icon="solar:text-linear" aria-hidden="true" />字符统计</dt><dd>{formatCharacterCount(totalCharacters)} 字</dd></div>
                <div><dt><Icon icon="solar:clock-circle-linear" aria-hidden="true" />运行天数</dt><dd>{runningDays} 天</dd></div>
                <div><dt><Icon icon="solar:calendar-linear" aria-hidden="true" />最后更新</dt><dd>{newestPost ? getPostTimeLabel(newestPost).slice(0, 10) : "暂无"}</dd></div>
              </dl>
              <div className="archive-stat-art"><Image src="/images/sakura-coast-hero.png" alt="樱花海岸插画局部" fill sizes="220px" /></div>
            </section>

            <section className="archive-trend archive-panel">
              <h2><Icon icon="solar:stars-line-linear" aria-hidden="true" />年度趋势</h2>
              <div className="archive-bars" aria-label="各年份文章数量">
                {[...years].reverse().map((group) => {
                  const maxCount = Math.max(...years.map((item) => item.posts.length), 1);
                  return <span key={group.year}><i style={{ height: `${Math.max(18, (group.posts.length / maxCount) * 100)}%` }} /><b>{group.posts.length}</b><small>{group.year}</small></span>;
                })}
              </div>
            </section>

            <section className="archive-random archive-panel">
              <h2><Icon icon="solar:camera-linear" aria-hidden="true" />探索时光</h2>
              <p>{randomPost ? randomPost.title : "翻开过去的文章。"}</p>
              {randomPost ? <Link href={`/posts/${randomPost.slug}`}>读一篇<Icon icon="solar:arrow-right-linear" aria-hidden="true" /></Link> : null}
              <button type="button" onClick={() => setRandomIndex((current) => current + 1)}>换一篇</button>
            </section>

            <blockquote className="archive-quote archive-panel">
              <Icon icon="solar:chat-round-line-linear" aria-hidden="true" />
              <p>把平凡写成诗。</p>
              <cite>Sknying</cite>
            </blockquote>
          </aside>
        </div>

        <footer className="archive-footer">
          <SiteFooterBrand />
          <span>{SITE_COPYRIGHT}</span>
        </footer>
      </div>

    </main>
  );
}
