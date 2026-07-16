"use client";

// This component uses browser APIs (`window`, `localStorage`, and click
// events), so it must be a Client Component. Other components are static by
// default and do not need this directive.

import { useEffect, useState } from "react";
import { Icon } from "@/components/local-icon";

type ResolvedTheme = "light" | "dark";

function getResolvedTheme(): ResolvedTheme {
  // A manual choice stored on `<html>` takes priority over the system theme.
  const explicitTheme = document.documentElement.dataset.theme;

  if (explicitTheme === "light" || explicitTheme === "dark") {
    return explicitTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  // State drives the button icon and its accessible label after a click.
  const [theme, setTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    // Effects run only in the browser. Register the system-theme listener and
    // return a cleanup function so it is removed when the component unmounts.
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
      // The early script in `app/layout.tsx` restores this value on the next
      // page load, before the user sees the page.
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
