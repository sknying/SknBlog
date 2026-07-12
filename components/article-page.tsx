"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCodeLanguage, getLanguageLabel, highlightCodeLine } from "@/lib/code-highlight";
import type { ArticleBlock, Post } from "@/lib/blog-types";
import { getPostTimeLabel, getPrimaryTag } from "@/lib/blog-utils";
import { usePostTagState } from "@/lib/tag-state";

type ArticlePageProps = {
  post: Post;
  posts: Post[];
  previousPost?: Post;
  nextPost?: Post;
};

type OutlineItem = {
  id: string;
  label: string;
  level: 1 | 2 | 3 | 4;
};

function getBlockHeading(block: ArticleBlock) {
  if (block.type === "heading") return block.text;
  return block.type === "list" || block.type === "table" ? block.title ?? null : null;
}

function countPostCharacters(post: Post) {
  return post.wordCount;
}

function renderInlineText(text: string) {
  const parts = [];
  const pattern = /(`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\$([^$\n]+)\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

    if (match[2]) {
      parts.push(<code className="article-inline-code" key={`code-${match.index}`}>{match[2]}</code>);
    } else if (match[3] && match[4]) {
      const isExternal = /^https?:\/\//.test(match[4]);
      parts.push(
        <a href={match[4]} key={`link-${match.index}`} rel={isExternal ? "noreferrer" : undefined} target={isExternal ? "_blank" : undefined}>
          {match[3]}
        </a>
      );
    } else if (match[5]) {
      parts.push(<span className="article-inline-math" key={`math-${match.index}`}>{match[5]}</span>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.map((part, index) => typeof part === "string" ? <Fragment key={`text-${index}`}>{part}</Fragment> : part);
}

function SafePostImage({ post, priority = false }: { post: Post; priority?: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="article-image-fallback" role="img" aria-label={`${getPrimaryTag(post)} 文章封面`}>
        <Icon icon="solar:document-text-linear" aria-hidden="true" />
        <span>{getPrimaryTag(post)}</span>
      </div>
    );
  }

  return (
    <Image
      src={post.image}
      alt={`${post.title} 封面`}
      fill
      priority={priority}
      sizes="(max-width: 760px) 92vw, 720px"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export function ArticlePage({ post, posts: allPosts, previousPost, nextPost }: ArticlePageProps) {
  const articleSource = useMemo(() => [post], [post]);
  const { posts: taggedArticle } = usePostTagState(articleSource);
  const article = taggedArticle[0] ?? post;
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);
  const [activeOutlineId, setActiveOutlineId] = useState("article-title");
  const characterCount = useMemo(() => countPostCharacters(article), [article]);
  const relatedPosts = useMemo(
    () => allPosts.filter((item) => item.slug !== article.slug).sort((left, right) => {
      const leftScore = left.tags.filter((tag) => article.tags.includes(tag)).length;
      const rightScore = right.tags.filter((tag) => article.tags.includes(tag)).length;
      return rightScore - leftScore || Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
    }).slice(0, 3),
    [article, allPosts]
  );
  const outlineItems = useMemo<OutlineItem[]>(
    () => [
      { id: "article-title", label: article.title, level: 1 },
      ...article.blocks.flatMap((block, index) => {
        const heading = getBlockHeading(block);
        const level = block.type === "heading" ? block.level : 2;
        return heading ? [{ id: `block-${index + 1}`, label: heading, level }] : [];
      })
    ],
    [article]
  );

  useEffect(() => {
    const elements = outlineItems.map((item) => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      const visibleEntry = entries.filter((entry) => entry.isIntersecting).sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
      if (visibleEntry) setActiveOutlineId(visibleEntry.target.id);
    }, { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.2, 0.6] });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [outlineItems]);

  return (
    <main className="article-page">
      <div className="article-grain" aria-hidden="true" />

      <SiteSidebar active="archive" />

      <div className="article-workspace">
        <header className="article-toolbar">
          <nav className="article-breadcrumb" aria-label="面包屑">
            <Link href="/"><Icon icon="solar:home-2-linear" aria-hidden="true" />首页</Link>
            <span>/</span>
            <Link href="/posts">归档</Link>
            <span>/</span>
            <Link href={`/posts?tag=${encodeURIComponent(getPrimaryTag(article))}`}>{getPrimaryTag(article)}</Link>
            <span>/</span>
            <b>正文</b>
          </nav>
          <SiteSearch posts={allPosts} />
          <div className="article-toolbar-actions">
            <ThemeToggle />
            <Link href="/posts" aria-label="返回归档"><Icon icon="solar:archive-linear" aria-hidden="true" /></Link>
          </div>
        </header>

        <div className="article-grid">
          <article className="article-card">
            <header className="article-heading">
              <Link className="article-primary-tag" href={`/posts?tag=${encodeURIComponent(getPrimaryTag(article))}`}>{getPrimaryTag(article)}</Link>
              <h1 id="article-title">{article.title}</h1>
              <div className="article-meta">
                <span><Icon icon="solar:user-circle-linear" aria-hidden="true" />Sknying</span>
                <time dateTime={article.publishedAt}><Icon icon="solar:calendar-linear" aria-hidden="true" />{getPostTimeLabel(article)}</time>
                <span><Icon icon="solar:text-linear" aria-hidden="true" />{characterCount} 字</span>
                <span><Icon icon="solar:clock-circle-linear" aria-hidden="true" />{article.read}</span>
              </div>
              <div className="article-tags" aria-label="文章标签">
                {article.tags.map((tag) => <Link href={`/posts?tag=${encodeURIComponent(tag)}`} key={tag}>{tag}</Link>)}
              </div>
            </header>

            <div className="article-cover"><SafePostImage post={article} priority /></div>

            <blockquote className="article-lead-quote">
              <Icon icon="solar:chat-round-line-linear" aria-hidden="true" />
              <p>{article.intro}</p>
              <cite>{article.mood}</cite>
            </blockquote>

            <div className="article-content">
              {article.blocks.map((block, index) => {
                const id = `block-${index + 1}`;

                if (block.type === "heading") {
                  const Heading = `h${block.level}` as "h2" | "h3" | "h4";
                  return <Heading className="article-markdown-heading" id={id} key={id}>{block.text}</Heading>;
                }

                if (block.type === "paragraph") return <p id={id} key={id}>{renderInlineText(block.text)}</p>;

                if (block.type === "quote") {
                  return <blockquote id={id} key={id}><p>{block.text}</p><cite>{block.cite}</cite></blockquote>;
                }

                if (block.type === "code") {
                  const language = getCodeLanguage(block.language ?? block.title);
                  const codeLines = block.code.split("\n");
                  return (
                    <figure className={`article-code language-${language}`} id={id} key={id}>
                      <figcaption>
                        <span className="article-code-dots" aria-hidden="true"><i /><i /><i /></span>
                        <span>{block.title}</span>
                        <b>{getLanguageLabel(language)}</b>
                      </figcaption>
                      <pre><code>{codeLines.map((line, lineIndex) => (
                        <span className="code-line" key={`${id}-${lineIndex}`}>
                          <span className="code-line-number" aria-hidden="true">{lineIndex + 1}</span>
                          <span className="code-line-content">{highlightCodeLine(line, language, lineIndex)}</span>
                        </span>
                      ))}</code></pre>
                    </figure>
                  );
                }

                if (block.type === "image") {
                  return (
                    <figure className="article-image-block" id={id} key={id}>
                      <div className="article-image-frame"><Image src={block.src} alt={block.alt} fill sizes="(max-width: 760px) 92vw, 760px" unoptimized /></div>
                      {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                    </figure>
                  );
                }

                if (block.type === "table") {
                  return (
                    <section className="article-table-block" id={id} key={id}>
                      {block.title ? <h2>{block.title}</h2> : null}
                      <div className="article-table-scroll"><table><thead><tr>{block.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={`row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>
                    </section>
                  );
                }

                if (block.type === "math") {
                  return <figure className="article-math-block" id={id} key={id}><div>{block.formula}</div>{block.caption ? <figcaption>{block.caption}</figcaption> : null}</figure>;
                }

                const List = block.ordered ? "ol" : "ul";
                return <section className="article-list" id={id} key={id}>{block.title ? <h2>{block.title}</h2> : null}<List>{block.items.map((item) => <li key={item}>{item}</li>)}</List></section>;
              })}
            </div>

            <nav className="article-pager" aria-label="文章导航">
              {previousPost ? <Link href={`/posts/${previousPost.slug}`}><span>上一篇</span><strong>{previousPost.title}</strong></Link> : <span />}
              {nextPost ? <Link href={`/posts/${nextPost.slug}`}><span>下一篇</span><strong>{nextPost.title}</strong></Link> : <span />}
            </nav>
          </article>

          <aside className="article-right-rail">
            <section className="article-outline-panel article-rail-panel">
              <button className="article-outline-toggle" type="button" onClick={() => setIsOutlineOpen((current) => !current)} aria-expanded={isOutlineOpen} aria-controls="article-outline-list">
                <span><Icon icon="solar:list-check-linear" aria-hidden="true" />文章目录</span>
                <Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" />
              </button>
              {isOutlineOpen ? <nav className="article-outline" id="article-outline-list">{outlineItems.map((item, index) => <a className={`level-${item.level} ${activeOutlineId === item.id ? "active" : ""}`} href={`#${item.id}`} key={item.id} aria-current={activeOutlineId === item.id ? "location" : undefined}><span>{index + 1}.</span>{item.label}</a>)}</nav> : null}
            </section>

            <section className="article-info article-rail-panel">
              <h2><Icon icon="solar:document-text-linear" aria-hidden="true" />文章信息</h2>
              <dl>
                <div><dt><Icon icon="solar:bookmark-linear" aria-hidden="true" />所属专栏</dt><dd>{article.column}</dd></div>
                <div><dt><Icon icon="solar:tag-linear" aria-hidden="true" />文章标签</dt><dd>{article.tags.join(" · ")}</dd></div>
                <div><dt><Icon icon="solar:calendar-linear" aria-hidden="true" />发布时间</dt><dd>{getPostTimeLabel(article)}</dd></div>
                <div><dt><Icon icon="solar:text-linear" aria-hidden="true" />字符统计</dt><dd>{characterCount} 字</dd></div>
                <div><dt><Icon icon="solar:clock-circle-linear" aria-hidden="true" />阅读时长</dt><dd>{article.read}</dd></div>
              </dl>
            </section>

            <section className="article-related article-rail-panel">
              <h2><Icon icon="solar:gallery-wide-linear" aria-hidden="true" />相关文章</h2>
              <div>{relatedPosts.map((item) => <Link href={`/posts/${item.slug}`} key={item.slug}><span><SafePostImage post={item} /></span><div><strong>{item.title}</strong><small>{getPostTimeLabel(item).slice(0, 10)}</small></div></Link>)}</div>
            </section>

            <blockquote className="article-rail-quote article-rail-panel">
              <Icon icon="solar:chat-round-line-linear" aria-hidden="true" />
              <p>代码如诗。异步如梦。</p>
              <cite>Sknying</cite>
            </blockquote>
          </aside>
        </div>

        <footer className="article-footer">
          <Icon icon="solar:stars-line-linear" aria-hidden="true" />
          <strong>清樱小屋</strong>
          <span>记录美好 · 分享热爱</span>
        </footer>
      </div>
    </main>
  );
}
