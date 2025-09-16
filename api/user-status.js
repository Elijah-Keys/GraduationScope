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
    const raw = req.headers.cookie || "";
    const m = raw.match(/premium_cust=([^;]+)/);
    const customerId = m && m[1];

    if (req.query && req.query.debug === "1") {
      return res.status(200).json({ debug: true, hasCookie: !!customerId, customerId: customerId || null });
    }

    if (!customerId) {
      return res.status(200).json({ plan: "free", active: false, interval: null });
    }

    const s = getStripe();
    const subs = await s.subscriptions.list({
      customer: customerId,
      status: "all",
      expand: ["data.items.data.price"],
      limit: 10
    });

    const activeSub = subs.data.find(x => ["active", "trialing", "past_due", "unpaid"].includes(x.status));
    if (!activeSub) {
      return res.status(200).json({ plan: "free", active: false, interval: null });
    }

    const item = activeSub.items?.data?.[0];
    const interval = item?.price?.recurring?.interval || null;
    return res.status(200).json({ plan: "premium", active: true, interval });
  } catch (e) {
    return res.status(200).json({ plan: "free", active: false, interval: null, _err: String(e.message) });
  }
};
