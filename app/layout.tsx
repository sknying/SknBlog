import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AboutDialog } from "@/components/about-dialog";
import { NavigationProgress } from "@/components/navigation-progress";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteLoader } from "@/components/site-loader";
import { getAboutContent } from "@/lib/about-data";
import "katex/dist/katex.min.css";
import "./globals.css";

// Next.js reads this object at build time and writes site-wide `<head>` data.
// Keep browser icons, title, and social-preview defaults in this one place.
export const metadata: Metadata = {
  metadataBase: new URL("https://sknying.github.io"),
  title: "SknBlog | 半夜写代码的技术博客",
  description: "一个跟随系统明暗主题的技术博客，放 Markdown、代码笔记和一点 galgame 气味。",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/images/sknblog-logo-icon.svg", type: "image/svg+xml" }
    ],
    shortcut: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "512x512" }]
  },
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

// Run before React hydrates so the saved theme is visible on the first paint.
// This avoids the flash from light to dark (or the other way around).
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
  // Markdown is read during static generation. The dialog receives finished
  // content and never needs to read files in the browser.
  const aboutContent = getAboutContent();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {/* `beforeInteractive` deliberately runs before interactive components. */}
        <Script id="theme-preference" strategy="beforeInteractive">{themeScript}</Script>
        <SiteLoader />
        <ScrollProgress />
        <NavigationProgress />
        {children}
        <AboutDialog content={aboutContent} />
      </body>
    </html>
  );
}
