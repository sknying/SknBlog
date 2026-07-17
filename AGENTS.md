# SknBlog 协作指南

## 项目目标

SknBlog 是一个静态导出的个人技术博客。内容由本地 Markdown 驱动，重点是稳定阅读、清晰层级与轻量的二次元氛围。

## 技术约束

- 使用 Next.js App Router、React、TypeScript、CSS 与 pnpm。
- 保持 `next.config.ts` 的 `output: "export"`，所有页面必须能静态生成。
- 修改 Next.js、React、Iconify、Cloudflare 或其他库配置前，先查询 Context7 官方文档。
- 不引入 Tailwind，也不使用浏览器运行时图标 API。
- 图标使用本地 Iconify 数据，并在 `lib/local-icons.ts` 注册。

## 内容模型

- 文章位于 `content/posts/YYYY/*.md`，文件名是 slug。
- 目录年份必须与 `publishedAt` 年份一致。
- 文章 frontmatter 支持 `title`、`publishedAt`、`column`、`columnOrder`、`tags`、`summary`、`image`、`mood`、`intro`、`read`、`draft`。
- `columnOrder` 越小越靠前，只影响所属专栏内的顺序。无专栏文章按发布时间从新到旧排序。
- 专栏配置位于 `content/columns/*.md`。文章的 `column` 必须精确匹配专栏 `name`。
- 专栏 frontmatter 支持 `name`、`slug`、`coverImage`、`summary`、`intro`、`mood`、`quoteAuthor` 与 `order`；`quoteAuthor` 缺省时为 `Sknying`。
- 专栏配置可以没有文章；空专栏仍会生成索引卡片与静态详情页。
- 标签由文章 frontmatter 自动聚合，不在页面中创建或删除。

## 图片与资源

- 优先使用 `public/images/` 下的本地资源。
- 外部大图不得直接作为文章或专栏封面；先压缩并落地到 `public/images/posts/`。
- `next/image` 在静态导出中使用非优化模式，必须提供准确的 `sizes`，首屏图才使用 `priority`。
- 站内 Logo 使用 `public/images/sknblog-logo-icon.svg`；浏览器图标使用 `public/favicon.png` 与 `public/apple-touch-icon.png`。
- 代码字体仅使用 Fira Code 的 ASCII 字符范围，非 ASCII 字符回退到 Noto Serif SC。

## 视觉与交互

- 当前主题为暖色纸张与深色夜景两套模式，默认跟随系统。
- 保持现有背景图、玻璃卡片、樱花层和低圆角语言的一致性。
- 不使用纯平页面背景、默认 Tailwind 色板、紫蓝渐变、营销式横幅加三卡片布局或无意义装饰。
- 小型 UI 文案使用常规字重；仅大标题、错误码与文章引用可使用粗体。
- 所有图标按钮必须提供 `aria-label` 和 `title`。
- 动画只使用 `transform` 与 `opacity`；必须提供 `prefers-reduced-motion` 降级。
- 移动端不得出现横向溢出，正文图片和代码块必须可控。

## 代码规范

- 保持组件样式在对应 CSS 文件，公共 token 放在 `app/styles/`。
- 使用现有数据工具与组件，不进行无关重构。
- 手动编辑必须使用 `apply_patch`。
- 默认使用 ASCII；仅在中文内容、已有 Unicode 文件或必要 UI 文案中使用非 ASCII。
- 不删除或回退用户已有改动。

## 验证与 Git

- 用户自行启动开发服务器，不要启动或停止 `pnpm dev`。
- 完成代码变更后运行 `pnpm build`；CSS 小改也至少执行 `git diff --check`。
- 当前日常开发分支是 `dev`。未经明确要求不要合并、推送或切换到 `main`。
- 每项完成的用户请求单独提交，提交信息使用简洁的 Conventional Commit 风格。
- `out/`、`.next/`、`.playwright-cli/`、`tsconfig.tsbuildinfo` 都是可再生且忽略的目录或文件。开发服务器运行时不得清理 `.next/`。
