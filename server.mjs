import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.argv.includes("--dev");
const port = Number(process.env.PORT || (isDev ? 5173 : 3000));
const dataDirectory = path.join(__dirname, "data");
const dataFile = path.join(dataDirectory, "enquiries.ndjson");
const app = express();

app.set("trust proxy", true);
app.use(express.json({ limit: "1mb" }));

const rateWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 6;
const requestBuckets = new Map();

const formTargets = {
  school: {
    label: "School enquiry",
    required: ["primary_intent", "school_name", "city", "phone", "email", "message"],
  },
  investor: {
    label: "Investor enquiry",
    required: ["primary_intent", "name", "fund_name", "email", "focus_stage", "message"],
  },
  student: {
    label: "Student enquiry",
    required: ["primary_intent", "name", "email", "college", "branch", "why_clarix"],
  },
  contact: {
    label: "General enquiry",
    required: ["name", "email", "phone", "role", "message"],
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/.+/i;

const readEnv = (key, fallback = "") => (process.env[key] || fallback).trim();

const smtpConfig = {
  host: readEnv("SMTP_HOST"),
  port: Number(readEnv("SMTP_PORT", "587")),
  secure: readEnv("SMTP_SECURE", "false").toLowerCase() === "true",
  user: readEnv("SMTP_USER"),
  pass: readEnv("SMTP_PASS"),
  from: readEnv("SMTP_FROM_EMAIL"),
};

const notificationEmail = readEnv("FORM_TO_EMAIL");

let transporter;

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getSubmissionId = () => {
  const datePart = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `CLX-${datePart}-${randomPart}`;
};

const prettifyKey = (key) =>
  key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const pruneBuckets = () => {
  const now = Date.now();
  requestBuckets.forEach((timestamps, key) => {
    const recent = timestamps.filter((timestamp) => now - timestamp < rateWindowMs);
    if (!recent.length) {
      requestBuckets.delete(key);
      return;
    }
    requestBuckets.set(key, recent);
  });
};

const enforceRateLimit = (ipAddress) => {
  pruneBuckets();
  const now = Date.now();
  const recent = requestBuckets.get(ipAddress) || [];
  if (recent.length >= maxRequestsPerWindow) {
    throw createError(429, "Too many submissions from this network. Please try again shortly.");
  }
  recent.push(now);
  requestBuckets.set(ipAddress, recent);
};

const normalizeFields = (rawFields = {}) => {
  const normalized = {};
  Object.entries(rawFields).forEach(([key, value]) => {
    if (typeof value !== "string") {
      return;
    }

    const trimmed = value.replace(/\r/g, "").trim();
    if (!trimmed) {
      return;
    }

    normalized[key] = trimmed.slice(0, 3000);
  });
  return normalized;
};

const validateFields = (type, fields) => {
  const config = formTargets[type];
  if (!config) {
    throw createError(400, "Unsupported enquiry type.");
  }

  config.required.forEach((fieldName) => {
    if (!fields[fieldName]) {
      throw createError(400, `Missing required field: ${prettifyKey(fieldName)}.`);
    }
  });

  if (fields.email && !emailPattern.test(fields.email)) {
    throw createError(400, "Please enter a valid email address.");
  }

  if (fields.portfolio && !urlPattern.test(fields.portfolio)) {
    throw createError(400, "Portfolio or LinkedIn must be a valid URL.");
  }

  if (fields.resume_link && !urlPattern.test(fields.resume_link)) {
    throw createError(400, "Resume link must be a valid URL.");
  }

  if (fields.message && fields.message.length < 10) {
    throw createError(400, "Please share a bit more detail so we can review your enquiry properly.");
  }
};

const getTransporter = () => {
  if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.from) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure || smtpConfig.port === 465,
      auth:
        smtpConfig.user && smtpConfig.pass
          ? {
              user: smtpConfig.user,
              pass: smtpConfig.pass,
            }
          : undefined,
    });
  }

  return transporter;
};

const writeSubmission = async (submission) => {
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.appendFile(dataFile, `${JSON.stringify(submission)}\n`, "utf8");
};

const composeEmail = (submission) => {
  const headline = `${formTargets[submission.type]?.label || "Website enquiry"} received`;
  const lines = [
    headline,
    `Reference: ${submission.id}`,
    `Received: ${submission.receivedAt}`,
    `Page: ${submission.source.page}`,
    `Path: ${submission.source.path}`,
    `Delivery mode: Website form backend`,
    "",
    "Submitted details:",
    ...Object.entries(submission.fields).map(([key, value]) => `${prettifyKey(key)}: ${value}`),
    "",
    "Request metadata:",
    `IP: ${submission.meta.ipAddress}`,
    `User-Agent: ${submission.meta.userAgent}`,
  ];

  return lines.join("\n");
};

const notifyTeam = async (submission) => {
  const activeTransporter = getTransporter();
  if (!activeTransporter) {
    return {
      status: "saved",
      message: "Submission stored on the server. Configure SMTP to receive email notifications.",
    };
  }

  const replyTo = submission.fields.email && emailPattern.test(submission.fields.email) ? submission.fields.email : undefined;

  await activeTransporter.sendMail({
    from: smtpConfig.from,
    to: notificationEmail,
    replyTo,
    subject: `[Clarix] ${formTargets[submission.type]?.label || "Website enquiry"} - ${submission.id}`,
    text: composeEmail(submission),
  });

  return {
    status: "emailed",
    message: "Submission received and forwarded to the Clarix team.",
  };
};

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    environment: isDev ? "development" : "production",
    emailConfigured: Boolean(getTransporter()),
    storageFile: path.relative(__dirname, dataFile),
  });
});

app.post("/api/enquiries", async (request, response) => {
  try {
    const ipAddress = request.ip || request.headers["x-forwarded-for"] || "unknown";
    enforceRateLimit(String(ipAddress));

    const { type = "school", source = {}, fields = {} } = request.body || {};
    const normalizedFields = normalizeFields(fields);

    if (normalizedFields.company_website) {
      response.status(202).json({
        ok: true,
        id: getSubmissionId(),
        delivery: "ignored",
        message: "Submission accepted.",
      });
      return;
    }

    validateFields(type, normalizedFields);

    const submission = {
      id: getSubmissionId(),
      type,
      receivedAt: new Date().toISOString(),
      source: {
        page: typeof source.page === "string" ? source.page : "index.html",
        path: typeof source.path === "string" ? source.path : "/",
      },
      fields: normalizedFields,
      meta: {
        ipAddress: String(ipAddress),
        userAgent: request.get("user-agent") || "unknown",
      },
    };

    await writeSubmission(submission);
    const notification = await notifyTeam(submission);

    response.status(201).json({
      ok: true,
      id: submission.id,
      delivery: notification.status,
      message: notification.message,
    });
  } catch (error) {
    const status = error.status || 500;
    const message = status >= 500 ? "We could not process the enquiry right now. Please try again." : error.message;
    response.status(status).json({ ok: false, message });
  }
});

if (isDev) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root: __dirname,
    server: {
      middlewareMode: true,
    },
    appType: "mpa",
  });

  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.get("/", (_request, response) => {
    response.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Clarix server running on http://localhost:${port}`);
});
