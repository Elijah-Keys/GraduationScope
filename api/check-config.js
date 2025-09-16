// api/check-config.js
module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).end(JSON.stringify({
    hasSecret: !!process.env.STRIPE_SECRET_KEY,
    monthSet: !!process.env.STRIPE_PRICE_MONTH,
    yearSet: !!process.env.STRIPE_PRICE_YEAR,
    keyMode:
      (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_") ? "test" :
      (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live_") ? "live" :
      "missing",
    // helpful to spot whitespace:
    monthLen: (process.env.STRIPE_PRICE_MONTH || "").length,
    yearLen: (process.env.STRIPE_PRICE_YEAR || "").length
  }));
};
