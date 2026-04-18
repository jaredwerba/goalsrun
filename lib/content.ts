export const RUNNER_NAME = "Goals Lopes";
export const RUNNER_FIRST_NAME = "Goals";

export const TAGLINE = "Elite Boston distance runner. Castle Island regular.";

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

export const SOCIAL = {
  instagram: "https://instagram.com/REPLACE",
  strava: "https://strava.com/athletes/REPLACE",
  twitter: "",
};

export const PRESS_EMAIL = "press@REPLACE.com";

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
