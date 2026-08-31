import { pb } from '../pocketbase';
import { MemoryManager } from './MemoryManager';
import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { AIRouter } from './AIRouter';

export class PromptBuilder {
  static async buildContext(employeeId: string, workspaceId: string): Promise<string> {
    try {
      // 1. Get Employee Config
      const employee = await pb.collection('ai_employees').getOne(employeeId);
      
      // 2. Get Workspace Config
      let workspaceContext = "";
      if (workspaceId) {
        const workspace = await pb.collection('business_workspace').getOne(workspaceId);
        workspaceContext = `
BUSINESS CONTEXT:
Name: ${workspace.name}
Industry: ${workspace.industry || 'Unknown'}
Website: ${workspace.website || 'Unknown'}
Target Audience: ${workspace.target_audience || 'Unknown'}
Brand Voice: ${workspace.brand_voice || 'Unknown'}
Products/Services: ${workspace.products_services || 'Unknown'}
        `;

        // 3. Inject Long-term Memory
        const memory = await MemoryManager.getAllWorkspaceMemory(workspaceId);
        if (Object.keys(memory).length > 0) {
            workspaceContext += `\nLONG-TERM MEMORY:\n${JSON.stringify(memory, null, 2)}\n`;
        }
      }

      // 4. Perform RAG (Vector Search) if a task string is provided
      let ragContext = "";
      try {
        const route = await AIRouter.resolveRoute("Embeddings").catch(() => null);
        const baseURL = route?.provider?.base_url || process.env.AI_API_BASE_URL || 'https://api.openai.com/v1';
        const apiKey = route?.provider?.api_key || process.env.AI_API_KEY || 'mock-key';
        const modelId = route?.model?.model_id || 'text-embedding-3-small';
        const openai = createOpenAI({ baseURL, apiKey });

        // Generate embedding for the employee role / goal to find relevant KB chunks
        const { embedding } = await embed({
            model: openai.embedding(modelId),
            value: employee.role + " " + employee.system_prompt,
        });

        // Fetch chunks from PB (In MVP, fetch all for workspace and do local dot product)
        const allChunks = await pb.collection('ai_knowledge_base').getFullList({ filter: `workspace_id = "${workspaceId}"` });
        
        // Simple dot product for Cosine Similarity (assuming normalized embeddings)
        const dotProduct = (a: number[], b: number[]) => a.reduce((sum, val, i) => sum + val * b[i], 0);
        
        const scoredChunks = allChunks.map(doc => ({
            text: doc.chunk_text,
            score: dotProduct(embedding, doc.embedding as number[])
        })).sort((a, b) => b.score - a.score).slice(0, 3);

        if (scoredChunks.length > 0) {
            ragContext = "\nRELEVANT KNOWLEDGE BASE CONTEXT:\n" + scoredChunks.map(c => `- ${c.text}`).join("\n") + "\n";
        }
      } catch (e) {
        console.error("RAG Injection Failed", e);
      }

      // 5. Construct Final System Prompt
      const finalPrompt = `
You are acting as an AI Employee for this workspace.

ROLE: ${employee.role}
SYSTEM PROMPT: ${employee.system_prompt}

${workspaceContext}
${ragContext}

CRITICAL: You are an execution engine. You must process the user's task using the context provided.
      `;

      return finalPrompt;
    } catch (e) {
      console.error("Error building prompt context:", e);
      return "Error generating context.";
    }
  }
}
