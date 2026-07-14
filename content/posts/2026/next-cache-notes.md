---
title: Next 缓存别硬猜
publishedAt: 2026-07-09T01:20:00+08:00
column: 前端工程
tags: [Next.js, 缓存, 排查]
summary: 把路由缓存拆开看。少一点玄学。
image: /images/posts/next-cache-notes.jpg
mood: 凌晨排查缓存
intro: 缓存不是黑箱。先分层。再下手。
---

我以前也爱猜。改完代码，刷新两次。好了就算。坏了就怪框架。后来发现，这样只会把问题养大。

## 先看这 3 层

- 请求缓存。它管 fetch。
- 路由缓存。它管页面切换。
- 构建缓存。它管产物。

```tsx app/posts/[slug]/page.tsx
export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
```

> 缓存没错。错的是没说清楚谁在缓存。

排查时别一口气关掉所有缓存。先缩小范围。能复现，才有得修。
