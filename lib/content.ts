export const RUNNER_NAME = "Goals Lopes";
export const RUNNER_FIRST_NAME = "Goals";

export const AGE = 43;

export const TAGLINE = "Masters elite. 43 and still lowering PRs.";

export const BIO = `REPLACE: Short 2-3 paragraph bio goes here.
Write in first person. Hit the milestones — where you train, coach, any
sponsorships, what makes your running story different.`;

export type Marathon = {
  slug: string;
  name: string;
  subtitle?: string;
  time: string;
  totalSeconds: number;
};

function hms(h: number, m: number, s = 0) {
  return h * 3600 + m * 60 + s;
}

export const MARATHONS: Marathon[] = [
  {
    slug: "half-marathon-boston",
    name: "Half Marathon",
    subtitle: "Castle Island, Boston",
    time: "1:16",
    totalSeconds: hms(1, 16),
  },
  {
    slug: "chicago-marathon",
    name: "Chicago Marathon",
    subtitle: "Chicago, IL",
    time: "2:52",
    totalSeconds: hms(2, 52),
  },
  {
    slug: "boston-marathon",
    name: "Boston Marathon",
    subtitle: "Hopkinton → Boylston St",
    time: "2:54",
    totalSeconds: hms(2, 54),
  },
  {
    slug: "berlin-marathon",
    name: "Berlin Marathon",
    subtitle: "Berlin, DE",
    time: "2:48",
    totalSeconds: hms(2, 48),
  },
];

export const VO2_MAX = 62;

export const PHYSIOLOGY = {
  vo2Max: 62,
  restingHR: 42,
  weeklyMileage: 90,
  yearsRunning: 15,
  bodyFatPct: 4,
  marathonPR: "2:40",
  mastersPR: "2:40",
};

export type StackShoe = {
  brand: string;
  model: string;
  role: "daily" | "speed" | "long" | "race" | "trail";
};
export type StackItem = { brand: string; product: string };

export const STACK = {
  shoes: [
    { brand: "REPLACE", model: "Daily trainer", role: "daily" },
    { brand: "REPLACE", model: "Speed / intervals", role: "speed" },
    { brand: "REPLACE", model: "Long run", role: "long" },
    { brand: "REPLACE", model: "Race-day super shoe", role: "race" },
  ] as StackShoe[],
  watch: { brand: "REPLACE", product: "GPS watch" } as StackItem,
  tech: [
    { brand: "REPLACE", product: "Heart-rate monitor" },
    { brand: "REPLACE", product: "Recovery wearable" },
  ] as StackItem[],
  apparel: [
    { brand: "REPLACE", product: "Race singlet" },
    { brand: "REPLACE", product: "Training shorts" },
    { brand: "REPLACE", product: "Socks" },
  ] as StackItem[],
  nutrition: [
    { brand: "REPLACE", product: "Race gels" },
    { brand: "REPLACE", product: "Hydration mix" },
  ] as StackItem[],
  recovery: [
    { brand: "REPLACE", product: "Compression / sleep" },
    { brand: "REPLACE", product: "Mobility / foam" },
  ] as StackItem[],
};

export const AUDIENCE = {
  instagram: {
    handle: "@REPLACE",
    followers: 0,
    url: "https://instagram.com/REPLACE",
  },
  strava: {
    handle: "REPLACE",
    followers: 0,
    url: "https://strava.com/athletes/REPLACE",
  },
  newsletter: { subscribers: 0, url: "" },
};

export const SOCIAL = {
  instagram: AUDIENCE.instagram.url,
  strava: AUDIENCE.strava.url,
  twitter: "",
};

export const PRESS_EMAIL = "press@REPLACE.com";
export const PARTNERSHIPS_EMAIL =
  process.env.PARTNERSHIPS_EMAIL ?? "partnerships@REPLACE.com";

export const PARTNERS_PITCH = `The running-brand audience is aging up — and most "elite" talent is 25. I'm 43, running 2:40, still getting faster. Masters athletes are the category brands most want to reach and least often sponsor. I make credible, detailed content: gear reviews that read like race reports, workouts that break down why they work, Castle Island footage most weeks of the year.`;

export const PARTNERSHIP_TYPES = [
  "Footwear",
  "Apparel",
  "Nutrition",
  "Recovery / tech",
  "Race entry",
  "Media / content",
  "Other",
] as const;
export type PartnershipType = (typeof PARTNERSHIP_TYPES)[number];

export const PARTNERSHIP_BUDGETS = [
  "Product only",
  "Under $5k",
  "$5k–$25k",
  "$25k+",
  "Prefer not to say",
] as const;
export type PartnershipBudget = (typeof PARTNERSHIP_BUDGETS)[number];

export const DELIVERABLES = [
  "Long-form gear reviews (1–2 per month)",
  "Race-day photo and video content",
  "Social posts tied to training blocks (Instagram grid + stories)",
  "Workout explainers with coaching context",
  "Appearances at Boston-area events, podcasts, brand activations",
];

export const BOOKING_LOCATION = "Castle Island, South Boston";
export const BOOKING_BLURB =
  "Join me for a 1:1 loop around Castle Island. Easy pace, good conversation.";

export type SessionType = { name: string; desc: string };
export const SESSION_TYPES: SessionType[] = [
  {
    name: "Norwegian 4×400s",
    desc: "Double-threshold intervals. Controlled lactate, repeatable, race-specific.",
  },
  {
    name: "Lactate threshold runs",
    desc: "Sustained tempo work at the edge of comfort. Builds the engine that holds marathon pace.",
  },
  {
    name: "Running economy",
    desc: "Form, cadence, and mechanics on the move. Less wasted motion, more free speed.",
  },
];
