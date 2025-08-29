const Stripe = require("stripe");
module.exports = async (req, res) => {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return res.status(500).json({ ok:false, error:"secret_missing" });
    const stripe = new Stripe(key);
    const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_MONTH);
    res.status(200).json({ ok:true, priceId: price.id });
  } catch (e) {
    res.status(500).json({ ok:false, error: String(e.message) });
  }
};
