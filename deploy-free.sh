#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  V360 AI Agency — Free Deployment Script                  ║"
echo "║  Deploy to Vercel + PocketBase Cloud (₹0 cost)           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Install it from https://git-scm.com"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Install Node.js from https://nodejs.org"
    exit 1
fi

echo "📋 Step 1: Setting up Git repository..."
echo ""

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit - V360 AI Agency"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📋 Step 2: Instructions for Vercel deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Create a GitHub repository and push your code:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/MarketingPilotAI.git"
echo "   git push -u origin main"
echo ""
echo "2. Go to https://vercel.com and sign up with GitHub"
echo ""
echo "3. Click 'Add New Project' and import your repository"
echo ""
echo "4. Configure:"
echo "   - Framework: Next.js"
echo "   - Root Directory: frontend"
echo "   - Build Command: npm run build"
echo ""
echo "5. Add these environment variables:"
echo ""
echo "   NEXT_PUBLIC_PB_URL=https://YOUR_INSTANCE.pockethost.io"
echo "   AI_API_KEY=sk-or-v1-YOUR_KEY"
echo "   META_ACCESS_TOKEN=EAAV7TIjiv8gBSG1YAMkEgk7z5xXfoaZCgJm6ZCund2u..."
echo "   META_PHONE_NUMBER_ID=1206627179205677"
echo "   META_VERIFY_TOKEN=vision360_secure_token"
echo ""
echo "6. Click Deploy!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Step 3: Create PocketBase Cloud Database"
echo ""
echo "1. Go to https://pockethost.io"
echo "2. Create free account"
echo "3. Create instance named 'vision360ai'"
echo "4. Copy your PocketBase URL"
echo "5. Add it to Vercel environment variables as NEXT_PUBLIC_PB_URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Step 4: Add Custom Domain"
echo ""
echo "1. In Vercel → Settings → Domains"
echo "2. Add: vision360aisolutions.in"
echo "3. Update DNS at your registrar:"
echo "   - A record: @ → 76.76.21.21"
echo "   - CNAME: www → cname.vercel-dns.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Total cost: ₹0 (FREE)"
echo ""
echo "📚 Full guide: FREE_DEPLOY.md"
