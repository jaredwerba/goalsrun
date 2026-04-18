export const RUNNER_NAME = "Goals Lopes";
export const RUNNER_FIRST_NAME = "Goals";

export const TAGLINE = "Elite Boston distance runner. Castle Island regular.";

export const BIO = `REPLACE: Short 2-3 paragraph bio goes here.
Write in first person. Hit the milestones — where you train, coach, any
sponsorships, what makes your running story different.`;

export type Race = {
  name: string;
  date: string;
  result: string;
  link?: string;
};

export const RACES: Race[] = [
  { name: "REPLACE: Boston Marathon 2025", date: "Apr 2025", result: "2:XX:XX" },
  { name: "REPLACE: BAA Half", date: "Oct 2024", result: "1:XX:XX" },
  { name: "REPLACE: USATF-NE 10k", date: "Jun 2024", result: "XX:XX" },
];

export const SOCIAL = {
  instagram: "https://instagram.com/REPLACE",
  strava: "https://strava.com/athletes/REPLACE",
  twitter: "",
};

export const PRESS_EMAIL = "press@REPLACE.com";

export const BOOKING_LOCATION = "Castle Island, South Boston";
export const BOOKING_BLURB =
  "Join me for a 1:1 loop around Castle Island. Easy pace, good conversation.";
