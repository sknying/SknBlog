---
title: Markdown 渲染小坑
publishedAt: 2026-07-06T23:40:00+08:00
column: 写作工具
tags: [Markdown, 渲染, 文档]
summary: 代码块、引用、标题锚点。都别糊。
image: https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg
mood: 文档渲染现场
intro: Markdown 好写。难的是好读。
---

一篇技术文档，最先被读到的不是观点。是标题、`inline code`、代码块和引用。复杂度大概是 $O(n log n)$。可以跳到 [Next.js 文档](https://nextjs.org/docs) 查细节。

## 我会先处理这些

- 标题锚点要稳定。
- 代码块要有语言名。
- 引用别像普通段落。
- 长表格别硬塞。

![桌面上的代码编辑器与笔记](https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg)

## 渲染检查表

| 元素 | 风险 | 处理 |
| --- | --- | --- |
| 超链接 | 颜色太跳 | 用主题蓝色 |
| 图片 | 高度乱跳 | 固定比例 |
| 表格 | 移动端溢出 | 横向滚动 |
| 公式 | 像乱码 | 单独成块 |

$$
\sum_{i=1}^{n} i = n(n + 1) / 2
$$

```ts markdown-parser.ts
const headings = tokens
  .filter((token) => token.type === "heading")
  .map((token) => ({
    id: slugify(token.text),
    text: token.text,
  }));
```

> Markdown 不是纯文本。它是阅读节奏。
