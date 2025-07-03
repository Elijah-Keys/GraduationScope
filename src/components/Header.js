import React from 'react';
import './Header.css';

function Header() {
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
        <div className="auth-links">
          <span className="signup-link">Sign Up</span>
          <span className="login-link">Log In</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
