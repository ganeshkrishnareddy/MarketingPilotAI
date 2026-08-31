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

// GET - Fetch conversations list or specific phone conversation
export async function GET(req: NextRequest) {
  try {
    const pbToken = await getPbAuth();
    if (!pbToken) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    if (phone) {
      // Fetch specific phone conversation
      const res = await fetch(
        `${PB_URL}/api/collections/whatsapp_conversations/records?filter=phone="${phone}"&sort=-timestamp&limit=${limit}`,
        { headers: { Authorization: `Bearer ${pbToken}` } }
      );
      const data = await res.json();
      return NextResponse.json({ conversations: data.items || [] });
    } else {
      // Fetch unique phones (conversation list)
      const res = await fetch(
        `${PB_URL}/api/collections/whatsapp_conversations/records?sort=-timestamp&limit=100`,
        { headers: { Authorization: `Bearer ${pbToken}` } }
      );
      const data = await res.json();
      const records = data.items || [];

      // Group by phone and get latest message
      const phoneMap = new Map<string, any>();
      for (const record of records) {
        if (!phoneMap.has(record.phone)) {
          phoneMap.set(record.phone, {
            phone: record.phone,
            contact_id: record.contact_id,
            lastMessage: record.message,
            lastDirection: record.direction,
            timestamp: record.timestamp,
          });
        }
      }

      return NextResponse.json({ conversations: Array.from(phoneMap.values()) });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
