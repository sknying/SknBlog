# Spring Theme

`spring` is SknBlog's current visual theme. It packages the shared design
tokens, code palette, background treatment, falling-petal component, and the
assets those files require.

## Structure

```text
themes/spring/
  index.css                 Theme CSS entry point
  theme.ts                  Public asset paths and theme identity
  theme.json                Machine-readable manifest
  components/sakura-fall.tsx
  styles/                   Tokens, code palette, component CSS, responsive rules

public/themes/spring/
  background.jpg            Repeating page background
  sknblog.jpg               Shared page header image
  logo.svg                  Site logo
  fonts/fira-code/          ASCII code font files
```

Article covers under `public/images/posts/` are content assets, not theme
assets. Keep them outside this package. React page components remain in
`components/`; they provide the site structure and content wiring, while all
visual CSS is owned by this theme.

## Enable It In This Project

`app/globals.css` imports the theme once:

```css
@import "../themes/spring/index.css";
```

For the petal layer, render the theme component through the compatibility
export in `components/sakura-fall.tsx`:

```tsx
import { SakuraFall } from "@/components/sakura-fall";

<main className="sakura-site">
  <SakuraFall />
  {/* Page content */}
</main>
```

Use `SPRING_ASSETS` from `themes/spring/theme.ts` for logo, hero, and fallback
image paths. This prevents future pages from hard-coding old asset locations.

## Move It To Another Next.js Site

1. Copy `themes/spring/` into the new repository.
2. Copy `public/themes/spring/` into the new repository.
3. Import `themes/spring/index.css` from the new root layout's global CSS.
4. Copy the `SakuraFall` component or remove its CSS import if petals are not needed.
5. Ensure the new site uses the same page root classes, or replace the root
   selectors in `styles/site-background.css` and `styles/sakura-fall.css`.

The theme assumes a Next.js App Router project and static assets served from
`public/` at root-relative URLs.
