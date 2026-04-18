import Link from "next/link";
import { RUNNER_NAME, SOCIAL } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {RUNNER_NAME}
        </p>
        <div className="flex items-center gap-4">
          {SOCIAL.instagram && (
            <Link
              href={SOCIAL.instagram}
              target="_blank"
              className="hover:underline underline-offset-4"
            >
              Instagram
            </Link>
          )}
          {SOCIAL.strava && (
            <Link
              href={SOCIAL.strava}
              target="_blank"
              className="hover:underline underline-offset-4"
            >
              Strava
            </Link>
          )}
          <Link href="/bookings" className="hover:underline underline-offset-4">
            My bookings
          </Link>
        </div>
      </div>
    </footer>
  );
}
