# Fix Healthcheck Failure on Railway

## ⚠️ Root Cause

The healthcheck is failing because **your server is not starting**. The server exits immediately with this error:

```
Missing Supabase credentials. Please set SUPABASE_KEY environment variable
```

When the server doesn't start, the healthcheck can never pass.

---

## ✅ Solution: Set SUPABASE_KEY Environment Variable

### Step 1: Get Your Supabase Key

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Under **"Project API keys"**, copy the **"anon public"** key
   - It starts with `eyJhbGc...`

### Step 2: Add to Railway

1. Go to [railway.app](https://railway.app) → Your Project
2. Click on your service
3. Go to **"Variables"** tab
4. Click **"+ New Variable"**
5. Add:
   - **Name**: `SUPABASE_KEY`
   - **Value**: (paste your anon key)
6. Click **"Add"**

### Step 3: Verify

Railway will automatically:
- ✅ Restart your service
- ✅ Server will start successfully
- ✅ Healthcheck will pass
- ✅ Your app will be live!

---

## 🔍 How to Check Logs

1. Railway Dashboard → Your Service
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Check the **"Logs"** tab

You should see:
- ✅ `Supabase connected successfully`
- ✅ `Server is running on http://0.0.0.0:PORT`
- ❌ No more "Missing Supabase credentials" errors

---

## 📋 Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_KEY` | **YES** | Supabase anon key (must be set!) |
| `PORT` | No | Railway sets this automatically |
| `NODE_ENV` | No | Set to `production` |

---

## 🚨 Common Issues

### Healthcheck Still Failing After Setting SUPABASE_KEY

1. **Wait a few minutes** - Railway needs time to restart
2. **Check logs** - Look for other errors
3. **Verify the key is correct** - Copy it again from Supabase
4. **Redeploy** - Sometimes a fresh deploy helps

### Server Starts But Healthcheck Fails

- Railway's healthcheck hits the `/` path
- Make sure your server responds to `GET /`
- Check that the server is listening on the PORT Railway provides

---

## ✅ After Fixing

Once `SUPABASE_KEY` is set:
- ✅ Server starts successfully
- ✅ Healthcheck passes
- ✅ Your app is accessible
- ✅ Links can be created and tracked

---

## 🆘 Still Having Issues?

1. Check Railway logs for specific errors
2. Verify Supabase project is active
3. Make sure you copied the **"anon public"** key (not service role)
4. Try redeploying the service

