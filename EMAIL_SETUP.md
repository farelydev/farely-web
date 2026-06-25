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

