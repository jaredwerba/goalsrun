import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-end">
        <nav className="flex items-center gap-4 sm:gap-6 text-sm">
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
            className="inline-flex items-center whitespace-nowrap rounded-md bg-foreground text-background px-3 py-1.5 font-medium hover:opacity-90"
          >
            Book a run
          </Link>
        </nav>
      </div>
    </header>
  );
}
