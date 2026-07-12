"use client";

import { useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/blog-types";

export const DEFAULT_TAG = "其他";

const TAG_STATE_KEY = "sknblog.tagState.v1";
const LEGACY_CUSTOM_TAG_KEY = "sknblog.customTags";
const LEGACY_CUSTOM_CATEGORY_KEY = "sknblog.customCategories";

type TagState = {
  tags: string[];
  postTags: Record<string, string[]>;
};

function uniqueTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

function ensureTags(tags: string[]) {
  const nextTags = uniqueTags(tags);
  return nextTags.length > 0 ? nextTags : [DEFAULT_TAG];
}

function buildBaseState(posts: Post[], extraTags: string[] = []): TagState {
  const postTags = Object.fromEntries(posts.map((post) => [post.slug, ensureTags(post.tags)]));

  return {
    postTags,
    tags: uniqueTags([...Object.values(postTags).flat(), ...extraTags])
  };
}

function normalizeState(state: Partial<TagState>, posts: Post[]) {
  const postTags = { ...(state.postTags ?? {}) };

  posts.forEach((post) => {
    postTags[post.slug] = ensureTags(postTags[post.slug] ?? post.tags);
  });

  const tags = uniqueTags([...(state.tags ?? []), ...Object.values(postTags).flat()]);

  return { postTags, tags };
}

function readJsonArray(key: string) {
  const stored = window.localStorage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function readStoredState(posts: Post[]) {
  const stored = window.localStorage.getItem(TAG_STATE_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return normalizeState(parsed, posts);
    } catch {
      return buildBaseState(posts);
    }
  }

  return buildBaseState(posts, [...readJsonArray(LEGACY_CUSTOM_TAG_KEY), ...readJsonArray(LEGACY_CUSTOM_CATEGORY_KEY)]);
}

export function usePostTagState(posts: Post[]) {
  const baseState = useMemo(() => buildBaseState(posts), [posts]);
  const [tagState, setTagState] = useState<TagState>(baseState);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setTagState(readStoredState(posts));
    setHasLoaded(true);
  }, [posts]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    window.localStorage.setItem(TAG_STATE_KEY, JSON.stringify(tagState));
  }, [hasLoaded, tagState]);

  const taggedPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        tags: ensureTags(tagState.postTags[post.slug] ?? post.tags)
      })),
    [posts, tagState.postTags]
  );

  function addTag(tag: string) {
    setTagState((current) => ({
      ...current,
      tags: uniqueTags([...current.tags, tag])
    }));
  }

  function deleteTags(tagsToDelete: string[]) {
    const deleteSet = new Set(tagsToDelete);

    setTagState((current) => {
      const postTags = Object.fromEntries(
        posts.map((post) => {
          const remainingTags = ensureTags(current.postTags[post.slug] ?? post.tags).filter((tag) => !deleteSet.has(tag));
          return [post.slug, ensureTags(remainingTags)];
        })
      );

      return {
        postTags,
        tags: uniqueTags([...current.tags.filter((tag) => !deleteSet.has(tag)), ...Object.values(postTags).flat()])
      };
    });
  }

  return {
    addTag,
    deleteTags,
    posts: taggedPosts,
    tags: tagState.tags
  };
}
