import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { ProviderManager } from "@/lib/ai/ProviderManager";
import { AIRouter } from "@/lib/ai/AIRouter";

// Schema for SEO keywords
const SeoKeywordSchema = z.object({
  clusters: z.array(z.object({
    name: z.string(),
    count: z.number()
  })),
  results: z.array(z.object({
    id: z.number(),
    keyword: z.string(),
    volume: z.string().describe("Estimated search volume (e.g. 12,500)"),
    difficulty: z.number().min(1).max(100),
    intent: z.enum(["Informational", "Transactional", "Navigational", "Investigational"]),
    cluster: z.string()
  }))
});

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Get the provider route
    const route = await AIRouter.resolveRoute("SEO");
    const model = ProviderManager.getModel(route);

    if (!model) {
      throw new Error("No available model for SEO generation");
    }

    const { object } = await generateObject({
      model: model,
      schema: SeoKeywordSchema,
      prompt: `You are an expert SEO strategist. Generate a list of high-value SEO keywords, search intents, difficulty scores (1-100), and semantic clusters for the following seed query or business URL: "${query}". 
      Make sure to return at least 4 clusters and 8-10 diverse keywords.`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("SEO Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate SEO data" }, { status: 500 });
  }
}
