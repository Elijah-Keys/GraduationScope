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
         <div className="hero-heading-group">
  <h1 className="hero-title">Your Path to <span style={{ color: "#FFD43A" }}>Graduation</span></h1>
  <p className="hero-subtitle">
    Navigate your academic journey with confidence. Track requirements,<br />
    discover courses, and graduate on time with personalized guidance.
  </p>
</div>
      <div className="hero-search-wrapper">
  <UniversitySearch />
</div>
        </div>
      </div>
   
      <section className="feature-section">
  <h2 className="feature-title">Everything You Need to Graduate</h2>
  <p className="feature-subtitle">
    Comprehensive tools and insights to navigate your academic journey with confidence
  </p>
  <div className="feature-grid">
    <div className="feature-card">
      <div className="feature-icon">🎯</div>
      <h3>Track Requirements</h3>
      <p>Monitor your progress through graduation requirements with detailed tracking and visual progress indicators.</p>
    </div>
    <div className="feature-card">
      <div className="feature-icon">📖</div>
      <h3>Smart Recommendations</h3>
      <p>Get personalized course suggestions based on your academic goals, interests, and graduation timeline.</p>
    </div>
    <div className="feature-card">
      <div className="feature-icon">🎓</div>
      <h3>Expert Guidance</h3>
      <p>Access curated information about course difficulty, professor ratings, and student success rates.</p>
    </div>
    <div className="feature-card">
      <div className="feature-icon">📊</div>
      <h3>Progress Analytics</h3>
      <p>Visualize your academic journey with comprehensive analytics and milestone tracking.</p>
    </div>
  </div>
</section>
<section className="cta-section">
  <h2 className="cta-title">Ready to Take Control of Your Academic Future?</h2>
  <p className="cta-subtitle">
    Join thousands of students who are successfully navigating their graduation requirements with confidence
  </p>
  <button className="cta-button">Start Your Journey →</button>
 <div className="cta-links">
  <a href="/contact">Contact</a>
  <a href="/survey">Survey</a>
  <a href="/about">About</a>
</div>
</section>

    </div>
  );
}
