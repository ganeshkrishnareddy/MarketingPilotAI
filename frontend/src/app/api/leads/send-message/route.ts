import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { getEmailTemplate, renderEmailTemplate, type EmailTemplateKey } from "@/lib/email-templates";

type LeadRow = {
  name: string;
  email: string;
  phone: string;
  business: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const channel = String(body.channel || "Email");
    const subject = String(body.subject || "Marketing update");
    const message = String(body.message || "");
    const templateKey = String(body.templateKey || "login-details") as EmailTemplateKey;
    const leads: LeadRow[] = Array.isArray(body.leads) ? body.leads : [];
    const template = getEmailTemplate(templateKey);

    if (!leads.length) {
      return NextResponse.json({ error: "No leads were provided." }, { status: 400 });
    }

    if (channel === "Email") {
      const recipients = leads.filter((lead) => lead.email);
      if (!recipients.length) {
        return NextResponse.json({ error: "At least one email address is required." }, { status: 400 });
      }

      const sent: string[] = [];

      for (const lead of recipients) {
        const leadName = lead.name || "there";
        const leadBusiness = lead.business || "your business";
        const templateValues = {
          "{{first_name}}": leadName,
          "{{name}}": leadName,
          "{{business}}": leadBusiness,
          "{{workspace_name}}": leadBusiness,
          "{{email}}": lead.email || "",
          "{{temporary_password}}": "Use the secure login sent separately",
          "{{dashboard_link}}": "https://app.marketingpilot.ai/dashboard",
          "{{login_url}}": "https://app.marketingpilot.ai/login",
          "{{password}}": "Use the secure login sent separately",
          "{{trial_days}}": "7",
          "{{report}}": "Weekly Business Summary",
          "{{score}}": "92/100",
          "{{issues}}": "3 critical, 7 medium",
          "{{lead}}": leadName,
          "{{company}}": leadBusiness,
          "{{leads}}": "24",
          "{{campaigns}}": "6",
          "{{revenue}}": "₹5,40,000",
          "{{tasks}}": "18",
        };
        const bodyText = renderEmailTemplate(
          message.trim() || template.body,
          templateValues
        )
        .trim();

        const plainText = [
          `Hi ${leadName},`,
          "",
          bodyText,
          "",
          lead.phone ? `Phone: ${lead.phone}` : "",
          "",
          "Best regards,",
          "MarketingPilot AI",
        ].filter(Boolean).join("\n");

        const html = `
          <div style="background:#111318;padding:32px;font-family:Inter,Arial,sans-serif;color:#e5e7eb">
            <div style="max-width:640px;margin:0 auto;background:#17181d;border:1px solid #2a2f3a;border-radius:16px;overflow:hidden">
              <div style="padding:24px 28px;background:linear-gradient(135deg,#6d5efc,#8b5cf6);color:#fff">
                <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.9">MarketingPilot AI</div>
                <div style="font-size:22px;font-weight:700;margin-top:6px">Personalized message for ${leadName}</div>
              </div>
              <div style="padding:28px">
                <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7">Hi ${leadName},</p>
                <div style="font-size:15px;line-height:1.8;color:#d1d5db;white-space:pre-wrap">${bodyText.replace(/\n/g, "<br />")}</div>
                ${lead.phone ? `<p style="margin:20px 0 0 0;font-size:14px;color:#9ca3af">Phone: ${lead.phone}</p>` : ""}
                <p style="margin:24px 0 0 0;font-size:14px;color:#9ca3af">Regards,<br />MarketingPilot AI</p>
              </div>
            </div>
          </div>
        `;

        await sendEmail({
          to: lead.email,
          subject: `${subject || template.subject} - ${leadName}`,
          text: plainText,
          html,
        });
        sent.push(lead.email);
      }

      return NextResponse.json({
        ok: true,
        channel,
        sentCount: sent.length,
      });
    }

    return NextResponse.json({
      ok: true,
      channel,
      sentCount: leads.filter((lead) => lead.phone).length,
      note: "WhatsApp is queued as a preview because the live WhatsApp API connector is not yet wired.",
      preview: {
        subject,
        message,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send message." },
      { status: 500 }
    );
  }
}
