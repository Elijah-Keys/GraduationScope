import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IoIosHome } from "react-icons/io";
import { GiBrain } from "react-icons/gi";
import { FaCircleInfo } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import "./MobileBottomBar.css";

export default function MobileBottomBar() {
  const location = useLocation();
  const isOnRecommend = location.pathname === "/recommend";

  return (
    <nav className="navy-bottom-bar" role="navigation" aria-label="Mobile Navigation">
      <Link to="/" className="bottom-bar-link" aria-label="Home">
        <IoIosHome className="bottom-bar-icon" />
        <span className="bottom-bar-text">Home</span>
      </Link>

      {isOnRecommend ? (
        <Link to="/sjsu" className="bottom-bar-link" aria-label="Back to SJSU">
          <IoIosArrowBack className="bottom-bar-icon" />
          <span className="bottom-bar-text">Back</span>
        </Link>
      ) : (
        <Link to="/recommend" className="bottom-bar-link" aria-label="Recommendations">
          <GiBrain className="bottom-bar-icon" />
          <span className="bottom-bar-text">Recommend</span>
        </Link>
      )}

      <Link to="/about" className="bottom-bar-link" aria-label="About">
        <FaCircleInfo className="bottom-bar-icon" />
        <span className="bottom-bar-text">About</span>
      </Link>
    </nav>
  );
}
