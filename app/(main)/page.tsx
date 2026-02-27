import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Campus Connect</h1>
      <Link
        href="/profile"
        className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
      >
        Complete your profile
      </Link>
    </div>
  );
}
