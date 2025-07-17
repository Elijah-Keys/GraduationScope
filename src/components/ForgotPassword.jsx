import React, { useState } from "react";


export default function ForgotPasswordPage({ onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: enter email, 2: set new password
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[email]) {
      setStep(2);
      setMessage("");
    } else {
      setMessage("No account found with that email.");
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    users[email].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));
    setMessage("Password successfully reset! You can now log in.");
    setTimeout(() => {
      setMessage("");
      onBackToLogin();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="login-modal-content">
        <button className="modal-close" onClick={onBackToLogin}>&times;</button>
        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <h1>Forgot Password</h1>
            <div className="input-box">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <i className='bx bxs-envelope'></i>
            </div>
            <button type="submit" className="btn">Next</button>
            <div className="register-link">
              <p>
                <a href="#" onClick={e => { e.preventDefault(); onBackToLogin(); }}>Back to Login</a>
              </p>
            </div>
            {message && <div className="success-toast" style={{marginTop: 12}}>{message}</div>}
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <h1>Reset Password</h1>
            <div className="input-box">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <i className='bx bxs-lock-alt'></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <i className='bx bxs-lock-alt'></i>
            </div>
            <button type="submit" className="btn">Set Password</button>
            <div className="register-link">
              <p>
                <a href="#" onClick={e => { e.preventDefault(); onBackToLogin(); }}>Back to Login</a>
              </p>
            </div>
            {message && <div className="success-toast" style={{marginTop: 12}}>{message}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
