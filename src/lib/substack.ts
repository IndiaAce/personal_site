// ============================================================
// Substack → inline posts.
//
// Pulls your Substack RSS feed at BUILD time and turns each post into a `Post`
// rendered IN LINE on /blog/<slug> (full text, styled to match the site) with a
// "Read on Substack" link. Free posts ship their entire body in
// <content:encoded>; paywalled posts only expose a preview, which still renders
// cleanly with the read-on-Substack link as the call to action.
//
// Publication URL:
//   • Default below points at lukemadethat.substack.com.
//   • Override with SUBSTACK_URL (e.g. in .env or Cloudflare env vars) — handy
//     if you ever rename the publication or add a custom domain.
//
// If the feed is unreachable at build time we return [] so the build never
// breaks; the Writing page just shows the hand-maintained posts.
// ============================================================
import { XMLParser } from 'fast-xml-parser';
import type { Post } from '../data/posts';

const SUBSTACK_URL = (
  import.meta.env.SUBSTACK_URL ??
  (typeof process !== 'undefined' ? process.env.SUBSTACK_URL : undefined) ??
  'https://lukemadethat.substack.com'
).replace(/\/+$/, '');

// How fiction is separated from security writing. Substack's RSS exposes no
// tag/section/category metadata, so we key off the post's URL slug: give a
// fiction post a URL starting with this prefix (Substack: post settings →
// "URL") and it lands in the FICTION bucket. Everything else is WRITING.
// No title hacks, no keyword guessing, no false positives.
const FICTION_SLUG_PREFIX = 'fic-';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // CDATA blocks (titles, content:encoded) are merged into the node's text.
  processEntities: true,
});

const asArray = <T>(v: T | T[] | undefined): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function slugFromLink(link: string): string {
  // https://pub.substack.com/p/<slug>  →  <slug>
  const m = link.replace(/\/+$/, '').match(/\/p\/([^/?#]+)/);
  if (m) return m[1];
  return link.replace(/\/+$/, '').split('/').pop() || 'post';
}

const isFiction = (slug: string): boolean => slug.startsWith(FICTION_SLUG_PREFIX);

export async function getSubstackPosts(): Promise<Post[]> {
  try {
    const xml = await fetch(`${SUBSTACK_URL}/feed`, {
      headers: { 'User-Agent': 'personal-site (+astro build)' },
    }).then((r) => {
      if (!r.ok) throw new Error('substack feed ' + r.status);
      return r.text();
    });

    const doc = parser.parse(xml);
    const items = asArray<any>(doc?.rss?.channel?.item);

    const posts: Post[] = items.map((it) => {
      const title = String(it.title ?? 'Untitled').trim();
      const link = String(it.link ?? `${SUBSTACK_URL}`).trim();
      const slug = slugFromLink(link);
      const contentHtml = String(it['content:encoded'] ?? it.description ?? '').trim();

      const d = it.pubDate ? new Date(it.pubDate) : new Date();
      const iso = Number.isNaN(d.getTime()) ? '1970-01-01' : d.toISOString().slice(0, 10);
      const date = Number.isNaN(d.getTime())
        ? ''
        : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

      const descText = stripHtml(String(it.description ?? ''));
      const bodyText = descText || stripHtml(contentHtml);
      const excerpt =
        bodyText.length > 180 ? bodyText.slice(0, 177).trimEnd() + '…' : bodyText;

      return {
        title,
        tag: isFiction(slug) ? 'FICTION' : 'WRITING',
        date,
        iso,
        excerpt,
        kind: 'substack' as const,
        slug,
        external: link, // "Read on Substack" target
        source: 'Substack',
        contentHtml,
      };
    });

    // de-dupe by slug, newest first
    const seen = new Set<string>();
    return posts
      .filter((p) => p.slug && !seen.has(p.slug) && seen.add(p.slug))
      .sort((a, b) => b.iso.localeCompare(a.iso));
  } catch (err) {
    console.warn('[substack] feed fetch/parse failed — skipping inline posts:', err);
    return [];
  }
}
