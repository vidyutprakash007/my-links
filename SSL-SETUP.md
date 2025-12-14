# SSL/HTTPS Setup Guide

This guide shows you how to set up SSL/HTTPS for your Link Tracker application.

## Option 1: Automatic SSL (Recommended - Easiest)

### Deploy to Platforms with Free SSL

These platforms provide automatic SSL certificates:

#### **Vercel** (Recommended)
- Free SSL included
- Automatic HTTPS
- Custom domain support
- **Steps:**
  1. Deploy to Vercel: `vercel --prod`
  2. Add custom domain in Vercel dashboard
  3. SSL is automatically configured

#### **Railway**
- Free SSL included
- Automatic HTTPS
- **Steps:**
  1. Deploy to Railway: `railway up`
  2. Add custom domain in Railway dashboard
  3. SSL is automatically configured

#### **Render**
- Free SSL included
- Automatic HTTPS
- **Steps:**
  1. Deploy to Render
  2. Add custom domain in Render dashboard
  3. SSL is automatically configured

---

## Option 2: Manual SSL with Let's Encrypt (For VPS/Dedicated Server)

### Prerequisites
- Domain name pointing to your server
- Server with root access
- Ports 80 and 443 open

### Step 1: Install Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot

# CentOS/RHEL
sudo yum install certbot
```

### Step 2: Install Nginx (Reverse Proxy)

```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/link-tracker`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/link-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Get SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will:
- Automatically configure SSL
- Set up auto-renewal
- Redirect HTTP to HTTPS

### Step 5: Update Environment Variables

In your `.env` file or server environment:
```env
PORT=3002
HOST=127.0.0.1  # Only listen on localhost (Nginx handles external traffic)
```

### Step 6: Auto-Renewal

Certbot sets up auto-renewal automatically. Test it:
```bash
sudo certbot renew --dry-run
```

---

## Option 3: Cloudflare (Free SSL Proxy)

### Steps:
1. Sign up at [Cloudflare](https://cloudflare.com)
2. Add your domain
3. Update DNS nameservers to Cloudflare
4. Enable "Flexible SSL" or "Full SSL"
5. Cloudflare provides free SSL automatically

**Note:** With Flexible SSL, traffic between Cloudflare and your server is HTTP. For Full SSL, you need a certificate on your server.

---

## Option 4: Use Fastify with HTTPS Directly

### Generate Self-Signed Certificate (Development Only)

```bash
# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate
openssl req -new -x509 -key key.pem -out cert.pem -days 365
```

### Update server.js

```javascript
const fastify = require('fastify')({
  logger: true,
  https: {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
  }
});
```

**Warning:** Self-signed certificates show security warnings. Only use for development.

---

## Verify SSL is Working

1. Visit your site: `https://yourdomain.com`
2. Check for padlock icon in browser
3. Test SSL: https://www.ssllabs.com/ssltest/

---

## Important Notes

- **Production:** Always use HTTPS for security
- **Location Tracking:** Works better with HTTPS (browsers trust geolocation more)
- **Email Links:** HTTPS links look more trustworthy
- **Auto-renewal:** Set up certificate auto-renewal for production

---

## Troubleshooting

### Certificate Not Working
- Check DNS points to your server
- Verify ports 80 and 443 are open
- Check firewall settings

### Mixed Content Warnings
- Ensure all resources (CSS, JS, images) use HTTPS
- Update any HTTP links to HTTPS

### Certificate Expired
- Check renewal: `sudo certbot renew`
- Verify cron job is running: `sudo systemctl status certbot.timer`

