// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pb } from '../pocketbase';
import { sendEmail } from '../email';

export class ToolRegistry {
  
  // A centralized registry of all tools available to AI Employees
  static getTools() {
    return {
      search_crm: tool({
        description: 'Search the CRM for contacts, leads, or companies',
        parameters: z.object({
          query: z.string().describe('The name or email to search for'),
        }),
      }),
      
      read_knowledge_base: tool({
        description: 'Search the internal knowledge base for company SOPs and data',
        parameters: z.object({
          topic: z.string().describe('The topic to search for'),
        }),
      }),

      analyze_website: tool({
        description: 'Analyze a URL and extract text content or metadata',
        parameters: z.object({
          url: z.string().url().describe('The website URL to analyze'),
        }),
      }),

      draft_email: tool({
        description: 'Draft an email in the user drafts folder',
        parameters: z.object({
          to: z.string().email(),
          subject: z.string(),
          body: z.string(),
        }),
      }),

      send_email: tool({
        description: 'Send an automated email immediately to a prospect or lead using the company email',
        parameters: z.object({
          to: z.string().email(),
          subject: z.string(),
          body: z.string(),
        }),
        execute: async ({ to, subject, body }) => {
          try {
            await sendEmail({ to, subject, text: body, html: body.replace(/\n/g, '<br>') });
            return `Email sent successfully to ${to}`;
          } catch (error) {
            return `Failed to send email: ${error}`;
          }
        }
      }),
    };
  }

  static getToolsForEmployee(toolNames: string[]) {
    const allTools = this.getTools();
    const selected: Record<string, any> = {};
    for (const name of toolNames) {
      if (allTools[name as keyof typeof allTools]) {
        selected[name] = allTools[name as keyof typeof allTools];
      }
    }
    return selected;
  }
}
