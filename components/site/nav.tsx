import Link from "next/link";
import { RUNNER_NAME } from "@/lib/content";

export function Nav() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold tracking-tight text-lg hover:opacity-80"
        >
          {RUNNER_NAME}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#about" className="hover:underline underline-offset-4">
            About
          </Link>
          <Link href="/#results" className="hover:underline underline-offset-4">
            Results
          </Link>
          <Link href="/#press" className="hover:underline underline-offset-4">
            Press
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center rounded-md bg-foreground text-background px-3 py-1.5 font-medium hover:opacity-90"
          >
            Book a run
          </Link>
        </nav>
      </div>
    </header>
  );
}
