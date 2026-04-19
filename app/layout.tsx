import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { RUNNER_NAME, TAGLINE } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const bebas = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const host = process.env.NEXT_PUBLIC_SITE_HOST || "goalsrun.vercel.app";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
