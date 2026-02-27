"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });

    if (error) {
      let message = error.message;
      if (message === "Failed to fetch") {
        message =
          "Cannot reach Supabase. Add your project URL and anon key to .env.local (get them from supabase.com/dashboard → Project Settings → API)";
      } else if (message === "Invalid API key") {
        message =
          "Invalid API key. Open supabase.com/dashboard → your project → Project Settings → API. Copy the anon key (Legacy tab) or publishable key. Update .env.local and restart dev server. Ensure the project is not paused.";
      } else if (
        message === "email rate limit exceeded" ||
        message.includes("rate limit")
      ) {
        message =
          "Too many signup attempts. Wait a few minutes and try again. For development: disable email confirmation in Supabase Dashboard → Authentication → Providers → Email → turn off \"Confirm email\".";
      }
      setError(message);
      setLoading(false);
      return;
    }

    // Supabase may require email confirmation - if not, session is set and we redirect
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      router.push("/profile");
      router.refresh();
    } else {
      setError(null);
      setLoading(false);
      setConfirmMessage(true);
      setEmail("");
      setPassword("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 p-8 dark:border-zinc-800"
      >
        <h1 className="text-2xl font-semibold">Sign up</h1>

        {error && (
          <p className="rounded bg-red-100 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </p>
        )}

        {confirmMessage && (
          <p className="rounded bg-green-100 p-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Check your email for the confirmation link.
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded border border-zinc-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
