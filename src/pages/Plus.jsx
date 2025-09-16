// src/pages/Plus.jsx
import React, { useContext, useState } from "react";
import { PremiumContext } from "../PremiumContext";

export default function Plus() {
  const { premium } = useContext(PremiumContext);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const validEmail = /\S+@\S+\.\S+/.test(email);

  // Base URL: live site when deployed
  const apiBase = window.location.origin.includes("localhost")
    ? "https://graduationscope.com"
    : "";

  const startCheckout = (interval) => {
    if (!validEmail || busy) return;
    setBusy(true);

    // Call your backend redirect (auto 303 -> Stripe Checkout)
    const url = `${apiBase}/api/checkout-redirect?email=${encodeURIComponent(
      email.trim().toLowerCase()
    )}&interval=${interval}`;
    window.location.href = url;
  };

  const openPortal = () => {
    window.location.href = `${apiBase}/api/portal-redirect`;
  };

  return (
    <div
      className="plus-page"
      style={{ textAlign: "center", padding: "100px 20px 60px" }} // added top padding
    >
      <section style={{ marginBottom: "50px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
          GraduationScope Plus
        </h1>
        <p style={{ fontSize: "1.2rem", color: "#555" }}>
          Go ad free. Support development. Cancel anytime.
        </p>
      </section>

      {premium ? (
        <section style={{ margin: "0 auto", maxWidth: 500 }}>
          <h2>Thanks for upgrading 🎉</h2>
          <p>Your account is premium. Ads are off across the site.</p>
          <button
            className="btn primary"
            onClick={openPortal}
            style={{ marginTop: 20, padding: "12px 24px" }}
          >
            Manage billing
          </button>
        </section>
      ) : (
        <>
          <section style={{ margin: "0 auto", maxWidth: 400 }}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              Email
            </label>
            <input
              className="input"
              placeholder="enter the email you logged in with"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoComplete="email"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                marginBottom: 20,
              }}
            />

            <button
              className="btn primary"
              onClick={() => startCheckout("month")}
              disabled={!validEmail || busy}
              style={{
                width: "100%",
                padding: "15px",
                marginBottom: 16,
                fontSize: "1.1rem",
              }}
            >
              {busy ? "Loading..." : "Buy Monthly"}
            </button>

            <button
              className="btn secondary"
              onClick={() => startCheckout("year")}
              disabled={!validEmail || busy}
              style={{
                width: "100%",
                padding: "15px",
                fontSize: "1.1rem",
              }}
            >
              {busy ? "Loading..." : "Buy Yearly"}
            </button>

            <div style={{ marginTop: 12, fontSize: "0.9rem", color: "#666" }}>
              By continuing, you agree to our Terms and Privacy.
            </div>
          </section>

          <section style={{ marginTop: 60 }}>
            <h3 style={{ marginBottom: 20 }}>What you get</h3>
            <ul style={{ listStyle: "none", padding: 0, lineHeight: "1.8" }}>
              <li>✅ No ads sitewide</li>
              <li>✅ Faster page loads</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
