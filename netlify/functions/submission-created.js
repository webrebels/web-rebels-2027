// Triggered by Netlify on every verified form submission.
// Sends a double opt-in confirmation email via Mailgun; the address is only
// added to the mailing list once the recipient clicks the signed link.
const { sign, mailgunPost } = require("./lib/shared");

exports.handler = async (event) => {
  const { payload } = JSON.parse(event.body);

  if (payload.form_name !== "newsletter") {
    return { statusCode: 200, body: "Ignored: not the newsletter form" };
  }

  const email = (payload.email || (payload.data && payload.data.email) || "").trim();
  if (!email) {
    return { statusCode: 422, body: "No email in submission" };
  }

  const ts = Date.now().toString();
  const query = new URLSearchParams({ email, ts, sig: sign(email, ts) });
  const confirmUrl = `${process.env.URL}/api/confirm?${query}`;

  await mailgunPost(`/${process.env.MAILGUN_DOMAIN}/messages`, {
    from: `Web Rebels <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: email,
    subject: "Confirm your Web Rebels newsletter subscription",
    text: [
      "Hi!",
      "",
      "Someone — hopefully you — signed up for the Web Rebels newsletter with this address.",
      "",
      "Confirm your subscription by clicking this link:",
      "",
      confirmUrl,
      "",
      "The link is valid for 48 hours. If you didn't sign up, you can safely ignore this email and you won't hear from us again.",
      "",
      "— Web Rebels",
    ].join("\n"),
    html: [
      "<p>Hi!</p>",
      "<p>Someone — hopefully you — signed up for the Web Rebels newsletter with this address.</p>",
      `<p><a href="${confirmUrl}">Confirm your subscription</a></p>`,
      "<p>The link is valid for 48 hours. If you didn't sign up, you can safely ignore this email and you won't hear from us again.</p>",
      "<p>— Web Rebels</p>",
    ].join("\n"),
  });

  return { statusCode: 200, body: "Confirmation email sent" };
};
