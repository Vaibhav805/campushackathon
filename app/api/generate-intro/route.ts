import { NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";

interface IntroStudent {
  name?: string;
  year?: string;
  skills?: string[];
  interests?: string[];
  goal?: string;
}

interface IntroRequestBody {
  sender?: IntroStudent;
  receiver?: IntroStudent;
}

interface IntroResponse {
  message: string;
}

function normalizeArray(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values.map((v) => String(v).trim()).filter(Boolean);
}

function buildPrompt(sender: IntroStudent, receiver: IntroStudent): string {
  const senderProfile = {
    name: String(sender.name ?? ""),
    year: String(sender.year ?? ""),
    skills: normalizeArray(sender.skills),
    interests: normalizeArray(sender.interests),
    goal: String(sender.goal ?? ""),
  };

  const receiverProfile = {
    name: String(receiver.name ?? ""),
    year: String(receiver.year ?? ""),
    skills: normalizeArray(receiver.skills),
    interests: normalizeArray(receiver.interests),
    goal: String(receiver.goal ?? ""),
  };

  return `You are an AI assistant helping university students start professional connections.

Your task:
Generate a short, friendly, and professional introduction message from Student A to Student B.

Guidelines:

2–3 sentences maximum.

Mention shared skills, interests, or goals if relevant.

Tone: polite, confident, collaborative.

Do NOT sound robotic.

Do NOT exaggerate.

Do NOT use emojis.

Keep it concise and natural.

Return STRICT JSON only.

Return format:

{
"message": "The generated introduction message here."
}

Student A (Sender):
${JSON.stringify(senderProfile, null, 2)}

Student B (Receiver):
${JSON.stringify(receiverProfile, null, 2)}

Remember:
Return only valid JSON.
No markdown.
No explanations outside JSON.`;
}

function parseIntroResponse(text: string): IntroResponse {
  let cleaned = text.trim();

  // Strip markdown code fences if model accidentally includes them
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  // If there is surrounding commentary, try to extract the JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("Failed to parse intro JSON from model response");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as { message?: unknown }).message !== "string"
  ) {
    throw new Error("Intro JSON does not contain a valid message field");
  }

  const message = (parsed as { message: string }).message.trim();
  if (!message) {
    throw new Error("Intro message is empty");
  }

  return { message };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as IntroRequestBody;
    const sender = body.sender;
    const receiver = body.receiver;

    if (!sender || !receiver) {
      return NextResponse.json(
        { error: "Missing sender or receiver in request body" },
        { status: 400 }
      );
    }

    const model = await getGeminiModel();
    const prompt = buildPrompt(sender, receiver);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 256,
      },
    });

    const text = result.response.text();
    if (!text) {
      return NextResponse.json(
        { error: "No response from Gemini while generating intro" },
        { status: 502 }
      );
    }

    const intro = parseIntroResponse(text);
    return NextResponse.json(intro);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate intro message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

