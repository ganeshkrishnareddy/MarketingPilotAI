import { NextResponse } from "next/server";

/**
 * POST /api/voice/stt
 * Body: raw audio bytes (audio/webm from MediaRecorder, or wav/mp3)
 * Header: Content-Type = actual audio mime
 * Returns: { transcript: string, confidence: number, is_final: boolean }
 */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "audio/webm";
    const audio = Buffer.from(await req.arrayBuffer());

    if (!audio.length) {
      return NextResponse.json({ error: "No audio received." }, { status: 400 });
    }

    // Normalize webm/opus from MediaRecorder into a mime Deepgram accepts.
    let mime = contentType.split(";")[0].trim();
    if (mime === "audio/webm") mime = "audio/webm;codecs=opus";

    const dgRes = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&punctuate=true&language=en",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY || ""}`,
          "Content-Type": mime,
        },
        body: audio,
      }
    );

    if (!dgRes.ok) {
      const errText = await dgRes.text();
      console.error("[Voice STT] Deepgram error:", dgRes.status, errText);
      return NextResponse.json(
        { error: `Deepgram STT failed: ${errText}` },
        { status: dgRes.status }
      );
    }

    const data = await dgRes.json();
    const result = data?.results?.channels?.[0]?.alternatives?.[0];
    const transcript: string = (result?.transcript || "").trim();

    return NextResponse.json({
      transcript,
      confidence: result?.confidence ?? 0,
      is_final: data?.is_final ?? true,
    });
  } catch (error) {
    console.error("[Voice STT Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
