import React, { useEffect, useState } from "react";
import "../AuthModal.css";

export default function SignInModal({
  onClose,
  onLogin,
  prefillEmail = "",
  onShowSignUp,
}) {
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { if (prefillEmail) setEmail(prefillEmail); }, [prefillEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Same gentle UX validation as Sign Up
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!validEmail) {
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await Promise.resolve(onLogin && onLogin({ email, password, rememberMe }));
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="modal-overlay" role="dialog" aria-modal="true" data-ui="signin-v2">
      <div className="auth-modal is-transparent">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
          title="Close"
          type="button"
        >
          &times;
        </button>

        <div className="auth-head">
          <div className="auth-title">Welcome back</div>
          <div className="auth-sub">Log in to continue your plan.</div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="field">
            <label className="label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="login-password">Password</label>
            <div className="input-row">
              <input
                id="login-password"
                className="input"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                title={showPw ? "Hide" : "Show"}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              Remember me
            </label>
            <a
              href="/forgot"
              style={{ textDecoration: "underline" }}
              aria-label="Forgot password"
            >
              Forgot?
            </a>
          </div>

          {message && (
            <div className="message error" role="alert">
              {message}
            </div>
          )}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>

        <div className="helper">
          No account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onShowSignUp && onShowSignUp(email || "");
            }}
          >
            Create one
          </a>
        </div>
      </div>
    </div>
  );
}
