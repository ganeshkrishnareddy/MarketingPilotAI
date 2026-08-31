import { pb } from '../pocketbase';

export class ExecutionPlanner {
    
    // Resolves task dependencies to find tasks that have no pending blockers
    static async getRunnableTasks(projectId: string): Promise<any[]> {
        // 1. Fetch all tasks for this project
        const tasks = await pb.collection('ai_tasks').getFullList({ filter: `project_id="${projectId}" && status="pending"` });
        
        if (tasks.length === 0) return [];
        
        // 2. Fetch all dependencies for these tasks
        const taskIds = tasks.map(t => t.id).map(id => `"${id}"`).join(',');
        const dependencies = await pb.collection('ai_task_dependencies').getFullList({
            filter: `task_id ?= [${taskIds}]`
        }).catch(() => []); // Graceful fail if no deps
        
        // 3. Find dependencies that are NOT completed
        const runnableTasks = [];
        for (const task of tasks) {
            const myDeps = dependencies.filter(d => d.task_id === task.id);
            let canRun = true;
            for (const dep of myDeps) {
                const blockingTask = await pb.collection('ai_tasks').getOne(dep.depends_on_task_id).catch(() => null);
                if (blockingTask && blockingTask.status !== 'completed') {
                    canRun = false;
                    break;
                }
            }
            if (canRun) runnableTasks.push(task);
        }
        
        return runnableTasks;
    }
    
    // Updates the graph representation in the database for the UI
    static async updateExecutionGraph(projectId: string) {
        try {
            const tasks = await pb.collection('ai_tasks').getFullList({ filter: `project_id="${projectId}"`, expand: 'assigned_agent' });
            const deps = await pb.collection('ai_task_dependencies').getFullList().catch(() => []);
            
            const nodes = tasks.map(t => ({
                id: t.id,
                title: t.title,
                status: t.status,
                agent: t.expand?.assigned_agent?.name || "Unassigned"
            }));
            
            const edges = deps.filter(d => tasks.some(t => t.id === d.task_id) && tasks.some(t => t.id === d.depends_on_task_id))
                             .map(d => ({ from: d.depends_on_task_id, to: d.task_id }));
                             
            const graphJson = { nodes, edges };
            
            // Find existing graph
            const graphs = await pb.collection('ai_execution_graph').getFullList({ filter: `project_id="${projectId}"` });
            if (graphs.length > 0) {
                await pb.collection('ai_execution_graph').update(graphs[0].id, { graph_json: graphJson });
            } else {
                await pb.collection('ai_execution_graph').create({ project_id: projectId, graph_json: graphJson });
            }
        } catch (e) {
            console.error("Failed to update execution graph", e);
        }
    }
}
