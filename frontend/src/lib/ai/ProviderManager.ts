import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, generateText } from 'ai';
import { RouteResolution } from './AIRouter';
import { pb } from '../pocketbase';
import { ToolRegistry } from './ToolRegistry';

export class ProviderManager {
  
  static getClient(provider: any) {
    const name = (provider.name || "").toLowerCase();
    // Provider records may leave the key blank to fall back to the server env
    // (single source of truth for local/dev deployments — never commit keys).
    const apiKey = provider.api_key || process.env.AI_API_KEY || "";

    if (name.includes('anthropic')) {
      return createAnthropic({ apiKey });
    }
    
    if (name.includes('gemini') || name.includes('google')) {
      return createGoogleGenerativeAI({ apiKey });
    }

    // Default to OpenAI / OpenRouter / Groq / Local compatible endpoints
    return createOpenAI({
      baseURL: provider.base_url || process.env.AI_API_BASE_URL || 'https://api.openai.com/v1',
      apiKey,
    });
  }

  // Returns an AI SDK model instance for a resolved route (used by generateObject/generateText callers)
  static getModel(route: RouteResolution) {
    const { provider, model } = route;
    const client = this.getClient(provider);
    return client(model.model_id);
  }

  static async logUsage(workspaceId: string, providerId: string, modelId: string, taskType: string, tokens: number, startTime: number, errorStatus: string = "") {
    try {
      const latency = Date.now() - startTime;
      
      // Calculate estimated cost (simple approximation)
      let estimated_cost = 0;
      if (modelId) {
        const model = await pb.collection('ai_models').getOne(modelId).catch(() => null);
        if (model && model.cost_per_1k_tokens) {
          estimated_cost = (tokens / 1000) * model.cost_per_1k_tokens;
        }
      }

      await pb.collection('ai_usage_logs').create({
        workspace_id: workspaceId || null,
        provider_id: providerId,
        model_id: modelId,
        task_type: taskType,
        tokens_used: tokens,
        latency_ms: latency,
        estimated_cost,
        error_status: errorStatus
      });
    } catch (e) {
      console.error("Failed to log usage", e);
    }
  }

  // Returns a Web stream for Server-Sent Events
  static async executeStream(
    systemPrompt: string, 
    userPrompt: string, 
    route: RouteResolution, 
    options: any,
    workspaceId: string = ""
  ) {
    const { provider, model, taskType } = route;
    const client = this.getClient(provider);
    const startTime = Date.now();

    try {
      const result = await streamText({
        model: client(model.model_id),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: options.temperature || 0.7,
        maxRetries: 3,
        tools: ToolRegistry.getToolsForEmployee(options.tools || []),
        abortSignal: options.signal
      });

      // We cannot easily hook onFinish if returning the result.toDataStreamResponse directly to NextJS,
      // but Vercel AI sdk streamText provides onFinish inside the execution itself.
      // However, we just return the stream directly and let the caller handle it.
      return result;
    } catch (error) {
      this.logUsage(workspaceId, provider.id, model.id, taskType || "Unknown", 0, startTime, (error as Error).message);
      throw error;
    }
  }

  // Synchronous execution for background workers
  static async executeTask(
    systemPrompt: string,
    userPrompt: string,
    route: RouteResolution,
    options: any = {},
    workspaceId: string = ""
  ) {
    const { provider, model, taskType } = route;
    const client = this.getClient(provider);
    const startTime = Date.now();

    try {
      const result = await generateText({
        model: client(model.model_id),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: options.temperature || 0.7,
        tools: ToolRegistry.getToolsForEmployee(options.tools || []),
        maxRetries: 3
      });

      const tokens = result.usage.totalTokens || 0;
      await this.logUsage(workspaceId, provider.id, model.id, taskType || "Unknown", tokens, startTime, "");
      
      return result.text;
    } catch (error) {
      await this.logUsage(workspaceId, provider.id, model.id, taskType || "Unknown", 0, startTime, (error as Error).message);
      throw error;
    }
  }
}
