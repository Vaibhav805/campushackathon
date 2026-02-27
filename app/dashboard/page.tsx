"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface MatchResult {
  score: number;
  match_type: "Mentor" | "Collaborator" | "Learning Buddy" | "Low Match";
  reason: string;
}

interface MatchWithProfile {
  profile: {
    id: string;
    name: string;
    year: string;
    skills: string[];
    interests: string[];
    goal: string;
  };
  result: MatchResult;
}

function MatchCard({ item }: { item: MatchWithProfile }) {
  const { profile, result } = item;
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const interests = Array.isArray(profile.interests) ? profile.interests : [];

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              {profile.name || "Unnamed"}
            </h3>
            {profile.year && (
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                Year {profile.year}
              </p>
            )}
          </div>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
            {result.score}%
          </span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {result.reason}
        </p>
        {profile.goal && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Goal
            </p>
            <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">
              {profile.goal}
            </p>
          </div>
        )}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interests.map((i) => (
              <span
                key={i}
                className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
              >
                {i}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function EmptyState({ message }: { message: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-600">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<MatchWithProfile[]>([]);
  const [collaborators, setCollaborators] = useState<MatchWithProfile[]>([]);
  const [others, setOthers] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) router.replace("/login");
        setAuthReady(true);
      });
  }, [router]);

  async function handleFindMatches() {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error || "Failed to find matches";
        setError(errMsg);
        setMentors([]);
        setCollaborators([]);
        setOthers([]);
        if (res.status === 404 && errMsg.toLowerCase().includes("profile")) {
          router.push("/profile");
        }
        return;
      }

      setMentors(data.mentors ?? []);
      setCollaborators(data.collaborators ?? []);
      setOthers(data.others ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMentors([]);
      setCollaborators([]);
      setOthers([]);
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = !loading && searched && mentors.length === 0 && collaborators.length === 0 && others.length === 0;

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Find mentors and collaborators based on your profile.
        </p>
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleFindMatches}
          disabled={loading || !authReady}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Finding matches…
            </>
          ) : (
            "Find Matches"
          )}
        </button>
        {!authReady && (
          <span className="text-sm text-zinc-500">Checking auth…</span>
        )}
      </div>

      {error && (
        <div className="mb-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isEmpty && (
        <EmptyState
          message={
            <>
              No matches yet.{" "}
              <Link href="/profile" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Complete your profile
              </Link>
              {" "}and invite others to join to find mentors and collaborators.
            </>
          }
        />
      )}

      {!isEmpty && (mentors.length > 0 || collaborators.length > 0 || others.length > 0) && (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-lg font-medium text-zinc-800 dark:text-zinc-200">
              Top Mentors
            </h2>
            {mentors.length === 0 ? (
              <EmptyState message="No mentor matches found." />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {mentors.map((item) => (
                  <li key={item.profile.id}>
                    <MatchCard item={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-medium text-zinc-800 dark:text-zinc-200">
              Top Collaborators
            </h2>
            {collaborators.length === 0 ? (
              <EmptyState message="No collaborator matches found." />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {collaborators.map((item) => (
                  <li key={item.profile.id}>
                    <MatchCard item={item} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {others.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-medium text-zinc-800 dark:text-zinc-200">
                Other potential matches
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {others.map((item) => (
                  <li key={item.profile.id}>
                    <MatchCard item={item} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
