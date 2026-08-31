import { NextResponse } from "next/server";

/**
 * GET /api/voice/providers?full=1
 * Returns live connectivity status for each voice provider. Cheap auth-only checks
 * by default; pass full=1 to also synthesize a tiny Rumik clip.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const full = url.searchParams.get("full") === "1";

  const out: Record<string, { status: string; detail?: string }> = {};

  // Deepgram
  try {
    const r = await fetch("https://api.deepgram.com/v1/projects", {
      headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY || ""}` },
    });
    out.deepgram = r.ok
      ? { status: "connected", detail: "Deepgram STT & TTS" }
      : { status: "error", detail: `HTTP ${r.status}` };
  } catch (e) {
    out.deepgram = { status: "error", detail: (e as Error).message };
  }

  // Groq
  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY || ""}` },
    });
    out.groq = r.ok
      ? { status: "connected", detail: "Groq Llama 3.3 70B" }
      : { status: "error", detail: `HTTP ${r.status}` };
  } catch (e) {
    out.groq = { status: "error", detail: (e as Error).message };
  }

  // Vobiz — list the account's numbers; also proves auth (bad creds → 401).
  try {
    const numsRes = await fetch(
      `https://api.vobiz.ai/api/v1/Account/${process.env.VOBIZ_AUTH_ID || ""}/numbers`,
      {
        headers: {
          "X-Auth-ID": process.env.VOBIZ_AUTH_ID || "",
          "X-Auth-Token": process.env.VOBIZ_AUTH_TOKEN || "",
        },
      }
    );
    const nums = await numsRes.json().catch(() => ({}));
    const caller = (nums.items || []).find(
      (n: { status?: string; voice_enabled?: boolean; e164?: string }) =>
        n.status === "active" && n.voice_enabled !== false && n.e164
    );
    out.vobiz = numsRes.ok
      ? caller
        ? { status: "connected", detail: `PSTN carrier · Caller ID ${caller.e164}` }
        : { status: "configured", detail: "Auth OK, but no active number — buy one in the Vobiz console" }
      : { status: "error", detail: `HTTP ${numsRes.status}` };
  } catch (e) {
    out.vobiz = { status: "error", detail: (e as Error).message };
  }

  // Rumik — auth check only (synth is metered); full test on demand.
  const hasRumikKey = Boolean(process.env.RUMIK_API_KEY);
  out.rumik = hasRumikKey
    ? full
      ? await (async () => {
          try {
            const r = await fetch("https://silk-api.rumik.ai/v1/tts", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${process.env.RUMIK_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ model: "muga", text: "[neutral] Hi" }),
            });
            const buf = await r.arrayBuffer();
            return r.ok && buf.byteLength > 100
              ? { status: "connected", detail: "Rumik Silk TTS" }
              : { status: "error", detail: `HTTP ${r.status}` };
          } catch (e) {
            return { status: "error", detail: (e as Error).message };
          }
        })()
      : { status: "configured", detail: "Key stored (synth test on demand)" }
    : { status: "missing", detail: "RUMIK_API_KEY not set" };

  return NextResponse.json({ providers: out });
}
