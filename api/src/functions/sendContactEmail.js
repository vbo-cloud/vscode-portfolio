const { app } = require("@azure/functions");
const nodemailer = require("nodemailer");
const { TableClient } = require("@azure/data-tables");

// Generic {name, email, message} -> Zoho SMTP relay. Nothing below is tied to
// the portfolio specifically — CORS (in Terraform) and the frontend caller
// are the only portfolio-specific pieces. See
// docs/prompts/prompt-09-contact-form-azure-function.md.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strips CRLFs so a crafted field can't inject extra SMTP headers — belt and
// braces on top of nodemailer's own header encoding.
const stripNewlines = (value) => String(value).replace(/[\r\n]+/g, " ").trim();

// Per-IP rate limiting (10 requests/hour) on top of the honeypot above — see
// docs/prompts/prompt-10-contact-form-rate-limiting.md. Deliberately simple:
// no atomicity (a read-then-write race could let the count briefly overshoot
// by one or two) and no cleanup of old rows (accepted tradeoff given this
// Function's traffic volume; revisit with a retention policy or periodic
// cleanup only if that ever becomes a real issue).
const RATE_LIMIT_TABLE = "ratelimits";
const RATE_LIMIT_PARTITION_KEY = "ratelimit";
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 3_600_000; // 1 hour, fixed (non-sliding) window

let rateLimitTableClient;
const getRateLimitTableClient = () => {
  if (!rateLimitTableClient) {
    rateLimitTableClient = TableClient.fromConnectionString(
      process.env.RATE_LIMIT_TABLE_CONNECTION_STRING,
      RATE_LIMIT_TABLE
    );
  }
  return rateLimitTableClient;
};

// Azure's x-forwarded-for is "<ip>:<port>[, <ip>:<port> ...]" for IPv4 —
// strip the port so the rate-limit key is stable per client (the port
// varies per connection, so leaving it in would give every request its own
// key and the limiter would never trigger). IPv6 and anything else pass
// through unchanged rather than risk mangling a colon-containing address.
const IPV4_WITH_PORT_RE = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/;
const getClientIp = (request) => {
  const header = request.headers.get("x-forwarded-for");
  if (!header) return null;
  const firstHop = header.split(",")[0].trim();
  const match = firstHop.match(IPV4_WITH_PORT_RE);
  return match ? match[1] : firstHop;
};

const isRateLimited = async (ip) => {
  const client = getRateLimitTableClient();
  const rowKey = `${ip}_${Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS)}`;

  let entity;
  try {
    entity = await client.getEntity(RATE_LIMIT_PARTITION_KEY, rowKey);
  } catch (err) {
    if (err.statusCode === 404) {
      await client.createEntity({
        partitionKey: RATE_LIMIT_PARTITION_KEY,
        rowKey,
        count: 1,
      });
      return false;
    }
    throw err; // Unexpected storage error — caller decides (fails open).
  }

  if (entity.count >= RATE_LIMIT_MAX) {
    return true;
  }

  await client.updateEntity(
    { partitionKey: RATE_LIMIT_PARTITION_KEY, rowKey, count: entity.count + 1 },
    "Merge"
  );
  return false;
};

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      // EU datacenter host — confirmed via this domain's MX records
      // (mx.zoho.eu). Zoho's regional SMTP hosts are auth-isolated: the
      // global smtp.zoho.com endpoint rejects EU-provisioned mailboxes
      // outright (535), regardless of how correct the password is.
      host: "smtp.zoho.eu",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });
  }
  return transporter;
};

const handler = async (request, context) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return { status: 400, jsonBody: { error: "Invalid JSON body." } };
  }

  const { name, email, subject, message, website } = body ?? {};

  // Honeypot: a hidden field a real visitor never fills in. Reject silently
  // with a normal-looking success response so bots don't learn their
  // submission was flagged.
  if (website) {
    context.warn("Honeypot field filled — silently dropping submission.");
    return { status: 200, jsonBody: { ok: true } };
  }

  const clientIp = getClientIp(request);
  if (clientIp) {
    try {
      if (await isRateLimited(clientIp)) {
        return {
          status: 429,
          jsonBody: { error: "Trop de messages envoyés récemment. Réessayez plus tard." },
        };
      }
    } catch (err) {
      // Fail open: a Table Storage hiccup shouldn't block a legitimate
      // contact-form submission.
      context.warn("Rate limit check failed, allowing request through:", err);
    }
  } else {
    // No x-forwarded-for (e.g. local `func start` without anything in
    // front) — nothing to key on, so skip rather than block.
    context.warn("No x-forwarded-for header — skipping rate limit check.");
  }

  if (!name || !email || !subject || !message) {
    return { status: 400, jsonBody: { error: "name, email, subject and message are all required." } };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: 400, jsonBody: { error: "email is not a valid address." } };
  }

  const cleanName = stripNewlines(name);
  const cleanEmail = stripNewlines(email);
  // Caller (frontend) decides the actual subject line, including any of its
  // own prefixing conventions — this Function stays a dumb relay.
  const cleanSubject = stripNewlines(subject);

  try {
    await getTransporter().sendMail({
      from: "contact@vincentboutin.dev",
      to: "contact@vincentboutin.dev",
      replyTo: cleanEmail,
      subject: cleanSubject,
      text: `${message}\n\n—\n${cleanName} (${cleanEmail})`,
    });
    return { status: 200, jsonBody: { ok: true } };
  } catch (err) {
    // Never surface raw SMTP error details to the client.
    context.error("Failed to send contact email:", err);
    return { status: 500, jsonBody: { error: "Failed to send the message. Please try again later." } };
  }
};

app.http("sendContactEmail", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler,
});

// Exported for local unit testing only — app.http above is the real entry point.
module.exports = { handler };
