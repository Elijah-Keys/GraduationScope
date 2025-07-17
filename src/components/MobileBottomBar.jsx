import './MobileBottomBar.css';
import React from "react";
import { IoIosHome } from "react-icons/io";
import { GiBrain } from "react-icons/gi";
import { FaCircleInfo } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function MobileBottomBar() {
  return (
    <nav className="navy-bottom-bar">
      <Link to="/" className="bottom-bar-link">
        <IoIosHome />
      </Link>
      <Link to="/recommend" className="bottom-bar-link">
        <GiBrain />
      </Link>
      <Link to="/about" className="bottom-bar-link">
        <FaCircleInfo />
      </Link>
    </nav>
  );
}
