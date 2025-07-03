import React from "react";
import UniversitySearch from "./UniversitySearch";
import "./Home.css";
import DesktopBottomBar from "./DesktopBottomBar";

export default function Home() {   
  return (
    <div>
      <div
        className="hero-section"
        style={{
          backgroundImage: 'url("/hero.jpg")',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          width: "100vw",
          height: "calc(100vh - 100px)", // 100px = header height
          marginTop: "100px",
          marginLeft: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <div className="hero-blur-overlay"></div>
        <div className="hero-overlay">
          <UniversitySearch />
        </div>
      </div>

     {/* Use the DesktopBottomBar component here */}
      <DesktopBottomBar />
    </div>
  );
}
