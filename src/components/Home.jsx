import React, { useRef } from "react";
import UniversitySearch from "./UniversitySearch";
import "./Home.css";

// Mobile detection hook
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
  const isMobile = useMobile();
  const heroImage = "/hero1.jpg";
  const searchRef = useRef(null);

const scrollToSearch = () => {
  if (searchRef.current) {
    searchRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      searchRef.current.focus(); // You can use click() if you prefer
    }, 600);
  }
};

<UniversitySearch ref={searchRef} />

  return (
    <div className="home-root">
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center center",
          backgroundSize: isMobile ? "107.5% 100%" : "cover",
          backgroundRepeat: "no-repeat",
          width: isMobile ? "100vw" : "100%",
          height: isMobile ? "140vw" : "calc(100vh - 100px)",
          marginTop: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div className="hero-blur-overlay"></div>
        <div className="hero-overlay">
          <div className="hero-heading-group">
            <h1 className="hero-title">
              Your Path to <span style={{ color: "#FFD43A" }}>Graduation</span>
            </h1>
            <p className="hero-subtitle">
              Navigate your academic journey with confidence. Track requirements,
              <br />
              discover courses, and graduate on time with personalized guidance.
            </p>
          </div>
          <div className="hero-search-wrapper">
            <UniversitySearch ref={searchRef} />
          </div>
        </div>
      </div>

      <section className="cta-section">
        <h2 className="cta-title">Ready to Take Control of Your Academic Future?</h2>
        <p className="cta-subtitle">
          Join thousands of students who are successfully navigating their graduation requirements with confidence
        </p>
        <button className="cta-button" onClick={scrollToSearch}>
          Start Your Journey →
        </button>
        <div className="cta-links">
          <a href="/contact">Contact</a>
          <a href="/survey">Survey</a>
          <a href="/about">About</a>
        </div>
      </section>
    </div>
  );
}
