# Farely business email setup

Configured public email:

```txt
info@tryfarely.com
```

Cloudflare Email Routing is enabled for:

```txt
tryfarely.com
```

Current forwarding rule:

```txt
info@tryfarely.com -> private verified inbox
```

The private inbox is not shown publicly on Farely.

## Website setting

Set this in Render:

```txt
VITE_CONTACT_EMAIL=info@tryfarely.com
```

Then redeploy Farely.

## Test

Send an email from another account to:

```txt
info@tryfarely.com
```

Check that it arrives in the private forwarding inbox. Also check spam/junk if it does not appear after a few minutes.


## Farely Inbox notifications

Farely now includes an inbox panel for action items and an API that can email the current action list.

Default sender to filter in Gmail:

```txt
info@tryfarely.com
```

To send real emails, configure these environment variables in Render:

```txt
NOTIFICATIONS_TO_EMAIL=fadumo5007@gmail.com
NOTIFICATIONS_FROM_EMAIL=info@tryfarely.com
RESEND_API_KEY=your_resend_api_key
```

`NOTIFICATIONS_FROM_EMAIL` is the sender Gmail will see. Create a Gmail filter for `from:(info@tryfarely.com)` and route it to a Farely label/inbox.

If `RESEND_API_KEY` is not set, the Farely Inbox still displays the items, but the Email me button returns a setup message instead of sending.
