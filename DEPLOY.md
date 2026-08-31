# V360 AI Agency — Deployment Guide

**Domain:** https://vision360aisolutions.in

---

## Option 1: VPS + Docker (Recommended)

### Prerequisites
- Ubuntu 22.04+ VPS (4GB RAM minimum)
- Docker & Docker Compose installed
- Domain pointed to VPS IP (A record)
- SSL via Cloudflare (easiest) or Certbot

### Step 1: SSH into your VPS

```bash
ssh root@YOUR_VPS_IP
```

### Step 2: Install Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

### Step 3: Clone the project

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/MarketingPilotAI.git
cd MarketingPilotAI
```

### Step 4: Create .env file

```bash
cp .env.example .env
nano .env
```

Fill in your API keys:
- `AI_API_KEY` — Your OpenRouter key
- `DEEPGRAM_API_KEY` — Your Deepgram key
- `GROQ_API_KEY` — Your Groq key
- `RUMIK_API_KEY` — Your Rumik/Vobiz key
- `SMTP_USER` / `SMTP_PASS` — Your email credentials

### Step 5: Deploy

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Step 6: Verify

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl -I http://localhost:3000    # Frontend
curl -I http://localhost:8090    # PocketBase
curl -I http://localhost:5678    # n8n
```

### Step 7: Create admin user

Open PocketBase admin:
```
http://YOUR_VPS_IP:8090/_/
```

Create admin account:
- Email: `admin@vision360.ai`
- Password: `Vision@360`

---

## Option 2: Cloudflare Tunnel (No Port Opening)

If you don't want to open ports, use Cloudflare Tunnel:

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# Create tunnel
cloudflared tunnel create v360ai

# Configure
cat > ~/.cloudflared/config.yml << EOF
tunnel: YOUR_TUNNEL_ID
credentials-file: /root/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: vision360aisolutions.in
    service: http://localhost:3000
  - hostname: pb.vision360aisolutions.in
    service: http://localhost:8090
  - hostname: n8n.vision360aisolutions.in
    service: http://localhost:5678
  - service: http_status:404
EOF

# Route DNS
cloudflared tunnel route dns v360ai vision360aisolutions.in
cloudflared tunnel route dns v360ai pb.vision360aisolutions.in
cloudflared tunnel route dns v360ai n8n.vision360aisolutions.in

# Run tunnel
cloudflared tunnel run v360ai
```

---

## Option 3: Vercel (Frontend Only)

If you want to deploy frontend to Vercel:

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the repository
4. Set root directory to `frontend`
5. Add environment variables
6. Deploy
7. Add custom domain: `vision360aisolutions.in`

**Note:** PocketBase must be hosted separately (on your VPS).

---

## DNS Configuration

Point your domain to your VPS:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_VPS_IP | Auto |
| A | pb | YOUR_VPS_IP | Auto |
| A | n8n | YOUR_VPS_IP | Auto |

Or for Cloudflare Tunnel, create CNAME records pointing to your tunnel.

---

## SSL / HTTPS

### Cloudflare (Recommended)
1. Add domain to Cloudflare
2. Set SSL mode to "Full (Strict)"
3. Enable "Always Use HTTPS"

### Certbot (Manual)
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d vision360aisolutions.in
```

---

## Updating

```bash
cd /opt/MarketingPilotAI
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Backup

```bash
# Backup PocketBase data
tar -czf pb_backup_$(date +%Y%m%d).tar.gz pocketbase/pb_data/

# Backup environment
cp .env .env.backup
```

---

## Troubleshooting

### Frontend can't connect to PocketBase
Check that `NEXT_PUBLIC_PB_URL` points to the PocketBase service:
- Docker: `http://pocketbase:8090`
- Local: `http://localhost:8090`

### Port conflicts
```bash
# Check what's using port 8090
lsof -i :8090
# Kill process if needed
kill -9 PID
```

### View logs
```bash
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f pocketbase
```

---

## Services Summary

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend | 3000 | vision360aisolutions.in | Next.js app |
| PocketBase | 8090 | pb.vision360aisolutions.in | Database |
| n8n | 5678 | n8n.vision360aisolutions.in | Automation |
