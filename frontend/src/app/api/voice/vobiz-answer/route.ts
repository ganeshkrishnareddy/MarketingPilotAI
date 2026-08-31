import { NextResponse } from "next/server";

/**
 * POST /api/voice/vobiz-answer[?lang=en|hi|te|...][&mode=stream|play|gather]
 * First webhook Vobiz hits when a call is answered.
 *
 * mode=stream (default): full-duplex conversational agent via <Stream> — Vobiz
 *   opens a WebSocket to our voice stream server (Deepgram live STT → Groq →
 *   Rumik TTS, with barge-in). The caller hears the multilingual greeting and
 *   can talk back immediately; the agent mirrors their language.
 * mode=play:        plays our own pre-rendered 8kHz greeting audio.
 * mode=gather:      legacy Vobiz <Gather> ASR flow (requires Vobiz ASR add-on).
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") || "en";
  const mode = url.searchParams.get("mode") || "stream";
  const params = await req.formData().catch(() => null);
  const from = params?.get("From") || "the caller";

  const base = process.env.PUBLIC_APP_URL || "http://localhost:3000";
  const streamBase = process.env.VOICE_STREAM_URL || "";
  const supported = ["en", "hi", "te", "ta", "kn", "bn", "mr", "ml", "gu", "pa", "or"];
  const agentLang = supported.includes(lang) ? lang : "en";

  // ---- mode=stream: full-duplex WebSocket conversation ----
  if (mode === "stream" && streamBase) {
    const wsUrl = `${streamBase}/ws?lang=${agentLang}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Record recordSession="true" playBeep="false" callbackUrl="${base}/api/voice/recording-ready" callbackMethod="POST" redirect="false"/>
<Stream bidirectional="true" keepCallAlive="true" contentType="audio/x-l16;rate=16000" maxRetries="3">
${wsUrl}
</Stream>
<Redirect>${base}/api/voice/vobiz-end?lang=${agentLang}</Redirect>
</Response>`;

    console.log(`[Voice AI] Call from ${from} answered — stream conversation started (lang=${agentLang}, ws=${wsUrl}).`);
    return new NextResponse(xml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }

  // ---- mode=play: pre-rendered multilingual greeting audio ----
  if (mode === "play") {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Record recordSession="true" playBeep="false" callbackUrl="${base}/api/voice/recording-ready" callbackMethod="POST" redirect="false"/>
<Play>${base}/api/voice/greeting?lang=${agentLang}</Play>
<Hangup/>
</Response>`;

    console.log(`[Voice AI] Call from ${from} answered — play-mode greeting served (lang=${agentLang}).`);
    return new NextResponse(xml, {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    });
  }

  // ---- legacy gather mode (or stream URL unset): Vobiz ASR loop ----
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Record recordSession="true" playBeep="false" callbackUrl="${base}/api/voice/recording-ready" callbackMethod="POST" redirect="false"/>
<Gather action="${base}/api/voice/vobiz-turn" method="POST" inputType="speech" language="en-US" executionTimeout="20" speechEndTimeout="auto" speechModel="telephony">
<Play>${base}/api/voice/greeting?lang=${agentLang}</Play>
</Gather>
<Redirect>${base}/api/voice/vobiz-end?lang=${agentLang}</Redirect>
</Response>`;

  console.log(`[Voice AI] Call from ${from} answered — gather-mode fallback served (lang=${agentLang}).`);
  return new NextResponse(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });
}
