import React, { useState } from "react";
import "./SignUpModal.css";

export default function SignUpModal({ onClose, onSignUp, onShowLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function normalizeEmail(email) {
    return email.trim().toLowerCase();
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem("users") || "{}");
    } catch {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

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
      if (onShowLogin) {
        onShowLogin(normalizedEmail); // Pass the email to prefill in login
      }
    }, 1200);
  }

  function handleClose() {
    if (onClose) onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="login-modal-content">
        <button className="modal-close" onClick={handleClose} title="Close">&times;</button>
        <h1>Sign Up</h1>
        <form onSubmit={handleSignUp} autoComplete="off">
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              autoComplete="username"
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <i className="fa fa-envelope" aria-hidden="true" />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="new-password"
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <i className="fa fa-lock" aria-hidden="true" />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              autoComplete="new-password"
              onChange={e => setConfirm(e.target.value)}
              disabled={loading}
              required
            />
            <i className="fa fa-lock" aria-hidden="true" />
          </div>
          {message && (
            <div
              style={{
                color: message.startsWith("Account created") ? "#21824b" : "#d32f2f",
                background: message.startsWith("Account created") ? "#e8f5e9" : "#ffebee",
                borderRadius: 6,
                fontWeight: 600,
                padding: "10px 12px",
                marginBottom: 18,
                textAlign: "center"
              }}
            >
              {message}
            </div>
          )}
          <button
            className="btn"
            type="submit"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, pointerEvents: loading ? "none" : "auto" }}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <div className="register-link" style={{ marginTop: 12 }}>
          Already have an account?{" "}
          <a href="#" onClick={e => { e.preventDefault(); if (onShowLogin) onShowLogin(); }}>
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
