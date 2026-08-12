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
FORM_TO_EMAIL=contact@clarixdigitech.com
SMTP_HOST=smtp.zoho.in
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@clarixdigitech.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=Clarix Digitech <your-email@clarixdigitech.com>
```

For local production testing:

```powershell
npm run build
npm start
```

For live hosting with `clarixdigitech.com`, follow `deploy-instructions.md`.
