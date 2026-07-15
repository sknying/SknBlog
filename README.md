# SknBlog

一个以 Markdown 为内容源的静态个人博客。站点使用暖色纸张、半透明卡片与樱花粒子背景，支持浅色和深色模式。

## 功能

- Markdown 文章、代码高亮、表格、图片和 LaTeX 公式。
- 按年份归档，标签筛选，全文标题搜索。
- 专栏页和专栏详情页。
- 专栏内文章可用 Markdown 手动排序。
- 静态导出，可部署至 GitHub Pages 或 Cloudflare Pages。
- 移动端目录、阅读进度、主题切换和无障碍动效降级。

## 环境

- Node.js 20+
- pnpm 10+

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
```

静态文件会输出到 `out/`。该目录是构建产物，不应提交。

## 写文章

文章放在 `content/posts/YYYY/`。文件名会成为文章链接的 slug，目录年份必须与 `publishedAt` 一致。

```md
---
title: "文章标题"
publishedAt: "2026-07-14T20:30:00+08:00"
column: "前端工程"
columnOrder: 10
tags: [Next.js, Markdown]
summary: "列表页摘要。"
image: "/images/posts/cover.jpg"
mood: "写作记录"
intro: "文章开头的引言。"
---

正文从这里开始。
```

- `column` 可选，一篇文章只能属于一个专栏。
- `columnOrder` 仅在所属专栏内生效，数值越小越靠前。建议使用 10、20、30，方便中间插入文章。
- 无专栏文章按 `publishedAt` 从新到旧排列。
- `tags` 支持多个值，自动汇总到标签页。
- `image` 应优先使用 `public/images/posts/` 中的本地压缩图片。

详细字段与代码块语言说明见 [content/README.md](content/README.md)。

### 快速创建 Markdown

不想手写 frontmatter 时，在项目根目录运行：

```bash
pnpm new:post
pnpm new:column
```

工具会交互式询问必填字段，并自动创建正确的年份目录、文章模板或专栏配置。文章 slug 和专栏 slug 只允许小写英文、数字与连字符，例如 `rust-async-intro`。

## 配置专栏

在 `content/columns/` 创建一个 Markdown 文件：

```md
---
name: "前端工程"
slug: "frontend"
coverImage: "/images/posts/next-cache-notes.jpg"
summary: "Next.js、缓存和构建流程。"
intro: "从页面到发布。"
mood: "持续整理中。"
order: 10
---
```

文章的 `column` 必须与 `name` 完全一致。`slug` 决定专栏详情页路径。

## 目录

```text
app/          Next.js 路由、全局样式和布局
components/   页面与可复用交互组件
content/      Markdown 文章、专栏配置和关于内容
lib/          内容解析、数据模型和工具函数
public/       Logo、背景、字体和文章图片
.github/      GitHub Pages 工作流
```

## 前端维护

刚接触 CSS、TypeScript 或 React 时，先阅读 [前端修改入门](docs/FRONTEND_GUIDE.md)。它说明主题变量、组件交互、Markdown 解析、动画和安全修改流程。

## 主题

当前主题为 [Spring](themes/spring/README.md)。主题源码位于 `themes/spring/`，其背景、主视觉、Logo 和 Fira Code 资源位于 `public/themes/spring/`。文章封面仍放在 `public/images/posts/`，避免内容资源与主题资源混在一起。

## 部署

项目使用 `output: "export"`，可将 `out/` 作为静态站点目录部署。

- GitHub Pages：使用 `.github/workflows/deploy-pages.yml`。
- Cloudflare Pages：构建命令为 `pnpm build`，输出目录为 `out`。

## 维护

- `out/`、`.next/`、`.playwright-cli/` 和 `tsconfig.tsbuildinfo` 都是可再生文件。
- 当前开发服务器运行时不要删除 `.next/`。
- 新增图标时使用本地 Iconify 图标包，并登记到 `lib/local-icons.ts`。
