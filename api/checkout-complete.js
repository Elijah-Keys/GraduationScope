let stripe;
function getStripe() {
  if (!stripe) {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  }
  return stripe;
}

module.exports = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).send("Missing session_id");

    const s = getStripe();
    const session = await s.checkout.sessions.retrieve(sessionId, { expand: ["customer"] });
    const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;

    if (!customerId) return res.status(400).send("No customer on session");

    // set cookie for 400 days
    const host = req.headers.host || "";
    const cookieDomain = process.env.COOKIE_DOMAIN || host.split(":")[0];
    const secure = cookieDomain !== "localhost";

    res.setHeader("Set-Cookie", [
      `premium_cust=${customerId}; Path=/; Max-Age=${60*60*24*400}; SameSite=Lax; ${secure ? "Secure; " : ""}Domain=${cookieDomain}`
    ]);

    const baseUrl = process.env.APP_URL || `https://${host}`;
    res.redirect(302, `${baseUrl}/plus?welcome=1`);
  } catch (e) {
    res.status(500).send("Error: " + String(e.message));
  }
};
// inside checkout-complete handler after you get customerId
const host = req.headers.host || "";
const cookieDomain = process.env.COOKIE_DOMAIN || "graduationscope.com";
const secure = true;

res.setHeader("Set-Cookie", [
  `premium_cust=${customerId}; Path=/; Max-Age=${60*60*24*400}; SameSite=Lax; ${secure ? "Secure; " : ""}Domain=${cookieDomain}`
]);

const baseUrl = process.env.APP_URL || `https://${host}`;
res.redirect(302, `${baseUrl}/plus?welcome=1`);
