"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteFooterBrand } from "@/components/site-footer-brand";
import { SakuraFall } from "@/components/sakura-fall";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Post } from "@/lib/blog-types";
import { getPostTimeLabel } from "@/lib/blog-utils";
import { SITE_COPYRIGHT } from "@/lib/site-config";

function TagArticle({ post }: { post: Post }) {
  return (
    <article className="tag-result-card">
      <Link className="tag-result-cover" href={`/posts/${post.slug}`} aria-label={`阅读 ${post.title}`}>
        <Image src={post.image} alt={`${post.title} 封面`} fill sizes="(max-width: 700px) 88vw, 150px" unoptimized />
      </Link>
      <div>
        <time dateTime={post.publishedAt}>{getPostTimeLabel(post)}</time>
        <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.summary}</p>
        <span>{post.read}</span>
      </div>
      <Link className="tag-result-open" href={`/posts/${post.slug}`} aria-label={`打开 ${post.title}`}><Icon icon="solar:arrow-right-linear" aria-hidden="true" /></Link>
    </article>
  );
}

export function TagsIndex({ posts }: { posts: Post[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort((left, right) => left.localeCompare(right, "zh-CN")),
    [posts]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const filteredPosts = useMemo(
    () => posts
      .filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
      .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt)),
    [posts, selectedTags]
  );

  useEffect(() => {
    setSelectedTags(searchParams.getAll("tag").filter((tag) => tags.includes(tag)));
  }, [searchParams, tags]);

  function updateTags(nextTags: string[]) {
    const uniqueTags = Array.from(new Set(nextTags));
    const params = new URLSearchParams();
    uniqueTags.forEach((tag) => params.append("tag", tag));
    setSelectedTags(uniqueTags);
    router.replace(params.size > 0 ? `${pathname}?${params}` : pathname, { scroll: false });
  }

  function toggleTag(tag: string) {
    updateTags(selectedTags.includes(tag) ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag]);
  }

  return (
    <main className="tags-page">
      <SakuraFall />
      <div className="tags-grain" aria-hidden="true" />
      <SiteSidebar active="tags" />

      <div className="tags-workspace">
        <header className="tags-toolbar">
          <SiteSearch posts={posts} />
          <div className="tags-toolbar-actions">
            <ThemeToggle />
            <Link href="/" aria-label="返回首页"><Icon icon="solar:home-2-linear" aria-hidden="true" /></Link>
            <Link href="/tags" aria-label="标签页"><Icon icon="solar:tag-linear" aria-hidden="true" /></Link>
          </div>
        </header>

        <section className="tags-hero" aria-labelledby="tags-title">
          <Image src="/images/sakura-coast-hero.png" alt="樱花海岸与写作女孩" fill sizes="(max-width: 980px) 100vw, 78vw" priority />
          <div className="tags-hero-wash" aria-hidden="true" />
          <div className="tags-hero-copy">
            <span><Icon icon="solar:tag-linear" aria-hidden="true" />来自 Markdown</span>
            <h1 id="tags-title">标签清单</h1>
            <p>勾选标签，筛出文章。</p>
            <p>多选时取交集。</p>
          </div>
        </section>

        <div className="tags-layout">
          <div className="tags-main">
            <section className="tags-picker" aria-labelledby="tags-picker-title">
              <header>
                <div>
                  <span>全部标签</span>
                  <h2 id="tags-picker-title">选几个看看</h2>
                </div>
                {selectedTags.length > 0 ? <button type="button" onClick={() => updateTags([])}>清空</button> : null}
              </header>
              <div className="tags-picker-list">
                {tags.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  const count = posts.filter((post) => post.tags.includes(tag)).length;
                  return (
                    <button className={selected ? "active" : ""} type="button" key={tag} onClick={() => toggleTag(tag)} aria-pressed={selected}>
                      <Icon icon={selected ? "solar:check-circle-bold" : "solar:tag-linear"} aria-hidden="true" />
                      <span>{tag}</span>
                      <b>{count}</b>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="tag-results" aria-live="polite" aria-labelledby="tag-results-title">
              <header>
                <div>
                  <span>{selectedTags.length > 0 ? selectedTags.join(" + ") : "等待选择"}</span>
                  <h2 id="tag-results-title">{selectedTags.length > 0 ? `找到 ${filteredPosts.length} 篇文章` : "选择标签后显示文章"}</h2>
                </div>
              </header>
              {selectedTags.length > 0 ? (
                filteredPosts.length > 0 ? <div className="tag-results-list">{filteredPosts.map((post) => <TagArticle post={post} key={post.slug} />)}</div> : (
                  <div className="tag-results-empty"><Icon icon="solar:close-circle-linear" aria-hidden="true" /><p>没有共同文章。</p></div>
                )
              ) : (
                <div className="tag-results-empty"><Icon icon="solar:cursor-square-linear" aria-hidden="true" /><p>从上面勾选标签。</p></div>
              )}
            </section>
          </div>

          <aside className="tags-rail" aria-label="标签说明">
            <section className="tags-rail-panel tags-summary">
              <Icon icon="solar:hashtag-linear" aria-hidden="true" />
              <h2>标签来自文章</h2>
              <p>frontmatter 写好即可。</p>
              <p>不用手动维护。</p>
            </section>
            <section className="tags-rail-panel">
              <h2><Icon icon="solar:stars-line-linear" aria-hidden="true" />筛选规则</h2>
              <p className="tags-rule">多选标签时，文章必须同时包含每个已选标签。</p>
            </section>
          </aside>
        </div>

        <footer className="tags-footer">
          <SiteFooterBrand />
          <span>{SITE_COPYRIGHT}</span>
        </footer>
      </div>
    </main>
  );
}
