"use client";

import Link from "next/link";
import { Icon } from "@/components/local-icon";
import { SiteFooterBrand } from "@/components/site-footer-brand";
import { SakuraFall } from "@/components/sakura-fall";
import { SiteLogo } from "@/components/site-logo";
import { SiteSidebar } from "@/components/site-sidebar";
import { SITE_COPYRIGHT } from "@/lib/site-config";

type ErrorStateProps = {
  code: "404" | "500";
  title: string;
  message: string;
  hint: string;
  onRetry?: () => void;
};

export function ErrorState({ code, title, message, hint, onRetry }: ErrorStateProps) {
  return (
    <main className="error-page">
      <SakuraFall />
      <SiteSidebar />

      <div className="error-workspace">
        <section className="error-stage" aria-labelledby="error-title">
          <div className="error-code" aria-hidden="true">
            <span>{code.slice(0, 1)}</span>
            <SiteLogo className="error-code-logo" priority sizes="clamp(92px, 15vw, 164px)" />
            <span>{code.slice(2)}</span>
          </div>

          <div className="error-copy">
            <span className="error-kicker"><Icon icon="solar:stars-line-linear" aria-hidden="true" />ERROR {code}</span>
            <h1 id="error-title">{title}</h1>
            <p>{message}</p>
            <small>{hint}</small>

            <div className="error-actions">
              <Link className="error-primary-action" href="/">
                <Icon icon="solar:home-2-linear" aria-hidden="true" />
                回到首页
              </Link>
              <Link href="/posts">
                <Icon icon="solar:archive-linear" aria-hidden="true" />
                查看归档
              </Link>
              {onRetry ? (
                <button type="button" onClick={onRetry}>
                  <Icon icon="solar:arrow-right-linear" aria-hidden="true" />
                  再试一次
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <footer className="error-footer">
          <SiteFooterBrand />
          <span>{SITE_COPYRIGHT}</span>
        </footer>
      </div>
    </main>
  );
}
