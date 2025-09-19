import React, { useRef, useEffect } from "react";
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

  // Smooth scroll and focus the search input
  const scrollToSearch = () => {
    if (searchRef.current) {
      searchRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => { searchRef.current.focus(); }, 600);
    }
  };

  // Reveal on view
  useEffect(() => {
    const els = document.querySelectorAll(".home-root .reveal");
    if (!els.length) return;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) e.target.classList.add("in");
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

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
        <div className="hero-scrim"></div>

        <div className="hero-overlay">
          <div className="hero-heading-group">
            <h1 className="hero-title reveal">
              Your Path to <span style={{ color: "#FFD43A" }}>Graduation</span>
            </h1>
            <p className="hero-subtitle reveal">
              Navigate your academic journey with confidence. Track requirements,
              <br />
              discover courses, and graduate on time with personalized guidance.
            </p>
          </div>

          <div className="hero-search-wrapper reveal">
            {/* Pass the ref down so we can focus the actual input */}
            <UniversitySearch ref={searchRef} />
          </div>
        </div>
      </div>
{/* About Graduation Scope */}
<section className="about-section">
  <div className="about-inner">
    <h2 className="about-title reveal">About Graduation Scope</h2>
    <p className="about-subtitle reveal">
      Graduation Scope helps you plan smarter. Track GE and major requirements, find classes that fit your schedule, and see professor info in one place.
    </p>

    <div className="about-grid">
      <article className="about-card reveal">
        <div className="about-icon" aria-hidden="true">
          {/* checklist circle */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#9bb0ff" strokeWidth="2" fill="#eef2ff"/>
            <path d="M7 12l3 3 7-7" stroke="#6a7cf7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="about-copy">
          <h3 className="about-card-title">Track Requirements</h3>
          <p className="about-card-text">View progress at a glance. Know exactly what is left.</p>
        </div>
      </article>

      <article className="about-card reveal">
        <div className="about-icon" aria-hidden="true">
          {/* clock */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#9bb0ff" strokeWidth="2" fill="#eef2ff"/>
            <path d="M12 6v6l4 2" stroke="#6a7cf7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="about-copy">
          <h3 className="about-card-title">Find Classes Fast</h3>
          <p className="about-card-text">Filter by day and time. Build no Friday schedules easily.</p>
        </div>
      </article>

      <article className="about-card reveal">
        <div className="about-icon" aria-hidden="true">
          {/* person star */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#9bb0ff" strokeWidth="2" fill="#eef2ff"/>
            <path d="M8 16c1.2-1 2.8-1.5 4-1.5S14.8 15 16 16" stroke="#6a7cf7" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="9" r="2" fill="#6a7cf7"/>
          </svg>
        </div>
        <div className="about-copy">
          <h3 className="about-card-title">Professor Insights</h3>
          <p className="about-card-text">See instructor info and links to pick with confidence.</p>
        </div>
      </article>

      <article className="about-card reveal">
        <div className="about-icon" aria-hidden="true">
          {/* bolt */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#9bb0ff" strokeWidth="2" fill="#eef2ff"/>
            <path d="M13 3l-6 9h4l-2 9 6-9h-4l2-9z" fill="#6a7cf7"/>
          </svg>
        </div>
        <div className="about-copy">
          <h3 className="about-card-title">Personalized Picks</h3>
          <p className="about-card-text">Get recommendations tuned to your goals and pace.</p>
        </div>
      </article>
    </div>
  </div>
</section>



      <section className="cta-section">
        <h2 className="cta-title reveal">Ready to Take Control of Your Academic Future?</h2>
        <p className="cta-subtitle reveal">
          Join thousands of students who are successfully navigating their graduation requirements with confidence
        </p>
        <button className="cta-button reveal" onClick={scrollToSearch}>
          Start Your Journey →
        </button>
      </section>
    </div>
  );
}
