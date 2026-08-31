import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const MAX_RECIPIENTS = 200;

export async function POST(req: NextRequest) {
  try {
    const { clientId, templateName, params = [] } = await req.json();

    const token = process.env.META_ACCESS_TOKEN;
    const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
    const tpl = templateName || process.env.WHATSAPP_TEMPLATE_NAME;

    if (!token || !phoneNumberId) {
      return NextResponse.json(
        { error: "WhatsApp is not configured. Set META_ACCESS_TOKEN and META_PHONE_NUMBER_ID in .env.local (tokens expire — refresh in Meta dashboard)." },
        { status: 400 }
      );
    }
    if (!tpl) {
      return NextResponse.json({ error: "No WhatsApp template configured" }, { status: 400 });
    }

    // Fetch leads as PocketBase admin
    const pbUrl = process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090";
    const pb = new PocketBase(pbUrl);
    const authRes = await fetch(`${pbUrl}/api/admins/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: process.env.POCKETBASE_ADMIN_EMAIL || "",
        password: process.env.POCKETBASE_ADMIN_PASSWORD || "",
      }),
    });
    const authData = await authRes.json();
    if (!authData.token) throw new Error("PocketBase admin auth failed");
    pb.authStore.save(authData.token);

    const options: any = { sort: "-created", requestKey: null };
    if (clientId) options.filter = `client_id = "${clientId}"`;
    const leads = await pb.collection("leads").getFullList(options).catch(() => []);

    const recipients = leads
      .filter((l: any) => l.phone)
      .slice(0, MAX_RECIPIENTS);

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No leads with a phone number found for this audience" }, { status: 404 });
    }

    let sent = 0;
    const failures: string[] = [];
    for (const lead of recipients) {
      const phone = String(lead.phone).replace(/[^0-9+]/g, "").replace(/^\+/, "");
      const bodyParams = params.map((p: string, i: number) => ({
        type: "text",
        text: i === 0 && p === "{{name}}" ? `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "there" : p,
      }));
      const body: any = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
          name: tpl,
          language: { code: "en_US" },
        },
      };
      if (bodyParams.length > 0) {
        body.template.components = [{ type: "body", parameters: bodyParams }];
      }

      try {
        const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          failures.push(`${phone}: ${data?.error?.message || "Failed"}`);
        } else {
          sent++;
        }
      } catch (e: any) {
        failures.push(`${phone}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: sent,
      totalRecipients: recipients.length,
      template: tpl,
      failures: failures.slice(0, 5),
      note: failures.length > 0 ? "Some sends failed — check template approval status and recipient 24h window rules." : undefined,
    });
  } catch (error: any) {
    console.error("[WhatsApp Broadcast Error]", error);
    return NextResponse.json({ error: error.message || "Failed to send broadcast" }, { status: 500 });
  }
}
