// Per-brand pitch pages. Each entry powers /partners/[slug].
//
// Editorial rule: every pitch is written in Goals' voice, first person, and
// grounded in specifics Goals can actually defend (a training week, a race
// split, a gear item that appears in the photos). No made-up endorsements.

export type BrandPitch = {
  slug: string;
  brand: string;
  tagline: string;
  /** Square-ish headline image shown at top of the page. */
  heroImage: { src: string; alt: string };
  /** Two supporting images used lower on the page. */
  supportImages: { src: string; alt: string }[];
  whyBrand: string;
  whyGoals: string;
  whyNow: string;
  whyFirst: string;
};

export const BRAND_PITCHES: BrandPitch[] = [
  {
    slug: "nike",
    brand: "Nike",
    tagline: "Every PR I've ever run was in Nike.",
    heroImage: {
      src: "/images/IMG_2054.JPG",
      alt: "Goals Lopes mid-stride on a training run in Nike",
    },
    supportImages: [
      {
        src: "/images/IMG_2076.JPG",
        alt: "Goals Lopes in profile mid-stride",
      },
      {
        src: "/images/IMG_6906.jpeg",
        alt: "Goals Lopes racing the Berlin Marathon in Nike racing flats",
      },
    ],
    whyBrand:
      "Nike is the shoe that changed marathon racing. Alphafly and Vaporfly reset what's possible in the event — and reset every PR I've run since 2020. When the super shoe era started, Nike was the reason.",
    whyGoals:
      "At 43, I'm running times I couldn't imagine at 33 — and the shoes on my feet for every marathon PR I own were Nike. Boston 2026, 2:42 in the Alphafly 3. Ninety miles a week in Pegasus 41. Every pair paid for out of pocket.",
    whyNow:
      "Boston 2026 was 2:42 at 43. The goal now isn't chasing a faster time every year — it's running this kind of time at 48, and again at 50. A masters athlete building a decade-long arc at the distance, in the shoes he already races in, is a story Nike can use for years: the career, not the single season.",
    whyFirst:
      "I've never signed a brand deal. The first partnership I take is the one that gets the unboxing, the real race-day mileage, the honest \"why I wear this\" breakdown. For Nike, it's not marketing — it's already true. The first dollar is just a handshake on what's been happening for six years.",
  },
  {
    slug: "adidas",
    brand: "Adidas",
    tagline: "Adizero is how I get fast. Adios Pro is how I stay fast at 43.",
    heroImage: {
      src: "/images/IMG_2590.JPG",
      alt: "Goals Lopes crossing the Boston Marathon finish line",
    },
    supportImages: [
      {
        src: "/images/IMG_2495.jpeg",
        alt: "Goals Lopes pre-race at the Boston Marathon",
      },
      {
        src: "/images/photo_085.jpg",
        alt: "Goals Lopes training in Adidas kit",
      },
    ],
    whyBrand:
      "Adios Pro and Adizero Takumi Sen are the best intervals shoes in the sport. When I want to hit a 4:50 mile on Tuesday, they go on my feet. Adidas's running innovation is the quiet reason masters athletes can still run fast.",
    whyGoals:
      "Intervals are where most masters runners fall off — you can't hit the splits anymore, so you stop trying. I still hit them. Takumi Sen 10 on track days, Adios Pro on threshold days. 2:42 at Boston at 43 isn't because I train like I'm 28 — it's because my intervals today are smarter than they were at 28, and the Adidas side of my stack is most of the reason.",
    whyNow:
      "The rivalry between Alphafly and Adios Pro is the best story in road racing. An athlete who races in one and trains in the other, and posts the splits every week, is a comparison piece Adidas already wins on the training side.",
    whyFirst:
      "No incumbent relationship, no competing deal. Clean slate. The first dollar Adidas spends on me becomes a three-year training block with documented workouts, a PR attempt, and a race result the running media can actually cover.",
  },
  {
    slug: "puma",
    brand: "Puma",
    tagline: "Cape Verdean kid, Puma poster on the wall, now running 2:42 at Boston.",
    heroImage: {
      src: "/images/photo_070.jpg",
      alt: "Goals Lopes in Puma training kit",
    },
    supportImages: [
      {
        src: "/images/photo_067.jpg",
        alt: "Goals Lopes mid-workout",
      },
      {
        src: "/images/photo_071.jpg",
        alt: "Goals Lopes training in Boston",
      },
    ],
    whyBrand:
      "Puma's running resurgence is the most interesting story in footwear right now. Deviate Nitro Elite is a legitimate race shoe, and the brand heritage — Cape Verde sponsor nation, Bolt, the football crossover — is personal to me in a way no other brand comes close to.",
    whyGoals:
      "I was an unproven young kid from Cape Verde, and Puma was the brand on the wall. Twenty years later I'm 43, a father of three girls, and running 2:42 at Boston. Signing the first Cape Verdean masters marathoner to a Puma running deal is a story that already has a beginning, a middle, and a finish line — you just haven't put your name on it yet.",
    whyNow:
      "Puma is pushing into US endurance with Nitro Elite and a new marathon program. I'm a Boston-based 2:42 masters runner with a decade of documented training, a home-city race on the calendar, and a heritage story your team can actually lean into. The timing does not repeat.",
    whyFirst:
      "I've never been paid to run. For Puma, this isn't product placement — it's the first time a Cape Verdean running story lands in Boston with a real result behind it. Small deal now, permanent narrative. The brand gets a founding chapter, not a line item.",
  },
  {
    slug: "hoka",
    brand: "Hoka",
    tagline: "Men over 40 wear Hoka. I'm 43 and I'm running 2:42 in them.",
    heroImage: {
      src: "/images/photo_068.jpg",
      alt: "Goals Lopes on a long training run in Hoka shoes",
    },
    supportImages: [
      {
        src: "/images/photo_090.jpg",
        alt: "Goals Lopes logging easy miles",
      },
      {
        src: "/images/IMG_1570.jpeg",
        alt: "Goals Lopes in recovery kit after a long run",
      },
    ],
    whyBrand:
      "Hoka redefined what cushion can do for a distance runner. The masters category is already yours by default — every road and trail runner over 40 I know owns at least one pair. You have the audience I'm built for, and the shoe I actually train in.",
    whyGoals:
      "I am the story Hoka should be telling. 43 years old, 90 miles a week, father of three, Clifton 9 on easy long runs six days out of seven. My edge at this age isn't chasing faster — it's longevity. Staying healthy, staying consistent, still in it at 50. That's the whole masters pitch, and it's the shoe that makes it possible.",
    whyNow:
      "Hoka's been chasing elite credibility for five years. Signing a 2:42 masters runner in Boston — the road-running capital of America — is category credibility without paying World Marathon Majors money for a 28-year-old pro. The masters marathon is the least-crowded story in running.",
    whyFirst:
      "No other brand has been first. First to offer anything gets the exclusive, the Cielo X1 race-day post, the honest long-run review, and the masters-category story you've been trying to own for half a decade.",
  },
  {
    slug: "maurten",
    brand: "Maurten",
    tagline: "320 the night before. Gel 100s on course. Every marathon since 2020.",
    heroImage: {
      src: "/images/IMG_6906.jpeg",
      alt: "Goals Lopes racing the Berlin Marathon fueled by Maurten",
    },
    supportImages: [
      {
        src: "/images/photo_133.jpg",
        alt: "Goals Lopes mid-race carrying fuel",
      },
      {
        src: "/images/IMG_2590.JPG",
        alt: "Goals Lopes crossing the Boston Marathon finish line",
      },
    ],
    whyBrand:
      "Maurten changed marathon fueling. It's the only gel I take on race day because it's the only one my stomach tolerates at 6:10 pace for three hours straight. 2:42 at 43 doesn't happen without it — not for me, and not for most of the athletes I coach.",
    whyGoals:
      "I've tested every gel on the market and come back to Maurten every time. Drink Mix 320 the night before, Gel 100 plus Caf 100 every 5K on course — that's the exact protocol for every marathon PR I own, Boston included.",
    whyNow:
      "The masters marathon category is where Maurten's next growth wave lives — runners who care about exact carb load because they can't afford to blow up at mile 20 anymore. I am that customer, loud, with a platform and a documented fueling spreadsheet.",
    whyFirst:
      "I'm already buying Maurten by the case. A partnership formalizes a relationship that's been one-way for four years. The first brand to make it official gets the race-week protocol posts, the fueling breakdowns, and the masters-specific content that nobody else in the space is producing.",
  },
  {
    slug: "new-balance",
    brand: "New Balance",
    tagline:
      "Boston's hometown brand and a Boston masters runner at 2:42. Why hasn't this happened yet?",
    heroImage: {
      src: "/images/photo_085.jpg",
      alt: "Goals Lopes training at Castle Island in New Balance",
    },
    supportImages: [
      {
        src: "/images/IMG_2590.JPG",
        alt: "Goals Lopes crossing the Boston Marathon finish line",
      },
      {
        src: "/images/photo_092.jpg",
        alt: "Goals Lopes logging miles in Boston",
      },
    ],
    whyBrand:
      "Boston brand. Boston Marathon. Boston athlete. New Balance headquarters is three miles from where I train at Castle Island every morning. The geography alone is a campaign — and the brand heritage with the BAA makes the partnership write itself.",
    whyGoals:
      "I'm not a global sub-2:10 elite. I'm the Boston-local masters runner your core customer actually looks like. A 43-year-old father of three with a 2:42, a full-time life, and a coaching practice at Castle Island is more relatable than any sponsored pro on the roster.",
    whyNow:
      "New Balance's running roster skews young. The masters category is massive and underserved — and NB does not have a masters voice in Boston. I live here, I race Boston, I coach at Castle Island. This is a local story that the brand's own neighbors already recognize.",
    whyFirst:
      "Zero other brand deals — New Balance gets the first one. Boston local signing with Boston brand is a story local press picks up for free. The partnership launches itself.",
  },
  {
    slug: "asics",
    brand: "ASICS",
    tagline: "Metaspeed Sky on long runs. Gel-Kayano saved my knees at 40.",
    heroImage: {
      src: "/images/IMG_4430.jpeg",
      alt: "Goals Lopes with an age-group award in ASICS kit",
    },
    supportImages: [
      {
        src: "/images/IMG_6906.jpeg",
        alt: "Goals Lopes racing a marathon",
      },
      {
        src: "/images/photo_133.jpg",
        alt: "Goals Lopes on a training run",
      },
    ],
    whyBrand:
      "ASICS is the most trusted running brand in the sport's history. Gel-Kayano is the reason my knees survived fifteen years at 70-plus miles a week. Metaspeed is a legitimate top-three race shoe. The research is real and I read it.",
    whyGoals:
      "I'm the athlete ASICS's Kobe lab would design for — 43, high-mileage, injury-free, fueled by sports science not hype. I read the lab reports, pick Metaspeed Sky over Edge because it's right for my gait, and I can explain why on camera.",
    whyNow:
      "ASICS's US marketing is shifting back toward performance storytelling. A 2:42 masters runner in Boston with documented training, a Metaspeed on race day, and a coaching practice is the athlete story the brand is currently missing in the market.",
    whyFirst:
      "ASICS hasn't had a Boston-based masters athlete on roster since I started running. The first partnership here starts a category. \"Sound Mind Sound Body\" at 43 is a direct reframe of masters running as performance, not survival.",
  },
  {
    slug: "whoop",
    brand: "Whoop",
    tagline:
      "Three years of Whoop data. 2:42 at 43 is what recovery-driven training looks like.",
    heroImage: {
      src: "/images/IMG_1570.jpeg",
      alt: "Goals Lopes wearing a Whoop strap post-run",
    },
    supportImages: [
      {
        src: "/images/photo_084.jpg",
        alt: "Goals Lopes on a recovery run",
      },
      {
        src: "/images/photo_090.jpg",
        alt: "Goals Lopes logging easy miles",
      },
    ],
    whyBrand:
      "Whoop is the recovery wearable that earned its place in elite sport. HRV, strain, sleep — the three variables that separate a 43-year-old who runs 2:42 from a 43-year-old who can't finish a 5K. The product actually works, and the data proves it.",
    whyGoals:
      "I've worn Whoop every single day since 2022. My HRV trends correlate exactly with workout quality and race readiness. If Whoop wants to prove recovery-driven training extends masters careers, I am already the case study — the data is sitting in your database.",
    whyNow:
      "Whoop is moving into performance and away from pure consumer wellness. A masters marathoner with three years of clean, continuous data and a 2:42 at 43 is the exact athlete story that proves HRV-guided training changes outcomes at a demographic your marketing is trying to reach.",
    whyFirst:
      "I'm already in the ecosystem. No conflict, no switch cost, no learning curve. The first brand deal I sign is a storytelling deal — and three years of my own data is the content that writes itself, weekly, for as long as the partnership runs.",
  },
  {
    slug: "garmin",
    brand: "Garmin",
    tagline:
      "Every mile, every interval, every race in Garmin. Forerunner 965 on my wrist for 2:42 at Boston.",
    heroImage: {
      src: "/images/photo_068.jpg",
      alt: "Goals Lopes on a long training run checking a Garmin watch",
    },
    supportImages: [
      {
        src: "/images/photo_067.jpg",
        alt: "Goals Lopes mid-workout",
      },
      {
        src: "/images/IMG_2054.JPG",
        alt: "Goals Lopes on a training run",
      },
    ],
    whyBrand:
      "The GPS watch that every serious runner I know wears. Garmin's Running Dynamics — cadence, vertical oscillation, ground contact time — are what I use to dial in form. They're the details that turn a 2:50 runner into a 2:42 runner at 43.",
    whyGoals:
      "Forerunner 965 on my wrist for every workout for two years. Connect data pulls directly into the coaching templates I use with athletes. If Garmin wants a masters athlete showing how Running Dynamics translate into PRs, that athlete already exists.",
    whyNow:
      "Garmin is the overwhelming incumbent in the watch category — but the brand's athlete storytelling skews young and trail. A 43-year-old road marathoner with a 2:42 and three years of public Connect data broadens the Garmin narrative into the masters category your competitors are starting to chase.",
    whyFirst:
      "Easiest yes in the stack — I already wear it, already train with it, already recommend it to clients. The first partnership isn't about sending me a watch. It's about formalizing a relationship so the Strava + Connect data becomes public content the brand can actually point at.",
  },
  {
    slug: "strava",
    brand: "Strava",
    tagline:
      "Every run since 2014, public. Castle Island segments, 40+ local KOMs.",
    heroImage: {
      src: "/images/photo_061.jpg",
      alt: "Goals Lopes logging a run on Strava",
    },
    supportImages: [
      {
        src: "/images/photo_153.jpg",
        alt: "Goals Lopes finishing a workout",
      },
      {
        src: "/images/IMG_8496.jpeg",
        alt: "Goals Lopes on the road",
      },
    ],
    whyBrand:
      "Strava is the social layer of running. Every race, every workout, every easy shuffle lives there. That's where the running community actually talks — and where my audience actually is. Nothing else in the stack comes close.",
    whyGoals:
      "I've been on Strava since 2014. My Castle Island laps are public, my training is public, my race data is public. A Strava partnership isn't content I'd need to create — it's content I already make every morning at 5:30am.",
    whyNow:
      "Strava's athletes-on-Strava roster has always skewed global elite. Signing an age-group Boston runner who shows up on the leaderboard every single day is a different, honestly more useful story for the platform's actual median user — the 35-to-50 working athlete chasing a PR they can't quite catch.",
    whyFirst:
      "A Strava partnership for a 2:42 masters runner is the cleanest first brand deal possible — zero conflict, zero setup, instant authenticity. And every Strava post I make links back to the partnership brands that come next. The platform is the flywheel.",
  },
];

export function findBrandPitch(slug: string): BrandPitch | undefined {
  return BRAND_PITCHES.find((p) => p.slug === slug);
}
