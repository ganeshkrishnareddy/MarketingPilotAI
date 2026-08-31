import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

function buildTemporaryPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "";
  for (let i = 0; i < 10; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim();
    const name = String(body.name || "").trim();
    const role = String(body.role || "Member");
    const defaultPassword = String(body.defaultPassword || buildTemporaryPassword());
    const accountId = String(body.accountId || `MP-${Math.floor(1000 + Math.random() * 9000)}`);

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const subject = `Your MarketingPilot AI account is ready`;
    const text = [
      `Hi ${name || "there"},`,
      "",
      `Your account has been created for MarketingPilot AI.`,
      `Account ID: ${accountId}`,
      `Role: ${role}`,
      `Default password: ${defaultPassword}`,
      "",
      "Please sign in and change your password after first login.",
    ].join("\n");

    const html = text.replace(/\n/g, "<br />");

    try {
      await sendEmail({ to: email, subject, text, html });
      return NextResponse.json({
        ok: true,
        sent: true,
        accountId,
        defaultPassword,
      });
    } catch (error) {
      return NextResponse.json({
        ok: true,
        sent: false,
        preview: {
          to: email,
          subject,
          text,
        },
        accountId,
        defaultPassword,
        warning: error instanceof Error ? error.message : "SMTP is not configured.",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create invite." },
      { status: 500 }
    );
  }
}
