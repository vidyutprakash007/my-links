# Deployment Guide

This guide provides step-by-step instructions for deploying the Identity Link Tracker application to various platforms.

## Quick Deploy Options

### 🚀 Vercel (Fastest - Recommended)

**Best for**: Quick deployments, automatic SSL, custom domains

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
   vercel
   ```

4. **Set Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `SUPABASE_KEY` = Your Supabase anon key

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

6. **Add Custom Domain**:
   - Vercel Dashboard → Settings → Domains
   - Add your domain
   - Configure DNS as instructed

**Pros**: Free tier, automatic HTTPS, easy custom domains, GitHub integration
**Cons**: Serverless functions have execution time limits

---

### 🚂 Railway

**Best for**: Full Node.js environment, persistent connections

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
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Add Custom Domain**:
   - Railway Dashboard → Your Service → Settings → Networking
   - Generate domain or add custom domain

**Pros**: Simple deployment, good free tier, easy environment management
**Cons**: Free tier has resource limits

---

### 🎨 Render

**Best for**: Simple deployments, automatic SSL

1. **Connect GitHub**:
   - Go to [render.com](https://render.com)
   - Sign up/login with GitHub
   - Click "New" → "Web Service"
   - Connect your repository

2. **Configure**:
   - **Name**: identity-link-tracker
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

3. **Set Environment Variables**:
   - In the dashboard, go to Environment
   - Add:
     - `SUPABASE_KEY` (your Supabase anon key)
     - `PORT` = `10000`

4. **Deploy**:
   - Click "Create Web Service"
   - Render will automatically deploy

5. **Add Custom Domain**:
   - Settings → Custom Domains
   - Add your domain

**Pros**: Free tier available, automatic deployments, easy setup
**Cons**: Free tier spins down after inactivity

---

### ☁️ DigitalOcean App Platform

**Best for**: Production apps, scalable infrastructure

1. **Create App**:
   - Go to DigitalOcean Dashboard
   - Create → Apps → GitHub
   - Select your repository

2. **Configure**:
   - **Build Command**: `npm install`
   - **Run Command**: `node server.js`

3. **Set Environment Variables**:
   - Add:
     - `SUPABASE_KEY` (your Supabase anon key)

4. **Deploy**:
   - Click "Create Resources"
   - DigitalOcean will build and deploy

5. **Add Custom Domain**:
   - Settings → Domains
   - Add your domain

**Pros**: Production-ready, scalable, good performance
**Cons**: Paid service (starts at $5/month)

---

### 🐳 Docker Deployment

For deploying to any Docker-compatible platform:

1. **Create Dockerfile** (if not exists):
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Build**:
   ```bash
   docker build -t identity-link-tracker .
   ```

3. **Run**:
   ```bash
   docker run -p 3000:3000 \
     -e SUPABASE_KEY=your_supabase_anon_key \
     identity-link-tracker
   ```

---

## Pre-Deployment Checklist

- [ ] Supabase project created and database schema migrated
- [ ] Environment variables configured
- [ ] `.env` file added to `.gitignore` (never commit secrets!)
- [ ] Tested locally with `npm start`
- [ ] All dependencies listed in `package.json`

## Post-Deployment Steps

1. **Test the deployment**:
   - Visit your deployed URL
   - Create a test link
   - Click the link to verify tracking works

2. **Configure Custom Domain** (if needed):
   - Add DNS records as instructed by your platform
   - Wait for DNS propagation (can take up to 48 hours)
   - SSL certificate will be automatically provisioned

3. **Monitor**:
   - Check platform logs for any errors
   - Monitor Supabase dashboard for database usage
   - Set up alerts if available

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_KEY` | Yes | Your Supabase anon key | `eyJhbGc...` |
| `PORT` | No | Server port (default: 3000) | `3000` |
| `HOST` | No | Server host (default: 0.0.0.0) | `0.0.0.0` |

**Note**: The Supabase URL (`https://gzvbzheryemdgrnxtozn.supabase.co`) is already configured in the code.

## Troubleshooting

### Deployment Fails
- Check build logs for errors
- Verify all environment variables are set
- Ensure Node.js version is 18+

### Database Connection Errors
- Verify Supabase credentials are correct
- Check that migration SQL has been executed
- Verify RLS policies allow operations

### Links Not Generating
- Check server logs for errors
- Verify Supabase connection
- Test database queries in Supabase SQL Editor

### Location Tracking Not Working
- Check ip-api.com rate limits
- Verify network requests aren't blocked
- Check server logs for API errors

## Support

For platform-specific issues:
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

