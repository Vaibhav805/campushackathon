"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { CLUBS } from "@/lib/clubs";

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

type RawConnectionStatus = "pending" | "accepted" | "rejected";
type ConnectionStatus = RawConnectionStatus | "none";

interface Roadmap {
  "Year 1": string[];
  "Year 2": string[];
  "Year 3": string[];
}

const AVATAR_IMAGES = [
  "/images/avatars/avatar-1.png",
  "/images/avatars/avatar-2.png",
  "/images/avatars/avatar-3.png",
  "/images/avatars/avatar-4.png",
  "/images/avatars/avatar-5.png",
  "/images/avatars/avatar-6.png",
];

function getAvatarIndex(profileId: string): number {
  let hash = 0;
  for (let i = 0; i < profileId.length; i++) {
    hash = (hash << 5) - hash + profileId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % AVATAR_IMAGES.length;
}

function MatchCard({
  item,
  connectionStatus = "none",
  onConnect,
  connectLoading = false,
}: {
  item: MatchWithProfile;
  connectionStatus?: ConnectionStatus;
  onConnect: () => void;
  connectLoading?: boolean;
}) {
  const { profile, result } = item;
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const interests = Array.isArray(profile.interests) ? profile.interests : [];
  const avatarSrc = AVATAR_IMAGES[getAvatarIndex(profile.id)];

  return (
    <article className="group relative overflow-hidden rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-lg shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:border-indigo-500/50">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-100/80 to-violet-100/80 opacity-60 blur-xl transition-opacity group-hover:opacity-80 dark:from-indigo-900/30 dark:to-violet-900/30" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Image
              src={avatarSrc}
              alt={profile.name || "Match"}
              width={56}
              height={56}
              className="h-14 w-14 rounded-xl object-cover ring-2 ring-white shadow-md ring-offset-2 ring-offset-zinc-50 transition-all group-hover:ring-indigo-200 dark:ring-zinc-700 dark:ring-offset-zinc-900 dark:group-hover:ring-indigo-500/50"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
              {profile.name || "Unnamed"}
            </h3>
            {profile.year && (
              <span className="mt-1 inline-flex items-center rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:from-indigo-900/40 dark:to-violet-900/40 dark:text-indigo-200">
                B.Tech Year {profile.year}
              </span>
            )}
          </div>
          <span className="flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-1.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
            {result.score}%
          </span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {result.reason}
        </p>
        {profile.goal && (
          <div className="rounded-lg bg-amber-50/80 p-3 dark:bg-amber-900/20">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
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
                className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
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
                className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-200"
              >
                {i}
              </span>
            ))}
          </div>
        )}
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={onConnect}
            disabled={
              connectLoading ||
              connectionStatus === "pending" ||
              connectionStatus === "accepted"
            }
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/30 disabled:cursor-default disabled:opacity-60 disabled:shadow-none"
          >
            {connectionStatus === "accepted"
              ? "Connected"
              : connectionStatus === "pending"
              ? "Pending"
              : connectLoading
              ? "Sending…"
              : "Connect"}
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ message }: { message: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 p-12 text-center dark:border-indigo-800 dark:from-indigo-950/30 dark:to-violet-950/30">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
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
  const [userId, setUserId] = useState<string | null>(null);
  const totalMatches = mentors.length + collaborators.length + others.length;
  const clubsCount = CLUBS.length;
  const [connections, setConnections] = useState<
    Record<string, ConnectionStatus>
  >({});
  const [connectLoading, setConnectLoading] = useState<
    Record<string, boolean>
  >({});
  const recommendedClubs = CLUBS.slice(0, 3);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) {
          router.replace("/login");
          return;
        }
        setUserId(user.id);
        setAuthReady(true);
      });
  }, [router]);

  async function handleFindMatches() {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      if (!userId) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
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

      const mentorsData: MatchWithProfile[] = data.mentors ?? [];
      const collaboratorsData: MatchWithProfile[] = data.collaborators ?? [];
      const othersData: MatchWithProfile[] = data.others ?? [];

      setMentors(mentorsData);
      setCollaborators(collaboratorsData);
      setOthers(othersData);

      const allMatches = [
        ...mentorsData,
        ...collaboratorsData,
        ...othersData,
      ];
      const peerIds = Array.from(
        new Set(allMatches.map((m) => m.profile.id).filter(Boolean))
      );

      if (peerIds.length > 0) {
        try {
          const params = new URLSearchParams({
            peerIds: peerIds.join(","),
          });
          const statusRes = await fetch(
            `/api/connections/status?${params.toString()}`
          );
          if (statusRes.ok) {
            const json: {
              statuses?: Record<string, RawConnectionStatus>;
            } = await statusRes.json();
            if (json.statuses) {
              setConnections((prev) => ({
                ...prev,
                ...json.statuses,
              }));
            }
          }
        } catch {
          // best-effort; ignore failures
        }
      }
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

  async function handleConnectClick(peerId: string) {
    if (!peerId) return;
    setConnectLoading((prev) => ({ ...prev, [peerId]: true }));
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: peerId }),
      });
      const data: {
        connection?: { receiver_id?: string; sender_id?: string; status?: RawConnectionStatus };
        error?: string;
      } = await res.json();

      if (!res.ok || !data.connection) {
        // keep any existing status, optionally surface error later
        return;
      }

      const status = data.connection.status ?? "pending";
      const counterpartId =
        data.connection.receiver_id === peerId ||
        data.connection.sender_id !== peerId
          ? peerId
          : peerId;

      setConnections((prev) => ({
        ...prev,
        [counterpartId]: status,
      }));
    } catch {
      // ignore for now; user can retry
    } finally {
      setConnectLoading((prev) => ({ ...prev, [peerId]: false }));
    }
  }

  async function handleGenerateRoadmap() {
    setRoadmapLoading(true);
    setRoadmapError(null);
    try {
      if (!userId) {
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data: {
        "Year 1"?: string[];
        "Year 2"?: string[];
        "Year 3"?: string[];
        error?: string;
      } = await res.json();

      if (!res.ok) {
        setRoadmap(null);
        setRoadmapError(data.error || "Failed to generate roadmap");
        return;
      }

      const nextRoadmap: Roadmap = {
        "Year 1": Array.isArray(data["Year 1"]) ? data["Year 1"] : [],
        "Year 2": Array.isArray(data["Year 2"]) ? data["Year 2"] : [],
        "Year 3": Array.isArray(data["Year 3"]) ? data["Year 3"] : [],
      };

      setRoadmap(nextRoadmap);
    } catch (err) {
      setRoadmap(null);
      setRoadmapError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setRoadmapLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-6 text-white shadow-xl shadow-indigo-500/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                Dashboard
              </h1>
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
              >
                Home
              </Link>
            </div>
            <p className="mt-1 text-sm text-white/90">
              Run matching to find mentors, collaborators, and clubs that fit your profile.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleFindMatches}
              disabled={loading || !authReady}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-lg transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-500 disabled:opacity-50"
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
              <span className="text-xs text-white/80">Checking auth…</span>
            )}
          </div>
        </div>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-100/80 p-4 dark:bg-zinc-800/50">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Quick actions</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center rounded-xl border-2 border-dashed border-indigo-200 px-4 py-2 font-medium text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/50"
          >
            Create new file
          </button>
          <Link
            href="/requests"
            className="inline-flex items-center rounded-xl border-2 border-indigo-200 bg-indigo-50 px-4 py-2 font-medium text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
          >
            Connection requests
          </Link>
          <Link
            href="/clubs"
            className="inline-flex items-center rounded-xl border-2 border-violet-200 bg-violet-50 px-4 py-2 font-medium text-violet-700 transition hover:border-violet-400 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-900/50"
          >
            Club features
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="group rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-md transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Matches
          </p>
          <p className="mt-2 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
            {totalMatches}
          </p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Mentors, collaborators, and other connections.
          </p>
        </div>
        <div className="group rounded-2xl border-2 border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-md transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg dark:border-violet-900/50 dark:from-violet-950/40 dark:to-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Clubs
          </p>
          <p className="mt-2 text-3xl font-bold text-violet-700 dark:text-violet-300">
            {clubsCount}
          </p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Discover communities across AI, quant, finance, robotics, and more.
          </p>
        </div>
        <div className="group rounded-2xl border-2 border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-white p-5 shadow-md transition-all hover:-translate-y-0.5 hover:border-fuchsia-200 hover:shadow-lg dark:border-fuchsia-900/50 dark:from-fuchsia-950/40 dark:to-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
            Skill gaps
          </p>
          <p className="mt-2 text-3xl font-bold text-fuchsia-700 dark:text-fuchsia-300">
            {totalMatches > 0 ? 3 : 0}
          </p>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Areas where mentors and clubs can help you grow.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
            Recommended clubs
          </h2>
          <Link
            href="/clubs"
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedClubs.map((club) => (
            <article
              key={club.id}
              className="rounded-2xl border-2 border-zinc-200 bg-white p-4 text-xs shadow-md transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-violet-600/50"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {club.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {club.description}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                  {club.matchScore}%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100">
                  {club.domain}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${
                    club.recruitmentStatus === "Open Now"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                      : club.recruitmentStatus === "Waitlist"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {club.recruitmentStatus}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Your 3-Year AI Roadmap
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Generate a personalised, practical roadmap based on your profile and goals.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateRoadmap}
            disabled={roadmapLoading || !authReady}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-950"
          >
            {roadmapLoading
              ? "Generating roadmap…"
              : roadmap
              ? "Regenerate roadmap"
              : "Generate roadmap"}
          </button>
        </div>

        {roadmapError && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {roadmapError}
          </div>
        )}

        {roadmap ? (
          <div className="grid gap-4 md:grid-cols-3">
            {(["Year 1", "Year 2", "Year 3"] as const).map((yearKey) => {
              const items = roadmap[yearKey] ?? [];
              return (
                <article
                  key={yearKey}
                  className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 text-xs shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {yearKey}
                  </h3>
                  {items.length > 0 ? (
                    <ul className="mt-2 space-y-1.5 text-zinc-600 dark:text-zinc-300">
                      {items.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                      No items yet for this year. Try regenerating your roadmap.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            No roadmap generated yet. Click{" "}
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              Generate roadmap
            </span>{" "}
            to get a 3-year AI-focused plan tailored to your profile.
          </div>
        )}
      </section>

      <section className="mt-2 rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-100">
              Need help or have feedback?
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              Reach out to the Campus Connect team or share ideas to improve your matching experience.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="mailto:support@campusconnect.ai"
              className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            >
              Contact us
            </Link>
            <Link
              href="/requests"
              className="inline-flex items-center rounded-full border border-zinc-300 px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:border-indigo-400 hover:text-indigo-700 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
            >
              View connection requests
            </Link>
          </div>
        </div>
      </section>

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
              </Link>{" "}
              and invite others to join to find mentors and collaborators.
            </>
          }
        />
      )}

      {!isEmpty && (mentors.length > 0 || collaborators.length > 0 || others.length > 0) && (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
              Top Mentors
            </h2>
            {mentors.length === 0 ? (
              <EmptyState message="No mentor matches found." />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {mentors.map((item) => (
                  <li key={item.profile.id}>
                    <MatchCard
                      item={item}
                      connectionStatus={connections[item.profile.id] ?? "none"}
                      onConnect={() => handleConnectClick(item.profile.id)}
                      connectLoading={connectLoading[item.profile.id] ?? false}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
              <span className="flex h-2 w-2 rounded-full bg-violet-500" />
              Top Collaborators
            </h2>
            {collaborators.length === 0 ? (
              <EmptyState message="No collaborator matches found." />
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {collaborators.map((item) => (
                  <li key={item.profile.id}>
                    <MatchCard
                      item={item}
                      connectionStatus={connections[item.profile.id] ?? "none"}
                      onConnect={() => handleConnectClick(item.profile.id)}
                      connectLoading={connectLoading[item.profile.id] ?? false}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {others.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                <span className="flex h-2 w-2 rounded-full bg-fuchsia-500" />
                Other potential matches
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {others.map((item) => (
                  <li key={item.profile.id}>
                    <MatchCard
                      item={item}
                      connectionStatus={connections[item.profile.id] ?? "none"}
                      onConnect={() => handleConnectClick(item.profile.id)}
                      connectLoading={connectLoading[item.profile.id] ?? false}
                    />
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
