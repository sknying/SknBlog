# Markdown 文章目录

按年份放进 `content/posts/YYYY`，文件名就是文章链接的 slug。目录年份必须与 `publishedAt` 一致。

```text
content/posts/
  2026/
    next-cache-notes.md
    markdown-rendering-notes.md
  2025/
    older-note.md
```

```md
---
title: "文章标题"
publishedAt: "2026-07-12T20:30:00+08:00"
column: "前端工程"
columnOrder: 1
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
- `columnOrder` 只用于所属专栏的文章排序，数值越小越靠前；可用 10、20、30 留出插入空间。
- `tags` 是多选标签，用于交叉筛选文章。
- `publishedAt` 决定无专栏文章的排序和展示时间。
- 不同年份目录中不能有同名文件，避免 slug 冲突。
- `wordCount` 与阅读时长在构建时从正文自动计算。
- 标签列表直接从全部文章的 `tags` 字段聚合，不在网页中创建或删除。

## 专栏配置

在 `content/columns` 中为专栏建立一个 Markdown 配置文件。文章中的 `column` 要与配置的 `name` 一致。

```md
---
name: "前端工程"
slug: "frontend"
coverImage: "/images/columns/frontend.png"
summary: "Next.js、性能和架构。"
intro: "从页面到构建流程。"
mood: "持续整理中。"
order: 10
---
```

- `slug` 决定专栏详情页链接，例如 `/columns/frontend`。
- `coverImage` 是专栏封面，优先级高于文章封面。
- `summary`、`intro` 与 `mood` 分别用于专栏卡片、横幅和签名区。
- `order` 越小越靠前；省略时按最近更新时间排序。

代码块在围栏后写语言和可选文件名：

````md
```ts parser.ts
// 这行会显示为灰色斜体注释。
export function parse() {}
```
````

支持 TypeScript、JavaScript、JSX/TSX、Rust、Python、Java、C/C++/C#、Go、PHP、Ruby、Kotlin、Swift、Shell、PowerShell、SQL、HTML/XML、CSS/Sass/Less，以及 JSON/JSON5、YAML、TOML、INI、Properties、Dockerfile、Nginx、HCL、GraphQL 和 Markdown。语言别名如 `ts`、`rs`、`py`、`yml`、`sh`、`ps1`、`dockerfile` 也可直接使用。
- 支持标题、链接、图片、引用、代码块、列表、表格和数学公式。
