const PocketBase = require('pocketbase/cjs');

async function expandSchema() {
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
        // 1. Create Companies
        console.log("Creating companies...");
        let companiesCol = await pb.collections.create({
            name: 'companies',
            type: 'base',
            schema: [
                { name: 'name', type: 'text', required: true },
                { name: 'industry', type: 'text' },
                { name: 'website', type: 'url' },
                { name: 'address', type: 'text' },
                { name: 'notes', type: 'text' }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("Companies exists?"));

        // Get updated collections map to resolve IDs
        const allCols = await pb.collections.getFullList();
        const getColId = (name) => allCols.find(c => c.name === name)?.id;
        const compId = getColId('companies');
        const contId = getColId('contacts');
        const leadId = getColId('leads');

        // 2. Create Tasks
        console.log("Creating tasks...");
        await pb.collections.create({
            name: 'tasks',
            type: 'base',
            schema: [
                { name: 'title', type: 'text', required: true },
                { name: 'due_date', type: 'date' },
                { name: 'priority', type: 'text' }, // High, Medium, Low
                { name: 'status', type: 'text' }, // Todo, In Progress, Done
                { name: 'assigned_to', type: 'text' },
                { name: 'contact', type: 'relation', required: false, options: { collectionId: contId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'lead', type: 'relation', required: false, options: { collectionId: leadId, cascadeDelete: false, maxSelect: 1 } }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("Tasks exists?"));

        // 3. Create Activities
        console.log("Creating activities...");
        await pb.collections.create({
            name: 'activities',
            type: 'base',
            schema: [
                { name: 'type', type: 'text', required: true }, // Call, Email, Meeting, Note
                { name: 'description', type: 'text' },
                { name: 'date', type: 'date' },
                { name: 'contact', type: 'relation', required: false, options: { collectionId: contId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'lead', type: 'relation', required: false, options: { collectionId: leadId, cascadeDelete: false, maxSelect: 1 } },
                { name: 'company', type: 'relation', required: false, options: { collectionId: compId, cascadeDelete: false, maxSelect: 1 } }
            ],
            listRule: "", viewRule: "", createRule: "", updateRule: "", deleteRule: ""
        }).catch(e => console.log("Activities exists?"));

        // Update Contacts with Company relation
        console.log("Updating contacts...");
        let contactsObj = allCols.find(c => c.name === 'contacts');
        if (contactsObj && !contactsObj.schema.some(s => s.name === 'company_rel')) {
            contactsObj.schema.push({
                name: 'company_rel',
                type: 'relation',
                required: false,
                options: { collectionId: compId, cascadeDelete: false, maxSelect: 1 }
            });
            await pb.collections.update(contactsObj.id, contactsObj);
        }

        console.log("Database successfully expanded for Phase 2!");
    } catch (e) {
        console.error(e);
    }
}
expandSchema();
