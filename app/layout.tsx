import type { Metadata } from "next";
import { Inter, Geist_Mono, Graduate } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { RUNNER_NAME, TAGLINE } from "@/lib/content";
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
      className={`${inter.variable} ${geistMono.variable} ${graduate.variable} h-full antialiased`}
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
