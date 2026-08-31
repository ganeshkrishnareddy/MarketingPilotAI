import { pb } from '../pocketbase';

export class TaskQueue {
  static async enqueue(title: string, employeeId: string, workspaceId: string, priority: string = "Normal") {
    return await pb.collection('ai_tasks').create({
      title,
      employee: employeeId,
      workspace: workspaceId,
      priority,
      status: "Pending",
      logs: `Task created at ${new Date().toISOString()}\n`
    });
  }

  static async updateStatus(taskId: string, status: string, additionalLog?: string) {
    const task = await pb.collection('ai_tasks').getOne(taskId);
    let newLogs = task.logs || "";
    if (additionalLog) {
      newLogs += `[${new Date().toISOString()}] ${additionalLog}\n`;
    }
    return await pb.collection('ai_tasks').update(taskId, {
      status,
      logs: newLogs
    });
  }

  static async completeTask(taskId: string, result: string, log?: string) {
    const task = await pb.collection('ai_tasks').getOne(taskId);
    let newLogs = task.logs || "";
    if (log) {
      newLogs += `[${new Date().toISOString()}] ${log}\n`;
    }
    newLogs += `[${new Date().toISOString()}] Task completed successfully.\n`;
    return await pb.collection('ai_tasks').update(taskId, {
      status: "Completed",
      result,
      logs: newLogs
    });
  }

  static async getPendingTasks() {
    return await pb.collection('ai_tasks').getList(1, 50, {
      filter: 'status = "Pending"',
      sort: 'created'
    });
  }
}
