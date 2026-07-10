export type ArticleBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "quote";
      text: string;
      cite: string;
    }
  | {
      type: "code";
      title: string;
      code: string;
    }
  | {
      type: "list";
      title: string;
      items: string[];
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "table";
      title: string;
      headers: string[];
      rows: string[][];
    }
  | {
      type: "math";
      formula: string;
      caption?: string;
    };

export type Post = {
  slug: string;
  title: string;
  tags: string[];
  publishedAt: string;
  date: string;
  read: string;
  summary: string;
  image: string;
  mood: string;
  intro: string;
  blocks: ArticleBlock[];
};

export const posts: Post[] = [
  {
    slug: "next-cache-notes",
    title: "Next 缓存别硬猜",
    tags: ["Next.js", "缓存", "排查"],
    publishedAt: "2026-07-09T01:20:00+08:00",
    date: "07.09",
    read: "8 分钟",
    summary: "把路由缓存拆开看。少一点玄学。",
    image: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg",
    mood: "凌晨排查缓存",
    intro: "缓存不是黑箱。先分层。再下手。",
    blocks: [
      {
        type: "paragraph",
        text: "我以前也爱猜。改完代码，刷新两次。好了就算。坏了就怪框架。后来发现，这样只会把问题养大。"
      },
      {
        type: "list",
        title: "先看这 3 层",
        items: ["请求缓存。它管 fetch。", "路由缓存。它管页面切换。", "构建缓存。它管产物。"]
      },
      {
        type: "code",
        title: "app/posts/[slug]/page.tsx",
        code: `export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}`
      },
      {
        type: "quote",
        text: "缓存没错。错的是没说清楚谁在缓存。",
        cite: "半夜 1 点的自己"
      },
      {
        type: "paragraph",
        text: "排查时别一口气关掉所有缓存。先缩小范围。能复现，才有得修。"
      }
    ]
  },
  {
    slug: "markdown-rendering-notes",
    title: "Markdown 渲染小坑",
    tags: ["Markdown", "渲染", "文档"],
    publishedAt: "2026-07-06T23:40:00+08:00",
    date: "07.06",
    read: "6 分钟",
    summary: "代码块、引用、标题锚点。都别糊。",
    image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
    mood: "文档渲染现场",
    intro: "Markdown 好写。难的是好读。",
    blocks: [
      {
        type: "paragraph",
        text: "一篇技术文档，最先被读到的不是观点。是标题、`inline code`、代码块和引用。复杂度大概是 $O(n log n)$。可以跳到 [Next.js 文档](https://nextjs.org/docs) 查细节。"
      },
      {
        type: "list",
        title: "我会先处理这些",
        items: ["标题锚点要稳定。", "代码块要有语言名。", "引用别像普通段落。", "长表格别硬塞。"]
      },
      {
        type: "image",
        src: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
        alt: "桌面上的代码编辑器与笔记",
        caption: "嵌入图片要先留空间。别让正文跳。"
      },
      {
        type: "table",
        title: "渲染检查表",
        headers: ["元素", "风险", "处理"],
        rows: [
          ["超链接", "颜色太跳", "用主题青绿"],
          ["图片", "高度乱跳", "固定比例"],
          ["表格", "移动端溢出", "横向滚动"],
          ["公式", "像乱码", "单独成块"]
        ]
      },
      {
        type: "math",
        formula: "\\sum_{i=1}^{n} i = n(n + 1) / 2",
        caption: "数学公式先保证可读。之后再接 KaTeX。"
      },
      {
        type: "code",
        title: "markdown-parser.ts",
        code: `const headings = tokens
  .filter((token) => token.type === "heading")
  .map((token) => ({
    id: slugify(token.text),
    text: token.text,
  }));`
      },
      {
        type: "quote",
        text: "Markdown 不是纯文本。它是阅读节奏。",
        cite: "SknBlog 渲染笔记"
      }
    ]
  },
  {
    slug: "glass-ui-readable",
    title: "玻璃 UI 不等于透明",
    tags: ["Design", "Glass UI", "可读性"],
    publishedAt: "2026-06-28T21:15:00+08:00",
    date: "06.28",
    read: "5 分钟",
    summary: "先保证可读。再谈氛围。",
    image: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg",
    mood: "设计自救记录",
    intro: "毛玻璃很好看。前提是字能看。",
    blocks: [
      {
        type: "paragraph",
        text: "很多玻璃效果翻车，是因为只调了透明度。背景一复杂，文字立刻消失。"
      },
      {
        type: "list",
        title: "别只盯着 blur",
        items: ["加一层深色底。", "边框要能分层。", "文字对比要够。", "动效别抢内容。"]
      },
      {
        type: "code",
        title: "glass-card.css",
        code: `.card {
  background: rgba(7, 19, 15, 0.72);
  border: 1px solid rgba(225, 239, 223, 0.14);
  backdrop-filter: blur(18px);
}`
      },
      {
        type: "paragraph",
        text: "氛围感不是糊。氛围感是层次、亮点和克制。"
      }
    ]
  },
  {
    slug: "admin-publish-flow",
    title: "管理员发文流程",
    tags: ["Admin", "发布", "Markdown"],
    publishedAt: "2026-06-21T10:30:00+08:00",
    date: "06.21",
    read: "7 分钟",
    summary: "从本地 Markdown 到线上页面。",
    image: "https://picsum.photos/id/180/900/700",
    mood: "后台流程草图",
    intro: "发文流程越短，越可能坚持。",
    blocks: [
      {
        type: "paragraph",
        text: "博客后台不需要像企业 CMS。我的目标很简单：本地写完，丢进去，预览，发布。"
      },
      {
        type: "list",
        title: "最低配流程",
        items: ["上传 Markdown。", "检查 frontmatter。", "生成预览页。", "确认后发布。"]
      },
      {
        type: "code",
        title: "frontmatter",
        code: `---
title: 管理员发文流程
date: 2026-06-21
tags: [Admin, 发布]
---`
      },
      {
        type: "quote",
        text: "能少点一步，就少点一步。",
        cite: "懒人后台原则"
      }
    ]
  }
];

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function getPrimaryTag(post: Pick<Post, "tags">) {
  return post.tags[0] ?? "未标记";
}

export function getTagLabel(post: Pick<Post, "tags">) {
  return post.tags.length > 0 ? post.tags.join(" / ") : "未标记";
}

export function getPostTimeLabel(post: Pick<Post, "publishedAt" | "date">) {
  const matched = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(post.publishedAt);
  return matched ? `${matched[1]}/${matched[2]}/${matched[3]} ${matched[4]}:${matched[5]}` : post.date;
}
