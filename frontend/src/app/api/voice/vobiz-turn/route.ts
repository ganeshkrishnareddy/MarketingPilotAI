import { NextResponse } from "next/server";
import {
  detectLanguage,
  langToAsr,
  langToDescription,
  downsampleWav24kTo8k,
  AGENT_LANGS,
} from "@/lib/voice/multilingual";
import { getCall, setCall, deleteCall, storeReply, cleanupStale, CallState } from "@/lib/voice/callStore";

const SYSTEM_PROMPT =
  "You are Vision 360 AI, an elite AI voice agent for a business automation agency. " +
  "Your goal is to qualify the caller and pitch AI automation services starting at ₹2,000 per month. " +
  "IMPORTANT: Respond in the SAME LANGUAGE the customer speaks — English, Hindi, Telugu, Tamil, Kannada, " +
  "Bengali, Marathi, or any other language they use. Mirror their language exactly. " +
  "Keep every reply short and conversational — at most 2 sentences, spoken style, no markdown, no lists, no emojis. " +
  "If they ask about pricing, emphasize ROI. If they say they are busy, ask for a better time to call back. " +
  "End the conversation politely when the caller says goodbye.";

async function synthTts(text: string, lang: string): Promise<Buffer> {
  const isNative = AGENT_LANGS.some((l) => l.code === lang) && lang !== "en";
  const payload =
    isNative || lang !== "en"
      ? { model: "muga", text: `[neutral] ${text}` }
      : {
          model: "mulberry",
          text,
          speaker: "siya",
          description: langToDescription(lang),
        };
  const rumikRes = await fetch("https://silk-api.rumik.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RUMIK_API_KEY || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!rumikRes.ok) {
    const err = await rumikRes.text();
    throw new Error(`Rumik TTS failed (${rumikRes.status}): ${err}`);
  }
  const wav24k = Buffer.from(await rumikRes.arrayBuffer());
  return downsampleWav24kTo8k(wav24k);
}

/**
 * POST /api/voice/vobiz-turn
 * Called by Vobiz <Gather> with the caller's transcribed speech (form-encoded):
 *   Speech, Digits, CallUUID, From, To, Direction, ...
 * Returns the next <Gather> that plays our synthesized reply and listens again.
 */
export async function POST(req: Request) {
  cleanupStale();
  const base = process.env.PUBLIC_APP_URL || "http://localhost:3000";
  const params = await req.formData().catch(() => null);
  const speech = ((params?.get("Speech") as string) || "").trim();
  const digits = ((params?.get("Digits") as string) || "").trim();
  const callUuid = ((params?.get("CallUUID") as string) || "").trim();
  const inputType = ((params?.get("InputType") as string) || "").trim();
  const from = ((params?.get("From") as string) || "").trim();

  // Language override from the call setup (e.g. ?lang=te in the answer URL).
  const answerUrl = req.headers.get("referer") || "";
  const setupLang = new URLSearchParams(answerUrl.split("?")[1] || "").get("lang") || "en";

  if (!callUuid) {
    // Can't track state without a call UUID — return a plain greeting.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Play>${base}/api/voice/greeting?lang=${setupLang}</Play>
<Hangup/>
</Response>`;
    return new NextResponse(xml, { status: 200, headers: { "Content-Type": "application/xml" } });
  }

  const state: CallState = getCall(callUuid) || {
    history: [],
    lang: setupLang,
    retries: 0,
    lastUsed: Date.now(),
  };
  setCall(callUuid, state);
  state.lastUsed = Date.now();

  // No speech detected — retry or end politely.
  if (!speech && !digits) {
    state.retries += 1;
    if (state.retries >= 2) {
      deleteCall(callUuid);
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Play>${base}/api/voice/reply-audio/${callUuid}/goodbye?lang=${state.lang}</Play>
<Hangup/>
</Response>`;
      return new NextResponse(xml, { status: 200, headers: { "Content-Type": "application/xml" } });
    }
    // Ask again with a retry prompt in the caller's language.
    const retryText =
      state.lang === "en"
        ? "Sorry, I didn't catch that. How can I help you today?"
        : "Sorry, I did not catch that. Please tell me how I can help you.";
    storeReply(`${callUuid}:retry`, await synthTts(retryText, state.lang).catch(() => Buffer.alloc(0)));
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Gather action="${base}/api/voice/vobiz-turn" method="POST" inputType="speech" language="${langToAsr(
      state.lang
    )}" executionTimeout="12" speechEndTimeout="auto" speechModel="phone_call">
<Play>${base}/api/voice/reply-audio/${callUuid}/retry</Play>
</Gather>
<Hangup/>
</Response>`;
    return new NextResponse(xml, { status: 200, headers: { "Content-Type": "application/xml" } });
  }

  const userMessage = speech || (digits ? `Pressed ${digits}` : "");
  state.retries = 0;

  // Detect the caller's language from the transcript script.
  const detected = detectLanguage(userMessage);
  state.lang = detected;

  state.history.push({ role: "user", content: userMessage });
  console.log(`[Voice Turn] ${callUuid} (${state.lang}): ${userMessage}`);

  // Groq brain.
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...state.history],
      temperature: 0.6,
      max_tokens: 400,
      stream: false,
    }),
  });

  let reply = "Sorry, I couldn't process that. Could you say it again?";
  if (groqRes.ok) {
    const data = await groqRes.json();
    reply = (data?.choices?.[0]?.message?.content || reply).trim();
  } else {
    console.error("[Voice Turn] Groq error:", groqRes.status, await groqRes.text());
  }

  state.history.push({ role: "assistant", content: reply });
  state.lastUsed = Date.now();

  // Synthesize the reply in the caller's language and cache the 8 kHz WAV.
  try {
    const wav = await synthTts(reply, state.lang);
    storeReply(callUuid, wav);
  } catch (err) {
    console.error("[Voice Turn] TTS error:", err);
    storeReply(callUuid, Buffer.alloc(0));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Gather action="${base}/api/voice/vobiz-turn" method="POST" inputType="speech" language="${langToAsr(
    state.lang
  )}" executionTimeout="12" speechEndTimeout="auto" speechModel="phone_call">
<Play>${base}/api/voice/reply-audio/${callUuid}</Play>
</Gather>
<Redirect>${base}/api/voice/vobiz-end?lang=${state.lang}</Redirect>
</Response>`;

  return new NextResponse(xml, { status: 200, headers: { "Content-Type": "application/xml" } });
}
