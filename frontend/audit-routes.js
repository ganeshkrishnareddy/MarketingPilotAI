const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, 'src', 'components', 'dashboard-sidebar.tsx');
const appDir = path.join(__dirname, 'src', 'app');

const content = fs.readFileSync(sidebarPath, 'utf8');

// regex to find all url: "/dashboard/..."
const regex = /url:\s*["'](\/dashboard[^"']+)["']/g;
let match;
const urls = [];

while ((match = regex.exec(content)) !== null) {
    urls.push(match[1]);
}

console.log(`Found ${urls.length} routes in sidebar.`);
const missing = [];

urls.forEach(url => {
    const pagePath = path.join(appDir, url.replace(/^\//, ''), 'page.tsx');
    if (!fs.existsSync(pagePath)) {
        missing.push(url);
    }
});

console.log(`\nMissing Routes (${missing.length}):`);
missing.forEach(m => console.log(m));

// Write missing routes to a json file for the subagents to pick up
fs.writeFileSync(path.join(__dirname, 'missing-routes.json'), JSON.stringify(missing, null, 2));
