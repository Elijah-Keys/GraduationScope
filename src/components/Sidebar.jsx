import React from "react";
import { IoIosHome } from "react-icons/io";
import { GiBrain } from "react-icons/gi";
import { FaCircleInfo } from "react-icons/fa6";
import { Link } from "react-router-dom";
import "./Header.css"; // Use your existing styles

export default function Sidebar() {
  return (
    <div className="navy-sidebar">
      <Link to="/">
        <IoIosHome className="sidebar-icon" />
      </Link>
      <Link to="/recommend">
        <GiBrain className="sidebar-icon" />
      </Link>
      <Link to="/about">
        <FaCircleInfo className="sidebar-icon" />
      </Link>
    </div>
  );
}
