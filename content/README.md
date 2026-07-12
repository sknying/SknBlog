# Markdown 文章目录

把每篇文章放进 `content/posts`，文件名就是文章链接的 slug。

```md
---
title: "文章标题"
publishedAt: "2026-07-12T20:30:00+08:00"
column: "前端工程"
tags: [Next.js, Markdown]
summary: "列表页摘要。"
image: "/images/cover.png"
mood: "写作记录"
intro: "文章开头的引言。"
# read: "6 分钟" # 可选；不写时自动按字数估算
# draft: true   # 可选；草稿不会发布
---

正文从这里开始。
```

- `column` 是可选的单选专栏，用于归类系列文章。
- `tags` 是多选标签，用于交叉筛选文章。
- `publishedAt` 决定排序和展示时间。
- `wordCount` 与阅读时长在构建时从正文自动计算。
- 标签列表直接从全部文章的 `tags` 字段聚合，不在网页中创建或删除。
- 支持标题、链接、图片、引用、代码块、列表、表格和数学公式。
