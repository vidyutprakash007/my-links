# Deploy to Custom Domain Guide

This guide shows you how to deploy the Link Tracker application to your own domain with all APIs working on the same domain.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `SUPABASE_KEY` = Your Supabase anon key
   - Add: `BASE_URL` = `https://yourdomain.com` (optional, will auto-detect)

5. **Add Custom Domain**:
   - Go to Vercel Dashboard → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `tracker.yourdomain.com` or `yourdomain.com`)
   - Follow DNS configuration instructions
   - SSL certificate is automatically provisioned

6. **Verify**:
   - Visit your domain
   - All APIs will work on the same domain automatically

---

### Option 2: Railway

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize**:
   ```bash
   railway init
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set SUPABASE_KEY=your_supabase_anon_key
   railway variables set BASE_URL=https://yourdomain.com
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Add Custom Domain**:
   - Railway Dashboard → Your Service → Settings → Networking
   - Click "Generate Domain" or "Add Custom Domain"
   - Configure DNS as instructed

---

### Option 3: Render

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository

2. **Create Web Service**:
   - Select your repository
   - Settings:
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Environment**: Node

3. **Set Environment Variables**:
   - `SUPABASE_KEY` = Your Supabase anon key
   - `PORT` = `10000`
   - `BASE_URL` = `https://yourdomain.com` (optional)

4. **Add Custom Domain**:
   - Settings → Custom Domains
   - Add your domain
   - Configure DNS

---

## Domain Configuration

### DNS Setup

#### For Root Domain (yourdomain.com):
```
Type: A
Name: @
Value: [Your platform's IP address]
```

Or use CNAME if platform supports it:
```
Type: CNAME
Name: @
Value: [Your platform's CNAME]
```

#### For Subdomain (tracker.yourdomain.com):
```
Type: CNAME
Name: tracker
Value: [Your platform's CNAME]
```

### SSL Certificate

Most platforms provide automatic SSL:
- **Vercel**: Automatic SSL with Let's Encrypt
- **Railway**: Automatic SSL
- **Render**: Automatic SSL

Wait 5-15 minutes after adding domain for SSL to provision.

---

## Environment Variables

### Required:
- `SUPABASE_KEY` - Your Supabase anon key

### Optional:
- `BASE_URL` - Your domain URL (e.g., `https://yourdomain.com`)
  - If not set, will auto-detect from request headers
  - Recommended to set for consistency
- `PORT` - Server port (usually auto-set by platform)
- `NODE_ENV` - Set to `production` for production

---

## Verify Deployment

1. **Check Domain**:
   - Visit `https://yourdomain.com`
   - Should see the Link Tracker interface

2. **Test API**:
   - Open browser console (F12)
   - Generate a link
   - Check Network tab - all requests should go to your domain

3. **Test Link**:
   - Generate a link
   - Click it
   - Should work and track location
   - All API calls should use your domain

---

## Troubleshooting

### APIs not working on domain:
- Check `BASE_URL` environment variable
- Verify DNS is properly configured
- Check SSL certificate is active
- Look at browser console for CORS errors

### Links showing wrong domain:
- Set `BASE_URL` environment variable explicitly
- Clear browser cache
- Check server logs for URL generation

### SSL not working:
- Wait 15-30 minutes for certificate provisioning
- Check DNS propagation (can take up to 48 hours)
- Verify DNS records are correct

---

## Production Checklist

- [ ] Domain added to hosting platform
- [ ] DNS records configured
- [ ] SSL certificate active (padlock icon)
- [ ] Environment variables set
- [ ] `BASE_URL` set (optional but recommended)
- [ ] Test link generation works
- [ ] Test link clicking works
- [ ] Test location tracking works
- [ ] All APIs working on same domain

