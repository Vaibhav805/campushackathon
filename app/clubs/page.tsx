"use client";

import { useMemo, useState } from "react";
import { CLUBS, type ClubDomain } from "@/lib/clubs";

const DOMAIN_FILTERS: { label: string; value: ClubDomain | "all" }[] = [
  { label: "All domains", value: "all" },
  { label: "AI", value: "AI" },
  { label: "Quant", value: "Quant" },
  { label: "Finance", value: "Finance" },
  { label: "Robotics", value: "Robotics" },
  { label: "Music", value: "Music" },
  { label: "Sports", value: "Sports" },
  { label: "Development", value: "Development" },
  { label: "Other", value: "Other" },
];

export default function ClubsPage() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<ClubDomain | "all">("all");

  const filteredClubs = useMemo(() => {
    return CLUBS.filter((club) => {
      const matchesDomain = domain === "all" || club.domain === domain;
      const matchesQuery =
        query.trim().length === 0 ||
        club.name.toLowerCase().includes(query.toLowerCase()) ||
        club.description.toLowerCase().includes(query.toLowerCase());
      return matchesDomain && matchesQuery;
    });
  }, [domain, query]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Clubs & Communities
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Discover AI, quant, finance, robotics, music, sports, and development clubs that match your interests.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by club name or description"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {DOMAIN_FILTERS.map((item) => {
            const isActive = domain === item.value;
            const baseClasses =
              "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900";
            const activeClasses =
              "border-indigo-600 bg-indigo-600 text-white shadow-sm hover:border-indigo-700 hover:bg-indigo-700";
            const inactiveClasses =
              "border-zinc-300 bg-white text-zinc-700 hover:border-indigo-400 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200";

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setDomain(item.value)}
                className={`${baseClasses} ${
                  isActive ? activeClasses : inactiveClasses
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredClubs.map((club) => (
          <article
            key={club.id}
            className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {club.name}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {club.description}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                  {club.matchScore}% match
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
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
              >
                View details
              </button>
            </div>
          </article>
        ))}

        {filteredClubs.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            No clubs match your filters yet. Try clearing the search or choosing a different domain.
          </div>
        )}
      </div>
    </div>
  );
}

