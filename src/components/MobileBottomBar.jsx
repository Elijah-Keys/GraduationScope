import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IoIosHome } from "react-icons/io";
import { GiBrain } from "react-icons/gi";
import { FaCircleInfo } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import "./MobileBottomBar.css";

/**
 * Mobile bottom navigation bar with dynamic icon for /recommend route.
 * Uses modern React Router and React Icons.
 * Shows only on mobile screens (see .css).
 */
export default function MobileBottomBar() {
  const location = useLocation();
  const isOnRecommend = location.pathname === "/recommend";

  return (
    <nav className="navy-bottom-bar" role="navigation" aria-label="Mobile Navigation">
      <Link to="/" className="bottom-bar-link" aria-label="Home">
        <IoIosHome />
      </Link>
      {isOnRecommend ? (
        <Link to="/sjsu" className="bottom-bar-link" aria-label="Back to SJSU">
          <IoIosArrowBack />
        </Link>
      ) : (
        <Link to="/recommend" className="bottom-bar-link" aria-label="Recommendations">
          <GiBrain />
        </Link>
      )}
      <Link to="/about" className="bottom-bar-link" aria-label="About">
        <FaCircleInfo />
      </Link>
    </nav>
  );
}
