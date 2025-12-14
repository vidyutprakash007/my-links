# Quick Domain Deployment Guide

Deploy your Link Tracker to your own domain with all APIs on the same domain.

## 🚀 Fastest: Vercel (5 minutes)

### Step 1: Deploy
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Step 2: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- `SUPABASE_KEY` = Your Supabase anon key

### Step 3: Add Custom Domain
1. Vercel Dashboard → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `tracker.yourdomain.com`)
4. Follow DNS instructions
5. Wait 2-5 minutes for SSL

### Step 4: Done! ✅
Visit your domain - all APIs work automatically on the same domain.

---

## 🚂 Railway (Alternative)

```bash
npm i -g @railway/cli
railway login
railway init
railway variables set SUPABASE_KEY=your_key
railway up
```

Then add domain in Railway Dashboard → Settings → Networking

---

## 📋 Environment Variables

**Required:**
- `SUPABASE_KEY` - Your Supabase anon key

**Optional (auto-detected if not set):**
- `BASE_URL` - Your domain URL (e.g., `https://yourdomain.com`)
- `NODE_ENV` - Set to `production`

---

## ✅ Verification

After deployment, verify:
1. ✅ Visit your domain - see the app
2. ✅ Generate a link - works
3. ✅ Click the link - tracks location
4. ✅ Check Network tab - all APIs use your domain
5. ✅ SSL certificate active (padlock icon)

---

## 🔧 DNS Configuration

### For Subdomain (tracker.yourdomain.com):
```
Type: CNAME
Name: tracker
Value: [Platform's CNAME]
```

### For Root Domain (yourdomain.com):
Check your platform's instructions - usually A record or CNAME.

---

## 📝 Notes

- All API calls use relative paths (`/api/links`) so they automatically work on your domain
- SSL is automatic on Vercel, Railway, Render
- No CORS issues since everything is on the same domain
- Links generated will use your domain automatically

