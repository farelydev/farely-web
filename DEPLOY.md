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

The site includes public legal/disclosure URLs that Travelpayouts can review:

```txt
/affiliate-disclosure
/privacy
/terms
```

After Travelpayouts gives you an affiliate/deep-link template, update Render:

```txt
FLIGHT_DEAL_PARTNER=travelpayouts
FLIGHT_AFFILIATE_URL=your_travelpayouts_link_template
```

Farely supports these template tokens:

```txt
{origin}
{destination}
{departureDate}
{returnDate}
{carrier}
{offerId}
{source}
```

Example format:

```txt
https://example.com/search?from={origin}&to={destination}&depart={departureDate}&return={returnDate}
```

## Private analytics

To open the private founder dashboard:

```txt
https://YOUR-RENDER-URL.onrender.com/?admin=YOUR_ADMIN_ANALYTICS_TOKEN#farely-analytics
```
