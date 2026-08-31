import { pb } from '../pocketbase';
import { ProviderManager } from './ProviderManager';
import { ExecutionPlanner } from './ExecutionPlanner';

export class AgentOrchestrator {
  static async createProject(workspaceId: string, title: string, goal: string) {
    // a. Create an ai_projects record
    const project = await pb.collection('ai_projects').create({
      workspace_id: workspaceId,
      title: title,
      goal: goal,
      status: 'pending'
    });

    // b. Find the "CEO AI" or first active AI employee from ai_employees
    const employees = await pb.collection('ai_employees').getFullList({
      filter: 'active = true',
      expand: 'provider_id,model_id' // Assuming these are relation fields
    });
    
    if (employees.length === 0) {
      throw new Error("No active AI employees found.");
    }

    let ceoEmployee = employees.find(e => e.role === 'CEO AI') || employees[0];

    // Build the route
    const route = {
      provider: ceoEmployee.expand?.provider_id || {},
      model: ceoEmployee.expand?.model_id || {},
      taskType: 'Project Planning'
    };

    // c. Use ProviderManager.executeTask() to ask the AI to break the goal into a JSON array of subtasks 
    const systemPrompt = "You are a CEO AI breaking down a goal into a project plan.";
    const userPrompt = `Break the following goal into a JSON array of subtasks. Each subtask must have the properties: 'title' (string), 'description' (string), 'required_agent_role' (string), and 'depends_on_indexes' (an array of numbers representing indexes of prior subtasks it depends on, starting at 0 for the first subtask). Goal: ${goal}`;
    
    let taskResult = "";
    try {
      taskResult = await ProviderManager.executeTask(systemPrompt, userPrompt, route as any, {}, workspaceId);
    } catch (e) {
      console.error("AI Planning failed:", e);
      return project;
    }
    
    // d. Parse the JSON array
    let subtasks: any[] = [];
    try {
        const jsonMatch = taskResult.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            subtasks = JSON.parse(jsonMatch[0]);
        } else {
            subtasks = JSON.parse(taskResult);
        }
    } catch (e) {
        console.error("Failed to parse subtasks from AI response", e);
        return project;
    }
    
    const createdTasks: any[] = [];
    for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        let assignedEmployee = employees.find(e => e.role === subtask.required_agent_role) || ceoEmployee;
        
        const aiTask = await pb.collection('ai_tasks').create({
            project_id: project.id,
            title: subtask.title,
            description: subtask.description,
            assigned_agent: assignedEmployee.id,
            status: 'pending'
        });
        
        createdTasks.push({ index: i, task: aiTask, dependencies: subtask.depends_on_indexes || [] });
    }
    
    // e. Insert records into ai_task_dependencies for any task that depends on another.
    for (const item of createdTasks) {
        for (const depIndex of item.dependencies) {
            const depTask = createdTasks.find(t => t.index === depIndex);
            if (depTask) {
                await pb.collection('ai_task_dependencies').create({
                    task_id: item.task.id,
                    depends_on_task_id: depTask.task.id
                });
            }
        }
    }

    // f. Call ExecutionPlanner.updateExecutionGraph(projectId)
    await ExecutionPlanner.updateExecutionGraph(project.id);
    
    return project;
  }
}
