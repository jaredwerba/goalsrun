export const RUNNER_NAME = "Goals Lopes";
export const RUNNER_FIRST_NAME = "Goals";

export const AGE = 43;

export const TAGLINE =
  "Forty-three. Father of two. Longevity is the next PR.";

export const BIO = `As I age, I've come to terms with one critical realization: what motivates me to run at 43 is different than at 22. My life has changed; I've changed. As an unproven young kid from Cape Verde, I desperately wanted to live up to my potential. Today — 43 years old, a father of two girls, having been around the track a few times — I've had the opportunity to live out much of that potential. My future potential now lies in my ability to maintain my longevity and consistency.

Longevity and consistency are what every workout now answers to. Ninety miles a week out of Castle Island in South Boston. Intervals on Tuesday, threshold on Thursday, long on Sunday — most of it before my daughters wake up. Boston 2026 was 2:42, and I'm proud of the time. But I'm more proud of the twenty years that got me there, and the twenty more I'm trying to build.

If you want to train with me, I coach 1:1 at Castle Island. If you're a brand, the pitch is on the partners page. Either way, this is a long career — and I'm only interested in the work that lets it keep going.`;

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
    slug: "boston-marathon",
    name: "Boston Marathon",
    subtitle: "Hopkinton → Boylston St · 2026",
    time: "2:42",
    totalSeconds: hms(2, 42),
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
  marathonPR: "2:42",
  mastersPR: "2:42",
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
    handle: "@goals_zizou",
    followers: 0,
    url: "https://www.instagram.com/goals_zizou",
  },
  strava: {
    // Strava athlete ID for Goals Lopes. The API treats this as the
    // canonical identifier; the public profile URL is derived from it.
    athleteId: "47881127",
    handle: "Goals Lopes",
    followers: 0,
    url: "https://www.strava.com/athletes/47881127",
  },
  newsletter: { subscribers: 0, url: "" },
};

export const SOCIAL = {
  instagram: AUDIENCE.instagram.url,
  strava: AUDIENCE.strava.url,
  twitter: "",
};

export const PRESS_EMAIL =
  process.env.PRESS_EMAIL ?? "gersonlopes7@gmail.com";
export const PARTNERSHIPS_EMAIL =
  process.env.PARTNERSHIPS_EMAIL ?? "gersonlopes7@gmail.com";

export const PARTNERS_PITCH = `The running audience is aging up, and most "elite" talent is 25. I'm 43, a father of two, Cape Verdean kid who came up with something to prove — and the story I can actually tell now isn't about chasing faster every year. It's longevity. It's consistency. It's what it takes to still be running PRs at 43 when most people my age have quit. That's the story brands selling to real runners need to tell, and too few of us are telling it. I make credible, detailed content: gear reviews that read like race reports, workouts that break down why they work, Castle Island footage most weeks of the year.`;

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
