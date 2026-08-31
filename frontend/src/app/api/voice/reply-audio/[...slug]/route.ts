import { NextResponse } from "next/server";
import { getReply, storeReply } from "@/lib/voice/callStore";
import { downsampleWav24kTo8k } from "@/lib/voice/multilingual";

/**
 * GET /api/voice/reply-audio/{callUuid}         → the latest AI reply
 * GET /api/voice/reply-audio/{callUuid}/retry   → retry prompt
 * GET /api/voice/reply-audio/{callUuid}/goodbye → goodbye clip
 *
 * Audio is synthesized by the turn handler and cached for the call's duration;
 * retry/goodbye clips are generated lazily here if missing.
 */

const lazyCache = new Map<string, Promise<Buffer>>();

const GOODBYES: Record<string, string> = {
  en: "[neutral] Thank you for your time. Goodbye!",
  hi: "[neutral] आपके समय के लिए धन्यवाद। नमस्ते!",
  te: "[neutral] మీ సమయానికి ధన్యవాదాలు. వీడ్కోలు!",
  ta: "[neutral] உங்கள் நேரத்திற்கு நன்றி. வணக்கம்!",
};
const RETRIES: Record<string, string> = {
  en: "[neutral] Sorry, I didn't catch that. How can I help you today?",
  hi: "[neutral] क्षमा करें, मैं समझ नहीं पाया। मैं आपकी कैसे मदद कर सकता हूँ?",
  te: "[neutral] క్షమించండి, నేను అర్థం చేసుకోలేకపోయాను. నేను మీకు ఎలా సహాయం చేయగలను?",
  ta: "[neutral] மன்னிக்கவும், எனக்கு புரியவில்லை. நான் உங்களுக்கு எப்படி உதவ முடியும்?",
};

async function synth(text: string): Promise<Buffer> {
  const rumikRes = await fetch("https://silk-api.rumik.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RUMIK_API_KEY || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "muga", text }),
  });
  if (!rumikRes.ok) {
    const err = await rumikRes.text();
    throw new Error(`Rumik TTS failed (${rumikRes.status}): ${err}`);
  }
  return downsampleWav24kTo8k(Buffer.from(await rumikRes.arrayBuffer()));
}

async function getLazy(key: string, text: string): Promise<Buffer> {
  if (!lazyCache.has(key)) {
    const p = synth(text).then((wav) => {
      storeReply(key, wav);
      return wav;
    });
    lazyCache.set(key, p);
  }
  return lazyCache.get(key)!;
}

export async function GET(req: Request, ctx: { params: Promise<{ slug: string[] }> }) {
  try {
    const { slug } = await ctx.params;
    const [callUuid, variant] = slug;
    if (!callUuid) {
      return NextResponse.json({ error: "Missing call uuid." }, { status: 400 });
    }

    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "en";

    let wav: Buffer | undefined;
    if (variant === "retry") {
      wav = getReply(`${callUuid}:retry`) || (await getLazy(`${callUuid}:retry`, RETRIES[lang] || RETRIES.en));
    } else if (variant === "goodbye") {
      wav = getReply(`${callUuid}:goodbye`) || (await getLazy(`${callUuid}:goodbye`, GOODBYES[lang] || GOODBYES.en));
    } else {
      wav = getReply(callUuid);
    }

    if (!wav) {
      return NextResponse.json({ error: "Reply audio not found." }, { status: 404 });
    }

    const body = new Uint8Array(wav);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(body.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Voice Reply Audio Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
