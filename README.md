# Luke Wescott — Personal Site

Personal site for Luke Wescott (Threat Detection Engineer). Built with
[Astro](https://astro.build), static-rendered, ready for Cloudflare Pages.

Design direction: a **reticle / scope** visual language — a custom crosshair cursor that
hides the OS pointer, a grid spotlight revealed around the cursor, a corner-bracket
lock-box that snaps onto interactive elements, and a `SCAN · CLEAR/LOCKED` HUD with live
coordinates. Layered over the **Signal** color palette (Syne / Hanken Grotesk / Space Mono
type, heavy borders, invert-on-hover) with a light/dark toggle. Derived from a Claude
Design prototype ("Luke Wescott - Reticle Site").

## Commands

| Command           | Action                                         |
| ----------------- | ---------------------------------------------- |
| `npm install`     | Install dependencies                           |
| `npm run dev`     | Dev server at `localhost:4321`                 |
| `npm run build`   | Static build to `dist/`                        |
| `npm run preview` | Preview the production build locally           |

## The reticle layer

A global progressive-enhancement layer lives in `layouts/Base.astro` (overlay markup +
inline script + styles):

- Replaces the cursor with a crosshair/scope and a grid spotlight that tracks the pointer.
- The lock-box and HUD snap to the nearest ancestor with a **`data-target`** attribute on
  hover, showing that element's label and flipping the status to `LOCKED`.
- **Guarded**: only activates on fine pointers (`pointer: fine`) without
  `prefers-reduced-motion`; otherwise the normal cursor is kept and the overlay stays
  hidden. Also force-hidden under 760px.

To make a new element "lockable", add `data-target="<label>"` to it — no other wiring
needed.

## Structure

```
src/
  styles/global.css   Signal palette tokens (light/dark), fonts, keyframes, reticle cursor guard
  layouts/Base.astro  <head>, header nav, footer, reticle layer, theme bootstrap, mobile overlay nav
  components/         Header, Footer, Marquee
  data/posts.ts       Blog index metadata
  pages/
    index.astro       Home (hero + status pill + bordered nav grid + marquee)
    resume.astro      Living résumé (portrait, expandable bullets, verbose toggle)
    github.astro      GitHub contribution heatmap + repos (live @IndiaAce data at build time)
    now.astro         /now page (Currently / Learning / Building / Based)
    blog/index.astro  Blog / writing index
    blog/<slug>.astro One page per internal post
public/assets/        luke.jpg + favicon
```

## Adding a blog post

Posts can be hosted here or linked out (see `data/posts.ts` — each entry is either internal
`slug` or `external` + `source`). For an internal post:

1. Create `src/pages/blog/<slug>.astro` that imports `Base.astro` (design it in Claude
   Design, convert to an `.astro` page).
2. Add an entry with a matching `slug` to `data/posts.ts` so it appears on `/blog`.

## Deploy (Cloudflare Pages)

Static output — no adapter needed. Either connect the GitHub repo in the Cloudflare
dashboard (build command `npm run build`, output directory `dist`), or deploy directly:

```
npx wrangler pages deploy dist
```
