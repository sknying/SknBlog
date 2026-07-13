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
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
};

export function SiteSearch({
  posts,
  value,
  defaultValue = "",
  onValueChange,
  onSearch
}: SiteSearchProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const query = value ?? internalValue;
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const matchingPosts = useMemo(() => {
    if (!normalizedQuery) return [];

    return posts.filter((post) => post.title.toLocaleLowerCase("zh-CN").includes(normalizedQuery));
  }, [normalizedQuery]);
  const suggestions = matchingPosts.slice(0, 5);
  const showMenu = isFocused && Boolean(normalizedQuery);
  const moreHref = {
    pathname: "/search",
    query: { q: query.trim() }
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
      <form className="site-search" action="/search" onSubmit={submitSearch} role="search" autoComplete="off">
        <Icon icon="solar:magnifer-linear" aria-hidden="true" />
        <div className="site-search-content">
          <input
            ref={inputRef}
            name="q"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={query}
            onChange={(event) => updateValue(event.target.value)}
            onKeyDown={handleKeyDown}
            type="search"
            placeholder="搜索文章标题..."
            aria-label="搜索文章标题"
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
