import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "https://openrouter.ai/api/v1";
const AI_API_KEY = process.env.AI_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "openrouter/free";
const OPENCODE_API_BASE_URL = process.env.OPENCODE_API_BASE_URL || "https://opencode.ai/zen/v1";
const OPENCODE_API_KEY = process.env.OPENCODE_API_KEY || "";
const OPENCODE_MODEL = process.env.OPENCODE_MODEL || "mimo-v2.5-free";

type ChatMessage = { role: string; content: string };

async function callProvider(
  provider: "openrouter" | "opencode",
  messages: ChatMessage[]
): Promise<string> {
  if (provider === "openrouter" && AI_API_KEY) {
    const res = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "OpenRouter request failed");
    return data.choices?.[0]?.message?.content || "No response generated.";
  }

  if (provider === "opencode" && OPENCODE_API_KEY) {
    const res = await fetch(`${OPENCODE_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENCODE_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENCODE_MODEL,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "OpenCode request failed");
    return data.choices?.[0]?.message?.content || "No response generated.";
  }

  throw new Error("AI provider unavailable. Please check AI Settings.");
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const systemMessage: ChatMessage = {
      role: "system",
      content:
        "You are Vision 360 AI, a helpful marketing automation assistant. " +
        "Answer questions about marketing strategy, campaign management, SEO, " +
        "social media, email marketing, lead generation, and business automation. " +
        "Be concise, professional, and actionable.",
    };

    const fullMessages = [systemMessage, ...messages];

    // Try OpenRouter first, fall back to OpenCode
    let content: string;
    try {
      content = await callProvider("openrouter", fullMessages);
    } catch {
      content = await callProvider("opencode", fullMessages);
    }

    // Log to ai_usage_logs
    try {
      const { pb } = await import("@/lib/pocketbase");
      await pb.collection("ai_usage_logs").create({
        model: AI_MODEL,
        tokens: content.length,
        latency_ms: 0,
        success: true,
        cost: 0,
      });
    } catch {
      // Non-critical — don't fail the request
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("[AI Chat Error]", error);
    return NextResponse.json(
      { error: error?.message || "AI provider unavailable. Please check AI Settings." },
      { status: 500 }
    );
  }
}
