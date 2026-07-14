"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/local-icon";
import type { AboutContent } from "@/lib/about-data";
import { GITHUB_URL } from "@/lib/site-config";

export function AboutDialog({ content }: { content: AboutContent }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const showDialog = () => setOpen(true);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("sknblog:open-about", showDialog);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("sknblog:open-about", showDialog);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="about-dialog-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="about-dialog" role="dialog" aria-modal="true" aria-labelledby="about-dialog-title">
        <header>
          <div>
            <span><Icon icon="solar:stars-line-linear" aria-hidden="true" />本站说明</span>
            <h2 id="about-dialog-title">{content.title}</h2>
            <p>{content.lead}</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="关闭关于弹窗" autoFocus><Icon icon="solar:close-circle-linear" aria-hidden="true" /></button>
        </header>
        <div className="about-dialog-content">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h3>{section.heading}</h3>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <footer>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="访问 Sknying 的 GitHub">
            <Icon icon="mdi:github" aria-hidden="true" />
            <span>github.com/sknying</span>
          </a>
        </footer>
      </section>
    </div>
  );
}
