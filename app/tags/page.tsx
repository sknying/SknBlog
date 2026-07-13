import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/local-icon";
import { SiteSearch } from "@/components/site-search";
import { SiteSidebar } from "@/components/site-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { posts } from "@/lib/blog-data";
import { getPostTimeLabel } from "@/lib/blog-utils";
import { SITE_COPYRIGHT, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "标签 | SknBlog",
  description: "按标签浏览 SknBlog 的文章。"
};

const tagGroups = Array.from(new Set(posts.flatMap((post) => post.tags)))
  .map((tag) => ({
    tag,
    posts: posts
      .filter((post) => post.tags.includes(tag))
      .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
  }))
  .sort((left, right) => right.posts.length - left.posts.length || left.tag.localeCompare(right.tag, "zh-CN"));

export default function TagsPage() {
  return (
    <main className="tags-page">
      <div className="tags-grain" aria-hidden="true" />
      <SiteSidebar active="tags" />

      <div className="tags-workspace">
        <header className="tags-toolbar">
          <SiteSearch posts={posts} />
          <div className="tags-toolbar-actions">
            <ThemeToggle />
            <Link href="/posts" aria-label="查看文章归档"><Icon icon="solar:archive-linear" aria-hidden="true" /></Link>
          </div>
        </header>

        <section className="tags-heading" aria-labelledby="tags-title">
          <span><Icon icon="solar:tag-linear" aria-hidden="true" />来自 Markdown</span>
          <h1 id="tags-title">标签清单</h1>
          <p>共 {tagGroups.length} 个标签。</p>
          <p>每个都能点开。</p>
        </section>

        <div className="tags-layout">
          <section className="tags-catalog" aria-label="全部标签">
            {tagGroups.map(({ tag, posts: tagPosts }) => {
              const latestPost = tagPosts[0];

              return (
                <article className="tag-card" key={tag}>
                  <header>
                    <span><Icon icon="solar:tag-linear" aria-hidden="true" />标签</span>
                    <b>{tagPosts.length} 篇</b>
                  </header>
                  <h2><Link href={`/search?q=${encodeURIComponent(tag)}`}>{tag}</Link></h2>
                  {latestPost ? (
                    <Link className="tag-card-latest" href={`/posts/${latestPost.slug}`}>
                      <span>
                        <Image src={latestPost.image} alt={`${latestPost.title} 封面`} fill sizes="88px" unoptimized />
                      </span>
                      <div>
                        <small>最近文章</small>
                        <strong>{latestPost.title}</strong>
                        <time dateTime={latestPost.publishedAt}>{getPostTimeLabel(latestPost).slice(0, 10)}</time>
                      </div>
                    </Link>
                  ) : null}
                  <Link className="tag-card-more" href={`/search?q=${encodeURIComponent(tag)}`}>查看文章<Icon icon="solar:arrow-right-linear" aria-hidden="true" /></Link>
                </article>
              );
            })}
          </section>

          <aside className="tags-rail" aria-label="标签说明">
            <section className="tags-rail-panel tags-summary">
              <Icon icon="solar:hashtag-linear" aria-hidden="true" />
              <h2>标签来自文章</h2>
              <p>不需要手动维护。</p>
              <p>写入 frontmatter 即可。</p>
            </section>
            <section className="tags-rail-panel">
              <h2><Icon icon="solar:stars-line-linear" aria-hidden="true" />常用标签</h2>
              <ol>
                {tagGroups.slice(0, 5).map(({ tag, posts: tagPosts }, index) => (
                  <li key={tag}>
                    <b>{String(index + 1).padStart(2, "0")}</b>
                    <Link href={`/search?q=${encodeURIComponent(tag)}`}>{tag}</Link>
                    <span>{tagPosts.length}</span>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        <footer className="tags-footer">
          <Icon icon="solar:stars-line-linear" aria-hidden="true" />
          <strong>{SITE_NAME}</strong>
          <span>{SITE_COPYRIGHT}</span>
        </footer>
      </div>
    </main>
  );
}
