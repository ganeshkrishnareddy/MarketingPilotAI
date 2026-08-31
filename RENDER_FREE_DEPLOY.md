# 🆓 Render.com FREE Deployment (No Credit Card!)

Render has a **free tier** that runs PocketBase + Next.js **without any payment**.

---

## Why Render?

| Feature | Free Tier |
|---------|-----------|
| Credit card required | ❌ **NO** |
| PocketBase hosting | ✅ Yes |
| Next.js hosting | ✅ Yes |
| Custom domain | ✅ Yes |
| SSL | ✅ Automatic |
| Bandwidth | 100GB/month |
| **Cost** | **₹0 FOREVER** |

---

## Step 1: Create Render Account

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (no credit card needed!)

---

## Step 2: Push Code to GitHub

```bash
cd /d/MarketingPilotAI
git init
git add .
git commit -m "V360 AI Agency"
git remote add origin https://github.com/YOUR_USERNAME/MarketingPilotAI.git
git push -u origin main
```

---

## Step 3: Deploy PocketBase (Database)

1. In Render Dashboard → **"New +"** → **"Web Service"**

2. Connect your GitHub repository

3. Configure:
   - **Name**: `vision360-pocketbase`
   - **Region**: Singapore (or closest to India)
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile.pocketbase`

4. Click **"Create Web Service"**

5. Wait for deployment (2-3 minutes)

6. Go to **"Settings"** → **"Info"**

7. Copy your PocketBase URL (e.g., `https://vision360-pocketbase.onrender.com`)

---

## Step 4: Create PocketBase Admin

1. Open: `https://vision360-pocketbase.onrender.com/_/`

2. Create admin account:
   - Email: `admin@vision360.ai`
   - Password: `Vision@360`

3. Create collections (the app will create them automatically on first use)

---

## Step 5: Deploy Next.js Frontend

1. In Render Dashboard → **"New +"** → **"Web Service"**

2. Connect same GitHub repository

3. Configure:
   - **Name**: `vision360-frontend`
   - **Region**: Singapore
   - **Runtime**: Node
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`

4. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_PB_URL` | `https://vision360-pocketbase.onrender.com` |
| `AI_API_KEY` | Your OpenRouter key |
| `META_ACCESS_TOKEN` | Your WhatsApp token |
| `META_PHONE_NUMBER_ID` | `1206627179205677` |
| `META_VERIFY_TOKEN` | `vision360_secure_token` |
| `POCKETBASE_ADMIN_EMAIL` | `admin@vision360.ai` |
| `POCKETBASE_ADMIN_PASSWORD` | `Vision@360` |

5. Click **"Create Web Service"**

6. Wait for deployment (5-10 minutes)

7. Copy your frontend URL (e.g., `https://vision360-frontend.onrender.com`)

---

## Step 6: Add Custom Domain

1. In **vision360-frontend** service → **"Settings"** → **"Custom Domains"**

2. Click **"Add Custom Domain"**

3. Enter: `vision360aisolutions.in`

4. Render will show DNS records to add:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | `vision360-frontend.onrender.com` |

5. Go to your domain registrar and update DNS

6. Wait 5-10 minutes for SSL to activate

---

## Step 7: Test Your App

1. Open: `https://vision360aisolutions.in`

2. Login with:
   - Email: `admin@vision360.ai`
   - Password: `Vision@360`

3. Test all features!

---

## Important Notes

### Free Tier Limitations

| Limit | Value | Impact |
|-------|-------|--------|
| Spin down after inactivity | 15 minutes | First request after sleep takes 30-60s |
| Monthly bandwidth | 100GB | Enough for small apps |
| Build minutes | 500/month | Plenty |
| **No credit card** | ✅ | **Truly free!** |

### To Avoid Spin Down

Render free tier spins down after 15 minutes of inactivity. To keep it always on:

1. Use **UptimeRobot** (free) to ping your app every 5 minutes
2. Go to https://uptimerobot.com
3. Add monitor: HTTP(s) → `https://vision360aisolutions.in`
4. This keeps your app awake!

---

## Cost Summary

| Service | Platform | Monthly Cost |
|---------|----------|-------------|
| Frontend | Render Free | ₹0 |
| Database | Render Free | ₹0 |
| Domain | Already purchased | ₹0 |
| SSL | Automatic | ₹0 |
| **Total** | | **₹0 FOREVER** |

---

## Files Created

| File | Purpose |
|------|---------|
| `RENDER_FREE_DEPLOY.md` | This guide |
| `Dockerfile.pocketbase` | PocketBase Docker config |

---

## Troubleshooting

### App is sleeping (slow first load)
- Normal for free tier
- Use UptimeRobot to keep it awake

### Build fails
- Check Render logs
- Ensure all dependencies are in package.json

### Can't connect to PocketBase
- Verify `NEXT_PUBLIC_PB_URL` is correct
- Check PocketBase service is running

### Custom domain not working
- DNS propagation takes 5-10 minutes
- Ensure CNAME record is correct
