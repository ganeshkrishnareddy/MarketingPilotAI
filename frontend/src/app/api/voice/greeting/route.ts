import { NextResponse } from "next/server";
import { downsampleWav24kTo8k, AGENT_LANGS } from "@/lib/voice/multilingual";

const GREETINGS: Record<string, string> = {
  en: "[neutral] Hello! This is Vision 360 AI calling from your partner business. I am your AI voice agent. How can I help you today?",
  hi: "[neutral] नमस्ते! यह विज़न 360 एआई आपके पार्टनर बिज़नेस से बोल रहा है। मैं आपका एआई वॉइस एजेंट हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
  te: "[neutral] నమస్తే! ఇది విజన్ 360 ఎఐ మీ భాగస్వామి వ్యాపారం నుండి మాట్లాడుతోంది. నేను మీ AI వాయిస్ ఏజెంట్ ని. నేను మీకు ఎలా సహాయం చేయగలను?",
  ta: "[neutral] வணக்கம்! இது விஷன் 360 ஏஐ உங்கள் பார்ட்னர் வணிகத்திலிருந்து பேசுகிறது. நான் உங்கள் AI குரல் முகவர். நான் உங்களுக்கு எப்படி உதவ முடியும்?",
  kn: "[neutral] ನಮಸ್ಕಾರ! ಇದು ವಿಷನ್ 360 AI ನಿಮ್ಮ ಪಾಲುದಾರ ವ್ಯಾಪಾರದಿಂದ ಮಾತನಾಡುತ್ತಿದೆ. ನಾನು ನಿಮ್ಮ AI ಧ್ವನಿ ಏಜೆಂಟ್. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
  bn: "[neutral] নমস্কার! এটি ভিশন ৩৬০ এআই আপনার পার্টনার ব্যবসা থেকে কথা বলছে। আমি আপনার AI ভয়েস এজেন্ট। আমি কীভাবে আপনাকে সাহায্য করতে পারি?",
  mr: "[neutral] नमस्कार! हे विजन ३६० एआय तुमच्या पार्टनर व्यवसायातून बोलत आहे. मी तुमचा AI व्हॉइस एजंट आहे. मी तुम्हाला कशी मदत करू शकतो?",
  ml: "[neutral] നമസ്കാരം! ഇത് വിഷൻ 360 AI നിങ്ങളുടെ പങ്കാളി ബിസിനസിൽ നിന്ന് സംസാരിക്കുന്നു. ഞാൻ നിങ്ങളുടെ AI വോയ്സ് ഏജന്റാണ്. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?",
  gu: "[neutral] નમસ્તે! આ વિઝન 360 AI તમારા પાર્ટનર બિઝનેસ તરફથી બોલે છે. હું તમારો AI વૉઇસ એજન્ટ છું. હું તમને કેવી રીતે મદદ કરી શકું?",
  pa: "[neutral] ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਇਹ ਵਿਜ਼ਨ 360 AI ਤੁਹਾਡੇ ਪਾਰਟਨਰ ਕਾਰੋਬਾਰ ਵੱਲੋਂ ਬੋਲ ਰਿਹਾ ਹੈ। ਮੈਂ ਤੁਹਾਡਾ AI ਵੌਇਸ ਏਜੰਟ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
  or: "[neutral] ନମସ୍କାର! ଏହା ଭିଜନ୍ 360 AI ଆପଣଙ୍କ ପାର୍ଟନର ବ୍ୟବସାୟରୁ କହୁଛି। ମୁଁ ଆପଣଙ୍କର AI ଭଏସ୍ ଏଜେଣ୍ଟ। ମୁଁ ଆପଣଙ୍କୁ କେମିତି ସାହାଯ୍ୟ କରିପାରିବି?",
};

const cache = new Map<string, Buffer>();
const inFlight = new Map<string, Promise<Buffer>>();

async function synthesize(lang: string, text: string): Promise<Buffer> {
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
  const wav24k = Buffer.from(await rumikRes.arrayBuffer());
  return downsampleWav24kTo8k(wav24k);
}

async function getGreeting(lang: string): Promise<Buffer> {
  const key = AGENT_LANGS.some((l) => l.code === lang) ? lang : "en";
  const cached = cache.get(key);
  if (cached) return cached;
  if (!inFlight.has(key)) {
    const p = synthesize(key, GREETINGS[key]).then((wav) => {
      cache.set(key, wav);
      return wav;
    });
    inFlight.set(key, p);
    try {
      return await p;
    } finally {
      inFlight.delete(key);
    }
  }
  return inFlight.get(key)!;
}

/**
 * GET /api/voice/greeting?lang=en|hi|te|...
 * Returns the agent greeting as an 8 kHz mono WAV in the requested language.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") || "en";
  try {
    const wav = await getGreeting(lang);
    const body = new Uint8Array(wav);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[Voice Greeting Error]", error);
    return NextResponse.json({ error: "Could not generate greeting." }, { status: 500 });
  }
}
