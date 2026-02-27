import { getGeminiModel } from "@/lib/gemini";

export interface MatchProfile {
  name: string;
  year: string;
  skills: string[];
  interests: string[];
  goal: string;
  open_to_mentorship?: boolean;
}

export interface MatchResult {
  score: number;
  match_type: "Mentor" | "Collaborator" | "Learning Buddy" | "Low Match";
  reason: string;
}

const SYSTEM_PROMPT = `You are an AI system that evaluates compatibility between two university students for mentorship or collaboration.

Your task:
Given two student profiles, calculate a compatibility score from 0 to 100.

Scoring Guidelines:
- Skills overlap increases compatibility.
- Shared interests increase compatibility.
- Complementary skills (one knows what the other wants to learn) increases compatibility.
- Similar goals increases compatibility.
- Senior mentoring junior (if open_to_mentorship is true) increases compatibility.
- Completely unrelated profiles should score below 30.

Return STRICT JSON only. No explanations outside JSON.
Return format:
{"score": number (0-100), "match_type": "Mentor" | "Collaborator" | "Learning Buddy" | "Low Match", "reason": "One short sentence explaining why they are a good match."}

Remember: Return only valid JSON. No markdown. No additional commentary.`;

function buildPrompt(studentA: MatchProfile, studentB: MatchProfile): string {
  return `Student A:
${JSON.stringify(studentA)}

Student B:
${JSON.stringify(studentB)}`;
}

function parseJsonResponse(text: string): MatchResult {
  let cleaned = text.trim();

  // Remove markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Extract JSON object if there's extra text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  let parsed: MatchResult;
  try {
    parsed = JSON.parse(cleaned) as MatchResult;
  } catch {
    // Fallback: try to extract fields with regex
    const scoreMatch = cleaned.match(/"score"\s*:\s*(\d+(?:\.\d+)?)/);
    const typeMatch = cleaned.match(/"match_type"\s*:\s*"(\w+(?:\s+\w+)?)"/);
    const reasonMatch = cleaned.match(/"reason"\s*:\s*"((?:[^"\\]|\\.)*)"/);

    const score = scoreMatch ? Math.max(0, Math.min(100, Math.round(parseFloat(scoreMatch[1])))) : 50;
    const matchType = typeMatch?.[1] ?? "Collaborator";
    const validTypes = ["Mentor", "Collaborator", "Learning Buddy", "Low Match"];
    const match_type = validTypes.includes(matchType) ? (matchType as MatchResult["match_type"]) : "Collaborator";
    const reason = reasonMatch?.[1]?.replace(/\\(.)/g, "$1") ?? "Good potential match based on profile.";

    parsed = { score, match_type, reason };
  }

  if (
    typeof parsed.score !== "number" ||
    !["Mentor", "Collaborator", "Learning Buddy", "Low Match"].includes(parsed.match_type) ||
    typeof parsed.reason !== "string"
  ) {
    throw new Error("Invalid match result structure");
  }
  parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  return parsed;
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("quota");
}

function getRetryDelayMs(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : 8000;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function computeCompatibility(
  studentA: MatchProfile,
  studentB: MatchProfile
): Promise<MatchResult> {
  const model = await getGeminiModel();
  const prompt = buildPrompt(studentA, studentB);
  const fullPrompt = SYSTEM_PROMPT + "\n\n" + prompt;

  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      });

      const response = result.response;
      const text = response.text();
      if (!text) {
        throw new Error("No response from Gemini");
      }
      return parseJsonResponse(text);
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries && isRateLimitError(err)) {
        const delay = getRetryDelayMs(err);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }

  throw lastError;
}
