export interface PostMeta {
  title: string;
  tag: string;
  date: string; // display date
  iso: string; // ISO date, for sorting
  excerpt: string;
  // A post is either hosted here (slug → /blog/<slug>) or published elsewhere
  // (external URL + source label). Internal posts are bespoke pages under
  // src/pages/blog/<slug>.astro (design in Claude Design → convert to .astro).
  slug?: string;
  external?: string;
  source?: string;
}

const all: PostMeta[] = [
  {
    title: 'Prompt injection attacks don’t look like what you’re seeing in social media and headlines',
    tag: 'AI SECURITY',
    date: 'May 2026',
    iso: '2026-05-05',
    excerpt:
      'In email attacks, adversaries most often use prompt injection to confuse AI security analysis (for now).',
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
    external:
      'https://sublime.security/blog/youve-been-invited-to-join-a-meta-for-business-scam/',
    source: 'Sublime Security',
  },
];

// newest first
export const posts: PostMeta[] = [...all].sort((a, b) => b.iso.localeCompare(a.iso));
