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

  // Determine if we are on one of the recommendation pages
  const isOnSJRecommend = path === "/recommend";
  const isOnChicoRecommend = path === "/chicorecommend";

  // Determine if we are on one of the campus home pages
  const isOnSJSU = path === "/sjsu";
  const isOnChico = path === "/chico";

  // For rendering the Recommend / Back link
  // Back link points to campus home if on recommend page for that campus
  // Recommend link points to recommend page corresponding to current campus home

  let linkTo, ariaLabel, icon, text;

  if (isOnChicoRecommend) {
    // On Chico recommend page: show Back to /chico
    linkTo = "/chico";
    ariaLabel = "Back to Chico";
    icon = <IoIosArrowBack className="bottom-bar-icon" />;
    text = "Back";
  } else if (isOnSJRecommend) {
    // On San Jose recommend page: show Back to /sjsu
    linkTo = "/sjsu";
    ariaLabel = "Back to San Jose";
    icon = <IoIosArrowBack className="bottom-bar-icon" />;
    text = "Back";
  } else if (isOnChico) {
    // On Chico home page: show Recommend linking to /chicorecommend
    linkTo = "/chicorecommend";
    ariaLabel = "Recommend for Chico";
    icon = <GiBrain className="bottom-bar-icon" />;
    text = "Recommend";
  } else if (isOnSJSU) {
    // On San Jose home page: show Recommend linking to /recommend
    linkTo = "/recommend";
    ariaLabel = "Recommend for San Jose State";
    icon = <GiBrain className="bottom-bar-icon" />;
    text = "Recommend";
  } else {
    // For all other pages, fallback: show Recommend linking to /recommend
    linkTo = "/recommend";
    ariaLabel = "Recommend";
    icon = <GiBrain className="bottom-bar-icon" />;
    text = "Recommend";
  }

  return (
    <nav className="navy-bottom-bar" role="navigation" aria-label="Mobile Navigation">
      <Link to="/" className="bottom-bar-link" aria-label="Home">
        <IoIosHome className="bottom-bar-icon" />
        <span className="bottom-bar-text">Home</span>
      </Link>

      <Link to={linkTo} className="bottom-bar-link" aria-label={ariaLabel}>
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
