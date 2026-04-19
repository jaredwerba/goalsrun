import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Graduate } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import {
  AGE,
  AUDIENCE,
  MARATHONS,
  PHYSIOLOGY,
  RUNNER_NAME,
  TAGLINE,
} from "@/lib/content";
import "./globals.css";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const graduate = Graduate({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const host = process.env.NEXT_PUBLIC_SITE_HOST || "goalsrun.vercel.app";

export const viewport: Viewport = {
  themeColor: "#000000",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(`https://${host}`),
  title: {
    default: `${RUNNER_NAME} — ${TAGLINE}`,
    template: `%s · ${RUNNER_NAME}`,
  },
  description: TAGLINE,
  openGraph: {
    title: RUNNER_NAME,
    description: TAGLINE,
    type: "website",
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: RUNNER_NAME,
  jobTitle: "Distance Runner & Running Coach",
  description: `${PHYSIOLOGY.marathonPR} marathoner, ${AGE}. VO2 max ${PHYSIOLOGY.vo2Max}. ${TAGLINE}`,
  url: `https://${host}`,
  image: `https://${host}/opengraph-image`,
  sameAs: [AUDIENCE.instagram.url, AUDIENCE.strava.url].filter(
    (u) => u && !u.includes("REPLACE"),
  ),
  knowsAbout: [
    "Marathon running",
    "Running mechanics",
    "Masters athletics",
    "Running coaching",
  ],
  award: MARATHONS.map((m) => `${m.name} — ${m.time}`),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${graduate.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
