import { pb } from '../pocketbase';

export interface RouteResolution {
    provider: any;
    model: any;
    taskType?: string;
}

export class AIRouter {
    static async resolveRoute(taskType: string): Promise<RouteResolution> {
        try {
            // Find route in DB
            const routes = await pb.collection('ai_task_routes').getList(1, 1, {
                filter: 'task_type = "' + taskType + '"',
                expand: 'model_id,model_id.provider_id'
            });

            if (routes.items.length > 0 && routes.items[0].expand?.model_id) {
                const model = routes.items[0].expand.model_id;
                const provider = model.expand?.provider_id;
                if (provider && provider.is_active && model.is_active) {
                    return { provider, model, taskType };
                }
            }

            // Fallback to finding any active provider and model
            const fallbackModel = await pb.collection('ai_models').getFirstListItem('is_active = true', {
                expand: 'provider_id'
            });
            return {
                provider: fallbackModel.expand?.provider_id,
                model: fallbackModel,
                taskType
            };
        } catch (e) {
            console.error("Route resolution failed", e);
            throw new Error("No active AI Providers or Models configured.");
        }
    }
}
