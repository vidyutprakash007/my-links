# Deploy Your App (Using Supabase as Database)

## Understanding the Setup

- **Supabase**: Your database (already configured) ✅
- **Fastify App**: Your Node.js server (needs deployment) 🚀
- **Connection**: The app connects to Supabase via API

---

## Quick Deploy: Railway (Easiest - Recommended)

### Step 1: Prepare Your Code

1. **Ensure your code is on GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
   - Sign up/login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Railway will auto-detect**:
   - ✅ Node.js project
   - ✅ `package.json` found
   - ✅ `railway.json` configuration detected

3. **Add Environment Variables**:
   - Click on your service → "Variables" tab
   - Add these variables:
     ```
     SUPABASE_KEY=your_supabase_anon_key_here
     PORT=3002
     NODE_ENV=production
     ```

4. **Get Your Supabase Key**:
   - Go to [supabase.com](https://supabase.com) → Your Project
   - Settings → API
   - Copy the "anon public" key
   - Paste it as `SUPABASE_KEY` in Railway

5. **Deploy**:
   - Railway will automatically build and deploy
   - Wait for "Deploy Successful" message

6. **Get Your URL**:
   - Railway Dashboard → Your Service → Settings
   - Under "Networking" → Generate Domain
   - Copy the URL (e.g., `https://your-app.railway.app`)

### Step 3: Set Up Supabase Database

1. **Run the SQL Migration**:
   - Go to Supabase Dashboard → SQL Editor
   - Open `COMPLETE-SETUP.sql`
   - Copy all the SQL
   - Paste into SQL Editor
   - Click "Run"

2. **Verify Tables Created**:
   - Go to Table Editor
   - You should see `links` and `link_clicks` tables

### Step 4: Test Your Deployment

1. **Visit your Railway URL**: `https://your-app.railway.app`
2. **Create a test link**
3. **Click the link** - it should show "Good Morning" page
4. **Check Supabase** - go to `link_clicks` table to see the tracking data

---

## Alternative: Render (Also Easy)

### Step 1: Deploy to Render

1. **Go to [render.com](https://render.com)**
   - Sign up/login with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure**:
   - **Name**: `identity-link-tracker`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free (or paid for better performance)

3. **Environment Variables**:
   - Add:
     - `SUPABASE_KEY` = Your Supabase anon key
     - `PORT` = `10000` (Render uses port 10000)
     - `NODE_ENV` = `production`

4. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Get your URL: `https://your-app.onrender.com`

### Step 2: Set Up Supabase (Same as Railway)

- Follow Step 3 from Railway section above

---

## Alternative: Vercel (Serverless)

### Step 1: Deploy to Vercel

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
     - `NODE_ENV` = `production`

5. **Redeploy for Production**:
   ```bash
   vercel --prod
   ```

---

## Important: HTTPS Requirement

⚠️ **Your app MUST use HTTPS in production** for geolocation to work!

- ✅ Railway: Automatic HTTPS
- ✅ Render: Automatic HTTPS  
- ✅ Vercel: Automatic HTTPS
- ❌ HTTP: Geolocation will be blocked by browsers

---

## Environment Variables Checklist

Make sure these are set in your hosting platform:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `SUPABASE_KEY` | Your anon key | Supabase Dashboard → Settings → API |
| `PORT` | `3002` (or platform default) | - |
| `NODE_ENV` | `production` | - |
| `BASE_URL` | Your deployed URL | Optional, for consistent links |

---

## Post-Deployment Steps

### 1. Update BASE_URL (Optional)

If you want consistent link URLs, set `BASE_URL` environment variable:
```
BASE_URL=https://your-app.railway.app
```

### 2. Test Everything

- ✅ Create a link
- ✅ Click the link (should show "Good Morning" page)
- ✅ Allow location permission when prompted
- ✅ Check Supabase `link_clicks` table for data
- ✅ Verify latitude/longitude are recorded

### 3. Monitor

- Check platform logs for errors
- Monitor Supabase dashboard for database usage
- Test geolocation on mobile devices

---

## Troubleshooting

### "Geolocation not working"
- ✅ Ensure you're using HTTPS (not HTTP)
- ✅ Check browser console for errors
- ✅ Verify location permission was granted

### "Database connection failed"
- ✅ Verify `SUPABASE_KEY` is correct
- ✅ Check Supabase project is active
- ✅ Verify SQL migration was run

### "Links not creating"
- ✅ Check server logs
- ✅ Verify RLS policies in Supabase
- ✅ Test database connection

---

## Summary

1. **Supabase** = Database (already set up) ✅
2. **Deploy Fastify app** to Railway/Render/Vercel 🚀
3. **Set environment variables** (especially `SUPABASE_KEY`) 🔑
4. **Run SQL migration** in Supabase SQL Editor 📊
5. **Test** your deployed app 🧪

Your app will automatically connect to Supabase once deployed!

