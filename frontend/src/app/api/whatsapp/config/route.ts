import { NextRequest, NextResponse } from "next/server";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090";
const PB_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || "";
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "";

async function getPbAuth(): Promise<string> {
  try {
    const res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: PB_ADMIN_EMAIL,
        password: PB_ADMIN_PASSWORD,
      }),
    });
    const data = await res.json();
    return data?.token || "";
  } catch {
    return "";
  }
}

// GET - Fetch WhatsApp chatbot configuration
export async function GET(req: NextRequest) {
  try {
    const pbToken = await getPbAuth();
    if (!pbToken) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const res = await fetch(`${PB_URL}/api/collections/whatsapp_config/records?limit=1`, {
      headers: { Authorization: `Bearer ${pbToken}` },
    });
    const data = await res.json();
    const config = data.items?.[0] || null;

    return NextResponse.json({
      config: config || {
        welcome_message: "Hello! 👋 Welcome to V360 AI Agency. How can I help you today?",
        business_hours: "Mon-Fri 9:00 AM - 6:00 PM IST",
        fallback_message: "I'm sorry, I didn't understand that. Can you rephrase? You can also type 'agent' to speak with a human.",
        handoff_keywords: "agent, human, person, speak to someone",
        auto_reply_enabled: true,
        language: "auto",
      },
      meta_configured: Boolean(process.env.META_ACCESS_TOKEN && process.env.META_PHONE_NUMBER_ID),
      webhook_url: `${req.nextUrl.origin}/api/webhooks/whatsapp`,
      verify_token: process.env.META_VERIFY_TOKEN || "vision360_secure_token",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Save WhatsApp chatbot configuration
export async function POST(req: NextRequest) {
  try {
    const pbToken = await getPbAuth();
    if (!pbToken) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const body = await req.json();

    // Check if config exists
    const existing = await fetch(`${PB_URL}/api/collections/whatsapp_config/records?limit=1`, {
      headers: { Authorization: `Bearer ${pbToken}` },
    });
    const existingData = await existing.json();
    const existingConfig = existingData.items?.[0];

    let result;
    if (existingConfig) {
      // Update
      const res = await fetch(`${PB_URL}/api/collections/whatsapp_config/records/${existingConfig.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${pbToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      result = await res.json();
    } else {
      // Create
      const res = await fetch(`${PB_URL}/api/collections/whatsapp_config/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pbToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      result = await res.json();
    }

    return NextResponse.json({ success: true, config: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
