// api/checkout-redirect.js
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
    // allow only GET (navigation)
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).send("Method Not Allowed");
    }

    const email = (req.query.email || "").trim().toLowerCase();
    const interval = req.query.interval === "year" ? "year" : "month";

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).send("Bad email");
    }

    const priceId = interval === "month"
      ? process.env.STRIPE_PRICE_MONTH
      : process.env.STRIPE_PRICE_YEAR;

    if (!priceId) return res.status(500).send("Missing price env");

    const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;

    const s = getStripe();
    const session = await s.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${baseUrl}/api/checkout-complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/premium/cancelled`
    });

    // 303 redirect to Stripe Checkout
    return res.redirect(303, session.url);
  } catch (e) {
    return res.status(500).send("Error: " + String(e.message));
  }
};
