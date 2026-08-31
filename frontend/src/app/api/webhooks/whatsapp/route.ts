import { NextRequest, NextResponse } from "next/server";
import { AIRouter } from "@/lib/ai/AIRouter";
import { ProviderManager } from "@/lib/ai/ProviderManager";

// Meta API Credentials (from environment)
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || "";
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || "vision360_secure_token";
const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090";

// PocketBase admin credentials
const PB_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL || "";
const PB_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD || "";

// Get PocketBase auth token
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

// Send WhatsApp reply via Meta API
async function sendWhatsAppReply(to: string, message: string) {
  if (!META_ACCESS_TOKEN || !META_PHONE_NUMBER_ID) {
    console.error("[WhatsApp] Missing META_ACCESS_TOKEN or META_PHONE_NUMBER_ID");
    return { error: { message: "Meta credentials not configured" } };
  }

  const response = await fetch(
    `https://graph.facebook.com/v19.0/${META_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        type: "text",
        text: { body: message },
      }),
    }
  );

  return response.json();
}

// Save conversation to PocketBase
async function saveConversation(
  phone: string,
  name: string,
  incomingMessage: string,
  aiResponse: string,
  pbToken: string
) {
  if (!pbToken) return;

  try {
    // Find or create contact
    let contactId = "";
    const existing = await fetch(
      `${PB_URL}/api/collections/contacts/records?filter=phone="${phone}"`,
      { headers: { Authorization: `Bearer ${pbToken}` } }
    );
    const existingData = await existing.json();
    if (existingData.items?.length > 0) {
      contactId = existingData.items[0].id;
    } else {
      // Create new contact
      const createRes = await fetch(`${PB_URL}/api/collections/contacts/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pbToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: name || "WhatsApp User",
          phone: phone,
          source: "whatsapp",
        }),
      });
      const createData = await createRes.json();
      contactId = createData.id || "";
    }

    // Save message to conversation history
    if (contactId) {
      await fetch(`${PB_URL}/api/collections/whatsapp_conversations/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pbToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_id: contactId,
          phone: phone,
          direction: "incoming",
          message: incomingMessage,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});

      await fetch(`${PB_URL}/api/collections/whatsapp_conversations/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pbToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_id: contactId,
          phone: phone,
          direction: "outgoing",
          message: aiResponse,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.error("[WhatsApp] Failed to save conversation:", err);
  }
}

// Get business context from PocketBase
async function getBusinessContext(pbToken: string): Promise<string> {
  if (!pbToken) return "";

  try {
    const res = await fetch(`${PB_URL}/api/collections/businesses/records?limit=1`, {
      headers: { Authorization: `Bearer ${pbToken}` },
    });
    const data = await res.json();
    const biz = data.items?.[0];
    if (!biz) return "";

    return `
BUSINESS INFORMATION:
- Name: ${biz.name || "V360 AI Agency"}
- Industry: ${biz.industry || "Technology"}
- Website: ${biz.website || "N/A"}
- Audience: ${biz.target_audience || "Businesses looking for AI marketing solutions"}
- Products: ${biz.products_services || "AI-powered marketing automation"}
`;
  } catch {
    return "";
  }
}

// Get recent conversation history
async function getConversationHistory(
  phone: string,
  pbToken: string
): Promise<string> {
  if (!pbToken) return "";

  try {
    const res = await fetch(
      `${PB_URL}/api/collections/whatsapp_conversations/records?filter=phone="${phone}"&sort=-timestamp&limit=10`,
      { headers: { Authorization: `Bearer ${pbToken}` } }
    );
    const data = await res.json();
    if (!data.items?.length) return "";

    return data.items
      .reverse()
      .map((m: any) => `${m.direction === "incoming" ? "User" : "Assistant"}: ${m.message}`)
      .join("\n");
  } catch {
    return "";
  }
}

// 1. Webhook Verification (Meta requires this)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  console.log(`[WhatsApp] Verification request: mode=${mode}, token=${token}`);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[WhatsApp] Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error("[WhatsApp] Verification failed: invalid token");
    return NextResponse.json({ error: "Invalid verify token" }, { status: 403 });
  }
}

// 2. Handle Incoming WhatsApp Messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a valid WhatsApp message event
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ error: "Not a WhatsApp event" }, { status: 200 });
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // Only process text messages (ignore status updates)
    if (!message || message.type !== "text") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const phone = message.from;
    const userMessage = message.text.body;
    const userName = value.contacts?.[0]?.profile?.name || "User";

    console.log(`[WhatsApp] Message from ${userName} (${phone}): "${userMessage}"`);

    // Get PocketBase auth
    const pbToken = await getPbAuth();

    // Get business context
    const businessContext = await getBusinessContext(pbToken);

    // Get conversation history
    const history = await getConversationHistory(phone, pbToken);

    // Get AI configuration
    let aiConfig = "";
    try {
      if (pbToken) {
        const configRes = await fetch(`${PB_URL}/api/collections/whatsapp_config/records?limit=1`, {
          headers: { Authorization: `Bearer ${pbToken}` },
        });
        const configData = await configRes.json();
        const config = configData.items?.[0];
        if (config) {
          aiConfig = `
CHATBOT CONFIGURATION:
- Welcome Message: ${config.welcome_message || "Hello! How can I help you today?"}
- Business Hours: ${config.business_hours || "Mon-Fri 9AM-6PM"}
- Fallback Message: ${config.fallback_message || "I'm sorry, I didn't understand that. Can you rephrase?"}
- Human Handoff Keywords: ${config.handoff_keywords || "agent, human, person, speak to someone"}
`;
        }
      }
    } catch {}

    // Check for human handoff request
    const handoffKeywords = ["agent", "human", "person", "talk to someone", "speak to someone", "representative", "真人", "ఏజెంట్"];
    const needsHandoff = handoffKeywords.some((kw) =>
      userMessage.toLowerCase().includes(kw.toLowerCase())
    );

    if (needsHandoff) {
      const handoffMsg = "I understand you'd like to speak with a human agent. Let me connect you with our team. They'll be with you shortly. In the meantime, feel free to leave your question and we'll get back to you as soon as possible.";
      await sendWhatsAppReply(phone, handoffMsg);
      await saveConversation(phone, userName, userMessage, handoffMsg, pbToken);
      return NextResponse.json({ success: true, handoff: true }, { status: 200 });
    }

    // Build system prompt
    const systemPrompt = `You are the AI Assistant for ${businessContext ? "the business listed below" : "V360 AI Agency"}.

Your role:
- Answer customer questions professionally and helpfully
- Provide information about services, pricing, and availability
- Help with bookings, appointments, and inquiries
- Be friendly, concise, and professional
- If you don't know something specific, offer to connect them with a human agent
- Support multiple languages (English, Hindi, Telugu) - reply in the language the customer uses

${businessContext}

${aiConfig}

${history ? `RECENT CONVERSATION:\n${history}\n` : ""}

IMPORTANT:
- Keep responses under 500 characters for WhatsApp
- Use simple formatting (no markdown)
- Be conversational and helpful
- If asked about pricing, provide general information or ask them to contact sales
- Never make up information you don't have`;

    // Get AI response
    let aiResponse = "";

    // Check if AI_API_KEY is configured
    if (!process.env.AI_API_KEY && !process.env.OPENCODE_API_KEY) {
      aiResponse = "Thank you for your message! Our AI assistant is currently being configured. A team member will get back to you shortly.";
    } else {
      try {
        const route = await AIRouter.resolveRoute("Chat").catch(() => null);
        if (route) {
          aiResponse = await ProviderManager.executeTask(
            systemPrompt,
            userMessage,
            route,
            { temperature: 0.7 },
            ""
          );
        }
      } catch (err) {
        console.error("[WhatsApp] AI error:", err);
      }

      if (!aiResponse) {
        aiResponse = "Thank you for your message! I'm having trouble processing right now. Please try again or type 'agent' to speak with a human.";
      }
    }

    // Send reply
    const sendResult = await sendWhatsAppReply(phone, aiResponse);
    console.log(`[WhatsApp] Reply sent to ${phone}: "${aiResponse.substring(0, 100)}..."`);

    // Save conversation
    await saveConversation(phone, userName, userMessage, aiResponse, pbToken);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[WhatsApp Webhook Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 200 }); // Always return 200 to Meta
  }
}
