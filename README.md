# Clarix Digitech Website

## Run locally

```powershell
npm run dev
```

The site runs through `server.mjs`, so frontend pages and `/api/enquiries` are available from the same server.

## Form backend

Website enquiries submit to:

```text
POST /api/enquiries
```

Local development uses `server.mjs`, which can save submissions to `data/enquiries.ndjson`. Production on Netlify uses `netlify/functions/enquiries.mjs`, which sends enquiries by email through SMTP.

## Email setup

Copy `.env.example` to `.env` and fill in your real SMTP details:

```text
FORM_TO_EMAIL=you@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=you@example.com
SMTP_PASS=your-mailbox-password
SMTP_FROM_EMAIL=Your Name <you@example.com>
```

For local production testing:

```powershell
npm run build
npm start
```

For live hosting with `clarixdigitech.com`, follow `deploy-instructions.md`.
