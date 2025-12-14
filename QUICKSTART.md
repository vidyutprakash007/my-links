# Quick Start Guide

## Your Supabase Configuration

Your Supabase project is already configured:
- **URL**: `https://gzvbzheryemdgrnxtozn.supabase.co`
- **API Key**: Use the anon key from your Supabase dashboard

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase-migration.sql`
5. Click **Run** to create the tables

### 3. Create Environment File

Create a `.env` file in the root directory:

```env
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6dmJ6aGVyeWVtZGdybnh0b3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODA5NjksImV4cCI6MjA4MTI1Njk2OX0.wYy8xv-H6E586Fy9grgnFSf1JBDal2lw_bVWOsSwGpI
```

Or copy from `env.example`:

```bash
cp env.example .env
```

### 4. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

### 5. Test the Application

1. Open `http://localhost:3000` in your browser
2. Enter a link name (e.g., "My Test Link")
3. Click "Generate Link"
4. Copy the generated link and open it in a new tab
5. Check the stats to see the location tracking

## Deploy to Production

See `DEPLOYMENT.md` for detailed deployment instructions to:
- Vercel (recommended)
- Railway
- Render
- DigitalOcean
- Or any Node.js hosting platform

When deploying, only set the `SUPABASE_KEY` environment variable - the URL is already configured in the code.

## Troubleshooting

### Database Connection Error
- Verify the migration SQL has been run in Supabase SQL Editor
- Check that your `SUPABASE_KEY` is correct
- Ensure RLS policies are set up (included in migration)

### Links Not Generating
- Check server logs for errors
- Verify Supabase connection in Supabase dashboard
- Test database queries in Supabase SQL Editor

