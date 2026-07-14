"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let scrollableHeight = 0;

    const updateProgress = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollingElement = document.scrollingElement ?? document.documentElement;
        const progress = scrollableHeight > 0
          ? Math.min(1, Math.max(0, scrollingElement.scrollTop / scrollableHeight))
          : 0;

        if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      });
    };

    const measurePage = () => {
      const scrollingElement = document.scrollingElement ?? document.documentElement;
      scrollableHeight = Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
      updateProgress();
    };

    const resizeObserver = new ResizeObserver(measurePage);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", measurePage);
    measurePage();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", measurePage);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="scroll-progress" aria-hidden="true"><div ref={barRef} /></div>;
}
