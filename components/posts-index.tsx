"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteFooterBrand } from "@/components/site-footer-brand";
import { SakuraFall } from "@/components/sakura-fall";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMemo, useState } from "react";
import type { Post } from "@/lib/blog-types";
import { getPostTimeLabel } from "@/lib/blog-utils";
import { SITE_COPYRIGHT } from "@/lib/site-config";
import { SPRING_ASSETS } from "@/themes/spring/theme";

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
  const taggedPosts = posts;
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [randomIndex, setRandomIndex] = useState(0);

  const years = useMemo(() => {
    const sourceYears = Array.from(new Set(taggedPosts.map((post) => getYearMonth(post).year))).sort((a, b) => b.localeCompare(a));

    return sourceYears.map((year) => {
      const yearPosts = taggedPosts.filter((post) => getYearMonth(post).year === year);
      return {
        year,
        posts: yearPosts,
        monthCounts: Object.fromEntries(MONTH_LABELS.map((month) => [month, yearPosts.filter((post) => getYearMonth(post).month === month).length]))
      };
    });
  }, [taggedPosts]);

  const activeYear = years.find((group) => group.year === selectedYear) ?? years[0];
  const activeMonths = activeYear
    ? MONTH_LABELS.map((month) => ({
      month,
      posts: activeYear.posts.filter((post) => getYearMonth(post).month === month)
    })).filter((group) => group.posts.length > 0)
    : [];

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
          <SiteSearch posts={taggedPosts} />
          <div className="archive-toolbar-icons">
            <ThemeToggle />
            <Link href="/" aria-label="返回首页"><Icon icon="solar:home-2-linear" aria-hidden="true" /></Link>
            <Link href="/tags" aria-label="标签页"><Icon icon="solar:tag-linear" aria-hidden="true" /></Link>
          </div>
        </header>

        <div className="archive-home-grid">
          <div className="archive-main-column">
        <section className="archive-banner" aria-labelledby="archive-title">
          <div className="archive-banner-copy">
            <span>从第一篇开始</span>
            <h1 id="archive-title">文章归档</h1>
            <p><Icon icon="solar:stars-line-linear" aria-hidden="true" />记录每一刻的思考</p>
          </div>
          <figure className="archive-banner-portrait">
            <Image src={SPRING_ASSETS.hero} alt="樱花海岸与写作女孩" fill sizes="(max-width: 420px) 102px, (max-width: 700px) 132px, 220px" priority />
          </figure>
          </section>

          <section className="archive-years archive-panel" id="years" aria-label="按年份浏览文章">
            <div className="archive-year-progress" aria-label="年份选择">
              {years.map((group) => {
                const isActive = group.year === activeYear?.year;

                return (
                  <button className={isActive ? "active" : ""} type="button" key={group.year} onClick={() => setSelectedYear(group.year)} aria-pressed={isActive}>
                    <strong>{group.year}</strong>
                    <span>{group.posts.length} 篇</span>
                  </button>
                );
              })}
            </div>

            {activeYear ? (
              <section className="archive-year" key={activeYear.year}>
                <div className="archive-year-heading">
                  <div><h2>{activeYear.year} 年</h2><p>共 {activeYear.posts.length} 篇文章</p></div>
                </div>

                <div className="archive-month-timeline" aria-label={`${activeYear.year} 年文章月份时间线`}>
                  {activeMonths.map((monthGroup) => (
                    <section className="archive-month-section" key={monthGroup.month}>
                      <div className="archive-month-heading">
                        <span aria-hidden="true" />
                        <h3>{monthGroup.month} 月</h3>
                        <p>{monthGroup.posts.length} 篇文章</p>
                      </div>
                      <div className="archive-year-posts">
                        {monthGroup.posts.map((post) => (
                          <Link href={`/posts/${post.slug}`} key={post.slug}>
                            <span className="archive-post-cover">
                              <Image src={post.image} alt={`${post.title} 封面`} fill sizes="(max-width: 420px) 84px, (max-width: 980px) 104px, 120px" unoptimized />
                            </span>
                            <time dateTime={post.publishedAt}>{getPostTimeLabel(post)}</time>
                            <strong>{post.title}</strong>
                            <span>{post.tags.slice(0, 3).join(" · ")}</span>
                            <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                          </Link>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            ) : <p className="archive-no-results">还没有可以归档的文章。</p>}
            <p className="archive-year-quote"><Icon icon="solar:stars-line-linear" aria-hidden="true" />时光会走，文字留下。</p>
          </section>
          </div>

          <aside className="archive-insights" id="archive-stats">
            <section className="archive-stats archive-panel">
              <h2><Icon icon="solar:archive-linear" aria-hidden="true" />归档统计</h2>
              <dl>
                <div><dt><Icon icon="solar:document-text-linear" aria-hidden="true" />文章总数</dt><dd>{taggedPosts.length} 篇</dd></div>
                <div><dt><Icon icon="solar:text-linear" aria-hidden="true" />字符统计</dt><dd>{formatCharacterCount(totalCharacters)} 字</dd></div>
                <div><dt><Icon icon="solar:clock-circle-linear" aria-hidden="true" />运行天数</dt><dd>{runningDays} 天</dd></div>
                <div><dt><Icon icon="solar:calendar-linear" aria-hidden="true" />最后更新</dt><dd>{newestPost ? getPostTimeLabel(newestPost).slice(0, 10) : "暂无"}</dd></div>
              </dl>
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
