// ============================================================
// Per-repo daily commit series for the GitHub page line graph.
//
// Uses GitHub's GraphQL `contributionsCollection`, which returns per-repo,
// per-day commit counts directly (including private repos), capped at a
// 1-year window. A single fetch covers every range the UI offers
// (1M / 3M / 6M / 1Y) — the toggle just filters client-side.
//
// Requires a Personal Access Token (repo: read scope) at BUILD time:
//   • Local: put GITHUB_TOKEN=... in a .env file (git-ignored).
//   • Cloudflare Pages: Settings → Environment variables → GITHUB_TOKEN.
// Without a token this returns null and the page falls back to the heatmap.
// ============================================================

const USER = 'IndiaAce';
const TOKEN =
  (typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined) ??
  import.meta.env.GITHUB_TOKEN;

// How many public repos get their own line before the rest fold into "Other".
const MAX_NAMED_REPOS = 9;

const PRIVATE_LABEL = 'Private';
const OTHER_LABEL = 'Other';

// Recognizable colors for known repos; everything else cycles the palette.
const COLOR_MAP: Record<string, string> = {
  'sublime-rules': '#19e68c', // Sublime green
  [PRIVATE_LABEL]: '#3b82f6', // blue
  [OTHER_LABEL]: '#8a8aa3',   // muted gray
};
const PALETTE = [
  '#e0b341', '#e0567b', '#7a5cff', '#37c8d6', '#e07a3c',
  '#9aa6ff', '#d65fd6', '#5fd68a', '#d6c45f', '#ff8a5f',
];

export type RepoSeries = {
  name: string;
  isPrivate: boolean;
  color: string;
  total: number;
  daily: Record<string, number>; // 'YYYY-MM-DD' -> commit count
};

export type ContribData = {
  series: RepoSeries[];
  total: number; // total contributions in the window
  from: string; // 'YYYY-MM-DD'
  to: string; // 'YYYY-MM-DD'
  generatedAt: string;
};

const QUERY = `
query($from: DateTime!, $to: DateTime!) {
  viewer {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar { totalContributions }
      commitContributionsByRepository(maxRepositories: 100) {
        repository { name isPrivate }
        contributions(first: 100) {
          nodes { occurredAt commitCount }
        }
      }
    }
  }
}`;

const colorFor = (name: string, idx: number): string =>
  COLOR_MAP[name] ?? PALETTE[idx % PALETTE.length];

export async function getContributionSeries(): Promise<ContribData | null> {
  if (!TOKEN) {
    console.warn('[github] no GITHUB_TOKEN set — skipping line graph (heatmap fallback).');
    return null;
  }

  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': USER,
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { from: from.toISOString(), to: to.toISOString() },
    }),
  });

  if (!res.ok) throw new Error('github graphql ' + res.status);
  const json = await res.json();
  if (json.errors) throw new Error('github graphql: ' + JSON.stringify(json.errors));

  const cc = json.data?.viewer?.contributionsCollection;
  if (!cc) throw new Error('github graphql: no contributionsCollection');

  const total: number = cc.contributionCalendar?.totalContributions ?? 0;

  // Aggregate per-day commit counts; fold all private repos into one series.
  const privateDaily: Record<string, number> = {};
  let privateTotal = 0;
  const publicRepos: { name: string; total: number; daily: Record<string, number> }[] = [];

  for (const entry of cc.commitContributionsByRepository ?? []) {
    const daily: Record<string, number> = {};
    let t = 0;
    for (const node of entry.contributions?.nodes ?? []) {
      const day = String(node.occurredAt).slice(0, 10);
      const n = node.commitCount ?? 0;
      daily[day] = (daily[day] ?? 0) + n;
      t += n;
    }
    if (t === 0) continue;

    if (entry.repository?.isPrivate) {
      for (const [d, n] of Object.entries(daily)) privateDaily[d] = (privateDaily[d] ?? 0) + n;
      privateTotal += t;
    } else {
      publicRepos.push({ name: entry.repository?.name ?? 'unknown', total: t, daily });
    }
  }

  publicRepos.sort((a, b) => b.total - a.total);

  const named = publicRepos.slice(0, MAX_NAMED_REPOS);
  const rest = publicRepos.slice(MAX_NAMED_REPOS);

  const series: RepoSeries[] = named.map((r, i) => ({
    name: r.name,
    isPrivate: false,
    color: colorFor(r.name, i),
    total: r.total,
    daily: r.daily,
  }));

  // Fold overflow public repos into one "Other" line.
  if (rest.length) {
    const daily: Record<string, number> = {};
    let t = 0;
    for (const r of rest) {
      for (const [d, n] of Object.entries(r.daily)) daily[d] = (daily[d] ?? 0) + n;
      t += r.total;
    }
    series.push({ name: OTHER_LABEL, isPrivate: false, color: COLOR_MAP[OTHER_LABEL], total: t, daily });
  }

  // Private line last so it draws on top in blue.
  if (privateTotal > 0) {
    series.push({
      name: PRIVATE_LABEL,
      isPrivate: true,
      color: COLOR_MAP[PRIVATE_LABEL],
      total: privateTotal,
      daily: privateDaily,
    });
  }

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return {
    series,
    total,
    from: iso(from),
    to: iso(to),
    generatedAt: new Date().toISOString(),
  };
}
