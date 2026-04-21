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
    // NOTE: Boston 2026 — placeholder of 2:39; update to exact chip time.
    slug: "boston-marathon",
    name: "Boston Marathon",
    subtitle: "Hopkinton → Boylston St · 2026",
    time: "2:39",
    totalSeconds: hms(2, 39),
  },
  {
    slug: "berlin-marathon",
    name: "Berlin Marathon",
    subtitle: "Berlin, DE",
    time: "2:48",
    totalSeconds: hms(2, 48),
  },
  {
    slug: "chicago-marathon",
    name: "Chicago Marathon",
    subtitle: "Chicago, IL",
    time: "2:52",
    totalSeconds: hms(2, 52),
  },
  {
    slug: "half-marathon-boston",
    name: "Half Marathon",
    subtitle: "Castle Island, Boston",
    time: "1:16",
    totalSeconds: hms(1, 16),
  },
];

export const VO2_MAX = 68;

export const PHYSIOLOGY = {
  vo2Max: 68,
  restingHR: 42,
  weeklyMileage: 90,
  yearsRunning: 15,
  bodyFatPct: 4,
  marathonPR: "2:39",
  mastersPR: "2:39",
};

export type StackShoe = {
  brand: string;
  model: string;
  role: "daily" | "speed" | "long" | "race" | "trail";
};
export type StackItem = { brand: string; product: string };

// Current stack, paid out of pocket. Observable in training and race-day
// photos; listed honestly so brand pitches can reference real usage.
export const STACK = {
  shoes: [
    { brand: "Nike", model: "Pegasus 41 — daily miles", role: "daily" },
    { brand: "Adidas", model: "Adizero Takumi Sen 10 — intervals", role: "speed" },
    { brand: "Hoka", model: "Clifton 9 — easy long runs", role: "long" },
    { brand: "Nike", model: "Alphafly 3 — race day", role: "race" },
  ] as StackShoe[],
  watch: { brand: "Garmin", product: "Forerunner 965" } as StackItem,
  tech: [
    { brand: "Whoop", product: "4.0 recovery strap" },
    { brand: "Garmin", product: "HRM-Pro chest strap" },
    { brand: "Strava", product: "Training log · every run since 2014" },
  ] as StackItem[],
  apparel: [
    { brand: "Tracksmith", product: "Race singlet" },
    { brand: "Nike", product: "Training shorts" },
    { brand: "Balega", product: "Hidden Comfort socks" },
  ] as StackItem[],
  nutrition: [
    { brand: "Maurten", product: "Gel 100 · race fuel" },
    { brand: "Maurten", product: "Drink Mix 320 · pre-race carb load" },
  ] as StackItem[],
  recovery: [
    { brand: "Normatec", product: "3 compression boots" },
    { brand: "Theragun", product: "Elite percussive" },
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
