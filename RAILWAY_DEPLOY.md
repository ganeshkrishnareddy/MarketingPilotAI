# 🚂 Railway Free Deployment Guide

Railway gives you **$5/month free credit** — enough to run PocketBase 24/7.

---

## Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Login"** → Sign up with GitHub
3. You get **$5/month free** (no credit card required)

---

## Step 2: Deploy PocketBase

1. Click **"New Project"**
2. Select **"Deploy from GitHub Repo"**
3. Select your `MarketingPilotAI` repository

4. Add a **New Service** → **"Dockerfile"**

5. Create a file called `Dockerfile` in the root of your repo:

```dockerfile
FROM dockprom/pocketbase:latest

EXPOSE 8090

CMD ["serve", "--http=0.0.0.0:8090"]
```

6. Railway will auto-deploy PocketBase

7. Go to **Settings** → **Networking** → **Generate Domain**

8. Copy the URL (e.g., `pocketbase.up.railway.app`)

---

## Step 3: Deploy Next.js Frontend

1. In same Railway project, click **"New Service"**
2. Select **"GitHub Repo"**
3. Select same repository

4. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

5. Add Environment Variables:

```
NEXT_PUBLIC_PB_URL=https://pocketbase.up.railway.app
AI_API_KEY=sk-or-v1-YOUR_KEY
META_ACCESS_TOKEN=EAAV7TIjiv8gBSG1YAMkEgk7z5xXfoaZCgJm6ZCund2u...
META_PHONE_NUMBER_ID=1206627179205677
META_VERIFY_TOKEN=vision360_secure_token
POCKETBASE_ADMIN_EMAIL=admin@vision360.ai
POCKETBASE_ADMIN_PASSWORD=Vision@360
```

6. Go to **Settings** → **Networking** → **Generate Domain**

7. Copy the URL (e.g., `frontend.up.railway.app`)

---

## Step 4: Add Custom Domain

1. In Railway frontend service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add: `vision360aisolutions.in`

4. Railway will show DNS records:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | `frontend.up.railway.app` |

5. Update DNS at your domain registrar

---

## Step 5: Create PocketBase Admin

1. Open PocketBase admin: `https://pocketbase.up.railway.app/_/`
2. Create admin account:
   - Email: `admin@vision360.ai`
   - Password: `Vision@360`

---

## Cost Breakdown

| Service | Monthly Cost | Your Usage |
|---------|-------------|------------|
| Railway | $5 free credit | ~$3-4 |
| Domain | Already purchased | ₹0 |
| **Total** | **₹0** | ✅ |

---

## Troubleshooting

### PocketBase not starting
- Check logs in Railway dashboard
- Ensure port 8090 is exposed

### Frontend can't connect to PocketBase
- Verify `NEXT_PUBLIC_PB_URL` is correct
- Check PocketBase is running in Railway logs

### Custom domain not working
- DNS propagation takes 5-10 minutes
- Ensure CNAME record points to Railway domain

---

## Alternative: One-Click Deploy

If you want the easiest option, use **Render** instead:

1. Go to **https://render.com**
2. Sign up with GitHub
3. Create **Web Service** for PocketBase
4. Create **Web Service** for Next.js
5. Add environment variables
6. Deploy

Render free tier spins down after 15 min inactivity, but wakes up on request.
