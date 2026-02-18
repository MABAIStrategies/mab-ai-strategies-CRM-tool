import { NextResponse } from "next/server";
import { rateLimit } from "../../../../src/lib/rate-limit";
import { getAIProvider } from "../../../../src/lib/ai-provider";

export async function POST(request: Request) {
  const rate = rateLimit("ai-chat", 20, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const body = await request.json();
  const messages = body.messages as { role: string; content: string }[];

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages array is required." }, { status: 400 });
  }

  const ai = getAIProvider();
  const response = await ai.chat(messages);

  return NextResponse.json({ response });
}
