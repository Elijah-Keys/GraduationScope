// MobileBottomBar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IoIosHome } from "react-icons/io";
import { GiBrain } from "react-icons/gi";
import { FaCircleInfo } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import "./MobileBottomBar.css";

export default function MobileBottomBar() {
  const location = useLocation();
  const path = location.pathname;

  const isOnSJRecommend = path === "/recommend";
  const isOnChicoRecommend = path === "/chicorecommend";
  const isOnSJSU = path === "/sjsu";
  const isOnChico = path === "/chico";

  let linkTo, ariaLabel, icon, text;

  if (isOnChicoRecommend) {
    linkTo = "/chico";
    ariaLabel = "Back to Chico";
    icon = <IoIosArrowBack className="bottom-bar-icon" />;
    text = "Back";
  } else if (isOnSJRecommend) {
    linkTo = "/sjsu";
    ariaLabel = "Back to San Jose";
    icon = <IoIosArrowBack className="bottom-bar-icon" />;
    text = "Back";
  } else if (isOnChico) {
    linkTo = "/chicorecommend";
    ariaLabel = "Recommend for Chico";
    icon = <GiBrain className="bottom-bar-icon" />;
    text = "Recommend";
  } else if (isOnSJSU) {
    linkTo = "/recommend";
    ariaLabel = "Recommend for San Jose State";
    icon = <GiBrain className="bottom-bar-icon" />;
    text = "Recommend";
  } else {
    linkTo = "/recommend";
    ariaLabel = "Recommend";
    icon = <GiBrain className="bottom-bar-icon" />;
    text = "Recommend";
  }

  const isRecommendCTA = text === "Recommend"; // only glow when it's the Recommend action

  return (
    <nav className="navy-bottom-bar" role="navigation" aria-label="Mobile Navigation">
      <Link to="/" className="bottom-bar-link" aria-label="Home">
        <IoIosHome className="bottom-bar-icon" />
        <span className="bottom-bar-text">Home</span>
      </Link>

      <Link
        to={linkTo}
        className={`bottom-bar-link ${isRecommendCTA ? "recommend-cta" : ""}`}
        aria-label={ariaLabel}
      >
        <span className="cta-glow" aria-hidden="true" />
        {icon}
        <span className="bottom-bar-text">{text}</span>
      </Link>

      <Link to="/about" className="bottom-bar-link" aria-label="About">
        <FaCircleInfo className="bottom-bar-icon" />
        <span className="bottom-bar-text">About</span>
      </Link>
    </nav>
  );
}
