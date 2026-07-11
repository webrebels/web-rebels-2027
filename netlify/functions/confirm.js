// Target of the signed link in the confirmation email. Verifies the token
// and adds the address to the Mailgun mailing list.
const { verify, mailgunPost } = require("./lib/shared");

const MAX_AGE_MS = 48 * 60 * 60 * 1000;

function redirect(status) {
  return { statusCode: 302, headers: { Location: `/?signup=${status}#newsletter` } };
}

exports.handler = async (event) => {
  const { email = "", ts = "", sig = "" } = event.queryStringParameters || {};

  if (!verify(email, ts, sig, MAX_AGE_MS)) {
    return redirect("invalid");
  }

  try {
    await mailgunPost(`/lists/${process.env.MAILGUN_LIST}/members`, {
      address: email,
      subscribed: "yes",
      upsert: "yes",
    });
  } catch (err) {
    console.error(err);
    return redirect("error");
  }

  return redirect("confirmed");
};
