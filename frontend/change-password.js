const PocketBase = require('pocketbase/cjs');

async function changeAdminPassword() {
    const pb = new PocketBase('http://127.0.0.1:8090');
    
    // Auth with old password
    const res = await fetch('http://127.0.0.1:8090/api/admins/auth-with-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'admin@marketingpilot.ai', password: 'Password123!' })
    });
    const authData = await res.json();
    if (!authData.token) {
        console.error("Auth failed. Maybe already changed?");
        return;
    }
    pb.authStore.save(authData.token, authData.admin);

    try {
        // Update to new password
        await fetch(`http://127.0.0.1:8090/api/admins/${authData.admin.id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.token}`
            },
            body: JSON.stringify({ 
                password: 'pvXcFY5f7rKl6J0g',
                passwordConfirm: 'pvXcFY5f7rKl6J0g'
            })
        });
        console.log("Admin password updated securely.");
    } catch (e) {
        console.error("Error updating admin password", e);
    }
}
changeAdminPassword();
