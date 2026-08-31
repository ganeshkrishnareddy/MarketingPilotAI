import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { sendEmail } from "@/lib/email";

const MAX_RECIPIENTS = 100;

function personalize(template: string, lead: any) {
  const first = lead.first_name || lead.name?.split(" ")[0] || "there";
  const full = lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : lead.name || first;
  return template
    .replaceAll("{{first_name}}", first)
    .replaceAll("{{name}}", full)
    .replaceAll("{{company}}", lead.company || "")
    .replaceAll("{{business}}", lead.company || "your business")
    .replaceAll("{{email}}", lead.email || "");
}

export async function POST(req: NextRequest) {
  try {
    const { subject, html, audience = "all", clientId } = await req.json();

    if (!subject || !html) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 });
    }

    // Fetch recipient leads as PocketBase admin so scoping rules don't block the server
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
    if (!authData.token) {
      throw new Error("PocketBase admin auth failed: " + (authData.message || "no token"));
    }
    pb.authStore.save(authData.token);

    if (audience === "client" && !clientId) {
      return NextResponse.json({ error: "clientId is required when audience is 'client'" }, { status: 400 });
    }

    const options: any = { sort: "-created", requestKey: null };
    if (audience === "client" && clientId) options.filter = `client_id = "${clientId}"`;
    const leads = await pb
      .collection("leads")
      .getFullList(options)
      .catch(() => []);

    const recipients = leads.filter((l: any) => l.email).slice(0, MAX_RECIPIENTS);
    if (recipients.length === 0) {
      return NextResponse.json({ error: "No leads with an email address found for this audience" }, { status: 404 });
    }

    let sent = 0;
    const failures: string[] = [];
    for (const lead of recipients) {
      try {
        await sendEmail({
          to: lead.email,
          subject: personalize(subject, lead),
          html: personalize(html, lead),
        });
        sent++;
      } catch (e: any) {
        failures.push(`${lead.email}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: sent,
      totalRecipients: recipients.length,
      failures: failures.slice(0, 5),
      sender: process.env.EMAIL_FROM || process.env.SMTP_USER,
    });
  } catch (error: any) {
    console.error("[Email Campaign Error]", error);
    return NextResponse.json({ error: error.message || "Failed to send campaign" }, { status: 500 });
  }
}
