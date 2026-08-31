const fs = require('fs');
let content = "";
try {
    content = fs.readFileSync('.env.local', 'utf8');
    if (content.includes('\u0000')) {
        content = fs.readFileSync('.env.local', 'utf16le');
    }
} catch (e) {
    console.error(e);
}

if (!content.includes('AI_API_BASE_URL')) {
    content += '\nAI_API_BASE_URL="https://openrouter.ai/api/v1"\n';
    content += 'AI_API_KEY="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"\n';
    content += 'AI_MODEL="meta-llama/llama-3.1-8b-instruct:free"\n';
    fs.writeFileSync('.env.local', content, 'utf8');
    console.log('Updated .env.local');
} else {
    console.log('Already updated');
}
