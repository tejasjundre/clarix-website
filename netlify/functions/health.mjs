const readEnv = (key, fallback = "") => (process.env[key] || fallback).trim();

export const handler = async () => ({
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    ok: true,
    environment: "netlify",
    emailConfigured: Boolean(readEnv("SMTP_HOST") && readEnv("SMTP_FROM_EMAIL")),
  }),
});
