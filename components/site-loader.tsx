"use client";

import { useEffect, useState } from "react";
import { SiteLogo } from "@/components/site-logo";

const EXIT_DURATION = 360;
const MAX_LOADING_DURATION = 3000;

export function SiteLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let hasFinished = false;

    const finishLoading = () => {
      if (hasFinished) return;
      hasFinished = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      setIsLeaving(true);
      exitTimer = setTimeout(() => setIsVisible(false), EXIT_DURATION);
    };

    fallbackTimer = setTimeout(finishLoading, MAX_LOADING_DURATION);

    if (document.readyState === "complete") {
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading, { once: true });
    }

    return () => {
      window.removeEventListener("load", finishLoading);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`site-loader${isLeaving ? " site-loader--leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="网站正在加载"
    >
      <div className="site-loader__mark" aria-hidden="true">
        <div className="site-loader__orbit">
          <span className="site-loader__satellite" />
        </div>
        <div className="site-loader__logo-shell">
          <SiteLogo className="site-loader__logo" priority sizes="96px" />
        </div>
      </div>
    </div>
  );
}
