import { NextResponse } from "next/server";

/**
 * POST /api/voice/vobiz-end
 * Reached when a <Gather> times out without input and the conversation ends.
 * Plays a goodbye via Vobiz's own TTS (en-US only) and hangs up.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") || "en";
  const params = await req.formData().catch(() => null);
  const from = params?.get("From") || "the caller";

  const goodbye =
    lang === "hi"
      ? "धन्यवाद, नमस्ते!"
      : lang === "te"
      ? "ధన్యవాదాలు, వీడ్కోలు!"
      : lang === "ta"
      ? "நன்றி, வணக்கம்!"
      : "Thank you for your time. Goodbye!";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Speak>${goodbye}</Speak>
<Hangup/>
</Response>`;

  console.log(`[Voice AI] Ending call from ${from} (lang=${lang}).`);
  return new NextResponse(xml, { status: 200, headers: { "Content-Type": "application/xml" } });
}
