# Spring 主题

`spring` 是 SknBlog 当前使用的视觉主题。它包含共享设计变量、代码配色、背景处理、樱花飘落组件，以及这些功能所需的静态资源。

## 目录结构

```text
themes/spring/
  index.css                 主题 CSS 入口
  theme.ts                  公共资源路径与主题标识
  theme.json                机器可读的主题清单
  components/sakura-fall.tsx
  styles/                   设计变量、代码配色、组件 CSS 与响应式规则

public/themes/spring/
  background.jpg            重复平铺的页面背景
  sknblog.jpg               全站共享的横幅图片
  logo.svg                  网站 Logo
  fonts/fira-code/          ASCII 范围的代码字体文件
```

`public/images/posts/` 下的文章封面属于内容资源，不属于主题资源，应继续放在主题目录之外。React 页面组件仍位于 `components/`，负责页面结构与内容连接；所有视觉 CSS 由本主题管理。

## 在本项目启用

`app/globals.css` 只需导入一次主题入口：

```css
@import "../themes/spring/index.css";
```

需要樱花图层时，通过 `components/sakura-fall.tsx` 的兼容导出渲染主题组件：

```tsx
import { SakuraFall } from "@/components/sakura-fall";

<main className="sakura-site">
  <SakuraFall />
  {/* Page content */}
</main>
```

Logo、横幅与回退图片路径应使用 `themes/spring/theme.ts` 的 `SPRING_ASSETS`。这样新页面不会硬编码旧资源路径。

## 迁移到其他 Next.js 网站

1. 将 `themes/spring/` 复制到新仓库。
2. 将 `public/themes/spring/` 复制到新仓库。
3. 在新项目根布局的全局 CSS 中导入 `themes/spring/index.css`。
4. 复制 `SakuraFall` 组件；若不需要花瓣，则删除对应 CSS 导入。
5. 确保新网站使用相同的页面根类名，或改写 `styles/site-background.css` 与 `styles/sakura-fall.css` 中的根选择器。

该主题假定项目使用 Next.js App Router，且静态资源由 `public/` 目录以根相对路径提供。
