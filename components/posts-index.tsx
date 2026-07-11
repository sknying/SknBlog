"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/local-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { getPostTimeLabel, type Post } from "@/lib/blog-data";
import { DEFAULT_TAG, usePostTagState } from "@/lib/tag-state";

const MONTH_LABELS = ["12", "11", "10", "09", "08", "07", "06", "05", "04", "03", "02", "01"];

function getYearMonth(post: Post) {
  const [year = "未知", month = "00"] = post.publishedAt.slice(0, 7).split("-");
  return { year, month };
}

function countCharacters(post: Post) {
  return post.blocks.reduce((total, block) => {
    if (block.type === "paragraph" || block.type === "quote") return total + block.text.length;
    if (block.type === "code") return total + block.code.length;
    if (block.type === "list") return total + block.title.length + block.items.join("").length;
    if (block.type === "table") return total + block.title.length + block.headers.join("").length + block.rows.flat().join("").length;
    if (block.type === "math") return total + block.formula.length;
    return total + block.alt.length + (block.caption?.length ?? 0);
  }, post.title.length + post.summary.length + post.intro.length);
}

function formatCharacterCount(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

export function PostsIndex({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag") ?? "";
  const initialQuery = searchParams.get("q") ?? "";
  const { addTag, deleteTags, posts: taggedPosts, tags } = usePostTagState(posts);
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [committedQuery, setCommittedQuery] = useState(initialQuery);
  const [draftTags, setDraftTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [committedTags, setCommittedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [tagPanelOpen, setTagPanelOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tagMessage, setTagMessage] = useState("");
  const [randomIndex, setRandomIndex] = useState(0);

  const searchedPosts = useMemo(() => {
    const query = committedQuery.trim().toLocaleLowerCase("zh-CN");

    return taggedPosts
      .filter((post) => {
        const matchesText = !query || [post.title, post.summary, ...post.tags].some((value) => value.toLocaleLowerCase("zh-CN").includes(query));
        const matchesTags = committedTags.every((tag) => post.tags.includes(tag));
        return matchesText && matchesTags;
      })
      .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }, [committedQuery, committedTags, taggedPosts]);

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

  useEffect(() => {
    if (!tagPanelOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTagPanelOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [tagPanelOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedQuery(draftQuery);
    setCommittedTags(draftTags);
    setSelectedMonth("");
  }

  function toggleDraftTag(tag: string) {
    setDraftTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
  }

  function createTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = newTag.trim();
    if (!value) {
      setTagMessage("请输入标签名。");
      return;
    }
    if (tags.includes(value)) {
      setTagMessage("标签已存在。");
      return;
    }
    addTag(value);
    setNewTag("");
    setTagMessage(`已创建 ${value}。`);
  }

  function deleteTag(tag: string) {
    if (tag === DEFAULT_TAG) return;
    deleteTags([tag]);
    setDraftTags((current) => current.filter((item) => item !== tag));
    setCommittedTags((current) => current.filter((item) => item !== tag));
    setTagMessage(`已删除 ${tag}。`);
  }

  return (
    <main className="archive-page">
      <div className="archive-grain" aria-hidden="true" />

      <aside className="archive-side">
        <Link className="archive-logo" href="/">
          <Icon icon="solar:stars-line-linear" aria-hidden="true" />
          <span>清樱小屋</span>
        </Link>
        <div className="archive-author">
          <div><Image src="/images/sakura-coast-hero.png" alt="Sknying 头像" fill sizes="78px" priority /></div>
          <strong>Sknying</strong>
          <p>记录美好，分享热爱。</p>
        </div>
        <nav className="archive-navigation" aria-label="归档导航">
          <Link href="/"><Icon icon="solar:home-2-linear" aria-hidden="true" />首页</Link>
          <Link className="active" href="/posts"><Icon icon="solar:archive-linear" aria-hidden="true" />归档</Link>
          <a href="#years"><Icon icon="solar:widget-4-linear" aria-hidden="true" />分类</a>
          <button type="button" onClick={() => setTagPanelOpen(true)}><Icon icon="solar:tag-linear" aria-hidden="true" />标签</button>
          <a href="#archive-stats"><Icon icon="solar:chart-2-linear" aria-hidden="true" />统计</a>
          <Link href="/#about"><Icon icon="solar:user-circle-linear" aria-hidden="true" />关于</Link>
        </nav>
        <div className="archive-side-links">
          <a href="https://github.com/sknying" aria-label="GitHub"><Icon icon="mdi:github" aria-hidden="true" /></a>
          <Link href="/" aria-label="返回首页"><Icon icon="solar:home-2-linear" aria-hidden="true" /></Link>
          <button type="button" onClick={() => setTagPanelOpen(true)} aria-label="管理标签"><Icon icon="solar:tag-linear" aria-hidden="true" /></button>
        </div>
        <footer>2026 · SknBlog</footer>
      </aside>

      <div className="archive-workspace">
        <header className="archive-toolbar">
          <form className="archive-global-search" onSubmit={submitSearch}>
            <Icon icon="solar:magnifer-linear" aria-hidden="true" />
            <div className="archive-search-content">
              {draftTags.map((tag) => (
                <span key={tag}>{tag}<button type="button" onClick={() => toggleDraftTag(tag)} aria-label={`取消标签 ${tag}`}><Icon icon="solar:close-circle-linear" aria-hidden="true" /></button></span>
              ))}
              <input
                value={draftQuery}
                onChange={(event) => setDraftQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && !draftQuery && draftTags.length > 0) {
                    setDraftTags((current) => current.slice(0, -1));
                  }
                }}
                type="search"
                placeholder="搜索文章、标签..."
                aria-label="搜索文章或标签"
              />
            </div>
            <button type="submit" aria-label="确认搜索"><Icon icon="solar:arrow-right-linear" aria-hidden="true" /></button>
          </form>
          <div className="archive-toolbar-icons">
            <ThemeToggle />
            <Link href="/" aria-label="返回首页"><Icon icon="solar:home-2-linear" aria-hidden="true" /></Link>
            <button type="button" onClick={() => setTagPanelOpen(true)} aria-label="打开标签"><Icon icon="solar:tag-linear" aria-hidden="true" /></button>
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
          <Icon icon="solar:stars-line-linear" aria-hidden="true" />
          <strong>清樱小屋</strong>
          <span>记录美好 · 分享热爱</span>
        </footer>
      </div>

      {tagPanelOpen ? (
        <div className="archive-tag-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTagPanelOpen(false); }}>
          <section className="archive-tag-dialog" role="dialog" aria-modal="true" aria-labelledby="tag-dialog-title">
            <header><div><span>文章筛选</span><h2 id="tag-dialog-title">标签管理</h2></div><button type="button" onClick={() => setTagPanelOpen(false)} aria-label="关闭标签管理" autoFocus><Icon icon="solar:close-circle-linear" aria-hidden="true" /></button></header>
            <div className="archive-tag-list">
              {tags.map((tag) => (
                <span className={draftTags.includes(tag) ? "active" : ""} key={tag}>
                  <button type="button" onClick={() => toggleDraftTag(tag)} aria-pressed={draftTags.includes(tag)}>{tag}</button>
                  {tag !== DEFAULT_TAG ? <button type="button" onClick={() => deleteTag(tag)} aria-label={`删除标签 ${tag}`}><Icon icon="solar:trash-bin-minimalistic-linear" aria-hidden="true" /></button> : null}
                </span>
              ))}
            </div>
            <form className="archive-tag-create" onSubmit={createTag}><label htmlFor="archive-new-tag">创建标签</label><div><input id="archive-new-tag" value={newTag} onChange={(event) => setNewTag(event.target.value)} maxLength={16} placeholder="比如：Rust" /><button type="submit"><Icon icon="solar:add-circle-linear" aria-hidden="true" />创建</button></div><p role="status">{tagMessage}</p></form>
            <footer><button type="button" onClick={() => { setCommittedTags(draftTags); setCommittedQuery(draftQuery); setSelectedMonth(""); setTagPanelOpen(false); }}>应用筛选</button></footer>
          </section>
        </div>
      ) : null}
    </main>
  );
}
