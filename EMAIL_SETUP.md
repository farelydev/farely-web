# Farely business email setup

Configured public business emails:

```txt
info@tryfarely.com      general enquiries and partnerships
support@tryfarely.com   customer support
noreply@tryfarely.com   automated system emails
privacy@tryfarely.com   privacy and GDPR requests
security@tryfarely.com  security reports
```

Cloudflare Email Routing is enabled for:

```txt
tryfarely.com
```

Current forwarding rule:

```txt
Farely business addresses -> private verified inbox
```

The private inbox is not shown publicly on Farely.

## Website setting

Set this in Render:

```txt
VITE_CONTACT_EMAIL=info@tryfarely.com
VITE_SUPPORT_EMAIL=support@tryfarely.com
VITE_NOREPLY_EMAIL=noreply@tryfarely.com
VITE_PRIVACY_EMAIL=privacy@tryfarely.com
VITE_SECURITY_EMAIL=security@tryfarely.com
```

Then redeploy Farely.

## Test

Send an email from another account to:

```txt
info@tryfarely.com
```

Check that it arrives in the private forwarding inbox. Also check spam/junk if it does not appear after a few minutes.

## Support form forwarding

Cloudflare Email Routing receives and forwards mail sent to `info@tryfarely.com`. It does not send website form submissions by itself.

The Farely support assistant can submit unresolved queries to `/api/support`. The API stores the request and can forward it by email when a sending provider is configured.

For automatic email forwarding from the website, add these Render environment variables after setting up a sending provider such as Resend:

```txt
RESEND_API_KEY=your_resend_api_key
PUBLIC_SUPPORT_EMAIL=support@tryfarely.com
SUPPORT_TO_EMAIL=support@tryfarely.com
SUPPORT_FROM_EMAIL=Farely Support <support@tryfarely.com>
```

Until `RESEND_API_KEY` is configured, the site will show a backup email handoff link.
`SUPPORT_TO_EMAIL` may forward internally, but the website and API should only show Farely business addresses to users.
