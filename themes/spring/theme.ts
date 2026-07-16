/**
 * The public URLs owned by the Spring theme. Keep theme-wide imagery here so
 * pages do not depend on the old generic `/images` directory structure.
 */
export const SPRING_THEME = {
  id: "spring",
  name: "Spring",
  version: 1,
  entryCss: "@/themes/spring/index.css"
} as const;

export const SPRING_ASSETS = {
  background: "/themes/spring/background.jpg",
  hero: "/themes/spring/sknblog.jpg",
  logo: "/themes/spring/logo.svg"
} as const;
