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

module.exports = { sign, verify, mailgunPost };
