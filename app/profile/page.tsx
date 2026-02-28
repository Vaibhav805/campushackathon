"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const INTEREST_OPTIONS = [
  "AI",
  "Quant",
  "Finance",
  "Robotics",
  "Music",
  "Sports",
  "Development",
];

function parseCommaSeparated(str: string): string[] {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (!cancelled) {
            router.replace("/login");
          }
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("name, year, skills, interests, goal")
          .eq("id", user.id)
          .maybeSingle();

        if (!cancelled) {
          if (profile) {
            setName(profile.name ?? "");
            setYear(profile.year ?? "");
            setSkillsStr(
              Array.isArray(profile.skills) ? profile.skills.join(", ") : ""
            );
            setSelectedInterests(
              Array.isArray(profile.interests) ? profile.interests : []
            );
            setGoal(profile.goal ?? "");
          }
          setAuthLoading(false);
        }
      } catch {
        if (!cancelled) setAuthLoading(false);
      }
    }

    checkAuth();
    const timeout = setTimeout(() => {
      if (!cancelled) setAuthLoading(false);
    }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const skills = parseCommaSeparated(skillsStr);
    const interests = selectedInterests;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("users").upsert(
      {
        id: user.id,
        name,
        year,
        skills,
        interests,
        goal,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  if (authLoading) {
    return (
      <main className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  const previewSkills = parseCommaSeparated(skillsStr);

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-10 dark:from-zinc-950 dark:to-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Create your profile
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Tell us about your background and interests so we can match you with the right mentors, collaborators, and clubs.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
                >
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label
                    htmlFor="year"
                    className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Year (B.Tech)
                  </label>
                  <input
                    id="year"
                    type="text"
                    inputMode="numeric"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    placeholder="e.g. 1, 2, 3, 4"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="skills"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Skills
                </label>
                <input
                  id="skills"
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="Python, Design, Leadership"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Comma-separated values. These help us understand what you can contribute.
                </p>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Interests
                </p>
                <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Pick the domains you are most interested in exploring.
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((option) => {
                    const selected = selectedInterests.includes(option);
                    const baseClasses =
                      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900";
                    const selectedClasses =
                      "border-indigo-600 bg-indigo-600 text-white shadow-sm hover:border-indigo-700 hover:bg-indigo-700";
                    const unselectedClasses =
                      "border-zinc-300 bg-white text-zinc-700 hover:border-indigo-400 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300";

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setSelectedInterests((current) =>
                            current.includes(option)
                              ? current.filter((v) => v !== option)
                              : [...current, option]
                          )
                        }
                        className={`${baseClasses} ${
                          selected ? selectedClasses : unselectedClasses
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="goal"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Goal
                </label>
                <textarea
                  id="goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={4}
                  placeholder="What are you looking to achieve? (e.g. crack quant roles, build AI projects, start a robotics team)"
                  className="w-full resize-none rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
                >
                  {loading ? "Saving…" : "Save profile"}
                </button>
              </div>
            </form>
          </div>

          <aside className="rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-zinc-50 to-white p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Preview
            </p>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                    {name || "Your name"}
                  </h2>
                  {year && (
                    <span className="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                      B.Tech Year {year}
                    </span>
                  )}
                </div>
              </div>

              {goal && (
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-300">
                  {goal}
                </p>
              )}

              {previewSkills.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedInterests.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              This is how your card will appear to potential mentors and collaborators on the dashboard.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
