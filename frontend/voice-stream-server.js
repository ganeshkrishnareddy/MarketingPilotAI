/**
 * Vision 360 AI — Voice Stream Server
 *
 * Full-duplex conversational voice agent for Vobiz calls.
 *
 *   Vobiz <Stream> (bidirectional, L16 inbound)
 *       ↓  media events (base64 L16 PCM)
 *   Deepgram live STT (multilingual, interim + final)
 *       ↓  transcript
 *   Groq Llama (conversation brain, mirrors caller language)
 *       ↓  reply text
 *   Rumik Silk TTS (24kHz raw L16)
 *       ↓  playAudio chunks (+ checkpoint)
 *   Vobiz → caller
 *
 * Barge-in: when the caller speaks during playback, Deepgram interim results
 * trigger a clearAudio so the agent stops talking and listens.
 *
 * Run:  VOICE_STREAM_PORT=3002 node voice-stream-server.js
 * Expose: cloudflared tunnel --url http://localhost:3002
 */

const { WebSocketServer } = require("ws");
const http = require("http");

const PORT = process.env.VOICE_STREAM_PORT || 3002;
const SYSTEM_PROMPT =
  "You are Vision 360 AI, an elite AI voice agent for a business automation agency. " +
  "Your goal is to qualify the caller and pitch AI automation services starting at ₹2,000 per month. " +
  "IMPORTANT: Respond in the SAME LANGUAGE the customer speaks — English, Hindi, Telugu, Tamil, Kannada, " +
  "Bengali, Marathi, or any other language they use. Mirror their language exactly. " +
  "Keep every reply short and conversational — at most 2 sentences, spoken style, no markdown, no lists, no emojis. " +
  "If they ask about pricing, emphasize ROI. If they say they are busy, ask for a better time to call back. " +
  "End the conversation politely when the caller says goodbye.";

const GREETINGS = {
  en: "Hello! This is Vision 360 AI calling from your partner business. I am your AI voice agent. How can I help you today?",
  hi: "नमस्ते! यह विज़न 360 एआई आपके पार्टनर व्यवसाय से कॉल कर रहा है। मैं आपकी एआई वॉयस एजेंट हूँ। मैं आपकी कैसे मदद कर सकती हूँ?",
  te: "నమస్కారం! ఇది విజన్ 360 ఎఐ మీ భాగస్వామి వ్యాపారం నుండి కాల్ చేస్తోంది. నేను మీ ఎఐ వాయిస్ ఏజెంట్ ని. మీకు ఎలా సహాయం చేయగలను?",
  ta: "வணக்கம்! இது விஷன் 360 ஏஐ உங்கள் கூட்டாளர் வணிகத்திலிருந்து அழைக்கிறது. நான் உங்கள் ஏஐ குரல் முகவர். உங்களுக்கு எப்படி உதவ முடியும்?",
  kn: "ನಮಸ್ಕಾರ! ಇದು ವಿಷನ್ 360 ಎಐ ನಿಮ್ಮ ಪಾಲುದಾರ ವ್ಯಾಪಾರದಿಂದ ಕರೆ ಮಾಡುತ್ತಿದೆ. ನಾನು ನಿಮ್ಮ ಎಐ ಧ್ವನಿ ಏಜೆಂಟ್. ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
  bn: "নমস্কার! এটি ভিশন 360 এআই আপনার অংশীদার ব্যবসা থেকে কল করছে। আমি আপনার এআই ভয়েস এজেন্ট। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  mr: "नमस्कार! हे विझन 360 एआय तुमच्या भागीदार व्यवसायातून कॉल करत आहे. मी तुमची एआय व्हॉइस एजंट आहे. मी तुम्हाला कशी मदत करू शकते?",
  ml: "നമസ്ക്കാരം! ഇത് വിഷൻ 360 എഐ നിങ്ങളുടെ പങ്കാളി ബിസിനസിൽ നിന്ന് വിളിക്കുന്നു. ഞാൻ നിങ്ങളുടെ എഐ വോയ്സ് ഏജന്റാണ്. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?",
  gu: "નમસ્તે! આ વિઝન 360 એઆઈ તમારા ભાગીદાર વ્યવસાયમાંથી કૉલ કરી રહ્યું છે. હું તમારી એઆઈ વૉઇસ એજન્ટ છું. હું તમને કેવી રીતે મદદ કરી શકું?",
  pa: "ਨਮਸਤੇ! ਇਹ ਵਿਜ਼ਨ 360 ਏਆਈ ਤੁਹਾਡੇ ਭਾਗੀਦਾਰ ਕਾਰੋਬਾਰ ਤੋਂ ਕਾਲ ਕਰ ਰਿਹਾ ਹੈ। ਮੈਂ ਤੁਹਾਡੀ ਏਆਈ ਵੌਇਸ ਏਜੰਟ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
  or: "ନମସ୍କାର! ଏହା ଭିଜନ୍ 360 ଏଆଇ ଆପଣଙ୍କ ସହଭାଗୀ ବ୍ୟବସାୟରୁ କଲ୍ କରୁଛି। ମୁଁ ଆପଣଙ୍କ ଏଆଇ ଭଏସ୍ ଏଜେଣ୍ଟ। ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
};

function loadEnv() {
  const fs = require("fs");
  const env = {};
  try {
    for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
  return env;
}
const ENV = loadEnv();

/** Deepgram streaming STT socket for one call. */
function openStt(lang, rate, onResult, onError) {
  const language = lang || "multi";
  const url =
    `wss://api.deepgram.com/v1/listen?model=nova-3&smart_format=true&interim_results=true` +
    `&endpointing=250&vad_events=false&encoding=linear16&sample_rate=${rate}&language=${encodeURIComponent(language)}`;
  const ws = new WebSocket(url, {
    headers: { Authorization: `Token ${ENV.DEEPGRAM_API_KEY}` },
  });
  ws.onmessage = (ev) => {
    if (typeof ev.data !== "string") return;
    try {
      const j = JSON.parse(ev.data);
      if (j.type === "Results") onResult(j);
      else if (j.type === "Error") onError(new Error(j.err_msg || "Deepgram error"));
    } catch {}
  };
  ws.onerror = () => onError(new Error("Deepgram connection error"));
  return ws;
}

/** Groq chat completion. */
async function groqReply(history) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
      temperature: 0.6,
      max_tokens: 400,
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return (j.choices?.[0]?.message?.content || "").trim();
}

/** Rumik Silk TTS → 24 kHz raw L16 PCM (strips the WAV header). */
async function rumikPcm(text, lang) {
  const payload =
    lang && lang !== "en"
      ? { model: "muga", text: `[neutral] ${text}` }
      : { model: "mulberry", text, speaker: "siya" };
  const res = await fetch("https://silk-api.rumik.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.RUMIK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Rumik ${res.status}: ${await res.text()}`);
  const wav = Buffer.from(await res.arrayBuffer());
  return wav.subarray(44); // raw mono L16 @ 24 kHz
}

/** Deepgram Aura-2 TTS → 24 kHz raw L16 PCM (multilingual fallback). */
async function deepgramPcm(text) {
  const res = await fetch(
    "https://api.deepgram.com/v1/speak?model=aura-2-thalia-en&encoding=linear16&sample_rate=24000&container=none",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${ENV.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    }
  );
  if (!res.ok) throw new Error(`Deepgram TTS ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer()); // raw mono L16 @ 24 kHz
}

/** TTS with automatic fallback: Rumik (multilingual) → Deepgram Aura. */
async function ttsPcm(text, lang) {
  try {
    return await rumikPcm(text, lang);
  } catch (err) {
    console.log(`[Stream] Rumik unavailable (${err.message.slice(0, 60)}) — using Deepgram Aura`);
    return deepgramPcm(text);
  }
}

/** Per-language greeting audio, synthesized once and cached (in-memory). */
const greetingCache = new Map();
async function getGreetingPcm(lang) {
  const key = GREETINGS[lang] ? lang : "en";
  if (greetingCache.has(key)) return greetingCache.get(key);
  const pcm = await ttsPcm(GREETINGS[key] || GREETINGS.en, key);
  greetingCache.set(key, pcm);
  return pcm;
}

function detectLanguage(text) {
  const ranges = [
    ["te", [0x0c00, 0x0c7f]], ["ta", [0x0b80, 0x0bff]], ["kn", [0x0c80, 0x0cff]],
    ["ml", [0x0d00, 0x0d7f]], ["bn", [0x0980, 0x09ff]], ["gu", [0x0a80, 0x0aff]],
    ["pa", [0x0a00, 0x0a7f]], ["or", [0x0b00, 0x0b7f]], ["hi", [0x0900, 0x097f]],
  ];
  for (const [lang, [lo, hi]] of ranges) {
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c >= lo && c <= hi) return lang;
    }
  }
  return "en";
}

/** Stream raw PCM to the caller in ~40 ms chunks, then checkpoint. */
function playPcm(call, pcm) {
  const chunkBytes = 1920; // 40 ms @ 24 kHz L16 mono
  call.playing = true;
  for (let off = 0; off < pcm.length; off += chunkBytes) {
    const chunk = pcm.subarray(off, Math.min(off + chunkBytes, pcm.length));
    if (chunk.length) {
      call.socket.send(
        JSON.stringify({
          event: "playAudio",
          streamId: call.streamId,
          media: {
            contentType: "audio/x-l16",
            sampleRate: 24000,
            payload: chunk.toString("base64"),
          },
        })
      );
    }
  }
  call.socket.send(
    JSON.stringify({ event: "checkpoint", streamId: call.streamId, name: "reply" })
  );
  // playing stays true until Vobiz confirms playback via playedStream/clearedAudio.
  clearTimeout(call.playSafeTimer);
  call.playSafeTimer = setTimeout(() => {
    call.playing = false;
  }, 60000);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Vision 360 AI voice stream server");
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket, req) => {
  const query = new URL(req.url, "http://localhost").searchParams;
  const call = {
    socket,
    callId: null,
    streamId: null,
    lang: query.get("lang") || "multi",
    history: [],
    stt: null,
    sttOpen: false,
    playing: false,
    processing: false,
    greeted: false,
    lastBarge: 0,
    pendingFinal: null,
    playSafeTimer: null,
  };

  socket.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    const ev = msg.event || msg.type;

    if (ev === "start") {
      call.callId = msg.start?.callId;
      call.streamId = msg.start?.streamId;
      const inboundRate = msg.start?.mediaFormat?.sampleRate || 16000;
      console.log(`[Stream] start ${call.callId} lang=${call.lang} inbound=${inboundRate}Hz`);
      call.stt = openStt(
        call.lang === "multi" ? "multi" : call.lang,
        inboundRate,
        (result) => onSttResult(call, result),
        (err) => console.error("[Stream] STT:", err.message)
      );
      // Opening greeting — caller hears the agent immediately, barge-in enabled.
      playGreeting(call);
    } else if (ev === "media") {
      const payload = msg.media?.payload;
      if (payload && call.stt && call.stt.readyState === WebSocket.OPEN) {
        call.stt.send(Buffer.from(payload, "base64"));
      }
    } else if (ev === "clearedAudio") {
      call.playing = false;
    } else if (ev === "playedStream") {
      call.playing = false;
    }
  });

  socket.on("close", () => {
    try {
      call.stt?.close();
    } catch {}
    clearTimeout(call.playSafeTimer);
    console.log(`[Stream] closed ${call.callId || "?"}`);
  });

  socket.on("error", () => {});
});

async function playGreeting(call) {
  if (call.greeted) return;
  call.greeted = true;
  const lang = GREETINGS[call.lang] ? call.lang : "en";
  try {
    const pcm = await getGreetingPcm(lang);
    console.log(`[Stream] greeting (${lang}, ${pcm.length} bytes${greetingCache.has(lang) ? ", cached" : ""})`);
    playPcm(call, pcm);
  } catch (err) {
    console.error("[Stream] greeting error:", err.message);
  }
}

async function onSttResult(call, result) {
  const alt = result.channel?.alternatives?.[0];
  const text = (alt?.transcript || "").trim();

  // Barge-in: caller speaks while the agent is playing.
  if (!result.is_final && text) {
    const now = Date.now();
    if (call.playing && now - call.lastBarge > 1500) {
      call.lastBarge = now;
      call.playing = false;
      try {
        call.socket.send(
          JSON.stringify({ event: "clearAudio", streamId: call.streamId })
        );
        console.log("[Stream] barge-in — playback cleared");
      } catch {}
    }
    return;
  }

  if (!result.is_final || !text) return;
  if (call.processing) {
    call.pendingFinal = text; // remember latest while busy
    return;
  }

  call.processing = true;
  const detected = detectLanguage(text);
  call.lang = detected;
  call.history.push({ role: "user", content: text });
  console.log(`[Stream] ${call.callId} (${detected}): ${text}`);

  try {
    let reply;
    try {
      reply = await groqReply(call.history);
    } catch (err) {
      console.error("[Stream] Groq error:", err.message);
      reply = "Sorry, I could not process that. Could you repeat, please?";
    }
    if (!reply) reply = "Could you say that again?";
    call.history.push({ role: "assistant", content: reply });
    console.log(`[Stream] reply (${call.lang}): ${reply.slice(0, 120)}`);

    const pcm = await ttsPcm(reply, call.lang);
    playPcm(call, pcm);
    // If the agent is closing the conversation, end the stream after the
    // goodbye plays so the call hangs up instead of idling.
    if (/\b(goodbye|bye|bye-bye)\b|thank you for your time|ధన్యవాదాలు|धन्यवाद|வணக்கம்|ನಮಸ್ಕార|వీడ్కోలు/i.test(reply)) {
      setTimeout(() => {
        try {
          call.socket.send(JSON.stringify({ event: "stop", streamId: call.streamId }));
        } catch {}
      }, 3000);
    }
  } catch (err) {
    console.error("[Stream] turn error:", err.message);
  } finally {
    call.processing = false;
    if (call.pendingFinal) {
      const pending = call.pendingFinal;
      call.pendingFinal = null;
      setTimeout(() => onSttResult(call, { is_final: true, channel: { alternatives: [{ transcript: pending }] } }), 10);
    }
  }
}

server.listen(PORT, () => {
  console.log(`Vision 360 voice stream server listening on ws://localhost:${PORT}/ws`);
});
