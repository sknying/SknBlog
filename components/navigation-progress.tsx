"use client";

import { useEffect, useRef } from "react";

const MIN_VISIBLE_TIME = 240;
const MAX_WAIT_TIME = 12000;
const COMPLETE_DURATION = 220;

type NavigationStartEvent = CustomEvent<{ url: string }>;

function comparableUrl(value: string) {
  const url = new URL(value, window.location.href);
  return `${url.pathname}${url.search}`;
}

export function NavigationProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const progress = progressRef.current;
    if (!progress) return;

    const bar = progress.firstElementChild as HTMLDivElement | null;
    if (!bar) return;

    let frame = 0;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    let navigationId = 0;

    const reset = () => {
      progress.classList.remove("navigation-progress--active");
      bar.style.transition = "none";
      bar.style.transform = "scaleX(0)";
    };

    const finish = (id: number, startedAt: number) => {
      if (id !== navigationId) return;

      const elapsed = performance.now() - startedAt;
      const delay = Math.max(0, MIN_VISIBLE_TIME - elapsed);

      finishTimer = setTimeout(() => {
        if (id !== navigationId) return;
        bar.style.transition = `transform ${COMPLETE_DURATION}ms ease-out`;
        bar.style.transform = "scaleX(1)";
        progress.classList.add("navigation-progress--complete");

        finishTimer = setTimeout(() => {
          if (id !== navigationId) return;
          progress.classList.remove("navigation-progress--active", "navigation-progress--complete");
          bar.style.transition = "none";
          bar.style.transform = "scaleX(0)";
        }, COMPLETE_DURATION);
      }, delay);
    };

    const handleNavigationStart = (event: Event) => {
      const { url } = (event as NavigationStartEvent).detail;
      const targetUrl = comparableUrl(url);
      const startedAt = performance.now();
      const id = ++navigationId;

      if (finishTimer) clearTimeout(finishTimer);
      if (frame) cancelAnimationFrame(frame);

      progress.classList.remove("navigation-progress--complete");
      progress.classList.add("navigation-progress--active");
      bar.style.transition = "none";
      bar.style.transform = "scaleX(0.06)";

      requestAnimationFrame(() => {
        if (id !== navigationId) return;
        bar.style.transition = "transform 8s cubic-bezier(0.12, 0.72, 0.2, 1)";
        bar.style.transform = "scaleX(0.86)";
      });

      const watchNavigation = () => {
        if (id !== navigationId) return;

        const reachedTarget = comparableUrl(window.location.href) === targetUrl;
        const timedOut = performance.now() - startedAt >= MAX_WAIT_TIME;

        if (reachedTarget || timedOut) {
          finish(id, startedAt);
          return;
        }

        frame = requestAnimationFrame(watchNavigation);
      };

      frame = requestAnimationFrame(watchNavigation);
    };

    window.addEventListener("sknblog:navigation-start", handleNavigationStart);

    return () => {
      window.removeEventListener("sknblog:navigation-start", handleNavigationStart);
      if (frame) cancelAnimationFrame(frame);
      if (finishTimer) clearTimeout(finishTimer);
      reset();
    };
  }, []);

  return (
    <div ref={progressRef} className="navigation-progress" aria-hidden="true">
      <div />
    </div>
  );
}
