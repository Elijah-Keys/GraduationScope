import React from "react";
import UniversitySearch from "./UniversitySearch";
import "./Home.css";
import DesktopBottomBar from "./DesktopBottomBar";

// Custom hook to detect mobile screen size
function useMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 600);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

export default function Home() {
  const heroImage = "/hero1.jpg";           // <--- define here!
  const isMobile = useMobile();             // <--- define here!

  return (
    <div className="home-root">
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${heroImage})`,        // <-- heroImage now defined above
          backgroundPosition: 'center center',
          backgroundSize: isMobile ? '107.5% 100%' : 'cover',
          backgroundRepeat: 'no-repeat',
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "140vw" : "calc(100vh - 100px)",
          marginTop: "100px",
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
      <DesktopBottomBar />
    </div>
  );
}
