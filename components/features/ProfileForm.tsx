"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertProfile } from "@/lib/actions/profile";
import type { UserProfile } from "@/types";

interface ProfileFormProps {
  profile: UserProfile | null;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name ?? "");
  const [year, setYear] = useState(profile?.year ?? "");
  const [skillsStr, setSkillsStr] = useState(
    profile?.skills?.join(", ") ?? ""
  );
  const [interestsStr, setInterestsStr] = useState(
    profile?.interests?.join(", ") ?? ""
  );
  const [goal, setGoal] = useState(profile?.goal ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const interests = interestsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: err } = await upsertProfile({
      name,
      year,
      skills,
      interests,
      goal,
    });

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-6">
      {error && (
        <p className="rounded bg-red-100 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="year"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Year
        </label>
        <input
          id="year"
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="e.g. Freshman, 2025"
          className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="skills"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Skills
        </label>
        <input
          id="skills"
          type="text"
          value={skillsStr}
          onChange={(e) => setSkillsStr(e.target.value)}
          placeholder="e.g. Python, Design, Leadership"
          className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="interests"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Interests
        </label>
        <input
          id="interests"
          type="text"
          value={interestsStr}
          onChange={(e) => setInterestsStr(e.target.value)}
          placeholder="e.g. AI, Startups, Music"
          className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="goal"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Goal
        </label>
        <textarea
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="What are you looking to achieve?"
          className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
