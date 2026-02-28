import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeCompatibility, type MatchProfile, type MatchResult } from "@/lib/match";

interface MatchWithProfile {
  profile: { id: string; name: string; year: string; skills: string[]; interests: string[]; goal: string };
  result: MatchResult;
}

function toMatchProfile(row: { name?: string; year?: string; skills?: string[]; interests?: string[]; goal?: string }): MatchProfile {
  return {
    name: String(row?.name ?? ""),
    year: String(row?.year ?? ""),
    skills: Array.isArray(row?.skills) ? row.skills.map(String) : [],
    interests: Array.isArray(row?.interests) ? row.interests.map(String) : [],
    goal: String(row?.goal ?? ""),
    open_to_mentorship: false,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = (body as { userId?: string }).userId;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: myProfile } = await supabase
      .from("users")
      .select("id, name, year, skills, interests, goal")
      .eq("id", userId)
      .single();

    if (!myProfile) {
      return NextResponse.json(
        { error: "Profile not found. Complete your profile first." },
        { status: 404 }
      );
    }

    const { data: otherUsers } = await supabase
      .from("users")
      .select("id, name, year, skills, interests, goal")
      .neq("id", userId);

    if (!otherUsers || otherUsers.length === 0) {
      return NextResponse.json({
        mentors: [],
        collaborators: [],
        others: [],
      });
    }

    const myMatchProfile = toMatchProfile(myProfile);
    const results: MatchWithProfile[] = [];

    for (const other of otherUsers) {
      const otherMatchProfile = toMatchProfile(other);
      const result = await computeCompatibility(myMatchProfile, otherMatchProfile);
      results.push({
        profile: {
          id: other.id,
          name: String(other.name ?? ""),
          year: String(other.year ?? ""),
          skills: Array.isArray(other.skills) ? other.skills : [],
          interests: Array.isArray(other.interests) ? other.interests : [],
          goal: String(other.goal ?? ""),
        },
        result,
      });
    }

    const mentors = results
      .filter((r) => r.result.match_type === "Mentor")
      .sort((a, b) => b.result.score - a.result.score)
      .slice(0, 10);

    const collaborators = results
      .filter((r) => r.result.match_type === "Collaborator" || r.result.match_type === "Learning Buddy")
      .sort((a, b) => b.result.score - a.result.score)
      .slice(0, 10);

    const others = results
      .filter((r) => r.result.match_type === "Low Match")
      .sort((a, b) => b.result.score - a.result.score)
      .slice(0, 10);

    return NextResponse.json({ mentors, collaborators, others });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to compute matches";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
