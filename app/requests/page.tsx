import Link from "next/link";
import {
  acceptConnection,
  getAcceptedConnections,
  getPendingRequests,
  rejectConnection,
  type ConnectionWithProfile,
} from "@/lib/actions/connections";

function getInitials(name: string): string {
  if (!name) return "CC";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function RequestCard({
  item,
}: {
  item: ConnectionWithProfile;
}) {
  const { user, connection } = item;
  const initials = getInitials(user.name);
  const skills = Array.isArray(user.skills) ? user.skills : [];

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold uppercase text-white shadow-sm">
          {initials}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {user.name || "Unknown student"}
              </h3>
              {user.year && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  B.Tech Year {user.year}
                </p>
              )}
            </div>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              Incoming request
            </span>
          </div>

          {skills.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Requested on{" "}
          {new Date(connection.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </p>
        <div className="flex gap-2">
          <form action={acceptConnection.bind(null, connection.id)}>
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
            >
              Accept
            </button>
          </form>
          <form action={rejectConnection.bind(null, connection.id)}>
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:focus:ring-zinc-500 dark:focus:ring-offset-zinc-950"
            >
              Reject
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

function AcceptedCard({
  item,
}: {
  item: ConnectionWithProfile;
}) {
  const { user, connection } = item;
  const initials = getInitials(user.name);
  const skills = Array.isArray(user.skills) ? user.skills : [];

  return (
    <article className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold uppercase text-white shadow-sm">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {user.name || "Unknown student"}
          </p>
          {skills.length > 0 && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {skills.join(" • ")}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
          Connected
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Since{" "}
          {new Date(connection.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </article>
  );
}

export default async function RequestsPage() {
  const [pending, accepted] = await Promise.all([
    getPendingRequests(),
    getAcceptedConnections(),
  ]);

  const hasPending = pending.length > 0;
  const hasAccepted = accepted.length > 0;

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Connection requests
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Review incoming requests from mentors and collaborators, and manage your existing connections.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mt-2 inline-flex items-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:border-indigo-400 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-indigo-400 dark:hover:text-indigo-200 sm:mt-0"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Pending requests
          </h2>
          {hasPending && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {pending.length} pending
            </span>
          )}
        </div>

        {hasPending ? (
          <div className="grid gap-4 md:grid-cols-2">
            {pending.map((item) => (
              <RequestCard key={item.connection.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            No pending requests right now. When someone sends you a connect request, it will show up here.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Accepted connections
          </h2>
          {hasAccepted && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {accepted.length} connections
            </span>
          )}
        </div>

        {hasAccepted ? (
          <div className="grid gap-3 md:grid-cols-2">
            {accepted.map((item) => (
              <AcceptedCard key={item.connection.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            You don&apos;t have any accepted connections yet. Start by sending connect requests from your{" "}
            <Link href="/dashboard" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              dashboard matches
            </Link>
            .
          </div>
        )}
      </section>
    </main>
  );
}

