const PocketBase = require('pocketbase/cjs');

async function expandSchemaPhase3() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    const res = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'admin@marketingpilot.ai', password: 'pvXcFY5f7rKl6J0g' })
    });
    const authData = await res.json();
    if (!authData.token) return console.error("Auth failed.");
    pb.authStore.save(authData.token, authData.admin);

    try {
        console.log("Creating business_workspace...");
        const bwCol = await pb.collections.create({
            name: 'business_workspace',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'industry', type: 'text' },
                { name: 'website', type: 'url' },
                { name: 'brand_voice', type: 'text' },
                { name: 'target_audience', type: 'text' },
                { name: 'brand_colors', type: 'json', options: { maxSize: 2000000 } },
                { name: 'typography', type: 'json', options: { maxSize: 2000000 } },
                { name: 'social_accounts', type: 'json', options: { maxSize: 2000000 } },
                { name: 'products_services', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("BW Err:", JSON.stringify(e.data, null, 2)));

        const allCols = await pb.collections.getFullList();
        const bwId = allCols.find(c => c.name === 'business_workspace')?.id;

        console.log("Creating buyer_personas...");
        await pb.collections.create({
            name: 'buyer_personas',
            type: 'base',
            schema: [
                { name: 'workspace', type: 'relation', required: false, options: { collectionId: bwId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'name', type: 'text', required: true },
                { name: 'demographics', type: 'text' },
                { name: 'pain_points', type: 'text' },
                { name: 'goals', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("BP Err:", JSON.stringify(e.data, null, 2)));

        console.log("Creating competitors_workspace...");
        await pb.collections.create({
            name: 'competitors_workspace',
            type: 'base',
            schema: [
                { name: 'workspace', type: 'relation', required: false, options: { collectionId: bwId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'name', type: 'text', required: true },
                { name: 'website', type: 'url' },
                { name: 'strengths', type: 'text' },
                { name: 'weaknesses', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("CW Err:", JSON.stringify(e.data, null, 2)));

        console.log("Creating prospects...");
        await pb.collections.create({
            name: 'prospects',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'website', type: 'url' },
                { name: 'phone', type: 'text' },
                { name: 'email', type: 'email' },
                { name: 'google_maps_url', type: 'url' },
                { name: 'has_website', type: 'bool' },
                { name: 'has_social', type: 'bool' },
                { name: 'seo_score', type: 'number' },
                { name: 'review_rating', type: 'number' },
                { name: 'opportunity_score', type: 'number' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("PR Err:", JSON.stringify(e.data, null, 2)));

        console.log("Creating ai_analysis_reports...");
        await pb.collections.create({
            name: 'ai_analysis_reports',
            type: 'base',
            schema: [
                { name: 'workspace', type: 'relation', required: false, options: { collectionId: bwId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'type', type: 'text', required: true }, 
                { name: 'content', type: 'text' }, 
                { name: 'status', type: 'text' } 
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("AI Err:", JSON.stringify(e.data, null, 2)));

        console.log("Database successfully expanded for Phases 3-5!");
    } catch (e) {
        console.error(e);
    }
}
expandSchemaPhase3();
