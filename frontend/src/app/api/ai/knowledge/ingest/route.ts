import { NextRequest } from "next/server";
import { pb } from "@/lib/pocketbase";
import { embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { AIRouter } from "@/lib/ai/AIRouter";

export async function POST(req: NextRequest) {
  try {
    const { documentName, text, workspaceId } = await req.json();

    if (!documentName || !text) {
        return new Response(JSON.stringify({ error: "Missing document name or text" }), { status: 400 });
    }

    // 1. Basic Chunking (split by double newlines or max char limit for MVP)
    const chunks = text.split(/\n\n+/).filter((c: string) => c.trim().length > 10);
    
    // 2. Resolve embedding provider (fallback to OpenAI endpoint for embeddings)
    const route = await AIRouter.resolveRoute("Embeddings").catch(() => null);
    
    // Default to an open-compatible embeddings endpoint or OpenAI
    const baseURL = route?.provider?.base_url || process.env.AI_API_BASE_URL || 'https://api.openai.com/v1';
    const apiKey = route?.provider?.api_key || process.env.AI_API_KEY || 'mock-key';
    const modelId = route?.model?.model_id || 'text-embedding-3-small';

    const openai = createOpenAI({ baseURL, apiKey });

    // 3. Generate Embeddings
    const { embeddings } = await embedMany({
        model: openai.embedding(modelId),
        values: chunks,
    });

    // 4. Save to PocketBase (SQLite array)
    for (let i = 0; i < chunks.length; i++) {
        await pb.collection('ai_knowledge_base').create({
            workspace_id: workspaceId || null,
            document_name: documentName,
            chunk_text: chunks[i],
            embedding: embeddings[i] // Store as JSON array of floats
        });
    }

    return new Response(JSON.stringify({ success: true, chunksIngested: chunks.length }), { status: 200 });

  } catch (error) {
    console.error("Ingestion Error:", error);
    return new Response(JSON.stringify({ error: "Failed to ingest document", details: (error as Error).message }), { status: 500 });
  }
}
