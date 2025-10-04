import React, { useState } from "react";
import "./AuthModal.css";

export default function SignUpModal({ onClose, onSignUp, onShowLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  function normalizeEmail(v) { return v.trim().toLowerCase(); }
  function getUsers() {
    try { return JSON.parse(localStorage.getItem("users") || "{}"); }
    catch { return {}; }
  }
  function saveUsers(users) { localStorage.setItem("users", JSON.stringify(users)); }

  async function handleSignUp(e) {
    e.preventDefault();
    setMessage("");

    if (!email || !password || !confirm) {
      setMessage("All fields are required.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const users = getUsers();
    const normalizedEmail = normalizeEmail(email);

    if (users[normalizedEmail]) {
      setMessage("There is already an account under that email.");
      setLoading(false);
      return;
    }

    users[normalizedEmail] = { password, classesTaken: [] };
    saveUsers(users);

    setMessage("Account created! Redirecting to log in...");
    setTimeout(() => {
      setLoading(false);
      onShowLogin && onShowLogin(normalizedEmail);
    }, 1000);
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="auth-modal is-transparent">
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>

        <div className="auth-head">
          <div className="auth-title">Create your account</div>
          <div className="auth-sub">It only takes a minute.</div>
        </div>

        <form className="auth-form" onSubmit={handleSignUp} autoComplete="off">
          <div className="field">
            <label className="label" htmlFor="su-email">Email</label>
            <input
              id="su-email"
              className="input"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              disabled={loading}
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="su-password">Password</label>
            <div className="input-row">
              <input
                id="su-password"
                className="input"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          <div className="field">
            <label className="label" htmlFor="su-confirm">Confirm password</label>
            <div className="input-row">
              <input
                id="su-confirm"
                className="input"
                type={showPw2 ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPw2((s) => !s)}
                aria-label={showPw2 ? "Hide password" : "Show password"}
                title={showPw2 ? "Hide" : "Show"}
              >
                {showPw2 ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {message && (
            <div className={`message ${message.startsWith("Account created") ? "ok" : "error"}`}>
              {message}
            </div>
          )}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="helper">
          Already have an account?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); onShowLogin && onShowLogin(); }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
