"use client";

import Link from "next/link";
import type { FormEvent, KeyboardEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/local-icon";
import type { Post } from "@/lib/blog-types";
import { getPostTimeLabel } from "@/lib/blog-utils";

type SiteSearchProps = {
  posts: Post[];
  value?: string;
  defaultValue?: string;
  selectedTags?: string[];
  onValueChange?: (value: string) => void;
  onRemoveTag?: (tag: string) => void;
  onEmptyBackspace?: () => void;
  onSearch?: (value: string) => void;
};

export function SiteSearch({
  posts,
  value,
  defaultValue = "",
  selectedTags = [],
  onValueChange,
  onRemoveTag,
  onEmptyBackspace,
  onSearch
}: SiteSearchProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = value ?? internalValue;
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const matchingPosts = useMemo(() => {
    if (!normalizedQuery) return [];

    return posts.filter((post) =>
      [post.title, post.summary, ...post.tags].some((item) => item.toLocaleLowerCase("zh-CN").includes(normalizedQuery))
    );
  }, [normalizedQuery]);
  const suggestions = matchingPosts.slice(0, 5);
  const showMenu = isFocused && Boolean(normalizedQuery);
  const moreHref = {
    pathname: "/posts",
    query: selectedTags[0] ? { q: query.trim(), tag: selectedTags[0] } : { q: query.trim() }
  };

  function updateValue(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    if (!onSearch) return;
    event.preventDefault();
    onSearch(query);
    setIsFocused(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsFocused(false);
      event.currentTarget.blur();
      return;
    }

    if (event.key === "ArrowDown" && showMenu) {
      event.preventDefault();
      event.currentTarget.closest(".site-search-shell")?.querySelector<HTMLAnchorElement>(".site-search-menu a")?.focus();
      return;
    }

    if (event.key === "Backspace" && !query && selectedTags.length > 0) {
      onEmptyBackspace?.();
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Escape") return;
    event.preventDefault();

    if (event.key === "Escape") {
      inputRef.current?.focus({ preventScroll: true });
      requestAnimationFrame(() => setIsFocused(false));
      return;
    }

    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
    const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);
    const nextIndex = event.key === "ArrowDown" ? Math.min(currentIndex + 1, links.length - 1) : currentIndex - 1;

    if (nextIndex < 0) inputRef.current?.focus();
    else links[nextIndex]?.focus();
  }

  return (
    <div
      className="site-search-shell"
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
    >
      <form className="site-search" action="/posts" onSubmit={submitSearch} role="search">
        <Icon icon="solar:magnifer-linear" aria-hidden="true" />
        <div className="site-search-content">
          {selectedTags.map((tag) => (
            <span key={tag}>
              {tag}
              <button type="button" onClick={() => onRemoveTag?.(tag)} aria-label={`取消标签 ${tag}`}>
                <Icon icon="solar:close-circle-linear" aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            name="q"
            value={query}
            onChange={(event) => updateValue(event.target.value)}
            onKeyDown={handleKeyDown}
            type="search"
            placeholder="搜索文章、标签..."
            aria-label="搜索文章或标签"
            aria-expanded={showMenu}
            aria-controls="site-search-results"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            role="combobox"
          />
        </div>
        <button type="submit" aria-label="确认搜索"><Icon icon="solar:arrow-right-linear" aria-hidden="true" /></button>
      </form>

      {showMenu ? (
        <div className="site-search-menu" id="site-search-results" role="listbox" aria-label="搜索建议" onKeyDown={handleMenuKeyDown}>
          {suggestions.length > 0 ? suggestions.map((post) => (
            <Link href={`/posts/${post.slug}`} role="option" aria-selected="false" key={post.slug}>
              <span><Icon icon="solar:document-text-linear" aria-hidden="true" /></span>
              <div><strong>{post.title}</strong><small>{post.tags.slice(0, 3).join(" · ")}</small></div>
              <time dateTime={post.publishedAt}>{getPostTimeLabel(post).slice(0, 10)}</time>
            </Link>
          )) : <p><Icon icon="solar:close-circle-linear" aria-hidden="true" />没有匹配文章</p>}
          <Link className="site-search-more" href={moreHref} role="option" aria-selected="false">
            <span>更多搜索结果</span>
            <b>{matchingPosts.length} 篇</b>
            <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
