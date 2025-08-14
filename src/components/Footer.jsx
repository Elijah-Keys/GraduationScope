import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.css";

// NavLink that scrolls to top after route change
const ScrollLink = ({ to, children, onClick, ...rest }) => (
  <NavLink
    to={to}
    onClick={(e) => {
      onClick?.(e);
      // run right after navigation so the new page is mounted
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    }}
    {...rest}
  >
    {children}
  </NavLink>
);

export default function Footer({ isHome }) {
  const year = new Date().getFullYear();

  // Leave space so the mobile BottomBar (fixed) doesn’t cover the footer
  const needsBottomBarSpace =
    typeof window !== "undefined" && window.innerWidth <= 768 && !isHome;

  return (
    <footer
      className="site-footer"
      style={{ paddingBottom: needsBottomBarSpace ? "84px" : "24px" }}
    >
      <div className="footer-inner">
        <div className="brand">
          <img
            src="/graduation-scope-logo.png"
            alt="Graduation Scope logo"
            className="brand-logo"
          />
          <div>
            <div className="brand-name">Graduation Scope</div>
            <div className="tagline">Smarter GE planning.</div>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <div className="col">
            <h4>App</h4>
            <ScrollLink to="/">Home</ScrollLink>
            <ScrollLink to="/about">About</ScrollLink>
            <ScrollLink to="/contact">Contact</ScrollLink>
            <ScrollLink to="/survey">Survey</ScrollLink>
            <ScrollLink to="/privacy">Privacy</ScrollLink>
            <ScrollLink to="/terms">Terms</ScrollLink>
          </div>
          <div className="col">
            <h4>Universities</h4>
            <ScrollLink to="/sjsu">SJSU Tracker</ScrollLink>
            <ScrollLink to="/recommend">SJSU Recommend</ScrollLink>
            <ScrollLink to="/chico">Chico Tracker</ScrollLink>
            <ScrollLink to="/chicorecommend">Chico Recommend</ScrollLink>
            <ScrollLink to="/berkeley">Berkeley Tracker</ScrollLink>
            <ScrollLink to="/berkeleyrecommend">Berkeley Recommend</ScrollLink>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© {year} Graduation Scope</span>
      </div>
    </footer>
  );
}
