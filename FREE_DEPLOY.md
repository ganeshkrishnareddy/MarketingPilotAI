# 🆓 V360 AI Agency — FREE Deployment Guide

Deploy your full application **100% free** using Vercel + PocketBase Cloud.

---

## Option 1: Vercel + PocketBase Cloud (Recommended)

### Why this works
- **Vercel**: Free Next.js hosting (no credit card required)
- **PocketBase Cloud**: Free managed PocketBase (1GB storage)
- **Total cost**: ₹0

---

### Step 1: Create PocketBase Cloud Database

1. Go to **https://pockethost.io**
2. Sign up with GitHub or email
3. Create a new instance:
   - Name: `vision360ai`
   - Region: Choose closest to India
4. Copy your PocketBase URL (looks like: `https://vision360ai.pockethost.io`)
5. Open the admin panel and create your admin account:
   - Email: `admin@vision360.ai`
   - Password: `Vision@360`

---

### Step 2: Push Code to GitHub

```bash
cd /d/MarketingPilotAI
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/MarketingPilotAI.git
git push -u origin main
```

---

### Step 3: Deploy to Vercel

1. Go to **https://vercel.com**
2. Sign up with GitHub
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

6. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_PB_URL` | `https://vision360ai.pockethost.io` |
| `AI_API_KEY` | Your OpenRouter API key |
| `AI_API_BASE_URL` | `https://openrouter.ai/api/v1` |
| `META_ACCESS_TOKEN` | Your WhatsApp token |
| `META_PHONE_NUMBER_ID` | `1206627179205677` |
| `META_VERIFY_TOKEN` | `vision360_secure_token` |
| `POCKETBASE_ADMIN_EMAIL` | `admin@vision360.ai` |
| `POCKETBASE_ADMIN_PASSWORD` | `Vision@360` |

7. Click **Deploy**

---

### Step 4: Add Custom Domain

1. In Vercel project → **Settings** → **Domains**
2. Add: `vision360aisolutions.in`
3. Vercel will show DNS records to add

4. Go to your domain registrar (where you bought the domain)
5. Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

6. Wait 5-10 minutes for DNS propagation
7. SSL is automatic!

---

### Step 5: Run Database Migrations

1. Go to your PocketBase admin: `https://vision360ai.pockethost.io/_/`
2. Create collections manually or import from the app

The app will create collections automatically on first use.

---

## Option 2: Railway (Full Stack Free)

Railway has a free tier ($5/month credit) that can run everything.

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Sign up with GitHub
3. You get $5 free credit monthly

### Step 2: Deploy PocketBase

1. Create new project → **Database** → **Deploy Template**
2. Search for "PocketBase"
3. Deploy it
4. Note the internal URL (e.g., `pocketbase.railway.internal:8090`)

### Step 3: Deploy Next.js Frontend

1. In same project → **New Service** → **GitHub Repo**
2. Select your repository
3. Set:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

4. Add environment variables (same as Vercel)

5. Deploy

### Step 4: Add Domain

1. Railway → **Settings** → **Networking**
2. Generate public domain
3. Or add custom domain and configure DNS

---

## Option 3: Cyclic.sh (Truly Free)

1. Go to **https://cyclic.sh**
2. Sign up with GitHub
3. Connect your repository
4. Set environment variables
5. Deploy

**Note**: Free tier has cold starts (15-30s delay).

---

## Option 4: Cloudflare Pages + Supabase

### Frontend → Cloudflare Pages (Free, unlimited)

1. Go to **https://pages.cloudflare.com**
2. Connect GitHub repo
3. Set:
   - **Build command**: `cd frontend && npm run build`
   - **Output directory**: `frontend/.next`

### Database → Supabase (Free tier)

1. Go to **https://supabase.com**
2. Create free project
3. Get URL and anon key
4. Update `NEXT_PUBLIC_PB_URL` to Supabase REST API

**Note**: This requires code changes to use Supabase instead of PocketBase.

---

## My Recommendation

For **zero cost** and **easiest setup**:

### Use Vercel + PocketBase Cloud

| Service | Free Limit | Your Usage |
|---------|-----------|------------|
| Vercel | 100GB bandwidth/month | ~2-5GB |
| PocketBase Cloud | 1GB storage | ~100MB |
| Custom Domain | Free | Yes |
| SSL | Automatic | Yes |
| **Total** | **₹0** | ✅ |

---

## After Deployment Checklist

- [ ] Test login at `https://vision360aisolutions.in/login`
- [ ] Create admin account in PocketBase
- [ ] Configure WhatsApp webhook URL in Meta
- [ ] Test WhatsApp chatbot
- [ ] Add test data (leads, contacts)
- [ ] Verify AI features work

---

## Free Tier Limits

| Platform | Bandwidth | Storage | Builds |
|----------|-----------|---------|--------|
| Vercel | 100GB/mo | - | 100/day |
| PocketBase Cloud | - | 1GB | - |
| Railway | 100GB/mo | 1GB | - |
| Cyclic | 100GB/mo | - | 50/mo |
| Cloudflare Pages | Unlimited | - | 500/mo |

For a small business app, **Vercel + PocketBase Cloud is more than enough**.
