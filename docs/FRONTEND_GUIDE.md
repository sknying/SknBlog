# SknBlog 前端修改入门

这份文档面向有 C 或 Rust 基础、但刚接触 CSS 和 JavaScript 的维护者。

## 1. 先建立整体模型

这是静态网站，不是传统的运行时后端网站。

1. 执行 `pnpm build` 时，Next.js 读取 `content/` 中的 Markdown。
2. Next.js 预先生成每个路由的 HTML。
3. 浏览器只运行搜索、主题切换、弹窗等小型交互。

大多数修改只会落在下列位置：

| 目标 | 主要位置 |
| --- | --- |
| 修改文章、标签、文案 | `content/posts/YYYY/*.md` |
| 修改专栏资料 | `content/columns/*.md` |
| 修改全站颜色、字体、基础行为 | `app/styles/base.css` |
| 修改页面背景和纸张卡片 | `app/styles/site-background.css` |
| 修改某个页面或组件的布局 | 对应的 `components/*.tsx` 与 `components/*.css` |
| 修改 Markdown 解析规则 | `lib/blog-data.ts` |
| 修改专栏排序 | `lib/column-data.ts` |

不要手动编辑 `out/`、`.next/` 和 `tsconfig.tsbuildinfo`。它们都是构建产物。

## 2. 安全修改流程

1. 在 `dev` 分支修改。
2. 一次只改一个区域。
3. 刷新浏览器检查效果。
4. 执行 `pnpm build`。
5. 执行 `git diff --check`。
6. 用 `git diff` 检查准备提交的内容。

开发服务器由你自己运行。修改 `.tsx`、`.css` 或 Markdown 后，Next.js 通常会自动刷新。

## 3. CSS：先从变量开始

`app/styles/base.css` 顶部的 `:root` 是全站设计变量。

```css
:root {
  --accent: #f28fa8;
  --accent-2: #648ee4;
  --surface: rgba(250, 248, 235, 0.82);
}
```

- `--名字`：CSS 变量，类似可复用常量。
- `var(--accent)`：读取变量。
- `#f28fa8`：十六进制颜色，顺序是红、绿、蓝。
- `rgba(250, 248, 235, 0.82)`：前三项是 RGB，最后是 `0` 到 `1` 的透明度。

要调整主题色时，优先改变量，不要在各组件里逐个搜索颜色。

### 选择器与状态

```css
.site-search { padding: 12px; }
.site-search:hover { transform: translateY(-2px); }
.site-search input { color: var(--text); }
```

- `.site-search`：选择带这个 class 的元素。
- `:hover`：指针悬停时才生效。
- 空格表示内部元素；最后一行只影响搜索框里的 `input`。
- `padding`：内容到边框的内距。
- `transform`：只做视觉位移，不重新计算文档布局。

### 响应式规则

```css
@media (max-width: 700px) {
  .sakura-fall-petal { width: 12px; }
}
```

当屏幕宽度不超过 `700px` 时，花瓣宽度改为 `12px`。先写桌面默认样式，再在对应 CSS 文件底部增加移动端覆盖规则。

### 浅色与深色模式

```css
:root[data-theme="dark"] {
  --text: #f3f6ff;
}
```

这会匹配 `<html data-theme="dark">`。`ThemeToggle` 组件负责设置此属性。没有手动选择时，`@media (prefers-color-scheme: dark)` 会跟随系统主题。

## 4. JSX 与 React：把它当成 UI 函数

TSX 看起来像 HTML，实质是 TypeScript 中描述 UI 的语法。

```tsx
type GreetingProps = { name: string };

export function Greeting({ name }: GreetingProps) {
  return <p>你好，{name}</p>;
}
```

- `type GreetingProps`：描述输入结构，接近 Rust 结构体字段约束。
- `{ name }`：参数解构，等价于接收 `props` 后读取 `props.name`。
- `return <p>...</p>`：返回页面元素。
- JSX 中的 `{name}`：插入 TypeScript 表达式。
- `export`：让其他文件能 `import` 此组件。

组件分为两类：

1. **服务端组件**：默认类型。适合读取 Markdown、组织静态页面。
2. **客户端组件**：首行写 `"use client"`。适合点击、输入、`window` 和 `localStorage`。

不要因为一个按钮就给整页加 `"use client"`。将交互收在 `ThemeToggle`、`SiteSearch` 这种小组件中，静态页面会更轻。

## 5. 状态、事件与副作用

`components/theme-toggle.tsx` 是最小的交互例子。

```tsx
const [theme, setTheme] = useState<ResolvedTheme>("light");

function toggleTheme() {
  setTheme("dark");
}

<button onClick={toggleTheme}>切换</button>
```

- `useState("light")`：创建初始值为 `light` 的状态。
- `theme`：当前值。
- `setTheme(...)`：更新状态，并请求 React 重新渲染。
- `onClick={toggleTheme}`：传递函数本身。不要写 `toggleTheme()`，否则渲染时就会立即执行。

`useEffect` 处理渲染以外的事情，例如监听浏览器事件：

```tsx
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

- effect 在浏览器渲染后执行。
- `return` 的函数是清理函数，组件销毁时运行。
- `[]` 表示挂载时运行一次，卸载时清理一次。
- 不清理监听器会造成重复响应和内存浪费。

## 6. 搜索的两种状态管理模式

`components/site-search.tsx` 同时支持两种写法。

```tsx
<SiteSearch posts={posts} defaultValue="Rust" />
```

这是**非受控模式**，搜索组件自己保存输入文本。

```tsx
<SiteSearch
  posts={posts}
  value={query}
  onValueChange={setQuery}
/>
```

这是**受控模式**，父组件保存 `query`。输入内容还要同步影响页面别处时，使用它。

`useMemo` 只会在标准化后的查询文字变化时重新筛选文章。它适合重复筛选和排序，不适合包裹每一个简单表达式。

## 7. Markdown 如何变成文章

`lib/blog-data.ts` 会在构建期完成：

1. 用 Node.js `fs` 递归读取 `content/posts/YYYY`。
2. 用 `gray-matter` 拆分 frontmatter 和正文。
3. 用 `remark`、`remark-gfm`、`remark-math` 将 Markdown 解析为 AST。
4. 将 AST 转换为项目的 `ArticleBlock[]`，交由文章页面显示。

frontmatter 示例：

```md
---
title: Rust 异步入门
publishedAt: 2026-07-08 14:30
column: Rust 学习笔记
columnOrder: 1
tags: [Rust, async]
summary: 从 Future 到 async/await。
image: /images/posts/rust-async.jpg
---
```

- `column` 必须和 `content/columns/*.md` 的 `name` 完全一致。
- `columnOrder` 越小越靠前；没写时按发布时间兜底。
- `draft: true` 会保留文件，但不会生成网页。
- Markdown 所在年份目录必须等于 `publishedAt` 年份，否则构建会故意失败。

新增 Markdown 语法时，先扩展 `parseBlocks()`，再为 `ArticleBlock` 类型和文章组件各增加一个分支。

## 8. 专栏与站内链接

`lib/column-data.ts` 负责文章分组和排序。

```ts
return [...items].sort((left, right) =>
  Date.parse(right.publishedAt) - Date.parse(left.publishedAt)
);
```

- `[...items]`：复制数组。JavaScript 的 `sort()` 会直接修改原数组。
- 排序函数返回负数时，左项排在前面。
- `Date.parse(...)`：将日期文本变成可比较的毫秒数。

站内跳转使用 Next.js 的 `Link`：

```tsx
import Link from "next/link";

<Link href={`/posts/${post.slug}`}>{post.title}</Link>
```

静态导出后它仍能提供客户端导航体验。站内链接不要换回普通 `<a>`。

## 9. 动画与图层

`components/sakura-fall.tsx` 生成花瓣元素，`app/styles/sakura-fall.css` 为其设置动画。

```css
animation: sakura-petal-fall 16s linear infinite;
transform: translate3d(20vw, 80vh, 0) rotate(180deg);
opacity: 0.7;
```

- `animation`：动画名、时长、速度曲线、循环方式。
- `translate3d`：移动元素，第三个值通常为 `0`。
- `vw`：视口宽度的百分之一；`vh`：视口高度的百分之一。
- `z-index`：同一层叠上下文中的前后顺序，数字大者更靠前。

本项目的动画只修改 `transform` 和 `opacity`。不要持续改 `top`、`left`、`width` 或 `height`，否则可能触发布局计算并造成滚动卡顿。

保留 `prefers-reduced-motion` 规则。它尊重用户系统里的“减少动态效果”无障碍设置。

## 10. 新手常见问题

### 修改没有显示

先确认改的是源码，而不是 `out/`。仍未变化时，浏览器硬刷新一次。

### 深色模式只有部分区域不对

同时检查：

1. `:root[data-theme="dark"]`：用户手动选择的深色模式。
2. `@media (prefers-color-scheme: dark)`：跟随系统的深色模式。

### 手机出现横向滚动条

优先检查图片、代码块和 `width: 100vw`。文章图片应使用：

```css
max-width: 100%;
height: auto;
```

长代码应在代码容器设置 `overflow-x: auto`，不要让整个页面横向溢出。

### 构建失败

执行 `pnpm build`，从第一条错误开始解决。常见原因是年份不一致、重复 slug、frontmatter 格式错误或导入路径拼错。

## 11. 官方参考

- [React：使用 TypeScript](https://react.dev/learn/typescript)
- [React：响应事件](https://react.dev/learn/responding-to-events)
- [Next.js：服务端与客户端组件](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js：静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
