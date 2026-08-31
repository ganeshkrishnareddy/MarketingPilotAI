import { NextResponse } from "next/server";

/**
 * POST /api/voice/llm
 * Body: {
 *   system: string,             // agent system prompt
 *   messages: {role, content}[],// conversation history (user/assistant)
 *   model?: string              // groq model id (default llama-3.3-70b-versatile)
 * }
 * Returns: { reply: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const system: string = (body.system || "").toString();
    const history: { role: string; content: string }[] = Array.isArray(body.messages)
      ? body.messages
      : [];
    const model: string = body.model || "llama-3.3-70b-versatile";

    if (!system) {
      return NextResponse.json({ error: "System prompt is required." }, { status: 400 });
    }
    if (!history.length) {
      return NextResponse.json({ error: "No conversation provided." }, { status: 400 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, ...history],
        temperature: 0.6,
        max_tokens: 400,
        stream: false,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("[Voice LLM] Groq error:", groqRes.status, errText);
      return NextResponse.json(
        { error: `Groq LLM failed: ${errText}` },
        { status: groqRes.status }
      );
    }

    const data = await groqRes.json();
    const reply: string = (data?.choices?.[0]?.message?.content || "").trim();

    if (!reply) {
      return NextResponse.json({ error: "Groq returned an empty reply." }, { status: 502 });
    }

    return NextResponse.json({ reply, model: data?.model || model });
  } catch (error) {
    console.error("[Voice LLM Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
