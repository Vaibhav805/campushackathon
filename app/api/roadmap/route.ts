import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiModel } from "@/lib/gemini";
import type { UserProfileRow } from "@/types";

interface RoadmapBody {
  userId?: string;
}

export interface Roadmap {
  "Year 1": string[];
  "Year 2": string[];
  "Year 3": string[];
}

function normalizeArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((v) => String(v).trim()).filter(Boolean);
}

function buildPrompt(profile: UserProfileRow): string {
  const normalizedProfile: UserProfileRow = {
    id: profile.id,
    name: String(profile.name ?? ""),
    year: String(profile.year ?? ""),
    skills: Array.isArray(profile.skills)
      ? profile.skills.map((s) => String(s))
      : [],
    interests: Array.isArray(profile.interests)
      ? profile.interests.map((i) => String(i))
      : [],
    goal: String(profile.goal ?? ""),
  };

  return `You are an AI assistant helping university students plan their careers.

Your task:
Given the student profile below, generate a realistic, actionable 3-year roadmap tailored to this student.

Guidelines:
- Focus on skills, projects, internships, networking, and club/competition involvement.
- Keep each item short and concrete (1 bullet = 1 clear action or milestone).
- Do NOT overpromise unrealistic outcomes.
- Keep the roadmap practical for a typical university student in India.

Return STRICT JSON only.

Return format:
{
  "Year 1": [],
  "Year 2": [],
  "Year 3": []
}

Each array should contain 3–7 short string items describing what the student should focus on in that year.

Student Profile:
${JSON.stringify(normalizedProfile, null, 2)}

Remember:
- Return only valid JSON.
- No markdown.
- No explanations outside JSON.`;
}

function buildFallbackRoadmap(): Roadmap {
  return {
    "Year 1": [
      "Strengthen your fundamentals in programming, math, and core CS subjects.",
      "Complete at least 2–3 small AI or development projects and publish them on GitHub.",
      "Explore campus clubs or online communities related to AI, development, or your primary interest area.",
      "Build a consistent study routine (3–5 hours per week) focused on your target domain.",
    ],
    "Year 2": [
      "Work on 1–2 larger projects or research ideas that go deeper into your chosen area.",
      "Target relevant internships, hackathons, or competitions to gain practical experience.",
      "Contribute to an open-source project or collaborate with peers on a team project.",
      "Start building a simple portfolio site or LinkedIn profile showcasing your work.",
    ],
    "Year 3": [
      "Focus on polishing 2–3 flagship projects that show real impact or depth.",
      "Prepare for internships or full-time roles through mock interviews and problem practice.",
      "Network with seniors, alumni, and professionals for referrals and mentorship.",
      "Refine your resume, portfolio, and online presence to clearly reflect your story and goals.",
    ],
  };
}

function parseRoadmapResponse(text: string): Roadmap {
  let cleaned = text.trim();

  // Strip markdown code fences if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Extract JSON object if there is surrounding text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // If the model did not return perfectly valid JSON, fall back to a safe default roadmap
    return buildFallbackRoadmap();
  }

  const result = parsed as Partial<Roadmap> | null;

  const year1 = normalizeArray(result?.["Year 1"]);
  const year2 = normalizeArray(result?.["Year 2"]);
  const year3 = normalizeArray(result?.["Year 3"]);

  if (!year1.length && !year2.length && !year3.length) {
    // If the structure is wrong or empty, also fall back to a safe default roadmap
    return buildFallbackRoadmap();
  }

  return {
    "Year 1": year1.length ? year1 : buildFallbackRoadmap()["Year 1"],
    "Year 2": year2.length ? year2 : buildFallbackRoadmap()["Year 2"],
    "Year 3": year3.length ? year3 : buildFallbackRoadmap()["Year 3"],
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RoadmapBody;
    const userId = body.userId;

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

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id,name,year,skills,interests,goal")
      .eq("id", userId)
      .single<UserProfileRow>();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const model = await getGeminiModel();
    const prompt = buildPrompt(profile);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 640,
      },
    });

    const text = result.response.text();
    if (!text) {
      return NextResponse.json(
        { error: "No response from Gemini while generating roadmap" },
        { status: 502 }
      );
    }

    const roadmap = parseRoadmapResponse(text);

    return NextResponse.json(roadmap satisfies Roadmap);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate roadmap";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

