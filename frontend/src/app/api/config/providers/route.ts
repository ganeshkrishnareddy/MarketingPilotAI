import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    providers: [
      {
        name: "OpenRouter",
        base_url: process.env.AI_API_BASE_URL || "https://openrouter.ai/api/v1",
        model: process.env.AI_MODEL || "openrouter/free",
        category: "Free AI",
        visible: true,
      },
      {
        name: "OpenCode",
        base_url: process.env.OPENCODE_API_BASE_URL || "https://opencode.ai/zen/v1",
        model: process.env.OPENCODE_MODEL || "mimo-v2.5-free",
        category: "Free AI",
        visible: true,
      },
      {
        name: "Supabase / PocketBase",
        base_url: "local-config",
        model: "local-storage",
        category: "App Backend",
        visible: true,
      },
    ],
  });
}
