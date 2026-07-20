const { app } = require("@azure/functions");
const nodemailer = require("nodemailer");

// Generic {name, email, message} -> Zoho SMTP relay. Nothing below is tied to
// the portfolio specifically — CORS (in Terraform) and the frontend caller
// are the only portfolio-specific pieces. See
// docs/prompts/prompt-09-contact-form-azure-function.md.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strips CRLFs so a crafted field can't inject extra SMTP headers — belt and
// braces on top of nodemailer's own header encoding.
const stripNewlines = (value) => String(value).replace(/[\r\n]+/g, " ").trim();

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

  const { name, email, message, website } = body ?? {};

  // Honeypot: a hidden field a real visitor never fills in. Reject silently
  // with a normal-looking success response so bots don't learn their
  // submission was flagged.
  if (website) {
    context.warn("Honeypot field filled — silently dropping submission.");
    return { status: 200, jsonBody: { ok: true } };
  }

  if (!name || !email || !message) {
    return { status: 400, jsonBody: { error: "name, email and message are all required." } };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: 400, jsonBody: { error: "email is not a valid address." } };
  }

  const cleanName = stripNewlines(name);
  const cleanEmail = stripNewlines(email);

  try {
    await getTransporter().sendMail({
      from: "contact@vincentboutin.dev",
      to: "contact@vincentboutin.dev",
      replyTo: cleanEmail,
      subject: `Portfolio contact from ${cleanName}`,
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
