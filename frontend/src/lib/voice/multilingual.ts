/**
 * Multilingual voice helpers for the Vision 360 AI voice agent.
 * Supported languages: English, Hindi, Telugu, Tamil, Kannada, Bengali,
 * Marathi, Malayalam, Gujarati, Punjabi, Odia — anything Rumik TTS can speak
 * and Vobiz ASR can (attempt to) transcribe.
 */

export type AgentLang = "en" | "hi" | "te" | "ta" | "kn" | "bn" | "mr" | "ml" | "gu" | "pa" | "or";

export const AGENT_LANGS: { code: AgentLang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi (हिन्दी)", native: "Hindi" },
  { code: "te", label: "Telugu (తెలుగు)", native: "Telugu" },
  { code: "ta", label: "Tamil (தமிழ்)", native: "Tamil" },
  { code: "kn", label: "Kannada (ಕನ್ನಡ)", native: "Kannada" },
  { code: "bn", label: "Bengali (বাংলা)", native: "Bengali" },
  { code: "mr", label: "Marathi (मराठी)", native: "Marathi" },
  { code: "ml", label: "Malayalam (മലയാളം)", native: "Malayalam" },
  { code: "gu", label: "Gujarati (ગુજરાતી)", native: "Gujarati" },
  { code: "pa", label: "Punjabi (ਪੰਜਾਬੀ)", native: "Punjabi" },
  { code: "or", label: "Odia (ଓଡ଼ିଆ)", native: "Odia" },
];

/** Vobiz <Gather> ASR language code. Falls back to en-US for unsupported ones. */
export function langToAsr(lang: string): string {
  const map: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    bn: "bn-IN",
    mr: "mr-IN",
    ml: "ml-IN",
    gu: "gu-IN",
    pa: "pa-IN",
    or: "or-IN",
  };
  return map[lang] || "en-US";
}

/** Natural-language voice description used with Rumik Silk per language. */
export function langToDescription(lang: string): string {
  const name = AGENT_LANGS.find((l) => l.code === lang)?.native || "English";
  return `a warm, friendly Indian female voice speaking fluent ${name}, smooth conversational pacing, clear pronunciation, professional and welcoming`;
}

/** Detect the language of a transcript from its script. Defaults to English. */
export function detectLanguage(text: string): AgentLang {
  if (!text) return "en";
  const ranges: [AgentLang, [number, number]][] = [
    ["te", [0x0c00, 0x0c7f]], // Telugu
    ["ta", [0x0b80, 0x0bff]], // Tamil
    ["kn", [0x0c80, 0x0cff]], // Kannada
    ["ml", [0x0d00, 0x0d7f]], // Malayalam
    ["bn", [0x0980, 0x09ff]], // Bengali
    ["gu", [0x0a80, 0x0aff]], // Gujarati
    ["pa", [0x0a00, 0x0a7f]], // Punjabi
    ["or", [0x0b00, 0x0b7f]], // Odia
    ["hi", [0x0900, 0x097f]], // Devanagari (Hindi, Marathi)
  ];
  for (const [lang, [lo, hi]] of ranges) {
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c >= lo && c <= hi) return lang;
    }
  }
  return "en";
}

/** Convert a 24 kHz mono PCM16 WAV (Rumik output) to a standard 8 kHz RIFF WAV. */
export function downsampleWav24kTo8k(wav24k: Buffer): Buffer {
  const dataStart = 44; // standard RIFF header for Rumik output
  const inSamples = Math.floor((wav24k.length - dataStart) / 2);
  const input = new Int16Array(wav24k.buffer, wav24k.byteOffset + dataStart, inSamples);

  const outCount = Math.floor(inSamples / 3);
  const output = new Int16Array(outCount);
  for (let i = 0; i < outCount; i++) {
    const a = input[i * 3];
    const b = input[i * 3 + 1];
    const c = input[i * 3 + 2];
    output[i] = (a + b + c) / 3;
  }

  return buildWav8k(output);
}

/** Build a standard RIFF WAV header + PCM16 data for 8 kHz mono. */
export function buildWav8k(pcm: Int16Array): Buffer {
  const dataSize = pcm.byteLength;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); // fmt chunk size
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(8000, 24); // sample rate
  buf.writeUInt32LE(16000, 28); // byte rate
  buf.writeUInt16LE(2, 32); // block align
  buf.writeUInt16LE(16, 34); // bits per sample
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength).copy(buf, 44);
  return buf;
}

/** Parse a WAV's sample rate to verify telephony compatibility. */
export function wavSampleRate(wav: Buffer): number {
  return wav.readUInt32LE(24);
}
