module.exports = async (req, res) => {
  res.status(200).json({
    hasSecret: !!process.env.STRIPE_SECRET_KEY,
    priceMonth: process.env.STRIPE_PRICE_MONTH || null,
    priceYear: process.env.STRIPE_PRICE_YEAR || null,
    appUrl: process.env.APP_URL || null
  });
};
