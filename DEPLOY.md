# Farely live URL setup

Use Render for the first public Farely URL because this project serves both:

- the React/Vite frontend
- the Express API routes, including `/api/flights`, `/api/flexible`, `/api/health`, and deal redirects

## Render deployment

1. Push this repo to GitHub.
2. Go to Render and create a new Blueprint or Web Service from the repo.
3. Use the existing `render.yaml` when Render detects it.
4. Add these environment variables in Render:

```txt
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
AMADEUS_HOSTNAME=test
USE_DEMO_FALLBACK=true
FLIGHT_DEAL_PARTNER=google-flights-placeholder
FLIGHT_AFFILIATE_URL=
ADMIN_ANALYTICS_TOKEN=use_a_long_private_value
NODE_VERSION=22.12.0
VITE_CONTACT_EMAIL=
```

5. Deploy.
6. Your live URL will look like:

```txt
https://farely.onrender.com
```

or Render may add a suffix if the name is taken.

## Checks after deploy

Open these URLs:

```txt
https://YOUR-RENDER-URL.onrender.com
https://YOUR-RENDER-URL.onrender.com/api/health
https://YOUR-RENDER-URL.onrender.com/api/debug/amadeus
https://YOUR-RENDER-URL.onrender.com/affiliate-disclosure
https://YOUR-RENDER-URL.onrender.com/privacy
https://YOUR-RENDER-URL.onrender.com/terms
```

The health endpoint should return JSON with:

```txt
ok: true
amadeusCredentialsLoaded: true
```

## Travelpayouts

Use the main Render URL as the website URL in Travelpayouts:

```txt
https://YOUR-RENDER-URL.onrender.com
```

Travelpayouts Drive is not required for Farely's current architecture. Farely uses a custom backend redirect path for `View deal` clicks so affiliate links stay server-controlled, trackable, and configurable. Do not add Drive scripts, widgets, or plugin-style dependencies unless Travelpayouts explicitly requires Drive for approval or link usage.

## Public email

Configured domain:

```txt
tryfarely.com
```

Configured public email:

```txt
VITE_CONTACT_EMAIL=info@tryfarely.com
VITE_SUPPORT_EMAIL=support@tryfarely.com
VITE_NOREPLY_EMAIL=noreply@tryfarely.com
VITE_PRIVACY_EMAIL=privacy@tryfarely.com
VITE_SECURITY_EMAIL=security@tryfarely.com
```

Cloudflare Email Routing can forward these business addresses to the private verified inbox for now. The private inbox is an internal forwarding destination and must not be shown publicly by Farely.

For automatic support-form email forwarding, configure a sending provider such as Resend and add:

```txt
RESEND_API_KEY=your_resend_api_key
PUBLIC_SUPPORT_EMAIL=support@tryfarely.com
SUPPORT_TO_EMAIL=support@tryfarely.com
SUPPORT_FROM_EMAIL=Farely Support <support@tryfarely.com>
```

Cloudflare Email Routing receives mail; it does not send website form submissions by itself.

The site includes public legal/disclosure URLs that Travelpayouts can review:

```txt
/affiliate-disclosure
/privacy
/terms
```

After Travelpayouts approves the site, update Render with your Travelpayouts marker:

```txt
FLIGHT_DEAL_PARTNER=travelpayouts
TRAVELPAYOUTS_MARKER=your_travelpayouts_marker
TRAVELPAYOUTS_HOST=www.aviasales.com
TRAVELPAYOUTS_SUB_ID=farely
```

With only `TRAVELPAYOUTS_MARKER` set, Farely automatically logs `View deal` click metadata, generates a backend affiliate redirect URL, and sends flight deal clicks through:

```txt
https://www.aviasales.com/search/{origin}{departureDay}{departureMonth}{destination}{returnDay}{returnMonth}1?marker=...
```

If Travelpayouts gives you a specific deep-link template, set `FLIGHT_AFFILIATE_URL` as an override. Farely supports these template tokens:

```txt
{origin}
{destination}
{departureDate}
{departureDay}
{departureMonth}
{departureYear}
{departureShortYear}
{departureCompact}
{returnDate}
{returnDay}
{returnMonth}
{returnYear}
{returnShortYear}
{returnCompact}
{carrier}
{offerId}
{source}
{marker}
{subId}
```

Example format:

```txt
https://example.com/search?from={origin}&to={destination}&depart={departureDate}&return={returnDate}&marker={marker}
```

## Private analytics

To open the private founder dashboard:

```txt
https://YOUR-RENDER-URL.onrender.com/?admin=YOUR_ADMIN_ANALYTICS_TOKEN#farely-analytics
```
