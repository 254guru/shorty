import express from 'express';
import helmet from 'helmet';
import fetch from 'node-fetch';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory token cache
let cachedToken = null;
let tokenExpiry = 0;

// Simple session store for user tokens
const sessions = new Map();
const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state'
].join(' ');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

async function fetchSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET');
  }

  const params = new URLSearchParams();
  params.set('grant_type', 'client_credentials');
  params.set('client_id', clientId);
  params.set('client_secret', clientSecret);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify token error: ${response.status} ${text}`);
  }
  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000; // refresh 5m early
  return data;
}

// Security headers including CSP via helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src': ["'self'", 'https://sdk.scdn.co'],
        'img-src': ["'self'", 'data:', 'https://storage.googleapis.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'script-src': ["'self'", "'unsafe-inline'", 'https://sdk.scdn.co'],
        'connect-src': ["'self'", 'https://accounts.spotify.com', 'https://api.spotify.com', 'wss://guc-dealer.spotify.com', 'https://guc-dealer.spotify.com', 'wss://dealer.spotify.com'],
        'media-src': ['https://*.scdn.co', 'https://*.spotify.com', 'https://audio-ak-spotify-com.akamaized.net', 'data:'],
        'frame-src': ["'self'", 'https://sdk.scdn.co', 'https://open.spotify.com'],
        'worker-src': ["'self'", 'blob:'],
        'object-src': ["'none'"],
        'frame-ancestors': ["'self'"],
        'upgrade-insecure-requests': []
      }
    },
    frameguard: { action: 'sameorigin' }
  })
);

app.get('/api/spotify/token', async (req, res) => {
  try {
    if (cachedToken && Date.now() < tokenExpiry) {
      const ttl = Math.max(0, Math.floor((tokenExpiry - Date.now()) / 1000));
      return res.json({ access_token: cachedToken, token_type: 'Bearer', expires_in: ttl });
    }
    const data = await fetchSpotifyToken();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'token_fetch_failed' });
  }
});

// OAuth login (PKCE)
function base64url(input) {
  return input.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

app.get('/auth/login', (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `http://localhost:${PORT}/auth/callback`;
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());
  const state = base64url(crypto.randomBytes(16));
  const sid = base64url(crypto.randomBytes(24));
  sessions.set(sid, { code_verifier: verifier, state });
  res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax' });
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const sid = req.cookies.sid;
    const sess = sessions.get(sid);
    if (!sess) return res.status(400).send('Missing session');
    const { state: expectedState, code_verifier } = sess;
    const { code, state } = req.query;
    if (!code || state !== expectedState) return res.status(400).send('Invalid state');
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || `http://localhost:${PORT}/auth/callback`;
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      code_verifier
    });
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('OAuth token error:', data);
      return res.status(500).send('OAuth failed');
    }
    sessions.set(sid, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000) - 300000 // 5m early
    });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('OAuth error');
  }
});

// Provide user token to frontend
app.get('/api/me/token', async (req, res) => {
  try {
    const sid = req.cookies.sid;
    const sess = sessions.get(sid);
    if (!sess || !sess.access_token) return res.status(401).json({ error: 'not_authenticated' });
    if (Date.now() > (sess.expires_at || 0)) {
      // attempt refresh
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: sess.refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID
      });
      const r = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await r.json();
      if (r.ok) {
        sess.access_token = data.access_token;
        sess.expires_at = Date.now() + (data.expires_in * 1000) - 300000;
        sessions.set(sid, sess);
      } else {
        return res.status(401).json({ error: 'refresh_failed' });
      }
    }
    const ttl = Math.max(0, Math.floor(((sess.expires_at || 0) - Date.now()) / 1000));
    res.json({ access_token: sess.access_token, token_type: 'Bearer', expires_in: ttl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'me_token_error' });
  }
});

// Serve the static site
app.use(express.static('foryoumylove-main'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
