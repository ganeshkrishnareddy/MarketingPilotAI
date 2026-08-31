const fs = require('fs');
let content = fs.readFileSync('.env.local', 'utf8');
content = content.replace(/AI_API_KEY=".+"/g, 'AI_API_KEY="<REVOKED>"');
fs.writeFileSync('.env.local', content, 'utf8');
