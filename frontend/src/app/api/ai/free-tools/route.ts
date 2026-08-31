import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "https://openrouter.ai/api/v1";
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || process.env.OPENAI_MODEL || "openrouter/free";
const OPENCODE_API_BASE_URL = process.env.OPENCODE_API_BASE_URL || "https://opencode.ai/zen/v1";
const OPENCODE_API_KEY = process.env.OPENCODE_API_KEY;
const OPENCODE_MODEL = process.env.OPENCODE_MODEL || "mimo-v2.5-free";

type ToolRequest = {
  module: string;
  business?: string;
  audience?: string;
  goal?: string;
  channel?: string;
  tone?: string;
  prompt?: string;
  provider?: "auto" | "openrouter" | "opencode";
};

const moduleRecipes: Record<string, string[]> = {
  "content-creation": ["Instagram caption", "LinkedIn post", "Blog outline", "Email subject lines", "CTA variants"],
  "personal-branding": ["Positioning statement", "Founder bio", "Authority topics", "Content angles", "Trust builders"],
  "social-media": ["30-day calendar", "Post ideas", "Hashtag sets", "Engagement prompts", "Reply templates"],
  "google-ads": ["Search keywords", "Ad groups", "Responsive search ads", "Negative keywords", "Landing page notes"],
  website: ["Hero copy", "Page sections", "Conversion issues", "CTA suggestions", "Trust signals"],
  seo: ["Keyword clusters", "Meta titles", "Meta descriptions", "Blog topics", "Internal links"],
  "influencer-marketing": ["Influencer brief", "Outreach DM", "Collaboration terms", "Tracking metrics", "Content rules"],
  "whatsapp-ai": ["Broadcast message", "Qualification questions", "Follow-up flow", "Offer script", "Handoff rules"],
  "instagram-automation": ["DM opener", "Comment reply", "Story reply", "Lead capture flow", "Follow-up sequence"],
  "ai-chatbot": ["Welcome message", "FAQ answers", "Lead questions", "Booking flow", "Escalation rules"],
  "lead-follow-up": ["Lead score", "Follow-up sequence", "Objection replies", "Reminder tasks", "Close prompt"],
  crm: ["Lead fields", "Pipeline stages", "Task list", "Activity summary", "Opportunity score"],
  "appointment-booking": ["Booking script", "Calendar rules", "Reminder messages", "No-show recovery", "Confirmation copy"],
  "email-automation": ["Welcome email", "Nurture sequence", "Promo email", "Reactivation email", "Subject tests"],
  "voice-ai": ["Call opening", "Qualification script", "Objection handling", "Summary format", "Next-step script"],
  "business-process": ["Process map", "Automation triggers", "SOP checklist", "Owner handoffs", "KPI tracker"],
};

function titleCase(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function fallbackGenerate(input: ToolRequest) {
  const moduleName = titleCase(input.module || "marketing");
  const business = input.business || "the business";
  const audience = input.audience || "local customers and small business buyers";
  const goal = input.goal || "generate qualified leads and increase revenue";
  const tone = input.tone || "premium, clear, conversion-focused";
  const channel = input.channel || moduleName;
  const recipes = moduleRecipes[input.module] || ["Strategy", "Content", "Automation", "Follow-up", "Metrics"];

  const sections = recipes.map((item, index) => {
    const angle = [
      `Use ${channel} to move ${audience} from awareness to action.`,
      `Make the message specific to ${business}, not generic digital marketing.`,
      `Include one clear CTA tied to ${goal}.`,
      `Track replies, clicks, bookings, and revenue impact.`,
      `Save every output for approvals, versioning, and reuse.`,
    ][index % 5];
    return `### ${item}\n- ${angle}\n- Sample output: ${business} helps ${audience} achieve ${goal}. Book a quick audit today.\n- KPI: ${index % 2 === 0 ? "conversion rate" : "response rate"}\n`;
  });

  return `## ${moduleName} Plan\n\n**Business:** ${business}\n**Audience:** ${audience}\n**Goal:** ${goal}\n**Tone:** ${tone}\n\n${sections.join("\n")}\n## Automation Workflow\n1. Capture input from website, CRM, or campaign form.\n2. Generate the first draft with AI.\n3. Score output for clarity, offer, audience fit, and CTA strength.\n4. Send to approval queue.\n5. After approval, schedule, send, or assign follow-up.\n6. Track performance and regenerate weak variations.\n\n## Next Best Actions\n- Create 3 variants and test the strongest CTA.\n- Add approved output to the content calendar or CRM timeline.\n- Trigger email or WhatsApp follow-up for engaged leads.`;
}

type ProviderConfig = {
  name: string;
  baseUrl: string;
  apiKey?: string;
  model: string;
};

async function callChatProvider(input: ToolRequest, provider: ProviderConfig) {
  if (!provider.apiKey) return null;

  const response = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${provider.apiKey}`,
      "http-referer": "http://localhost:3000",
      "x-title": "MarketingPilot AI",
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are MarketingPilot AI. Generate practical, ready-to-use marketing assets. Keep outputs structured, specific, and execution-ready.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
    }),
  });

  if (!response.ok) return null;
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content as string | undefined;
  return content ? { provider: `${provider.name}:${provider.model}`, content } : null;
}

async function providerGenerate(input: ToolRequest) {
  const providers: ProviderConfig[] = [
    {
      name: "openrouter",
      baseUrl: AI_API_BASE_URL,
      apiKey: AI_API_KEY,
      model: AI_MODEL,
    },
    {
      name: "opencode",
      baseUrl: OPENCODE_API_BASE_URL,
      apiKey: OPENCODE_API_KEY,
      model: OPENCODE_MODEL,
    },
  ];
  const requestedProvider = input.provider && input.provider !== "auto" ? input.provider : null;
  const selectedProviders = requestedProvider
    ? providers.filter((provider) => provider.name === requestedProvider)
    : providers;

  for (const provider of selectedProviders) {
    const result = await callChatProvider(input, provider).catch(() => null);
    if (result) return result;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json() as ToolRequest;
    if (!input.module) {
      return NextResponse.json({ error: "module is required" }, { status: 400 });
    }

    const providerResult = await providerGenerate(input);
    return NextResponse.json({
      provider: providerResult?.provider || "free-local-generator",
      content: providerResult?.content || fallbackGenerate(input),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
