import React from 'react';
import './Header.css';
import { Link } from "react-router-dom";

function Header({ isAuthenticated, onLogout, onShowSignUp, onShowLogin }) {

  return (
    <header className="navy-header">
      <div className="navy-header-content">
        <div className="logo-circle-wrapper">
          <div className="navy-circle"></div>
          <img
            src="/graduation-scope-logo.png"
            alt="Graduation Scope Logo"
            className="navy-logo"
          />
        </div>
        <span className="navy-title">Graduation Scope</span>
        <div className="spacer" />
        <div className="auth-links">
          {isAuthenticated ? (
            <>
              <Link to="/account" className="account-link">Account Settings</Link>
              <button onClick={onLogout} className="logout-button">Log Out</button>
            </>
          ) : (
            <div className="guest-links">
            <button className="signup-link" onClick={onShowSignUp} style={{ background: "none", border: "none", cursor: "pointer" }}>
  Sign Up
</button>
<button
  className="login-link"
  onClick={onShowLogin}
  style={{ background: "none", border: "none", cursor: "pointer" }}
>
  Log In
</button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
