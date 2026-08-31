import { NextResponse } from "next/server";

/**
 * POST /api/voice/tts
 * Body: { text: string, voice?: "rumik-mulberry" | "rumik-muga" | "deepgram-aura", speaker?: string, description?: string }
 * Returns the synthesized audio (WAV).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text: string = (body.text || "").toString().trim();
    if (!text) {
      return NextResponse.json({ error: "Text is required." }, { status: 400 });
    }

    const voice: string = body.voice || "rumik-mulberry";
    const speaker: string = body.speaker || "siya";
    const description: string =
      body.description ||
      "a warm Indian female voice, smooth timbre, conversational pacing, friendly and professional";

    // ---- Rumik Silk (primary) ----
    if (voice.startsWith("rumik")) {
      const isMuga = voice === "rumik-muga";
      const payload: Record<string, unknown> = {
        model: isMuga ? "muga" : "mulberry",
        text: isMuga ? `[neutral] ${text}` : text,
      };
      if (!isMuga) {
        payload.description = description;
        payload.speaker = speaker;
      }

      const rumikRes = await fetch("https://silk-api.rumik.ai/v1/tts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RUMIK_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!rumikRes.ok) {
        const errText = await rumikRes.text();
        console.error("[Voice TTS] Rumik error:", rumikRes.status, errText);
        return NextResponse.json(
          { error: `Rumik TTS failed: ${errText}` },
          { status: rumikRes.status }
        );
      }

      const audio = Buffer.from(await rumikRes.arrayBuffer());
      return new Response(audio, {
        status: 200,
        headers: {
          "Content-Type": "audio/wav",
          "Content-Length": String(audio.byteLength),
          "Cache-Control": "no-store",
        },
      });
    }

    // ---- Deepgram Aura (secondary) ----
    const dgModel = voice.replace("deepgram-", "");
    const dgRes = await fetch(
      `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(dgModel)}&encoding=linear16&container=wav`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!dgRes.ok) {
      const errText = await dgRes.text();
      console.error("[Voice TTS] Deepgram error:", dgRes.status, errText);
      return NextResponse.json(
        { error: `Deepgram TTS failed: ${errText}` },
        { status: dgRes.status }
      );
    }

    const audio = Buffer.from(await dgRes.arrayBuffer());
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Voice TTS Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
