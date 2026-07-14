---
title: 玻璃 UI 不等于透明
publishedAt: 2026-06-28T21:15:00+08:00
column: 设计笔记
columnOrder: 1
tags: [Design, Glass UI, 可读性]
summary: 先保证可读。再谈氛围。
image: /images/posts/glass-ui-readable.jpg
mood: 设计自救记录
intro: 毛玻璃很好看。前提是字能看。
---

很多玻璃效果翻车，是因为只调了透明度。背景一复杂，文字立刻消失。

## 别只盯着 blur

- 加一层深色底。
- 边框要能分层。
- 文字对比要够。
- 动效别抢内容。

```css glass-card.css
.card {
  background: rgba(7, 19, 15, 0.72);
  border: 1px solid rgba(225, 239, 223, 0.14);
  backdrop-filter: blur(18px);
}
```

氛围感不是糊。氛围感是层次、亮点和克制。
