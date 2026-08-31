const PocketBase = require('pocketbase/cjs');

async function setupDatabase() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    console.log("Authenticating as Admin (Manual Endpoint for v0.22)...");
    
    // Manually fetch token since pb.admins.authWithPassword might hit the wrong endpoint
    const res = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'admin@marketingpilot.ai', password: 'Password123!' })
    });
    const authData = await res.json();
    if (!authData.token) {
        console.error("Auth failed:", authData);
        return;
    }
    
    pb.authStore.save(authData.token, authData.admin);
    console.log("Authenticated successfully.");

    try {
        // 1. Businesses
        console.log("Creating businesses collection...");
        await pb.collections.create({
            name: 'businesses',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'industry', type: 'text' },
                { name: 'website_url', type: 'url' },
                { name: 'target_audience', type: 'text' },
                { name: 'monthly_budget', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        });

        // 2. Contacts
        console.log("Creating contacts collection...");
        let contactsCol = await pb.collections.create({
            name: 'contacts',
            type: 'base',
            schema: [
                { name: 'first_name', type: 'text', required: true },
                { name: 'last_name', type: 'text' },
                { name: 'email', type: 'email' },
                { name: 'company', type: 'text' },
                { name: 'phone', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        });

        // 3. Leads
        console.log("Creating leads collection...");
        await pb.collections.create({
            name: 'leads',
            type: 'base',
            schema: [
                { name: 'contact', type: 'relation', required: false, options: { collectionId: contactsCol.id, cascadeDelete: false, maxSelect: 1 } },
                { name: 'source', type: 'text' },
                { name: 'score', type: 'number' },
                { name: 'status', type: 'text' }, // New, Contacted, Qualified
                { name: 'notes', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        });

        // 4. Deals
        console.log("Creating deals collection...");
        await pb.collections.create({
            name: 'deals',
            type: 'base',
            schema: [
                { name: 'title', type: 'text', required: true },
                { name: 'value', type: 'number' },
                { name: 'stage', type: 'text' }, // New Leads, Contacted, Qualified, Proposal, Closed
                { name: 'contact_name', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        });

        // 5. AI Agents
        console.log("Creating ai_agents collection...");
        await pb.collections.create({
            name: 'ai_agents',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'role', type: 'text', required: true },
                { name: 'status', type: 'text' },
                { name: 'system_prompt', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        });

        console.log("All collections created successfully!");
    } catch (e) {
        console.error("Error creating collections:", e.data || e);
    }
}

setupDatabase();
