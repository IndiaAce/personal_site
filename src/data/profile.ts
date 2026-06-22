// ============================================================
// Single source of truth for résumé content.
// Consumed by the desktop résumé page (src/pages/resume.astro) and the
// mobile "Paper" résumé section on the home page (src/pages/index.astro).
// Edit here once and both stay in sync.
// ============================================================

export const name = { first: 'Luke', last: 'Wescott' };

export const intro =
  'Detection Engineer specializing in ML-driven, detection-as-code systems — ' +
  'designing and tuning the detections that catch real threats at global scale. ' +
  'M.Sc in AI & Machine Learning. Off the clock: French lessons, hockey, books, and new music.';

export type Fact = { k: string; v: string; href?: string };
export const meta: Fact[] = [
  { k: 'LOCATION', v: 'Vermont' },
  { k: 'LANGUAGES', v: 'EN · FR (B1)' },
  { k: 'GITHUB', v: 'IndiaAce', href: 'https://github.com/IndiaAce' },
  { k: 'LINKEDIN', v: 'in/luke-wescott', href: 'https://www.linkedin.com/in/luke-wescott-ba027a1ab/' },
  { k: 'EMAIL', v: 'lukewescott808@gmail.com', href: 'mailto:lukewescott808@gmail.com' },
];

export type Bullet = { short: string; detail: string };
export type Role = {
  role: string;
  org: string;
  location: string;
  period: string;
  bullets: Bullet[];
};

// short = distilled headline (concise view) · detail = full résumé content (expanded)
export const experience: Role[] = [
  {
    role: 'Detection Engineer II',
    org: 'Sublime Security',
    location: 'Remote',
    period: 'May 2025 — Present',
    bullets: [
      {
        short: 'Bridge the ML and Detection Engineering teams',
        detail:
          'Curate atomic detection rules that shape ML-based verdicts — giving detection engineering direct influence over model outcomes to maximize efficacy.',
      },
      {
        short: 'Maintain 800+ detection rules for hundreds of global customers',
        detail:
          'Continuously update, manage, and expand the ruleset while tuning false-positive and false-negative rates against constantly evolving threats.',
      },
      {
        short: 'Help lead and grow the detection team',
        detail:
          'Mentor a growing team of 3 junior detection engineers, support customer escalations, and interview candidates — helping grow the team from 5 to 13.',
      },
    ],
  },
  {
    role: 'Detection Engineer',
    org: 'NuHarbor Security',
    location: 'Colchester, VT',
    period: 'Jun 2024 — May 2025',
    bullets: [
      {
        short: 'Built detection-as-code pipelines — +40% threat detection',
        detail:
          'Designed and deployed detection-as-code CI/CD pipelines, improving threat detection by 40%.',
      },
      {
        short: 'Automated detection with Python + SPL — −30% false positives',
        detail:
          'Automated threat detection using Python and SPL, reducing false positives by 30%.',
      },
      {
        short: 'Drove detection use cases through threat modeling',
        detail:
          'Conducted threat modeling and attack-path analysis and collaborated with intelligence teams to integrate new threat feeds, expanding detection coverage.',
      },
      {
        short: 'Built proprietary SOC automation tooling — +50% tuning efficiency',
        detail:
          'Built proprietary tools to automate SOC workflows, improving tuning efficiency by 50%, and optimized detection systems for GCP and Azure environments.',
      },
    ],
  },
  {
    role: 'Security Engineer',
    org: 'NuHarbor Security',
    location: 'Colchester, VT',
    period: 'Jun 2023 — Jun 2024',
    bullets: [
      {
        short: 'Delivered tailored Splunk solutions for SOC analysts',
        detail:
          'Built and administered Splunk environments that gave SOC analysts real-time insight and improved data-collection efficiency.',
      },
      {
        short: 'Designed detection strategies around client needs',
        detail:
          'Aligned detection strategies to client requirements, improving alert fidelity.',
      },
    ],
  },
  {
    role: 'IT Staff',
    org: 'Evergreen Parks & Recreation District',
    location: 'Evergreen, CO',
    period: '2021 — 2022',
    bullets: [
      {
        short: 'Kept POS systems and networks running',
        detail:
          'Resolved technical issues across POS systems and networks, and built a Python ticket-management app that cut response time by 25%.',
      },
    ],
  },
  {
    role: 'Technology & Merchandising Pro',
    org: 'Apple',
    location: 'Denver, CO',
    period: '2019 — 2021',
    bullets: [
      {
        short: 'Managed the Cherry Creek demo fleet via MDM',
        detail:
          'Deployed and managed the entire fleet of demo products via internal MDM, and led the merchandising reset for the flagship store relocation.',
      },
    ],
  },
];

export type Education = { deg: string; school: string; sub: string };
export const education: Education[] = [
  {
    deg: 'M.Sc — Artificial Intelligence & Machine Learning',
    school: 'Colorado State University Global',
    sub: 'Jan 2025 · GPA 3.96',
  },
  {
    deg: 'B.Sc — Computer Science',
    school: 'Colorado State University Global',
    sub: '2023 · GPA 3.9',
  },
];

export const certs: string[] = [
  'Splunk Certified Enterprise Admin · exp. Aug 2026',
  'Splunk Certified Power User · exp. Aug 2026',
];

export const skills: string[] = [
  'Python', 'Splunk / SPL', 'Detection-as-Code', 'GitOps · CI/CD',
  'Machine Learning', 'TensorFlow', 'Cloud Security (AWS·Azure·GCP)',
  'MITRE ATT&CK', 'Anomaly Detection', 'Email Analysis',
  'Microsoft Sentinel', 'Linux',
];

export type Work = { title: string; where: string; href: string | null };
export const work: Work[] = [
  { title: '“Prompt injection attacks don’t look like the headlines”', where: 'Sublime Security ↗', href: 'https://sublime.security/blog/prompt-injection-attacks-dont-look-like-what-youre-seeing-in-social-media-and-headlines/' },
  { title: '“Using AI signals within malicious email”', where: 'Sublime Security ↗', href: 'https://sublime.security/blog/using-ai-signals-within-malicious-email-for-attack-detection-and-threat-hunting/' },
  { title: '“You’ve been invited to join a Meta for Business scam!”', where: 'Sublime Security ↗', href: 'https://sublime.security/blog/youve-been-invited-to-join-a-meta-for-business-scam/' },
  { title: 'Content-Sync Deployment Automation', where: '−70% manual deploy time · Bash + Python', href: null },
  { title: 'ML SPL Generator — M.Sc capstone', where: 'Turns threat-writeup IOCs into Splunk SPL', href: null },
];
