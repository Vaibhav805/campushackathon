export async function getGeminiModel() {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  return genAI.getGenerativeModel({ model });
}
