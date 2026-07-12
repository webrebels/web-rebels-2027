// Triggered by Netlify on every verified form submission.
// Sends a double opt-in confirmation email via Mailgun; the address is only
// added to the mailing list once the recipient clicks the signed link.
const { sign, mailgunPost, checkEnv } = require("./lib/shared");

exports.handler = async (event) => {
  checkEnv();
  const { payload } = JSON.parse(event.body);

  if (payload.form_name !== "newsletter") {
    console.log(`Ignoring submission from form "${payload.form_name}"`);
    return { statusCode: 200, body: "Ignored: not the newsletter form" };
  }

  const email = (payload.email || (payload.data && payload.data.email) || "").trim();
  if (!email) {
    console.log("Submission had no email field, ignoring");
    return { statusCode: 422, body: "No email in submission" };
  }

  console.log(`Newsletter signup: ${email} — sending confirmation email`);

  const ts = Date.now().toString();
  const query = new URLSearchParams({ email, ts, sig: sign(email, ts) });
  const confirmUrl = `${process.env.URL}/api/confirm?${query}`;

  try {
  try {
    const result = await mailgunPost(`/${process.env.MAILGUN_DOMAIN}/messages`, {
      from: "Web Rebels <anders@webrebels.org>",
      to: email,
      subject: "Confirm your Web Rebels newsletter subscription",
      text: [
        "Hi!",
        "",
        "Someone (hopefully you) signed up for the Web Rebels newsletter with this address.",
        "",
        "One click and you're in:",
        "",
        confirmUrl,
        "",
        "The link works for 48 hours. If this wasn't you, just delete this email and we won't bother you again.",
        "",
        "Web Rebels",
      ].join("\n"),
      html: [
        "<p>Hi!</p>",
        "<p>Someone (hopefully you) signed up for the Web Rebels newsletter with this address.</p>",
        `<p><a href="${confirmUrl}">One click and you're in</a></p>`,
        "<p>The link works for 48 hours. If this wasn't you, just delete this email and we won't bother you again.</p>",
        "<p>Web Rebels</p>",
      ].join("\n"),
    });
    console.log(`Confirmation email queued for ${email}: ${result.id || result.message || "ok"}`);
  } catch (err) {
    console.error(`Failed to send confirmation email to ${email}:`, err.message);
    return { statusCode: 502, body: "Failed to send confirmation email" };
  }

  return { statusCode: 200, body: "Confirmation email sent" };
};
