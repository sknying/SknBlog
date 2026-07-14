"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/local-icon";
import { SiteLogo } from "@/components/site-logo";
import { BILIBILI_URL, GITHUB_AVATAR, GITHUB_URL, SITE_COPYRIGHT, SITE_EMAIL, SITE_NAME } from "@/lib/site-config";

type SiteSidebarProps = {
  active?: "home" | "archive" | "columns" | "tags";
};

const navigation = [
  { id: "home", label: "首页", href: "/", icon: "solar:home-2-linear" },
  { id: "archive", label: "归档", href: "/posts", icon: "solar:archive-linear" },
  { id: "columns", label: "专栏", href: "/columns", icon: "solar:widget-4-linear" },
  { id: "tags", label: "标签", href: "/tags", icon: "solar:tag-linear" },
  { id: "about", label: "关于", href: "/#about", icon: "solar:user-circle-linear" }
] as const;

export function SiteSidebar({ active }: SiteSidebarProps) {
  return (
    <aside className="sakura-sidebar">
      <Link className="sakura-brand" href="/" aria-label={`${SITE_NAME} 首页`}>
        <SiteLogo className="sakura-brand-logo" priority sizes="72px" />
        <span className="sakura-brand-name">{SITE_NAME}</span>
      </Link>

      <nav className="sakura-nav" aria-label="主导航">
        {navigation.map((item) => {
          const className = active === item.id ? "active" : "";

          if (item.id === "about") {
            return (
              <button className={className} type="button" onClick={() => window.dispatchEvent(new Event("sknblog:open-about"))} key={item.id}>
                <Icon icon={item.icon} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link className={className} href={item.href} key={item.id}>
              <Icon icon={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sakura-now-card" aria-label="当前状态">
        <div className="sakura-disc">
          <Image src={GITHUB_AVATAR} alt={`${SITE_NAME} GitHub 头像`} fill sizes="112px" priority unoptimized />
        </div>
        <span>春风与代码</span>
        <small>今天也在写</small>
      </div>

      <footer className="sakura-side-footer">
        <div>
          <a href={GITHUB_URL} aria-label="GitHub" title="GitHub" target="_blank" rel="noreferrer"><Icon icon="mdi:github" aria-hidden="true" /></a>
          <a href={`mailto:${SITE_EMAIL}`} aria-label={`发送邮件至 ${SITE_EMAIL}`} title={SITE_EMAIL}><Icon icon="solar:letter-linear" aria-hidden="true" /></a>
          <a href={BILIBILI_URL} aria-label="哔哩哔哩" title="哔哩哔哩" target="_blank" rel="noreferrer"><Icon icon="simple-icons:bilibili" aria-hidden="true" /></a>
        </div>
        <p>{SITE_COPYRIGHT}</p>
      </footer>
    </aside>
  );
}
