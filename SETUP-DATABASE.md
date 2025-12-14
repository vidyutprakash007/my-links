# Database Setup Instructions

## Error: "Could not find the table 'public.links' in the schema cache"

This error means the database tables haven't been created yet. Follow these steps:

## Step-by-Step Setup

### 1. Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Sign in to your account
- Select your project: `gzvbzheryemdgrnxtozn`

### 2. Open SQL Editor
- Click on **SQL Editor** in the left sidebar
- Click **New Query** button

### 3. Run the Migration
- Copy the **entire contents** of `supabase-migration.sql`
- Paste it into the SQL Editor
- Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### 4. Verify Tables Created
- Go to **Table Editor** in the left sidebar
- You should see two tables:
  - `links`
  - `link_clicks`

### 5. Restart Your Server
- Stop your server (Ctrl+C)
- Run `npm start` again
- Try creating a link - it should work now!

## What the Migration Does

The migration creates:
- ✅ `links` table - stores your generated links
- ✅ `link_clicks` table - stores tracking data (IP, latitude, longitude, etc.)
- ✅ Indexes for faster queries
- ✅ RLS policies to allow public access

## Troubleshooting

If you still get errors after running the migration:

1. **Check if tables exist:**
   - Go to Table Editor
   - Verify you see `links` and `link_clicks` tables

2. **Check RLS policies:**
   - Go to Authentication → Policies
   - Make sure policies exist for both tables

3. **Run the fix script:**
   - If you get permission errors, run `fix-rls-policies.sql` in SQL Editor

4. **Verify your API key:**
   - Make sure your `.env` file has the correct `SUPABASE_KEY`
   - You can use either the `anon` key or `service_role` key

