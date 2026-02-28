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
function normalizeArray(values: string[]): string[] {
  return values.map((v) => v.trim().toLowerCase()).filter(Boolean);
}

function getOverlapCount(a: string[], b: string[]): number {
  const setB = new Set(b);
  return a.filter((v) => setB.has(v)).length;
}

function getGoalOverlap(a: string, b: string): number {
  const wordsA = normalizeArray(a.split(/\s+/));
  const wordsB = normalizeArray(b.split(/\s+/));
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  return getOverlapCount(wordsA, wordsB);
}

function inferMatchType(
  score: number,
  a: MatchProfile,
  b: MatchProfile
): MatchResult["match_type"] {
  const yearA = parseInt(a.year, 10);
  const yearB = parseInt(b.year, 10);
  const bothNumeric = Number.isFinite(yearA) && Number.isFinite(yearB);
  const isSameYear = bothNumeric && yearA === yearB;
  const isBTechSeniorToA = bothNumeric && yearB > yearA;

  // When used from /api/matches, `a` is the current user and `b` is the other profile.
  // Prefer classifying higher-year students as mentors and same-year students as collaborators
  // when there is good alignment (reflected in the score).
  if (score >= 65 && isBTechSeniorToA) return "Mentor";
  if (score >= 55 && isSameYear) return "Collaborator";

  // Fallback purely on score for non-numeric years or generic comparisons.
  if (score >= 80) return "Mentor";
  if (score >= 70) return "Collaborator";
  if (score >= 45) return "Learning Buddy";
  return "Low Match";
}

function buildReason(
  score: number,
  sharedSkills: number,
  sharedInterests: number
): string {
  if (score < 30) {
    return "Profiles are quite different with limited overlap in skills and interests.";
  }
  const parts: string[] = [];
  if (sharedSkills > 0) {
    parts.push(`you share ${sharedSkills} overlapping skill${sharedSkills > 1 ? "s" : ""}`);
  }
  if (sharedInterests > 0) {
    parts.push(`you have ${sharedInterests} common interest${sharedInterests > 1 ? "s" : ""}`);
  }
  if (parts.length === 0) {
    return "You have some potential alignment based on your profiles.";
  }
  return `Strong potential match because ${parts.join(" and ")}.`;
}

export async function computeCompatibility(
  studentA: MatchProfile,
  studentB: MatchProfile
): Promise<MatchResult> {
  const skillsA = normalizeArray(studentA.skills);
  const skillsB = normalizeArray(studentB.skills);
  const interestsA = normalizeArray(studentA.interests);
  const interestsB = normalizeArray(studentB.interests);

  const sharedSkills = getOverlapCount(skillsA, skillsB);
  const sharedInterests = getOverlapCount(interestsA, interestsB);
  const goalOverlap = getGoalOverlap(studentA.goal, studentB.goal);

  let score = 0;

  // Weight skills most, then interests, then goals.
  score += sharedSkills * 18; // up to ~70 if many overlaps
  score += sharedInterests * 10; // up to ~30
  score += Math.min(goalOverlap * 4, 20); // cap goal contribution

  // Small baseline if there is at least some data filled in.
  const hasAnyData =
    skillsA.length + skillsB.length + interestsA.length + interestsB.length > 0 ||
    studentA.goal.trim() !== "" ||
    studentB.goal.trim() !== "";
  if (hasAnyData) {
    score = Math.max(score, 25);
  }

  // Clamp score to [0, 100].
  score = Math.max(0, Math.min(100, Math.round(score)));

  const match_type = inferMatchType(score, studentA, studentB);
  const reason = buildReason(score, sharedSkills, sharedInterests);

  return { score, match_type, reason };
}
