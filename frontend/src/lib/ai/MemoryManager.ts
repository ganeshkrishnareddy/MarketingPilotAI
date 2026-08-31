import { pb } from '../pocketbase';

export class MemoryManager {
  static async storeMemory(workspaceId: string, key: string, value: any) {
    try {
      // Check if memory key already exists
      const existing = await pb.collection('ai_memory').getList(1, 1, {
        filter: `workspace = "${workspaceId}" && key = "${key}"`
      });

      if (existing.items.length > 0) {
        return await pb.collection('ai_memory').update(existing.items[0].id, {
          value: JSON.stringify(value)
        });
      } else {
        return await pb.collection('ai_memory').create({
          workspace: workspaceId,
          key,
          value: JSON.stringify(value)
        });
      }
    } catch (e) {
      console.error("Error storing memory", e);
      throw e;
    }
  }

  static async getMemory(workspaceId: string, key: string) {
    try {
      const existing = await pb.collection('ai_memory').getList(1, 1, {
        filter: `workspace = "${workspaceId}" && key = "${key}"`
      });
      if (existing.items.length > 0) {
        const val = existing.items[0].value;
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return null;
    } catch (e) {
      console.error("Error fetching memory", e);
      return null;
    }
  }

  static async getAllWorkspaceMemory(workspaceId: string) {
    const memory = await pb.collection('ai_memory').getFullList({
      filter: `workspace = "${workspaceId}"`
    });
    return memory.reduce((acc, curr) => {
      try {
        acc[curr.key] = JSON.parse(curr.value);
      } catch {
        acc[curr.key] = curr.value;
      }
      return acc;
    }, {} as Record<string, any>);
  }
}
