import React, { useState, useEffect } from "react";
import "./SignInModal.css";

export default function SignInModal({ onClose, onLogin, prefillEmail, onShowSignUp }) {
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

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

  async function handleSignIn(e) {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);

    const users = getUsers();
    const normalizedEmail = normalizeEmail(email);
    const user = users[normalizedEmail];

    if (!user) {
      setMessage("No account found with that email.");
      setLoading(false);
      return;
    }

    if (user.password !== password) {
      setMessage("Incorrect password.");
      setLoading(false);
      return;
    }

    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("currentUser", normalizedEmail);

    setMessage("Login successful! Redirecting...");

    if (onLogin) onLogin({ email: normalizedEmail, password });

    setTimeout(() => {
      setLoading(false);
      if (onClose) onClose();
    }, 1200);
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotMessage("");

    if (!forgotEmail) {
      setForgotMessage("Please enter your email.");
      return;
    }

    setForgotLoading(true);

    const users = getUsers();
    const normalizedForgotEmail = normalizeEmail(forgotEmail);

    if (!users[normalizedForgotEmail]) {
      setForgotMessage("No account found with that email.");
      setForgotLoading(false);
      return;
    }

    setForgotMessage(`Password reset link sent to ${normalizedForgotEmail}. Check your email.`);
    setForgotLoading(false);
  }

  function handleClose() {
    if (onClose) onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="login-modal-content">
        <button className="modal-close" onClick={handleClose} title="Close">&times;</button>
        {!forgotPasswordMode ? (
          <>
            <h1 style={{ textAlign: "center", marginBottom: 28, fontWeight: 600 }}>Log In</h1>
            <form onSubmit={handleSignIn} autoComplete="off">
              <div className="input-box" style={{ marginBottom: 20 }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  autoComplete="username"
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  style={{ fontSize: "1.05rem", padding: "14px 16px" }}
                />
                <i className="fa fa-envelope" aria-hidden="true" />
              </div>
              <div className="input-box" style={{ marginBottom: 8 }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  style={{ fontSize: "1.05rem", padding: "14px 16px" }}
                />
                <i className="fa fa-lock" aria-hidden="true" />
              </div>
              {/* Forgot Password link above button */}
              <div style={{ marginBottom: 12, textAlign: "left" }}>
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setForgotPasswordMode(true);
                    setForgotEmail("");
                    setForgotMessage("");
                  }}
                  style={{
                    color: "#ffd700",
                    fontWeight: 500,
                    fontSize: "0.98rem",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Forgot Password?
                </a>
              </div>
              {message && (
                <div
                  style={{
                    color: message.startsWith("Login successful") ? "#21824b" : "#d32f2f",
                    background: message.startsWith("Login successful") ? "#e8f5e9" : "#ffebee",
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
                style={{
                  width: "100%",
                  padding: "15px 0",
                  background: "#14213d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  marginBottom: 18,
                  transition: "background 0.2s, color 0.2s"
                }}
              >
                {loading ? "Logging In..." : "Log In"}
              </button>
            </form>
            <div style={{ textAlign: "center", fontSize: "1rem", marginTop: 10 }}>
              Don't have an account?{" "}
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (onShowSignUp) onShowSignUp();
                }}
                style={{
                  color: "#ffd700",
                  fontWeight: 600,
                  textDecoration: "underline",
                  marginLeft: 2
                }}
              >
                Sign up
              </a>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ textAlign: "center", marginBottom: 28, fontWeight: 600 }}>Forgot Password</h1>
            <form onSubmit={handleForgotPassword} autoComplete="off">
              <div className="input-box" style={{ marginBottom: 20 }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  autoComplete="username"
                  onChange={e => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                  required
                  style={{ fontSize: "1.05rem", padding: "14px 16px" }}
                />
                <i className="fa fa-envelope" aria-hidden="true" />
              </div>
              {forgotMessage && (
                <div
                  style={{
                    color: forgotMessage.startsWith("Password reset link") ? "#21824b" : "#d32f2f",
                    background: forgotMessage.startsWith("Password reset link") ? "#e8f5e9" : "#ffebee",
                    borderRadius: 6,
                    fontWeight: 600,
                    padding: "10px 12px",
                    marginBottom: 18,
                    textAlign: "center"
                  }}
                >
                  {forgotMessage}
                </div>
              )}
              <button
                className="btn"
                type="submit"
                disabled={forgotLoading}
                style={{
                  width: "100%",
                  padding: "15px 0",
                  background: "#14213d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  cursor: forgotLoading ? "default" : "pointer",
                  opacity: forgotLoading ? 0.7 : 1,
                  marginBottom: 18,
                  transition: "background 0.2s, color 0.2s"
                }}
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <div style={{ textAlign: "center", fontSize: "1rem", marginTop: 10 }}>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setForgotPasswordMode(false);
                  setMessage("");
                }}
                style={{
                  color: "#ffd700",
                  fontWeight: 600,
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
              >
                Back to Log In
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
