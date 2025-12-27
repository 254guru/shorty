# foryoumylove
surprise your sweet girl with this cute website. 

## Development Server

- A small Express server is included to:
	- Serve strict CSP headers (including `frame-ancestors`).
	- Proxy Spotify token requests securely (avoiding secrets in the browser).

### Setup

1. Install dependencies:

```bash
cd /home/ggonza/Desktop/web_resources/foryoumylove
npm install
```

2. Set environment variables (use your Spotify app credentials):

```bash
export SPOTIFY_CLIENT_ID=83242526ggghhhs
export SPOTIFY_CLIENT_SECRET=cvhhdgdgfdgjdhdhh
export SPOTIFY_REDIRECT_URI=http://localhost:3000/auth/callback
```

3. Start the server:

```bash
npm start
```

4. Open the site:

```
http://localhost:3000
```

### Notes

- Click "Connect Spotify" in the Music section to sign in via OAuth. Premium is required for in-browser playback with the Web Playback SDK.
- The frontend requests `/api/me/token` to obtain the user access token for the SDK.
- CSP is served via response headers (preferred). If using other servers, configure equivalent headers and allow `https://sdk.scdn.co`, Spotify WebSocket and media hosts in CSP.
