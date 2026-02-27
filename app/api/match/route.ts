import { NextResponse } from "next/server";
import { computeCompatibility, type MatchProfile } from "@/lib/match";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentA, studentB } = body as {
      studentA: MatchProfile;
      studentB: MatchProfile;
    };

    if (!studentA || !studentB) {
      return NextResponse.json(
        { error: "Missing studentA or studentB in request body" },
        { status: 400 }
      );
    }

    const normalizeProfile = (p: MatchProfile): MatchProfile => ({
      name: String(p.name ?? ""),
      year: String(p.year ?? ""),
      skills: Array.isArray(p.skills) ? p.skills.map(String) : [],
      interests: Array.isArray(p.interests) ? p.interests.map(String) : [],
      goal: String(p.goal ?? ""),
      open_to_mentorship: Boolean(p.open_to_mentorship),
    });

    const a = normalizeProfile(studentA);
    const b = normalizeProfile(studentB);

    const result = await computeCompatibility(a, b);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Match computation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
