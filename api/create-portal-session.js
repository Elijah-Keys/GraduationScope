let stripe;
function getStripe() {
  if (!stripe) {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  }
  return stripe;
}

async function readBody(req) {
  try {
    if (req.body && typeof req.body === "object") return req.body;
    if (typeof req.body === "string") return JSON.parse(req.body || "{}");
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString("utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const body = await readBody(req);
  const raw = req.headers.cookie || "";
  const cm = raw.match(/premium_cust=([^;]+)/);
  const customerId = body.customerId || (cm && cm[1]);

  if (!customerId) return res.status(400).json({ error: "missing_customer" });

  try {
    const s = getStripe();
    const portal = await s.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_URL || `https://${req.headers.host}`}/plus`
    });
    return res.status(200).json({ url: portal.url });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e.message) });
  }
};
