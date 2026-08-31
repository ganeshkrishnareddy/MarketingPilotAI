import { pb } from '../pocketbase';

export class AgentMessenger {
  static async sendMessage(fromAgentId: string, toAgentId: string, taskId: string, payload: any) {
    return await pb.collection('ai_messages').create({
      from_agent_id: fromAgentId,
      to_agent_id: toAgentId,
      task_id: taskId,
      payload: payload
    });
  }
}
