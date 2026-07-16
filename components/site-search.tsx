"use client";

// Search reads typed text, focus, and keyboard events in the browser. Keep
// Markdown parsing in server-only `lib/` modules instead of this component.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  // Support both forms:
  // - uncontrolled: this component owns `internalValue`;
  // - controlled: the parent supplies `value` and receives `onValueChange`.
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const query = value ?? internalValue;
  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  // Only re-filter the post list when the normalized query changes, not when
  // focus moves between the input and suggestion menu.
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
    event.preventDefault();
    setIsFocused(false);

    if (onSearch) {
      // Archive pages can consume the confirmed query locally without a route
      // change. Typing alone deliberately does not call this callback.
      onSearch(query);
      return;
    }

    const trimmedQuery = query.trim();
    const targetUrl = trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : "/search";

    // Client navigation preserves the root layout, so an empty home search
    // shows only the pink navigation progress bar instead of the site loader.
    if (`${pathname}${window.location.search}` !== targetUrl) router.push(targetUrl);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsFocused(false);
      event.currentTarget.blur();
      return;
    }

    if (event.key === "ArrowDown" && showMenu) {
      // Move from the input into the first suggestion for keyboard users.
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

    // This DOM query only manages focus; React still owns the rendered list.
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
      <form className="site-search" onSubmit={submitSearch} role="search" autoComplete="off">
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
