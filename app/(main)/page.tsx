import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="mt-6 grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
        <div>
          <p className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
            Built for university hackathons
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-white">
            Find mentors, collaborators, and clubs in minutes.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-zinc-600 sm:text-base dark:text-zinc-300">
            Campus Connect uses smart matching to connect you with seniors, teammates, and
            communities that align with your skills, goals, and interests.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
            >
              Get started
            </Link>
            <Link
              href="/clubs"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-indigo-400 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
            >
              Explore clubs
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live matching
            </span>
            <span>Designed for students, mentors, and club leads.</span>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-500/15 via-sky-500/10 to-blue-500/5 blur-2xl" />
          <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-lg shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Your snapshot
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                  B.Tech Student · AI & Development
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                Matching enabled
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60">
                <p className="text-zinc-500 dark:text-zinc-400">Mentor matches</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                  8
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-300">
                  +3 this week
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60">
                <p className="text-zinc-500 dark:text-zinc-400">Collaborators</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                  12
                </p>
                <p className="mt-0.5 text-[11px] text-sky-600 dark:text-sky-300">
                  Hackathon-ready team
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-800/60">
                <p className="text-zinc-500 dark:text-zinc-400">Club matches</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                  5
                </p>
                <p className="mt-0.5 text-[11px] text-indigo-600 dark:text-indigo-300">
                  Based on your interests
                </p>
              </div>
            </div>

            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Profile completeness
                </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  80%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <FeatureCard
          title="AI-powered matching"
          description="We compare skills, interests, and goals to recommend seniors and peers who can actually help you grow."
        />
        <FeatureCard
          title="Club discovery"
          description="Discover clubs across AI, quant, finance, robotics, music, sports, and more — all in one place."
        />
        <FeatureCard
          title="Skill gap insights"
          description="See where you stand and what to learn next to reach your dream roles, internships, or teams."
        />
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-xs font-semibold text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900/40 dark:text-indigo-200">
        CC
      </div>
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
        {description}
      </p>
    </article>
  );
}
