import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AboutDialog } from "@/components/about-dialog";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteLoader } from "@/components/site-loader";
import { getAboutContent } from "@/lib/about-data";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SknBlog | 半夜写代码的技术博客",
  description: "一个跟随系统明暗主题的技术博客，放 Markdown、代码笔记和一点 galgame 气味。",
  openGraph: {
    title: "SknBlog",
    description: "凌晨也能读的技术博客。",
    type: "website"
  }
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef5fc" },
    { media: "(prefers-color-scheme: dark)", color: "#11182a" }
  ]
};

const themeScript = `
  try {
    var savedTheme = localStorage.getItem("sknblog-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch (_) {}
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const aboutContent = getAboutContent();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Script id="theme-preference" strategy="beforeInteractive">{themeScript}</Script>
        <SiteLoader />
        <ScrollProgress />
        {children}
        <AboutDialog content={aboutContent} />
      </body>
    </html>
  );
}
