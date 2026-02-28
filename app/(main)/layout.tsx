import Link from "next/link";
import { signOut } from "@/lib/actions/profile";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm">
              CC
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Campus Connect
            </span>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-medium text-zinc-700 dark:text-zinc-200 sm:flex">
            <Link
              href="/dashboard"
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Dashboard
            </Link>
            <Link
              href="/clubs"
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Clubs
            </Link>
            <Link
              href="/profile"
              className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Profile
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-red-500 hover:bg-red-50 hover:text-red-700 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-300"
              >
                Logout
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 sm:hidden">
            <Link
              href="/dashboard"
              className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700"
            >
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        {children}
      </main>

      <footer className="border-t border-zinc-200 bg-white/80 py-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
          <p className="text-[11px]">
            Built for campus hackathons · AI matching, clubs, and skills.
          </p>
        </div>
      </footer>
    </div>
  );
}
