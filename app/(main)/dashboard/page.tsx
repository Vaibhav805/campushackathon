import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserProfileRow } from "@/types";

const SKILL_POINTS = 2;
const INTEREST_POINTS = 3;

function hasCompleteProfile(profile: UserProfileRow | null): boolean {
  if (!profile) return false;
  return !!(profile.name && profile.year?.trim());
}

function computeMatchScore(
  currentUser: UserProfileRow,
  otherUser: UserProfileRow
): number {
  const mySkills = new Set(
    (Array.isArray(currentUser.skills) ? currentUser.skills : []).map((s) =>
      String(s).trim().toLowerCase()
    )
  );
  const myInterests = new Set(
    (Array.isArray(currentUser.interests) ? currentUser.interests : []).map(
      (i) => String(i).trim().toLowerCase()
    )
  );

  const otherSkills = Array.isArray(otherUser.skills) ? otherUser.skills : [];
  const otherInterests = Array.isArray(otherUser.interests)
    ? otherUser.interests
    : [];

  let score = 0;
  for (const s of otherSkills) {
    if (mySkills.has(String(s).trim().toLowerCase())) score += SKILL_POINTS;
  }
  for (const i of otherInterests) {
    if (myInterests.has(String(i).trim().toLowerCase()))
      score += INTEREST_POINTS;
  }
  return score;
}

function ProfileCard({
  user,
  isCurrentUser,
  matchScore,
}: {
  user: UserProfileRow;
  isCurrentUser?: boolean;
  matchScore?: number;
}) {
  const skills = Array.isArray(user.skills) ? user.skills : [];
  const interests = Array.isArray(user.interests) ? user.interests : [];

  return (
    <article
      className={`rounded-xl border p-6 ${
        isCurrentUser
          ? "border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/30"
          : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {user.name || "Unnamed"}
            {isCurrentUser && (
              <span className="ml-2 text-sm font-normal text-indigo-600 dark:text-indigo-400">
                (You)
              </span>
            )}
          </h3>
          {matchScore !== undefined && matchScore > 0 && (
            <span
              className="mt-1 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300"
              title="Match score: +2 per shared skill, +3 per shared interest"
            >
              {matchScore} pts
            </span>
          )}
          {user.year && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Year: {user.year}
            </p>
          )}
        </div>
      </div>
      {user.goal && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Goal
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {user.goal}
          </p>
        </div>
      )}
      {skills.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Skills
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs text-zinc-800 dark:bg-zinc-600 dark:text-zinc-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
      {interests.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Interests
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {interests.map((i) => (
              <span
                key={i}
                className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: myProfile } = await supabase
    .from("users")
    .select("id, name, year, skills, interests, goal")
    .eq("id", user.id)
    .single();

  if (!hasCompleteProfile(myProfile as UserProfileRow | null)) {
    redirect("/profile");
  }

  const { data: otherUsers } = await supabase
    .from("users")
    .select("id, name, year, skills, interests, goal")
    .neq("id", user.id);

  const myProfileRow = myProfile as UserProfileRow;
  const allOthers = (otherUsers ?? []) as UserProfileRow[];

  const suggestedConnections = allOthers
    .map((u) => ({ user: u, matchScore: computeMatchScore(myProfileRow, u) }))
    .filter(({ matchScore }) => matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-zinc-900 dark:text-white">
        Dashboard
      </h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium text-zinc-800 dark:text-zinc-200">
          My Profile
        </h2>
        <ProfileCard
          user={myProfile as UserProfileRow}
          isCurrentUser
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-zinc-800 dark:text-zinc-200">
          Suggested Connections
        </h2>
        {suggestedConnections.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
            No suggested connections with matching skills or interests yet. Invite others to join!
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {suggestedConnections.map(({ user: u, matchScore }) => (
              <li key={u.id}>
                <ProfileCard user={u} matchScore={matchScore} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
