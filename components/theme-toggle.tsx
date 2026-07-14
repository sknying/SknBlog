"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/local-icon";

type ResolvedTheme = "light" | "dark";

function getResolvedTheme(): ResolvedTheme {
  const explicitTheme = document.documentElement.dataset.theme;

  if (explicitTheme === "light" || explicitTheme === "dark") {
    return explicitTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => setTheme(getResolvedTheme());

    syncTheme();
    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: ResolvedTheme = getResolvedTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    try {
      localStorage.setItem("sknblog-theme", nextTheme);
    } catch {
      // Theme switching still works when storage is unavailable.
    }
    setTheme(nextTheme);
  }

  return (
    <button
      className={className}
      type="button"
      onClick={toggleTheme}
      aria-label={`切换为${theme === "dark" ? "浅色" : "深色"}模式`}
      title={`切换为${theme === "dark" ? "浅色" : "深色"}模式`}
    >
      <Icon icon={theme === "dark" ? "solar:sun-2-linear" : "solar:moon-linear"} aria-hidden="true" />
    </button>
  );
}
