// Target of the signed link in the confirmation email. Verifies the token
// and adds the address to the Mailgun mailing list.
const { verify, mailgunPost, checkEnv } = require("./lib/shared");

const MAX_AGE_MS = 48 * 60 * 60 * 1000;

function redirect(status) {
  return { statusCode: 302, headers: { Location: `/?signup=${status}#newsletter` } };
}

exports.handler = async (event) => {
  checkEnv();
  const { email = "", ts = "", sig = "" } = event.queryStringParameters || {};

  if (!verify(email, ts, sig, MAX_AGE_MS)) {
    console.log(`Rejected confirmation link for ${email} (bad signature or older than 48h, ts=${ts})`);
    return redirect("invalid");
  }

  try {
    await mailgunPost(`/lists/${process.env.MAILGUN_LIST}/members`, {
      address: email,
      subscribed: "yes",
      upsert: "yes",
    });
  } catch (err) {
    console.error(`Failed to add ${email} to the list:`, err.message);
    return redirect("error");
  }

  console.log(`Added ${email} to ${process.env.MAILGUN_LIST}`);
  return redirect("confirmed");
};
