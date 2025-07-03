import React from "react";
import { Link } from "react-router-dom";
import "./DesktopBottomBar.css";

export default function DesktopBottomBar() {
  return (
    <div className="bottom-bar">
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/survey">Survey</Link>
    </div>
  );
}
