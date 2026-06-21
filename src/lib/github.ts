// ============================================================
// Per-repo daily contribution series for the GitHub page line graph.
//
// Why two data sources:
//   • Daily TOTALS come from the PUBLIC contributions API (jogruber proxy of
//     the profile graph). With "Include private contributions on my profile"
//     enabled, this already includes the anonymized private counts — and it's
//     immune to SAML SSO, which blocks API tokens from seeing org-private work
//     (e.g. Sublime). This is how we recover the full ~1.6k total.
//   • Per-repo PUBLIC commit lines come from GraphQL `commitContributionsByRepository`
//     (any token works for public data). Private repos are NOT itemized.
//
// The "Private / other" line = daily public-profile total − attributed public
// commits. It carries private repo activity + non-commit contributions
// (PRs / issues / reviews) and makes the lines reconcile to the headline total.
//
// A token is only needed for the named public-repo lines:
//   • Local: GITHUB_TOKEN=... in a .env file (git-ignored).
//   • Cloudflare Pages: Settings → Environment variables → GITHUB_TOKEN.
// Without a token the page falls back to the heatmap.
// ============================================================

const USER = 'IndiaAce';
const TOKEN =
  (typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined) ??
  import.meta.env.GITHUB_TOKEN;

// How many public repos get their own line before the rest fold into "Other".
const MAX_NAMED_REPOS = 9;

const PRIVATE_LABEL = 'Private / other';
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
  daily: Record<string, number>; // 'YYYY-MM-DD' -> count
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

// Public per-repo commit breakdown (token, public data only).
async function fetchPublicRepos(from: Date, to: Date): Promise<{
  repos: { name: string; total: number; daily: Record<string, number> }[];
  publicDailyTotal: Record<string, number>;
}> {
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

  const entries = json.data?.viewer?.contributionsCollection?.commitContributionsByRepository ?? [];
  const repos: { name: string; total: number; daily: Record<string, number> }[] = [];
  const publicDailyTotal: Record<string, number> = {};

  for (const entry of entries) {
    if (entry.repository?.isPrivate) continue; // private rolls into residual line
    const daily: Record<string, number> = {};
    let t = 0;
    for (const node of entry.contributions?.nodes ?? []) {
      const day = String(node.occurredAt).slice(0, 10);
      const n = node.commitCount ?? 0;
      daily[day] = (daily[day] ?? 0) + n;
      t += n;
    }
    if (t === 0) continue;
    repos.push({ name: entry.repository?.name ?? 'unknown', total: t, daily });
    for (const [d, n] of Object.entries(daily)) publicDailyTotal[d] = (publicDailyTotal[d] ?? 0) + n;
  }
  return { repos, publicDailyTotal };
}

export async function getContributionSeries(): Promise<ContribData | null> {
  if (!TOKEN) {
    console.warn('[github] no GITHUB_TOKEN set — skipping line graph (heatmap fallback).');
    return null;
  }

  // --- public profile calendar: daily totals incl. anonymized private ---
  const cont = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`
  ).then((r) => {
    if (!r.ok) throw new Error('contrib ' + r.status);
    return r.json();
  });
  const calDays: { date: string; count: number }[] = cont.contributions ?? [];
  if (!calDays.length) throw new Error('github: empty contribution calendar');

  const calendarDaily: Record<string, number> = {};
  for (const d of calDays) calendarDaily[d.date] = d.count;
  const total: number = cont.total?.lastYear ?? calDays.reduce((a, d) => a + d.count, 0);
  const from = calDays[0].date;
  const to = calDays[calDays.length - 1].date;

  // --- public per-repo commit lines (token) ---
  const { repos: publicRepos, publicDailyTotal } = await fetchPublicRepos(
    new Date(from + 'T00:00:00Z'),
    new Date(to + 'T23:59:59Z')
  );
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

  // "Private / other" = public-profile daily total − attributed public commits.
  const privateDaily: Record<string, number> = {};
  let privateTotal = 0;
  for (const [day, cTotal] of Object.entries(calendarDaily)) {
    const residual = cTotal - (publicDailyTotal[day] ?? 0);
    if (residual > 0) {
      privateDaily[day] = residual;
      privateTotal += residual;
    }
  }
  if (privateTotal > 0) {
    series.push({
      name: PRIVATE_LABEL,
      isPrivate: true,
      color: COLOR_MAP[PRIVATE_LABEL],
      total: privateTotal,
      daily: privateDaily,
    });
  }

  console.warn(
    `[github] total=${total} publicRepos=${publicRepos.length} privateOtherTotal=${privateTotal}`
  );

  return {
    series,
    total,
    from,
    to,
    generatedAt: new Date().toISOString(),
  };
}
