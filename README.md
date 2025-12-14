# Identity Link Tracker

A simple Node.js application built with Fastify and Supabase (PostgreSQL) that generates trackable links and stores location details when users click on them.

## Features

- 🔗 Generate unique links based on custom names
- 📍 Track location details (IP, country, city, coordinates) when links are clicked
- 📊 View click statistics for each link
- 🎨 Modern, responsive UI
- ☁️ Deploy-ready with Supabase integration

## Prerequisites

- Node.js (v18 or higher)
- Supabase account (free tier available)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-migration.sql`
3. Click **Run** to execute the migration
4. This will create the `links` and `link_clicks` tables with proper indexes and RLS policies

### 3. Get Supabase Credentials

The Supabase URL is already configured in the code. You just need to set your API key:

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **anon key** (SUPABASE_KEY) - This is your public API key
   - The project uses the anon key which works with RLS policies
   - Your Supabase URL: `https://gzvbzheryemdgrnxtozn.supabase.co`

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_KEY=your_supabase_anon_key_here
PORT=3000
HOST=0.0.0.0
```

Or use the provided `env.example` as a template:

```bash
cp env.example .env
# The env.example already contains your Supabase URL and key
```

### 6. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Quick Deploy to Domain

**Fastest way**: Use Vercel (free, automatic SSL, 2 minutes)

```bash
npm i -g vercel
vercel login
vercel --prod
```

Then add your domain in Vercel Dashboard → Settings → Domains

See `DEPLOY-DOMAIN.md` for detailed instructions.

---

## Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Set environment variables**:
   ```bash
   vercel env add SUPABASE_KEY
   ```
   Or set it in Vercel Dashboard → Settings → Environment Variables

5. **Deploy**:
   ```bash
   vercel --prod
   ```

   Or push to GitHub and connect your repository to Vercel for automatic deployments.

6. **Add Custom Domain** (Optional):
   - Go to your project settings in Vercel dashboard
   - Navigate to **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize project**:
   ```bash
   railway init
   ```

4. **Set environment variables**:
   ```bash
   railway variables set SUPABASE_KEY=your_supabase_anon_key
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Add Custom Domain**:
   - In Railway dashboard, go to your service
   - Click on **Settings** → **Networking**
   - Add your custom domain

### Option 3: Deploy to Render

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository

2. **Create New Web Service**:
   - Select your repository
   - Use these settings:
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Environment**: Node

3. **Set Environment Variables**:
   - In the Render dashboard, go to **Environment**
   - Add:
     - `SUPABASE_KEY` (your Supabase anon key)
     - `PORT` (set to `10000` for Render)

4. **Deploy**:
   - Render will automatically deploy on push to main branch

5. **Add Custom Domain**:
   - Go to **Settings** → **Custom Domains**
   - Add your domain and configure DNS

### Option 4: Deploy to Any Node.js Hosting

The app works on any Node.js hosting platform. Just ensure:

1. Set environment variables:
   - `SUPABASE_KEY` (your Supabase anon key)
   - `PORT` (usually provided by the platform)
   - `HOST` (usually `0.0.0.0`)

2. Run `npm install` and `npm start`

## Domain Configuration

After deploying, configure your custom domain:

1. **Get your deployment URL** from your hosting platform
2. **Add DNS records**:
   - For root domain: Add A record or CNAME pointing to your deployment
   - For subdomain: Add CNAME record
3. **Configure SSL**: Most platforms (Vercel, Railway, Render) provide automatic SSL certificates
4. **Update environment** (if needed): Some platforms may require additional configuration

## Usage

1. Open your browser and navigate to your deployed URL or `http://localhost:3000`
2. Enter a name for your link in the input field
3. Click "Generate Link" to create a trackable link
4. Copy and share the generated link
5. When someone clicks the link, their location details will be automatically stored
6. View statistics by clicking the "Stats" button next to any link

## API Endpoints

- `GET /` - Home page with link generator UI
- `POST /api/links` - Create a new link
  - Body: `name=<link-name>`
- `GET /api/links` - Get all created links
- `GET /l/:slug` - Handle link click and track location
- `GET /api/links/:slug/stats` - Get click statistics for a link

## Database Schema

### Links Table
- `id` - UUID primary key
- `name` - Link name
- `slug` - Unique slug for the link
- `created_at` - Creation timestamp

### Link Clicks Table
- `id` - UUID primary key
- `link_id` - Foreign key to links table
- `ip_address` - Client IP address
- `country` - Country name
- `city` - City name
- `region` - Region/state name
- `latitude` - Latitude coordinate
- `longitude` - Longitude coordinate
- `user_agent` - Browser user agent
- `clicked_at` - Click timestamp

## Location Tracking

The application uses the free `ip-api.com` service to get location information from IP addresses. For production use, consider:

- Using a more reliable geolocation service (MaxMind GeoIP2, ipapi.co, etc.)
- Implementing rate limiting
- Adding caching for IP lookups
- Using a paid service for better accuracy and reliability

## Security Notes

- **Never commit** your `.env` file or Supabase keys to version control
- Use **service_role key** only on the server side (never expose to client)
- The service_role key bypasses Row Level Security (RLS) - use with caution
- For client-side access, use the `anon` key with proper RLS policies
- Consider adding authentication for link creation in production
- Implement rate limiting to prevent abuse
- Use HTTPS in production (most platforms provide this automatically)

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check that the migration SQL has been run successfully
- Ensure RLS policies allow the operations you need

### Deployment Issues
- Verify all environment variables are set correctly
- Check platform logs for specific error messages
- Ensure Node.js version is 18+ (check `package.json` engines)

### Location Tracking Not Working
- The free ip-api.com service has rate limits
- Check browser console and server logs for errors
- Consider upgrading to a paid geolocation service

## License

ISC
