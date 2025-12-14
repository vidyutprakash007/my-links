// Load environment variables from .env file
require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const CryptoJS = require('crypto-js');

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://gzvbzheryemdgrnxtozn.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Encryption/Decryption Secret Key (must match client-side)
const SECRET_KEY = "1d2359a2556c5e2ebd17fc49bf51c43106f1172f44a4a257517e389fc3255ff1";

// Decrypt payload function
function decryptPayload(encryptedData) {
  try {
    // Split IV and encrypted data (format: IV_in_Hex : EncryptedData_in_Base64)
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }

    const ivHex = parts[0];
    const encryptedBase64 = parts[1];

    // Convert IV from hex string to WordArray
    const iv = CryptoJS.enc.Hex.parse(ivHex);

    // Decrypt using AES-256-CBC
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    // Convert decrypted data to string and parse as JSON
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    fastify.log.error('Decryption error:', error);
    throw new Error('Failed to decrypt payload');
  }
}

// Register plugins
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});

fastify.register(require('@fastify/formbody'));

// Simple in-memory session store
const sessions = new Map();

// Authentication helper function
function checkAuth(request) {
  const sessionId = request.cookies.sessionId;
  
  if (!sessionId || !sessions.has(sessionId)) {
    return null;
  }
  
  const session = sessions.get(sessionId);
  if (session.expires < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session.user;
}

// Helper function to escape HTML (prevent XSS)
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Helper function to get client IP
function getClientIP(request) {
  // Check various headers for real IP (important when behind proxy/load balancer)
  const forwardedFor = request.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one (original client)
    const ip = forwardedFor.split(',')[0].trim();
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      return ip;
    }
  }
  
  const realIP = request.headers['x-real-ip'];
  if (realIP && realIP !== '127.0.0.1' && realIP !== '::1') {
    return realIP;
  }
  
  const cfConnectingIP = request.headers['cf-connecting-ip']; // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to request IP
  const ip = request.ip || request.socket.remoteAddress;
  return ip;
}

// Helper function to get location from IP
async function getLocationFromIP(ip) {
  // Skip geolocation for localhost/private IPs
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    fastify.log.warn(`Skipping geolocation for local/private IP: ${ip}`);
    return {
      country: 'Local/Private IP',
      city: 'Not Available',
      region: 'Not Available',
      latitude: null,
      longitude: null,
    };
  }

  try {
    // Use HTTPS and free ip-api.com service
    const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,message,country,city,regionName,lat,lon`, {
      headers: {
        'User-Agent': 'LinkTracker/1.0'
      },
      timeout: 5000 // 5 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        fastify.log.info(`Location found for IP ${ip}: ${data.city}, ${data.country}`);
        return {
          country: data.country || null,
          city: data.city || null,
          region: data.regionName || null,
          latitude: data.lat || null,
          longitude: data.lon || null,
        };
      } else {
        fastify.log.warn(`IP API returned error for ${ip}: ${data.message || 'Unknown error'}`);
      }
    } else {
      fastify.log.warn(`IP API request failed with status ${response.status} for IP ${ip}`);
    }
  } catch (error) {
    fastify.log.error(`Error fetching location for IP ${ip}:`, error.message);
  }

  // Return null values if location couldn't be determined
  return {
    country: null,
    city: null,
    region: null,
    latitude: null,
    longitude: null,
  };
}

// Route: Login page
fastify.get('/login', async (request, reply) => {
  // If already logged in, redirect to home
  const sessionId = request.cookies.sessionId;
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId);
    if (session.expires > Date.now()) {
      return reply.redirect('/');
    }
  }
  
  reply.type('text/html');
  return reply.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
    </head>
    <body style="margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div style="margin: 0; padding: 3rem; box-sizing: border-box; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); max-width: 400px; width: 90%;">
        <h1 style="margin: 0 0 30px 0; padding: 0; box-sizing: border-box; color: #333; font-size: 28px; font-weight: 600; text-align: center;">Login</h1>
        <form method="POST" action="/login" style="margin: 0; padding: 0; box-sizing: border-box;">
          <div style="margin: 0 0 20px 0; padding: 0; box-sizing: border-box;">
            <input type="text" name="username" placeholder="Username" required autofocus style="margin: 0; padding: 15px; box-sizing: border-box; width: 100%; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; transition: all 0.3s;" onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)'" onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'">
          </div>
          <div style="margin: 0 0 20px 0; padding: 0; box-sizing: border-box;">
            <input type="password" name="password" placeholder="Password" required style="margin: 0; padding: 15px; box-sizing: border-box; width: 100%; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; transition: all 0.3s;" onfocus="this.style.borderColor='#667eea'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)'" onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'">
          </div>
          <button type="submit" style="margin: 0; padding: 15px; box-sizing: border-box; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">Login</button>
        </form>
        ${request.query.error ? `<p style="margin: 20px 0 0 0; padding: 0; box-sizing: border-box; color: #dc3545; font-size: 14px; text-align: center;">${escapeHtml(request.query.error)}</p>` : ''}
      </div>
    </body>
    </html>
  `);
});

// Route: Login POST
fastify.post('/login', async (request, reply) => {
  const { username, password } = request.body;
  
  if (!username || !password) {
    return reply.redirect('/login?error=Username and password are required');
  }
  
  try {
    // Check user in database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password')
      .eq('username', username)
      .single();
    
    if (error || !user) {
      return reply.redirect('/login?error=Invalid username or password');
    }
    
    // Simple password comparison (in production, use bcrypt)
    if (user.password !== password) {
      return reply.redirect('/login?error=Invalid username or password');
    }
    
    // Create session
    const sessionId = require('crypto').randomBytes(32).toString('hex');
    const expires = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    
    sessions.set(sessionId, {
      user: { id: user.id, username: user.username },
      expires: expires
    });
    
    // Set cookie
    reply.setCookie('sessionId', sessionId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    return reply.redirect('/');
  } catch (error) {
    fastify.log.error('Login error:', error);
    return reply.redirect('/login?error=Login failed. Please try again.');
  }
});

// Route: Logout
fastify.get('/logout', async (request, reply) => {
  const sessionId = request.cookies.sessionId;
  if (sessionId) {
    sessions.delete(sessionId);
  }
  reply.clearCookie('sessionId');
  return reply.redirect('/login');
});

// Route: Home page (protected)
fastify.get('/', async (request, reply) => {
  const user = checkAuth(request);
  if (!user) {
    return reply.redirect('/login');
  }
  return reply.sendFile('index.html');
});

// Route: Create a new link
fastify.post('/api/links', async (request, reply) => {
  const user = checkAuth(request);
  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized. Please login.' });
  }
  
  try {
    const { name } = request.body;
    
    if (!name || name.trim() === '') {
      return reply.status(400).send({ error: 'Name is required' });
    }

    // Generate a unique slug from the name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);

    const { data, error } = await supabase
      .from('links')
      .insert({ name: name.trim(), slug })
      .select('id, slug')
      .single();

    if (error) {
      throw error;
    }

    const link = data;
    // Get the full URL from the request - use environment variable or detect from headers
    let baseUrl = process.env.BASE_URL;
    
    if (!baseUrl) {
      // Auto-detect from request headers (works with proxies/load balancers)
      let protocol = request.headers['x-forwarded-proto'] || (request.secure ? 'https' : 'http');
      
      // Force HTTPS in production (if not localhost)
      const isLocalhost = request.hostname === 'localhost' || request.hostname === '127.0.0.1';
      if (!isLocalhost && process.env.NODE_ENV === 'production') {
        protocol = 'https';
      }
      
      const host = request.headers['x-forwarded-host'] || request.headers.host || `${request.hostname || 'localhost'}:${request.socket?.localPort || 3000}`;
      
      // Ensure we have a proper host (include port if not standard)
      if (host.includes(':')) {
        // Host already includes port
        baseUrl = `${protocol}://${host}`;
      } else {
        const port = request.socket?.localPort || process.env.PORT || 3000;
        // Don't include port for standard HTTPS (443) or HTTP (80)
        if ((protocol === 'https' && port === 443) || (protocol === 'http' && port === 80)) {
          baseUrl = `${protocol}://${host}`;
        } else {
          // Only include port for non-standard ports and localhost
          if (isLocalhost) {
            baseUrl = `${protocol}://${host}:${port}`;
          } else {
            baseUrl = `${protocol}://${host}`;
          }
        }
      }
    }
    
    // Ensure baseUrl doesn't end with slash
    baseUrl = baseUrl.replace(/\/+$/, '');
    
    const linkUrl = `${baseUrl}/l/${link.slug}`;
    fastify.log.info('Generated link URL:', linkUrl);

    return reply.send({
      success: true,
      link: {
        id: link.id,
        name: name.trim(),
        slug: link.slug,
        url: linkUrl,
      },
    });
  } catch (error) {
    fastify.log.error('Error creating link:', error);
    
    // Check for specific error codes
    if (error.code === '23505') { // Unique violation
      return reply.status(409).send({ error: 'Link with this name already exists' });
    }
    
    // Check for RLS/permission errors
    if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('RLS')) {
      return reply.status(500).send({ 
        error: 'Permission denied. Check RLS policies in Supabase.',
        details: error.message,
        hint: 'Make sure the RLS policies allow INSERT operations for the anon role.'
      });
    }
    
    // Check if table doesn't exist
    if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
      return reply.status(500).send({ 
        error: 'Database tables not found. Please run the migration SQL in Supabase SQL Editor.',
        details: error.message 
      });
    }
    
    return reply.status(500).send({ 
      error: 'Failed to create link',
      details: error.message || JSON.stringify(error),
      code: error.code
    });
  }
});

// Route: Handle link click and track location
fastify.get('/l/:slug', async (request, reply) => {
  try {
    const { slug } = request.params;

    // Find the link
    const { data: linkData, error: linkError } = await supabase
      .from('links')
      .select('id, name, slug')
      .eq('slug', slug)
      .single();
    
    if (linkError || !linkData) {
      reply.type('text/html');
      return reply.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Not Found</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>404 - Link Not Found</h1>
              <p>The link you're looking for doesn't exist.</p>
            </div>
          </body>
        </html>
      `);
    }

    const link = linkData;
    const clientIP = getClientIP(request);
    const userAgent = request.headers['user-agent'] || '';

    // Get location details
    const location = await getLocationFromIP(clientIP);

    // Store the initial click with IP-based location (will be updated by client-side geolocation)
    const { data: clickData, error: clickError } = await supabase
      .from('link_clicks')
      .insert({
        link_id: link.id,
        ip_address: clientIP,
        country: location.country,
        city: location.city,
        region: location.region,
        latitude: location.latitude,
        longitude: location.longitude,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (clickError) {
      fastify.log.error('Error storing click:', clickError);
      // Still continue - we'll try to find the record later
    }

    const clickId = clickData?.id || '';
    
    if (!clickId) {
      fastify.log.warn('No click ID returned from insert - will find by link_id later');
    } else {
      fastify.log.info(`Click record created with ID: ${clickId}`);
    }

    // Show "Good Morning" page immediately - tracking happens silently in background
    reply.type('text/html');
    return reply.send(`
      <!DOCTYPE html>
      <html lang="en" style="margin: 0; padding: 0; box-sizing: border-box;">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Good Morning</title>
        </head>
        <body style="margin: 0; padding: 20px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="margin: 0; padding: 3rem; box-sizing: border-box; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; max-width: 500px; width: 100%; animation: slideUp 0.5s ease;">
            <div id="imageContainer" style="margin: 0 auto 30px; padding: 0; box-sizing: border-box; width: 100%; max-width: 400px; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: none;">
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PGNpcmNsZSBjeD0iMjUiIGN5PSIxMCIgcj0iMTAiIGZpbGw9InBpbmsiIC8+PGNpcmNsZSBjeD0iNDAiIGN5PSIyNSIgcj0iMTAiIGZpbGw9InBpbmsiIC8+PGNpcmNsZSBjeD0iMjUiIGN5PSI0MCIgcj0iMTAiIGZpbGw9InBpbmsiIC8+PGNpcmNsZSBjeD0iMTAiIGN5PSIyNSIgcj0iMTAiIGZpbGw9InBpbmsiIC8+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMTAiIGZpbGw9InllbGxvdyIgLz48L3N2Zz4=" alt="Good Morning" style="margin: 0; padding: 0; box-sizing: border-box; width: 100%; height: 300px; object-fit: contain; display: block; background: #f8f9fa;">
            </div>
            <div id="loadingMessage" style="margin: 0 auto 30px; padding: 20px; box-sizing: border-box; color: #666; font-size: 16px;">
              Please allow location access to view content...
            </div>
            <h1 style="margin: 0 0 20px 0; padding: 0; box-sizing: border-box; color: #333; font-size: 36px; font-weight: 600;">Good Morning</h1>
          </div>
          <style>
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"></script>
          <script>
            // Immediately execute script when page loads
            (function() {
              console.log('=== SCRIPT TAG LOADED AND EXECUTING ===');
              
              try {
                // Safely embed values using JSON.stringify to prevent injection
                const linkId = ${JSON.stringify(link.id)};
                const clickId = ${clickId ? JSON.stringify(clickId) : 'null'};
                const slug = ${JSON.stringify(link.slug)};
                
                // Convert string 'null' to actual null if needed
                const actualClickId = clickId === 'null' ? null : clickId;
                
                console.log('Variables loaded:', { linkId, clickId: actualClickId, slug });
                
                // Encryption configuration
                const SECRET_KEY = "1d2359a2556c5e2ebd17fc49bf51c43106f1172f44a4a257517e389fc3255ff1";
                
                // Encryption function
                function encryptPayload(payload) {
                  // Convert payload to string
                  const dataString = JSON.stringify(payload);

                  // Generate a random Initialization Vector (IV) for randomness
                  const iv = CryptoJS.lib.WordArray.random(16);

                  // Encrypt using AES-256-CBC
                  const encrypted = CryptoJS.AES.encrypt(dataString, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                  });

                  // Return the IV and Ciphertext concatenated
                  // Format: IV_in_Hex : EncryptedData_in_Base64
                  return iv.toString() + ':' + encrypted.toString();
                }
              
              if (!slug || slug === 'undefined' || slug === '') {
                console.error('Slug is missing or invalid:', slug);
                throw new Error('Invalid slug');
              }
              
              function sendLocationData(latitude, longitude, accuracy) {
                console.log('=== sendLocationData CALLED ===');
                console.log('Parameters:', { latitude, longitude, accuracy });
                
                try {
                  if (latitude === null || longitude === null || latitude === undefined || longitude === undefined) {
                    console.warn('❌ Invalid coordinates - skipping POST request');
                    console.warn('Latitude:', latitude, 'Longitude:', longitude);
                    return;
                  }

                  const latNum = parseFloat(latitude);
                  const lngNum = parseFloat(longitude);
                  
                  console.log('Parsed coordinates:', { latNum, lngNum });
                  
                  if (isNaN(latNum) || isNaN(lngNum)) {
                    console.warn('❌ Coordinates are not numbers - skipping POST request');
                    return;
                  }

                  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
                    console.warn('❌ Coordinates out of range - skipping POST request');
                    return;
                  }

                  const locationData = {
                    link_id: linkId,
                    click_id: actualClickId,
                    latitude: latNum,
                    longitude: lngNum,
                    accuracy: accuracy ? parseFloat(accuracy) : null,
                    timestamp: new Date().toISOString(),
                    slug: slug
                  };

                  // Encrypt the payload
                  const encryptedPayload = encryptPayload(locationData);
                  
                  const url = '/api/chromelc';
                  
                  console.log('=== SENDING POST REQUEST ===');
                  console.log('URL:', url);
                  console.log('Method: POST');
                  console.log('Headers:', { 'Content-Type': 'application/json' });
                  console.log('Original data:', JSON.stringify(locationData, null, 2));
                  console.log('Encrypted payload:', encryptedPayload.substring(0, 100) + '...');

                  // Make the fetch request with encrypted payload
                  const fetchPromise = fetch(url, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ encrypted: encryptedPayload })
                  });
                  
                  console.log('Fetch promise created, waiting for response...');
                  
                  fetchPromise
                  .then(response => {
                    console.log('=== FETCH RESPONSE RECEIVED ===');
                    console.log('Response status:', response.status);
                    console.log('Response statusText:', response.statusText);
                    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
                    
                    if (!response.ok) {
                      throw new Error('HTTP ' + response.status);
                    }
                    return response.json();
                  })
                  .then(data => {
                    console.log('=== POST REQUEST SUCCESS ===');
                    console.log('Response data:', data);
                    console.log('Location sent successfully to server');
                  })
                  .catch(error => {
                    console.error('=== POST REQUEST ERROR ===');
                    console.error('Error type:', error.name);
                    console.error('Error message:', error.message);
                    console.error('Full error:', error);
                  });
                  
                  return fetchPromise;
                } catch (err) {
                  console.error('=== EXCEPTION IN sendLocationData ===');
                  console.error('Error:', err);
                  console.error('Stack:', err.stack);
                }
              }
              
              // Test function to manually trigger POST request (for debugging)
              window.testLocationPost = function(testLat, testLng) {
                console.log('🧪 TEST: Manually calling sendLocationData');
                sendLocationData(testLat || 40.7128, testLng || -74.0060, 10);
              };
              console.log('💡 Test function available: window.testLocationPost(lat, lng)');

              // Request geolocation with retry mechanism
              if (typeof navigator !== 'undefined' && navigator.geolocation) {
                let locationRequested = false;
                
                let retryCount = 0;
                const maxRetries = 3;
                
                function requestLocation(useHighAccuracy, timeout, isRetry) {
                  if (isRetry) {
                    console.log('=== RETRYING GEOLOCATION (Attempt ' + (retryCount + 1) + '/' + maxRetries + ') ===');
                  } else {
                    console.log('=== REQUESTING GEOLOCATION ===');
                  }
                  console.log('Settings:', { useHighAccuracy, timeout, maximumAge: 300000 });
                  
                  locationRequested = true;
                  const requestStartTime = Date.now();
                  
                  console.log('Calling navigator.geolocation.getCurrentPosition()...');
                  
                  try {
                    navigator.geolocation.getCurrentPosition(
                      function(position) {
                        const elapsed = Date.now() - requestStartTime;
                        console.log('=== GEOLOCATION SUCCESS (after ' + elapsed + 'ms) ===');
                        console.log('Position object:', position);
                        console.log('Coords object:', position.coords);
                        
                        // Show the image when location permission is granted
                        const imageContainer = document.getElementById('imageContainer');
                        const loadingMessage = document.getElementById('loadingMessage');
                        if (imageContainer) {
                          imageContainer.style.display = 'block';
                          imageContainer.style.animation = 'slideUp 0.5s ease';
                        }
                        if (loadingMessage) {
                          loadingMessage.style.display = 'none';
                        }
                        
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        const accuracy = position.coords.accuracy;
                        
                        // Log coordinates prominently
                        console.log('📍 LATITUDE:', latitude);
                        console.log('📍 LONGITUDE:', longitude);
                        console.log('📍 ACCURACY:', accuracy, 'meters');
                        console.log('📍 Full coordinates:', { latitude, longitude, accuracy });
                        
                        console.log('🔵 Checking if coordinates are valid...');
                        console.log('🔵 Latitude type:', typeof latitude, 'Value:', latitude, 'IsNaN:', isNaN(latitude));
                        console.log('🔵 Longitude type:', typeof longitude, 'Value:', longitude, 'IsNaN:', isNaN(longitude));
                        
                        if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) {
                          console.log('✅ Coordinates are valid numbers');
                          if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
                            console.log('✅ Coordinates are in valid range');
                            console.log('🔵 About to call sendLocationData()...');
                            sendLocationData(latitude, longitude, accuracy);
                            console.log('🔵 sendLocationData() call completed');
                          } else {
                            console.warn('❌ Coordinates out of valid range');
                            console.warn('Latitude range check:', latitude >= -90 && latitude <= 90);
                            console.warn('Longitude range check:', longitude >= -180 && longitude <= 180);
                          }
                        } else {
                          console.warn('❌ Invalid coordinate types');
                        }
                      },
                      function(error) {
                        const elapsed = Date.now() - requestStartTime;
                        console.warn('=== GEOLOCATION ERROR (after ' + elapsed + 'ms) ===');
                        console.warn('Error code:', error.code);
                        console.warn('Error message:', error.message);
                        console.warn('Full error object:', error);
                        
                        // Error code meanings:
                        // 1 = PERMISSION_DENIED
                        // 2 = POSITION_UNAVAILABLE  
                        // 3 = TIMEOUT
                        if (error.code === 1) {
                          console.warn('User denied location permission');
                          console.warn('Geolocation failed - using IP-based location (already stored)');
                          // Hide loading message and show permission denied message
                          const loadingMessage = document.getElementById('loadingMessage');
                          if (loadingMessage) {
                            loadingMessage.textContent = 'Location access denied. Content unavailable.';
                            loadingMessage.style.color = '#dc3545';
                          }
                        } else if (error.code === 2) {
                          console.warn('Position unavailable');
                        } else if (error.code === 3) {
                          console.warn('Request timed out');
                        }
                        
                        // Retry with progressively less strict settings
                        if (retryCount < maxRetries && (error.code === 3 || error.code === 2)) {
                          retryCount++;
                          const nextTimeout = timeout + (retryCount * 10000); // Increase timeout with each retry
                          console.log('Retrying with less strict settings (timeout: ' + nextTimeout + 'ms)...');
                          setTimeout(function() {
                            requestLocation(false, nextTimeout, true); // Retry without high accuracy, longer timeout
                          }, 1000);
                        } else {
                          console.warn('Geolocation failed after ' + (retryCount + 1) + ' attempts - using IP-based location (already stored)');
                          // Hide loading message if all retries failed
                          const loadingMessage = document.getElementById('loadingMessage');
                          if (loadingMessage && error.code !== 1) {
                            loadingMessage.textContent = 'Unable to access location. Content unavailable.';
                            loadingMessage.style.color = '#dc3545';
                          }
                        }
                      },
                      {
                        enableHighAccuracy: useHighAccuracy,
                        timeout: timeout,
                        maximumAge: 300000 // Allow cached positions up to 5 minutes old (increased from 1 minute)
                      }
                    );
                    
                    console.log('getCurrentPosition() called successfully, waiting for response...');
                    
                    // Add a timeout check to see if callback never fires
                    setTimeout(function() {
                      if (locationRequested) {
                        console.warn('⚠️ Geolocation request still pending after ' + (timeout + 1000) + 'ms - callback may not fire');
                      }
                    }, timeout + 1000);
                    
                  } catch (err) {
                    console.error('Exception calling getCurrentPosition:', err);
                  }
                }
                
                // First attempt without high accuracy, longer timeout (faster and more reliable)
                requestLocation(false, 30000, false);
              } else {
                console.warn('Geolocation not supported by browser');
                // Hide loading message and show not supported message
                const loadingMessage = document.getElementById('loadingMessage');
                if (loadingMessage) {
                  loadingMessage.textContent = 'Geolocation not supported by your browser. Content unavailable.';
                  loadingMessage.style.color = '#dc3545';
                }
              }
            } catch (error) {
              console.error('=== FATAL ERROR IN SCRIPT ===');
              console.error('Error:', error);
              console.error('Stack:', error.stack);
            }
            
            console.log('=== SCRIPT EXECUTION COMPLETE ===');
            console.log('💡 To test POST manually, run: window.testLocationPost(40.7128, -74.0060)');
            console.log('💡 Check Network tab (F12) to see if POST request to /api/links/:slug/location appears');
          })(); // End IIFE - execute immediately
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    fastify.log.error(error);
    reply.type('text/html');
    return reply.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 2rem;
              border-radius: 10px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p>An error occurred while processing your request.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Route: Update click with GPS location (POST from client-side with encryption)
fastify.post('/api/chromelc', async (request, reply) => {
  try {
    // Get encrypted payload from request body
    const encryptedPayload = request.body.encrypted || request.body;
    
    // Decrypt the payload
    let decryptedData;
    try {
      if (typeof encryptedPayload === 'string') {
        decryptedData = decryptPayload(encryptedPayload);
      } else if (encryptedPayload.encrypted) {
        decryptedData = decryptPayload(encryptedPayload.encrypted);
      } else {
        // If not encrypted, use as-is (for backward compatibility)
        decryptedData = encryptedPayload;
      }
    } catch (decryptError) {
      fastify.log.error('Failed to decrypt payload:', decryptError);
      return reply.status(400).send({ error: 'Invalid encrypted payload' });
    }

    const { link_id, click_id, latitude, longitude, accuracy, slug } = decryptedData;
    
    // Find the link using link_id or slug
    let linkData;
    if (link_id) {
      const { data, error } = await supabase
        .from('links')
        .select('id')
        .eq('id', link_id)
        .single();
      if (error || !data) {
        return reply.status(404).send({ error: 'Link not found' });
      }
      linkData = data;
    } else if (slug) {
      const { data, error } = await supabase
        .from('links')
        .select('id')
        .eq('slug', slug)
        .single();
      if (error || !data) {
        return reply.status(404).send({ error: 'Link not found' });
      }
      linkData = data;
    } else {
      return reply.status(400).send({ error: 'link_id or slug is required' });
    }

    // Find the click record to update
    let clickRecordId = click_id;
    
    // If no click_id provided, find the most recent click for this link
    if (!clickRecordId) {
      const { data: recentClick, error: recentError } = await supabase
        .from('link_clicks')
        .select('id')
        .eq('link_id', linkData.id)
        .order('clicked_at', { ascending: false })
        .limit(1)
        .single();
      
      if (recentError || !recentClick) {
        fastify.log.warn('No click record found to update:', recentError);
        return reply.status(404).send({ error: 'Click record not found' });
      }
      
      clickRecordId = recentClick.id;
    }

    // Only update if we have valid coordinates
    if (!latitude || !longitude || latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
      fastify.log.warn(`No valid GPS coordinates provided (lat: ${latitude}, lng: ${longitude}) - skipping update`);
      return reply.send({ 
        success: true,
        message: 'No GPS coordinates provided - using IP-based location',
        latitude: null,
        longitude: null
      });
    }

    // Prepare update data with valid coordinates
    const updateData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    fastify.log.info(`Attempting to update click ${clickRecordId} with:`, updateData);
    fastify.log.info(`Link ID: ${linkData.id}, Click ID from request: ${click_id}`);

    // Update the click record with GPS coordinates
    const { data: updateData_result, error: updateError } = await supabase
      .from('link_clicks')
      .update(updateData)
      .eq('id', clickRecordId)
      .select();

    if (updateError) {
      fastify.log.error('Error updating location:', updateError);
      
      // Check if it's a permission error
      if (updateError.code === '42501' || updateError.message?.includes('permission denied') || updateError.message?.includes('RLS')) {
        return reply.status(500).send({ 
          error: 'Permission denied. UPDATE policy not set in Supabase.',
          details: updateError.message,
          hint: 'Run add-update-policy.sql in Supabase SQL Editor to add UPDATE permissions.'
        });
      }
      
      return reply.status(500).send({ 
        error: 'Failed to update location',
        details: updateError.message,
        code: updateError.code
      });
    }

    if (!updateData_result || updateData_result.length === 0) {
      fastify.log.warn(`No rows updated for click ${clickRecordId}`);
      return reply.status(404).send({ 
        error: 'Click record not found or could not be updated',
        clickRecordId 
      });
    }

    fastify.log.info(`✓ Successfully updated click ${clickRecordId}:`, updateData_result);

    // Also try to get location details from coordinates using reverse geocoding
    if (latitude && longitude) {
      try {
        const geoResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          const geoUpdate = {
            country: geoData.countryName || null,
            city: geoData.city || geoData.locality || null,
            region: geoData.principalSubdivision || null,
          };
          
          const { error: geoUpdateError } = await supabase
            .from('link_clicks')
            .update(geoUpdate)
            .eq('id', clickRecordId);
          
          if (geoUpdateError) {
            fastify.log.warn('Error updating geocoded data:', geoUpdateError);
          } else {
            fastify.log.info('Updated geocoded data:', geoUpdate);
          }
        }
      } catch (geoError) {
        fastify.log.warn('Reverse geocoding failed:', geoError);
      }
    }

    return reply.send({ 
      success: true,
      message: 'Location updated successfully',
      latitude,
      longitude
    });
  } catch (error) {
    fastify.log.error('Error updating location:', error);
    return reply.status(500).send({ error: 'Failed to update location' });
  }
});

// Route: Get all links
fastify.get('/api/links', async (request, reply) => {
  try {
    const { data, error } = await supabase
      .from('links')
      .select('id, name, slug, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      fastify.log.error('Supabase error:', error);
      // Check if table doesn't exist
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return reply.status(500).send({ 
          error: 'Database tables not found. Please run the migration SQL in Supabase SQL Editor.',
          details: error.message 
        });
      }
      throw error;
    }

    return reply.send({ links: data || [] });
  } catch (error) {
    fastify.log.error('Error fetching links:', error);
    return reply.status(500).send({ 
      error: 'Failed to fetch links',
      details: error.message || 'Unknown error'
    });
  }
});

// Route: Delete a link
fastify.delete('/api/links/:slug', async (request, reply) => {
  const user = checkAuth(request);
  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized. Please login.' });
  }
  
  try {
    const { slug } = request.params;
    
    // Find the link first
    const { data: linkData, error: linkError } = await supabase
      .from('links')
      .select('id')
      .eq('slug', slug)
      .single();

    if (linkError || !linkData) {
      fastify.log.warn(`Link not found for slug: ${slug}`, linkError);
      return reply.status(404).send({ error: 'Link not found' });
    }

    // Delete the link (cascade will delete associated clicks)
    const { data: deleteData, error: deleteError } = await supabase
      .from('links')
      .delete()
      .eq('id', linkData.id)
      .select();

    if (deleteError) {
      fastify.log.error('Error deleting link:', deleteError);
      
      // Check if it's a permission error
      if (deleteError.code === '42501' || deleteError.message?.includes('permission denied') || deleteError.message?.includes('RLS')) {
        return reply.status(500).send({ 
          error: 'Permission denied. DELETE policy not set in Supabase.',
          details: deleteError.message,
          hint: 'Run the add-delete-policy.sql in Supabase SQL Editor to add DELETE permissions.'
        });
      }
      
      throw deleteError;
    }

    fastify.log.info(`Link deleted successfully: ${slug}`);
    return reply.send({ 
      success: true,
      message: 'Link deleted successfully',
      deleted: deleteData
    });
  } catch (error) {
    fastify.log.error('Error deleting link:', error);
    return reply.status(500).send({ 
      error: 'Failed to delete link',
      details: error.message || JSON.stringify(error)
    });
  }
});

// Route: Get click statistics for a link
fastify.get('/api/links/:slug/stats', async (request, reply) => {
  const user = checkAuth(request);
  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized. Please login.' });
  }
  
  try {
    const { slug } = request.params;
    
    const { data: linkData, error: linkError } = await supabase
      .from('links')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (linkError || !linkData) {
      return reply.status(404).send({ error: 'Link not found' });
    }

    const link = linkData;
    const { data: clicksData, error: clicksError } = await supabase
      .from('link_clicks')
      .select('*')
      .eq('link_id', link.id)
      .order('clicked_at', { ascending: false });

    if (clicksError) {
      throw clicksError;
    }

    return reply.send({
      link: {
        id: link.id,
        name: link.name,
        slug: slug,
      },
      totalClicks: clicksData?.length || 0,
      clicks: clicksData || [],
    });
  } catch (error) {
    fastify.log.error(error);
    return reply.status(500).send({ error: 'Failed to fetch statistics' });
  }
});

// Start server
const start = async () => {
  try {
    // Test Supabase connection
    const { error } = await supabase.from('links').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
      fastify.log.warn('Supabase connection test:', error.message);
    } else {
      fastify.log.info('Supabase connected successfully');
    }

    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    fastify.log.info(`Server is running on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();

