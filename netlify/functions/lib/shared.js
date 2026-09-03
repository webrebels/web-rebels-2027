const crypto = require("crypto");

// EU region by default; override with MAILGUN_URL=https://api.mailgun.net for sandbox domains
const MAILGUN_URL = process.env.MAILGUN_URL || "https://api.eu.mailgun.net";

function sign(email, ts) {
  return crypto.createHmac("sha256", process.env.CONFIRM_SECRET).update(`${email}.${ts}`).digest("hex");
}

function verify(email, ts, sig, maxAgeMs) {
  const expected = sign(email, ts);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const age = Date.now() - Number(ts);
  return Number.isFinite(age) && age >= 0 && age <= maxAgeMs;
}

async function mailgunPost(path, params) {
  const res = await fetch(`${MAILGUN_URL}/v3${path}`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString("base64"),
    },
    body: new URLSearchParams(params),
  });
  if (!res.ok) {
    throw new Error(`Mailgun ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// Posts to the Slack channel behind SLACK_WEBHOOK_MAILGUN. Best effort: a Slack
// outage must never fail the signup, so errors are only logged.
async function notifySlack(text) {
  if (!process.env.SLACK_WEBHOOK_MAILGUN) return;
  try {
    const res = await fetch(process.env.SLACK_WEBHOOK_MAILGUN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("Slack notification failed:", err.message);
  }
}

function checkEnv() {
  const missing = ["MAILGUN_API_KEY", "MAILGUN_DOMAIN", "MAILGUN_LIST", "CONFIRM_SECRET"].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error("Missing environment variables:", missing.join(", "));
  }
  if (!process.env.SLACK_WEBHOOK_MAILGUN) {
    console.warn("SLACK_WEBHOOK_MAILGUN not set, Slack notifications disabled");
  }
  console.log(`Mailgun config: url=${MAILGUN_URL} domain=${process.env.MAILGUN_DOMAIN} list=${process.env.MAILGUN_LIST}`);
}

module.exports = { sign, verify, mailgunPost, notifySlack, checkEnv };
