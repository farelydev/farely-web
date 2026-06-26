# Farely cloud handoff

Farely is now backed up on GitHub:

- Repository: `https://github.com/farelydev/farely-web`
- Main branch: `main`
- Latest handoff commit: `8e0e257b201523135efd61b396f02fef3a407a5a`

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

## Current important status

- Exact-date flight search works.
- Flexible-date search is intentionally limited to a small live range.
- Farely does not take booking payments directly.
- Partner redirects and click tracking are part of the monetisation path.
- Support form email forwarding needs a sending provider such as Resend before it can send emails automatically.
