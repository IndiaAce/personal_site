// Unified post model used across the Writing section.
//
// Posts come from three places, distinguished by `kind`:
//   • 'external'  — published elsewhere (e.g. the Sublime Security blog). Links
//                   straight off-site; defined by hand in `manualPosts` below.
//   • 'substack'  — written on Substack, pulled from the RSS feed at build time
//                   and rendered IN LINE on /blog/<slug> (full text, with a
//                   "Read on Substack" link). See src/lib/substack.ts.
//   • 'internal'  — a bespoke page at src/pages/blog/<slug>.astro (none yet).
//
// The merged, date-sorted list comes from src/lib/posts.ts → getPosts().
export interface Post {
  title: string;
  tag: string;
  date: string; // display date, e.g. "May 2026"
  iso: string; // ISO date (YYYY-MM-DD), for sorting
  excerpt: string;
  kind: 'external' | 'substack' | 'internal';
  slug?: string; // reader page slug for 'substack' / 'internal'
  external?: string; // canonical off-site URL ('external' link target, or "read on Substack")
  source?: string; // label, e.g. "Sublime Security", "Substack"
  contentHtml?: string; // full inline body for 'substack' posts
}

// Hand-maintained posts published on other platforms.
export const manualPosts: Post[] = [
  {
    title: 'Prompt injection attacks don’t look like what you’re seeing in social media and headlines',
    tag: 'AI SECURITY',
    date: 'May 2026',
    iso: '2026-05-05',
    excerpt:
      'In email attacks, adversaries most often use prompt injection to confuse AI security analysis (for now).',
    kind: 'external',
    external:
      'https://sublime.security/blog/prompt-injection-attacks-dont-look-like-what-youre-seeing-in-social-media-and-headlines/',
    source: 'Sublime Security',
  },
  {
    title: 'Using AI signals within malicious email for attack detection and threat hunting',
    tag: 'THREAT HUNTING',
    date: 'Apr 2026',
    iso: '2026-04-15',
    excerpt:
      'AI signals within email attacks can bolster detection, prevention, and threat hunting.',
    kind: 'external',
    external:
      'https://sublime.security/blog/using-ai-signals-within-malicious-email-for-attack-detection-and-threat-hunting/',
    source: 'Sublime Security',
  },
  {
    title: 'You’ve been invited to join a Meta for Business scam!',
    tag: 'PHISHING',
    date: 'Nov 2025',
    iso: '2025-11-21',
    excerpt:
      'Credential phishing with fake and hijacked Meta for Business programs.',
    kind: 'external',
    external:
      'https://sublime.security/blog/youve-been-invited-to-join-a-meta-for-business-scam/',
    source: 'Sublime Security',
  },
];
