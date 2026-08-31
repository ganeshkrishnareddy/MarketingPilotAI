const PocketBase = require('pocketbase/cjs');

async function expandSchemaAIEngine() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    // Auth
    const res = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'admin@marketingpilot.ai', password: 'pvXcFY5f7rKl6J0g' })
    });
    const authData = await res.json();
    if (!authData.token) return console.error("Auth failed.");
    pb.authStore.save(authData.token, authData.admin);

    try {
        const allCols = await pb.collections.getFullList();
        const getColId = (name) => allCols.find(c => c.name === name)?.id;
        const bwId = getColId('business_workspace');

        console.log("Creating ai_employees...");
        const empCol = await pb.collections.create({
            name: 'ai_employees',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'role', type: 'text', required: true },
                { name: 'system_prompt', type: 'text' },
                { name: 'tools', type: 'json', options: { maxSize: 2000000 } },
                { name: 'permissions', type: 'json', options: { maxSize: 2000000 } }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("EMP Err:", JSON.stringify(e.data, null, 2)));
        
        const empId = empCol?.id || getColId('ai_employees');

        console.log("Creating ai_tasks...");
        await pb.collections.create({
            name: 'ai_tasks',
            type: 'base',
            schema: [
                { name: 'title', type: 'text', required: true },
                { name: 'employee', type: 'relation', required: false, options: { collectionId: empId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'workspace', type: 'relation', required: false, options: { collectionId: bwId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'priority', type: 'text' },
                { name: 'status', type: 'text' }, // Pending, Running, Failed, Completed
                { name: 'result', type: 'text' },
                { name: 'logs', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("TSK Err:", JSON.stringify(e.data, null, 2)));

        console.log("Creating ai_memory...");
        await pb.collections.create({
            name: 'ai_memory',
            type: 'base',
            schema: [
                { name: 'workspace', type: 'relation', required: false, options: { collectionId: bwId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'key', type: 'text', required: true },
                { name: 'value', type: 'json', options: { maxSize: 2000000 } }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("MEM Err:", JSON.stringify(e.data, null, 2)));

        console.log("Creating ai_workflows...");
        await pb.collections.create({
            name: 'ai_workflows',
            type: 'base',
            schema: [
                { name: 'workspace', type: 'relation', required: false, options: { collectionId: bwId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'name', type: 'text', required: true },
                { name: 'trigger', type: 'json', options: { maxSize: 2000000 } },
                { name: 'conditions', type: 'json', options: { maxSize: 2000000 } },
                { name: 'actions', type: 'json', options: { maxSize: 2000000 } },
                { name: 'is_active', type: 'bool' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("WF Err:", JSON.stringify(e.data, null, 2)));

        console.log("Database successfully expanded for AI Engine!");
    } catch (e) {
        console.error(e);
    }
}
expandSchemaAIEngine();
