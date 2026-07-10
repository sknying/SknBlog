"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { getPrimaryTag, getTagLabel, type Post } from "@/lib/blog-data";
import { usePostTagState } from "@/lib/tag-state";

type ArticlePageProps = {
  post: Post;
  previousPost?: Post;
  nextPost?: Post;
};

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
            {getTagLabel(article)} / {article.date} / {article.read}
          </span>
          <h1>{article.title}</h1>
          <p>{article.intro}</p>
        </div>
        <aside className="article-cover">
          <ArticleHeroImage post={article} />
        </aside>
      </section>

      <section className="article-layout">
        <aside className="article-sidebar" aria-label="文章信息">
          <span className="article-side-label">当前状态</span>
          <strong>{article.mood}</strong>
          <p>{article.summary}</p>
          <div className="article-mini-map">
            {article.blocks.map((block, index) => (
              <a key={`${block.type}-${index}`} href={`#block-${index + 1}`}>
                0{index + 1}
              </a>
            ))}
          </div>
        </aside>

        <article className="article-content">
          {article.blocks.map((block, index) => {
            const id = `block-${index + 1}`;

            if (block.type === "paragraph") {
              return (
                <p id={id} key={id}>
                  {block.text}
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
              return (
                <figure className="article-code" id={id} key={id}>
                  <figcaption>
                    <Icon icon="solar:code-square-linear" aria-hidden="true" />
                    {block.title}
                  </figcaption>
                  <pre>
                    <code>{block.code}</code>
                  </pre>
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
