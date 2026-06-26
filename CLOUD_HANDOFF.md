# Farely cloud handoff

Farely is now backed up on GitHub:

- Repository: `https://github.com/farelydev/farely-web`
- Main branch: `main`
- Latest code: use the latest commit on `main`

Use this file when moving from the old laptop to Codex web or a new laptop.

## What is safely in the cloud

- Farely source code
- Frontend and backend files
- Render deployment config in `render.yaml`
- Public setup notes in `DEPLOY.md` and `EMAIL_SETUP.md`
- Safe example environment variables in `.env.example`

## What is not stored in GitHub

These must stay private and should be added in Render, Codex cloud environment settings, or a private password manager:

- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `TRAVELPAYOUTS_MARKER`
- `ADMIN_ANALYTICS_TOKEN`
- `RESEND_API_KEY`
- Any real `.env` file

The repo is configured to ignore `.env`, `.env.*`, and local data logs.

## Using Codex web remotely

In Codex web, open the GitHub repository `farelydev/farely-web`.

Use the `main` branch unless you deliberately want to work on a separate branch.

If Codex web asks for setup commands, use:

```txt
npm install
npm run build
```

If it asks how to start Farely:

```txt
npm start
```

## Using a new laptop

Clone the repo from GitHub:

```txt
git clone https://github.com/farelydev/farely-web.git
cd farely-web
npm install
npm run build
```

Create a private `.env` file only on the new laptop if local API testing is needed. Do not upload `.env` to GitHub.

## Render deployment notes

Render should use:

```txt
Build Command: npm install && npm run build
Start Command: npm start
Health Check Path: /api/health
```

Required private Render environment variables:

```txt
AMADEUS_CLIENT_ID
AMADEUS_CLIENT_SECRET
TRAVELPAYOUTS_MARKER
ADMIN_ANALYTICS_TOKEN
```

Optional support form forwarding:

```txt
RESEND_API_KEY
SUPPORT_TO_EMAIL=info@tryfarely.com
SUPPORT_FROM_EMAIL=Farely Support <support@tryfarely.com>
```

## Cloudflare security notes

Cloudflare zone: `tryfarely.com`

The website DNS records are proxied through Cloudflare:

```txt
tryfarely.com -> farely-web.onrender.com
www.tryfarely.com -> farely-web.onrender.com
```

This lets Cloudflare sit in front of the site for HTTPS edge protection and basic traffic protection.

Manual Cloudflare dashboard checks still needed:

```txt
SSL/TLS encryption mode: Full (strict), if Render custom-domain SSL is healthy
Always Use HTTPS: On
Automatic HTTPS Rewrites: On
Minimum TLS version: TLS 1.2 or higher
TLS 1.3: On
Browser Integrity Check: On
Security Level: Medium
```

Do not enable strict HSTS for a long period until the domain has been stable on HTTPS for a while.

## Current important status

- Exact-date flight search works.
- Flexible-date search is intentionally limited to a small live range.
- Farely does not take booking payments directly.
- Partner redirects and click tracking are part of the monetisation path.
- Support form email forwarding needs a sending provider such as Resend before it can send emails automatically.
