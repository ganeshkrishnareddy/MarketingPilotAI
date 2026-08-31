import { NextResponse } from "next/server";

/**
 * POST /api/voice/outbound
 * Body: { phoneNumber: string, campaign?: string, carrier?: "vobiz" | "dograh" }
 * Primary carrier: Vobiz (real PSTN call). Falls back to the Dograh orchestrator if requested.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber, campaign, carrier = "vobiz", answerMode, lang = "en" } = body;
    const agentLang = ["en", "hi", "te", "ta", "kn", "bn", "mr", "ml", "gu", "pa", "or"].includes(lang)
      ? lang
      : "en";

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    // ---- Vobiz primary carrier: fire a real PSTN call ----
    if (carrier === "vobiz") {
      const authId = process.env.VOBIZ_AUTH_ID;
      const authToken = process.env.VOBIZ_AUTH_TOKEN;
      let fromNumber = process.env.VOBIZ_FROM_NUMBER;

      if (!authId || !authToken) {
        return NextResponse.json(
          { error: "VOBIZ_AUTH_ID / VOBIZ_AUTH_TOKEN are not configured." },
          { status: 500 }
        );
      }

      // Auto-detect the account's caller ID when not explicitly configured.
      if (!fromNumber) {
        try {
          const numsRes = await fetch(
            `https://api.vobiz.ai/api/v1/Account/${authId}/numbers`,
            { headers: { "X-Auth-ID": authId, "X-Auth-Token": authToken } }
          );
          const nums = await numsRes.json();
          fromNumber = (nums.items || []).find(
            (n: { status?: string; voice_enabled?: boolean; capabilities?: { voice?: boolean }; e164?: string }) =>
              n.status === "active" && n.voice_enabled !== false && n.capabilities?.voice !== false && n.e164
          )?.e164;
        } catch (e) {
          console.error("[Voice AI] Failed to list Vobiz numbers:", e);
        }
      }

      if (!fromNumber) {
        return NextResponse.json(
          {
            error:
              "No Vobiz caller ID available. Set VOBIZ_FROM_NUMBER in .env.local (E.164, e.g. +919876543210) or purchase a number in the Vobiz console.",
          },
          { status: 500 }
        );
      }

      // Public base URL used in callback webhooks (answer_url). For production set
      // PUBLIC_APP_URL (e.g. https://app.yourdomain.com); locally Vobiz cannot reach
      // localhost, so real calls need a tunnel or the deployed URL.
      const origin =
        process.env.PUBLIC_APP_URL || req.headers.get("origin") || req.headers.get("x-forwarded-host") || "http://localhost:3000";

      const vobizRes = await fetch(
        `https://api.vobiz.ai/api/v1/Account/${authId}/Call/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-ID": authId,
            "X-Auth-Token": authToken,
          },
          body: JSON.stringify({
            from: fromNumber,
            to: phoneNumber,
            answer_url: `${origin}/api/voice/vobiz-answer?lang=${agentLang}${answerMode === "play" ? "&mode=play" : ""}`,
            answer_method: "POST",
            caller_name: "Vision 360 AI",
            time_limit: 600,
            machine_detection: "false",
          }),
        }
      );

      const vobizData = await vobizRes.json().catch(async () => ({ raw: await vobizRes.text() }));

      if (!vobizRes.ok) {
        console.error("[Voice AI] Vobiz rejected the call:", vobizRes.status, vobizData);
        const rawErr = JSON.stringify(vobizData);
        let friendly =
          "Vobiz rejected the request: " + rawErr;
        if (/answer_url/i.test(rawErr)) {
          friendly =
            "Vobiz needs a publicly reachable answer_url. Set PUBLIC_APP_URL in .env.local to your deployed app URL or a tunnel (e.g. https://your-app.ngrok.app) so the greeting webhook is reachable.";
        } else if (vobizRes.status === 401) {
          friendly = "Vobiz authentication failed — check VOBIZ_AUTH_ID / VOBIZ_AUTH_TOKEN.";
        } else if (vobizRes.status === 402) {
          friendly = "Vobiz account balance is too low to place the call — top up in the Vobiz console.";
        }
        return NextResponse.json({ error: friendly }, { status: vobizRes.status });
      }

      console.log(
        `[Voice AI] Vobiz call fired to ${phoneNumber} for campaign: ${campaign || "default"} (${vobizData?.request_uuid || "n/a"})`
      );

      const isLocalUrl = origin.includes("localhost") || origin.startsWith("127.");
      return NextResponse.json({
        success: true,
        carrier: "vobiz",
        message: isLocalUrl
          ? "Call fired on Vobiz. ⚠️ answer_url points at localhost — set PUBLIC_APP_URL in .env.local to your public URL (or a tunnel) so the greeting webhook is reachable."
          : "Call fired on Vobiz — the caller will receive the call shortly.",
        target: phoneNumber,
        from: fromNumber,
        request_uuid: vobizData?.request_uuid || null,
      });
    }

    // ---- Dograh orchestrator (fallback / legacy) ----
    const dograhRes = await fetch(
      "https://168-144-154-134.sslip.io/api/v1/public/agent/test/973c4260-bcac-4df6-9c28-9ff97318a8e2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.DOGRAH_API_KEY || "",
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      }
    );

    if (!dograhRes.ok) {
      const errorText = await dograhRes.text();
      console.error("[Voice AI Error] Dograh responded with:", errorText);
      return NextResponse.json(
        { error: `Dograh rejected the request: ${errorText}` },
        { status: dograhRes.status }
      );
    }

    console.log(
      `[Voice AI] Successfully dispatched outbound call to ${phoneNumber} for campaign: ${campaign}`
    );

    return NextResponse.json({
      success: true,
      carrier: "dograh",
      message: "Call dispatched to Dograh orchestrator successfully.",
      target: phoneNumber,
    });
  } catch (error) {
    console.error("[Voice AI Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
