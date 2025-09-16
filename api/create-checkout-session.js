// api/create-checkout-session.js
let stripe;
function getStripe() {
  if (!stripe) {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16"
    });
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
  } catch (e) {
    return { __bodyError: String(e.message) };
  }
}

function looksLikeEmail(e) {
  return typeof e === "string" && /\S+@\S+\.\S+/.test(e);
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "method_not_allowed" });
    }

    const body = await readBody(req);
    if (body.__bodyError) {
      return res.status(400).json({ error: "bad_json", detail: body.__bodyError });
    }

    const interval = body.interval;
    let email = (body.email || "").trim().toLowerCase();

    if (!looksLikeEmail(email) || !["month", "year"].includes(interval)) {
      return res.status(400).json({ error: "email_and_interval_required" });
    }

    const priceId =
      interval === "month"
        ? process.env.STRIPE_PRICE_MONTH
        : process.env.STRIPE_PRICE_YEAR;

    if (!priceId) {
      return res.status(500).json({ error: "missing_price_env" });
    }

    const baseUrl = process.env.APP_URL || `https://${req.headers.host}`;

    const s = getStripe();
    const session = await s.checkout.sessions.create(
      {
        mode: "subscription",
        customer_email: email,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        client_reference_id: `gs_${interval}_${Date.now()}`,
        // Optional. Uncomment when ready to collect tax and addresses.
        // billing_address_collection: "auto",
        // automatic_tax: { enabled: true },
        success_url: `${baseUrl}/plus?success=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/premium/cancelled`
      },
      {
        idempotencyKey: `checkout_${email}_${interval}_${new Date().toISOString().slice(0,13)}`
      }
    );

    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: "server_error", detail: String(e.message) });
  }
};
