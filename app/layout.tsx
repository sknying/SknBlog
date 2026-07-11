import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const body = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "700"]
});

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
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
