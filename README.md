# Luke Wescott — Personal Site

Brutalist personal site for Luke Wescott (Threat Detection Engineer). Built with
[Astro](https://astro.build), static-rendered, ready for Cloudflare Pages.

Design direction: **Brutalist** visual language (heavy 2px borders, Syne / Space Mono /
Hanken Grotesk type, invert-on-hover, marquee) with the **Signal** color palette and a
light/dark toggle. Derived from a Claude Design prototype.

## Commands

| Command           | Action                                         |
| ----------------- | ---------------------------------------------- |
| `npm install`     | Install dependencies                           |
| `npm run dev`     | Dev server at `localhost:4321`                 |
| `npm run build`   | Static build to `dist/`                        |
| `npm run preview` | Preview the production build locally           |

## Structure

```
src/
  styles/global.css   Signal palette tokens (light/dark), fonts, keyframes, brutalist utilities
  layouts/Base.astro  <head>, header nav, footer, theme bootstrap (no-flash), mobile overlay nav
  components/         Header, Footer, Marquee
  data/posts.ts       Blog index metadata
  pages/
    index.astro       Home (brutalist hero + marquee + nav tiles)
    resume.astro      Living résumé
    github.astro      Procedural contribution heatmap + repos
    blog/index.astro  Blog index
    blog/<slug>.astro One page per post
public/assets/        luke.jpg + favicon
```

## Adding a blog post

Each post is a bespoke page (design it in Claude Design, convert to an `.astro` page):

1. Create `src/pages/blog/<slug>.astro` that imports `Base.astro`.
2. Add an entry to `src/pages/../data/posts.ts` so it appears on `/blog`.

## Deploy (Cloudflare Pages)

Static output — no adapter needed. Either connect the GitHub repo in the Cloudflare
dashboard (build command `npm run build`, output directory `dist`), or deploy directly:

```
npx wrangler pages deploy dist
```
