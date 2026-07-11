"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/local-icon";
import { Fragment, useEffect, useMemo, useState } from "react";
import { getCodeLanguage, getLanguageLabel, highlightCodeLine } from "@/lib/code-highlight";
import { getPostTimeLabel, getPrimaryTag, type ArticleBlock, type Post } from "@/lib/blog-data";
import { usePostTagState } from "@/lib/tag-state";

type ArticlePageProps = {
  post: Post;
  previousPost?: Post;
  nextPost?: Post;
};

type OutlineItem = {
  id: string;
  label: string;
  level: 1 | 2;
};

function getBlockHeading(block: ArticleBlock) {
  if (block.type === "list" || block.type === "table") {
    return block.title;
  }

  return null;
}

function renderInlineText(text: string) {
  const parts = [];
  const pattern = /(`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\$([^$\n]+)\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(
        <code className="article-inline-code" key={`code-${match.index}`}>
          {match[2]}
        </code>
      );
    } else if (match[3] && match[4]) {
      const isExternal = /^https?:\/\//.test(match[4]);

      parts.push(
        <a href={match[4]} key={`link-${match.index}`} rel={isExternal ? "noreferrer" : undefined} target={isExternal ? "_blank" : undefined}>
          {match[3]}
        </a>
      );
    } else if (match[5]) {
      parts.push(
        <span className="article-inline-math" key={`math-${match.index}`}>
          {match[5]}
        </span>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.map((part, index) => (typeof part === "string" ? <Fragment key={`text-${index}`}>{part}</Fragment> : part));
}

function ArticleHeroImage({ post }: { post: Post }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const primaryTag = getPrimaryTag(post);

    return (
      <div className="article-hero-fallback" role="img" aria-label={`${primaryTag} 文章封面`}>
        <Icon icon="solar:document-text-linear" aria-hidden="true" />
        <span>{primaryTag}</span>
      </div>
    );
  }

  return (
    <Image
      src={post.image}
      alt={`${post.title} 封面`}
      fill
      priority
      sizes="(max-width: 900px) 92vw, 38vw"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export function ArticlePage({ post, previousPost, nextPost }: ArticlePageProps) {
  const articleSource = useMemo(() => [post], [post]);
  const { posts } = usePostTagState(articleSource);
  const article = posts[0] ?? post;
  const [isOutlineOpen, setIsOutlineOpen] = useState(true);
  const [activeOutlineId, setActiveOutlineId] = useState("article-title");
  const outlineItems = useMemo<OutlineItem[]>(
    () => [
      { id: "article-title", label: article.title, level: 1 },
      ...article.blocks.flatMap((block, index) => {
        const heading = getBlockHeading(block);

        return heading ? [{ id: `block-${index + 1}`, label: heading, level: 2 as const }] : [];
      })
    ],
    [article]
  );

  useEffect(() => {
    const elements = outlineItems.map((item) => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];

        if (visibleEntry) {
          setActiveOutlineId(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-24% 0px -62% 0px",
        threshold: [0, 0.2, 0.6]
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [outlineItems]);

  return (
    <main className="article-shell">
      <div className="noise" aria-hidden="true" />
      <div className="meteor-field" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <header className="article-topbar">
        <Link className="brand" href="/" aria-label="回到首页">
          <span className="brand-mark">S</span>
          <span>SknBlog</span>
        </Link>
        <Link className="article-back" href="/#posts">
          <Icon icon="solar:arrow-left-linear" aria-hidden="true" />
          回归档
        </Link>
      </header>

      <section className="article-hero">
        <div className="article-title-block">
          <span className="article-kicker">
            {getPostTimeLabel(article)}
          </span>
          <h1 id="article-title">{article.title}</h1>
          <div className="article-tags" aria-label="文章标签">
            {article.tags.map((tag) => (
              <Link className="article-tag-pill" href={`/posts?tag=${encodeURIComponent(tag)}`} key={tag}>
                {tag}
              </Link>
            ))}
          </div>
          <p>{article.intro}</p>
        </div>
        <aside className="article-cover">
          <ArticleHeroImage post={article} />
        </aside>
      </section>

      <section className="article-layout">
        <aside className="article-sidebar" aria-label="文章大纲">
          <button
            className="article-outline-toggle"
            type="button"
            onClick={() => setIsOutlineOpen((current) => !current)}
            aria-expanded={isOutlineOpen}
            aria-controls="article-outline-list"
          >
            <span>
              <Icon icon="solar:list-check-linear" aria-hidden="true" />
              文章大纲
            </span>
            <Icon icon="solar:alt-arrow-down-linear" aria-hidden="true" />
          </button>
          {isOutlineOpen ? (
            <nav className="article-outline" id="article-outline-list">
              {outlineItems.map((item) => (
                <a className={`level-${item.level} ${activeOutlineId === item.id ? "active" : ""}`} href={`#${item.id}`} key={item.id} aria-current={activeOutlineId === item.id ? "location" : undefined}>
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
          <div className="article-sidebar-note">
            <span className="article-side-label">当前状态</span>
            <strong>{article.mood}</strong>
            <p>{article.summary}</p>
          </div>
        </aside>

        <article className="article-content">
          {article.blocks.map((block, index) => {
            const id = `block-${index + 1}`;

            if (block.type === "paragraph") {
              return (
                <p id={id} key={id}>
                  {renderInlineText(block.text)}
                </p>
              );
            }

            if (block.type === "quote") {
              return (
                <blockquote id={id} key={id}>
                  <p>{block.text}</p>
                  <cite>{block.cite}</cite>
                </blockquote>
              );
            }

            if (block.type === "code") {
              const language = getCodeLanguage(block.title);
              const codeLines = block.code.split("\n");

              return (
                <figure className={`article-code language-${language}`} id={id} key={id}>
                  <figcaption>
                    <span className="article-code-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    <Icon icon="solar:code-square-linear" aria-hidden="true" />
                    {block.title}
                    <span className="article-code-language">{getLanguageLabel(language)}</span>
                  </figcaption>
                  <pre>
                    <code>
                      {codeLines.map((line, lineIndex) => (
                        <span className="code-line" key={`${id}-${lineIndex}`}>
                          <span className="code-line-number" aria-hidden="true">
                            {lineIndex + 1}
                          </span>
                          <span className="code-line-content">{highlightCodeLine(line, language, lineIndex)}</span>
                        </span>
                      ))}
                    </code>
                  </pre>
                </figure>
              );
            }

            if (block.type === "image") {
              return (
                <figure className="article-image-block" id={id} key={id}>
                  <div className="article-image-frame">
                    <Image src={block.src} alt={block.alt} fill sizes="(max-width: 900px) 92vw, 760px" unoptimized />
                  </div>
                  {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                </figure>
              );
            }

            if (block.type === "table") {
              return (
                <section className="article-table-block" id={id} key={id}>
                  <h2>{block.title}</h2>
                  <div className="article-table-scroll">
                    <table>
                      <thead>
                        <tr>
                          {block.headers.map((header) => (
                            <th key={header}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, rowIndex) => (
                          <tr key={`row-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                              <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            }

            if (block.type === "math") {
              return (
                <figure className="article-math-block" id={id} key={id}>
                  <div className="article-math-formula">{block.formula}</div>
                  {block.caption ? <figcaption>{block.caption}</figcaption> : null}
                </figure>
              );
            }

            return (
              <section className="article-list" id={id} key={id}>
                <h2>{block.title}</h2>
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </article>

        <aside className="article-rail" aria-hidden="true" />
      </section>

      <nav className="article-pager" aria-label="文章导航">
        {previousPost ? (
          <Link href={`/posts/${previousPost.slug}`}>
            <span>上一篇</span>
            {previousPost.title}
          </Link>
        ) : (
          <span />
        )}
        {nextPost ? (
          <Link href={`/posts/${nextPost.slug}`}>
            <span>下一篇</span>
            {nextPost.title}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
