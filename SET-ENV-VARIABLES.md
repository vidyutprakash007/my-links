# How to Set Environment Variables

## ⚠️ CRITICAL: Your app needs `SUPABASE_KEY` to work!

The error `Missing Supabase credentials. Please set SUPABASE_KEY environment variable` means you need to add this in your deployment platform.

---

## 🚂 Railway

1. Go to [railway.app](https://railway.app) → Your Project
2. Click on your service
3. Go to **"Variables"** tab
4. Click **"+ New Variable"**
5. Add:
   - **Name**: `SUPABASE_KEY`
   - **Value**: Your Supabase anon key (see below)
6. Click **"Add"**
7. Railway will automatically restart your service

### Get Your Supabase Key:
- Go to [supabase.com](https://supabase.com) → Your Project
- **Settings** → **API**
- Copy the **"anon public"** key
- Paste it as the value for `SUPABASE_KEY`

---

## 🎨 Render

1. Go to [render.com](https://render.com) → Your Dashboard
2. Click on your web service
3. Go to **"Environment"** tab
4. Click **"+ Add Environment Variable"**
5. Add:
   - **Key**: `SUPABASE_KEY`
   - **Value**: Your Supabase anon key
6. Click **"Save Changes"**
7. Render will automatically redeploy

---

## ▲ Vercel

1. Go to [vercel.com](https://vercel.com) → Your Project
2. Go to **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Add:
   - **Key**: `SUPABASE_KEY`
   - **Value**: Your Supabase anon key
   - **Environment**: Production, Preview, Development (select all)
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"Redeploy"** on the latest deployment

---

## 🐳 Docker / Other Platforms

Set the environment variable when running:

```bash
docker run -e SUPABASE_KEY=your_key_here your-image
```

Or in your platform's environment variable settings.

---

## ✅ Verify It's Working

After setting the variable, check your deployment logs. You should see:
- ✅ No more "Missing Supabase credentials" errors
- ✅ "Supabase connected successfully" message
- ✅ Server starts without crashing

---

## 📋 All Required Environment Variables

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `SUPABASE_KEY` | **YES** | Supabase anon key | Supabase Dashboard → Settings → API |
| `PORT` | No | Server port (default: 3002) | - |
| `NODE_ENV` | No | Set to `production` | - |
| `BASE_URL` | No | Your domain URL | Optional |

---

## 🔑 Quick Copy: Get Your Supabase Key

1. Visit: https://supabase.com/dashboard
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Under **"Project API keys"**
5. Copy the **"anon public"** key (starts with `eyJhbGc...`)
6. Paste it as `SUPABASE_KEY` in your deployment platform

---

## ⚠️ Important Notes

- **Never commit** `.env` files to Git (already in `.gitignore`)
- The key should be the **"anon public"** key, not the service role key
- After adding the variable, your app will automatically restart/redeploy
- If it still doesn't work, check the logs for other errors

