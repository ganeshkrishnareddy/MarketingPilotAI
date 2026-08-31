import { NextRequest } from "next/server";
import { AIRouter } from "@/lib/ai/AIRouter";
import { ProviderManager } from "@/lib/ai/ProviderManager";


export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userPrompt, temperature, maxTokens, taskType } = await req.json();

    // 1. Route to best model based on taskType
    const route = await AIRouter.resolveRoute(taskType || "Chat");
    
    // 2. Stream response using Vercel AI SDK
    const result = await ProviderManager.executeStream(
        systemPrompt,
        userPrompt,
        route,
        { temperature, maxTokens }
    );

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Stream API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process request", details: (error as Error).message }), { status: 500 });
  }
}
