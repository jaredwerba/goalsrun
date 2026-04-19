import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
        <div className="flex-1" />
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          <Link
            href="/#about"
            className="inline-flex items-center h-11 px-2 sm:px-3 hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="/#results"
            className="inline-flex items-center h-11 px-2 sm:px-3 hover:underline underline-offset-4"
          >
            Results
          </Link>
          <Link
            href="/#press"
            className="inline-flex items-center h-11 px-2 sm:px-3 hover:underline underline-offset-4"
          >
            Press
          </Link>
        </nav>
        <div className="flex-1 flex justify-end">
          <Link
            href="/book"
            className="inline-flex items-center h-11 whitespace-nowrap rounded-md bg-foreground text-background px-4 text-sm font-medium hover:opacity-90"
          >
            Book a run
          </Link>
        </div>
      </div>
    </header>
  );
}
