// src/components/Home.jsx
import React, { useRef, useEffect, useState } from "react";
import UniversitySearch from "./UniversitySearch";
import "./Home.css";
import FeatureRibbon from "../components/FeatureRibbon"; // adjust path if needed

function useMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return isMobile;
}

export default function Home() {
  const rootRef = useRef(null);
  const subtitleRef = useRef(null);
  const headingRef = useRef(null);
  const titleRef = useRef(null);
  const searchRef = useRef(null);

  // NEW: Recommendations popover state
  const [isRecsOpen, setIsRecsOpen] = useState(false);
  const [arrowShift, setArrowShift] = useState(0); // aligns triangle under center
  const barRef = useRef(null);       // header pill (if present)
  const recsBtnRef = useRef(null);   // local trigger (desktop)

  const isMobile = useMobile();
  const heroImage = "/hero1.jpg";

  // Measure for subtitle width (keeps your search width matching)
  useEffect(() => {
    const setSubW = () => {
      if (!rootRef.current || !subtitleRef.current) return;
      if (window.innerWidth >= 1024) {
        rootRef.current.style.setProperty(
          "--sub-w",
          `${subtitleRef.current.offsetWidth}px`
        );
      } else {
        rootRef.current.style.removeProperty("--sub-w");
      }
    };
    document.fonts?.ready?.then(setSubW);
    setSubW();
    window.addEventListener("resize", setSubW);
    return () => window.removeEventListener("resize", setSubW);
  }, []);

  // Title width → lets subtitle clamp nicely
// Mobile: keep search bar exactly as wide as the title
useEffect(() => {
  const applyTitleWMobile = () => {
    if (!rootRef.current || !titleRef.current) return;
    const w = `${titleRef.current.offsetWidth}px`;
    rootRef.current.style.setProperty("--title-w-mobile", w);
  };
  document.fonts?.ready?.then(applyTitleWMobile);
  applyTitleWMobile();
  window.addEventListener("resize", applyTitleWMobile);
  return () => window.removeEventListener("resize", applyTitleWMobile);
}, []);


  // Reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll(".home-root .reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Smooth scroll to search
  const scrollToSearch = () => {
    if (!searchRef.current) return;
    searchRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => searchRef.current?.focus(), 600);
  };

  // === Recommendations popover behavior ===
  // Try to find the header pill once (for centering / arrow shift)
  useEffect(() => {
    const el = document.querySelector(".gs-header__bar");
    if (el) barRef.current = el;
  }, []);

  // Compute arrow shift to point at our local "Recommendations" trigger
  const computeArrowShift = () => {
    if (!barRef.current) return 0;
    const barRect = barRef.current.getBoundingClientRect();
    const barCenter = barRect.left + barRect.width / 2;

    // If we have a local trigger, point at it; otherwise, center of the pill
    const btnRect = recsBtnRef.current?.getBoundingClientRect();
    const targetCenter = btnRect
      ? btnRect.left + btnRect.width / 2
      : barCenter;

    return targetCenter - barCenter;
  };

  // Open/close + click-outside/ESC handling
  useEffect(() => {
    if (!isRecsOpen) return;

    const onKey = (e) => e.key === "Escape" && setIsRecsOpen(false);
    const onClick = (e) => {
      // Close when clicking outside the mega panel or the trigger
      const panel = document.getElementById("recs-mega");
      if (!panel) return;
      if (
        !panel.contains(e.target) &&
        !recsBtnRef.current?.contains(e.target)
      ) {
        setIsRecsOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [isRecsOpen]);

  const toggleRecs = () => {
    if (!isRecsOpen) {
      setArrowShift(computeArrowShift());
      setIsRecsOpen(true);
    } else {
      setIsRecsOpen(false);
    }
  };

  return (
    <div className="home-root" ref={rootRef}>
      <div
        className="hero-section"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundPosition: "center center",
          backgroundSize: isMobile ? "107.5% 100%" : "cover",
          backgroundRepeat: "no-repeat",
          width: isMobile ? "100vw" : "100%",
          height: "100vh",
          marginTop: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          paddingTop: isMobile
            ? "calc(env(safe-area-inset-top) + 40px)"
            : "calc(var(--header-h, 72px) + 32px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div className="hero-blur-overlay" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />
        <div className="hero-scrim" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />

        <div
          className="hero-overlay"
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: isMobile ? 12 : 0,
            width: "100%",
          }}
        >
          {/* Small inline “Recommendations” trigger that mirrors header behavior on Home.
              It sits inside the hero so we can open the same-style popover without touching Header.jsx */}
     

          {/* Title + subtitle */}
          <div
            className="hero-heading-group"
            ref={headingRef}
            style={{ width: "100%", textAlign: isMobile ? "left" : "center", margin: "0 auto" }}
          >
            <h1 className="hero-title-mobile reveal" ref={titleRef}>
              <span className="hero-title-prefix">Find Your</span>{" "}
              <span className="hero-title-emph">Easiest Classes</span>
            </h1>

            <p
              className="hero-subtitle-mobile reveal"
              ref={subtitleRef}
              style={{
                marginTop: 12,
                marginBottom: 0,
                fontWeight: 500,
                fontSize: "clamp(15px, 3.8vw, 18px)",
                lineHeight: 1.5,
                color: "#ffffff",
              }}
            >
              Discover the easiest courses, track your requirements, and graduate on time
              with personalized recommendations from Graduation Scope.
            </p>
          </div>

          {/* Search */}
          <div
            className="hero-search-wrapper reveal"
            style={{
              width: "100%",
              marginTop: isMobile ? 14 : 32, // keep previous spacing
              display: "flex",
              justifyContent: "center",
            }}
          >
            <UniversitySearch ref={searchRef} />
          </div>
        </div>

        {/* ===== Recommendations Mega (same look/behavior as Tracker) ===== */}
        {isRecsOpen && (
          <>
            {/* invisible click-outside catcher (local to hero area) */}
            <div
              className="gs-mega__backdrop"
              onClick={() => setIsRecsOpen(false)}
              aria-hidden
              style={{ position: "absolute" }}
            />
            <div
              id="recs-mega"
              className="gs-mega gs-mega--dark"
              style={{ "--arrow-shift": `${arrowShift}px` }}
              role="dialog"
              aria-label="Recommendations menu"
            >
              <div className="gs-mega__row gs-mega__row--four">
                <a className="gs-mega__card" href="/recommend" onClick={() => setIsRecsOpen(false)}>
                  <h4>San José State</h4>
                  <p>Open SJSU Recommendations</p>
                </a>
                <a className="gs-mega__card" href="/chicorecommend" onClick={() => setIsRecsOpen(false)}>
                  <h4>Chico State</h4>
                  <p>Open Chico Recommendations</p>
                </a>
                <a className="gs-mega__card" href="/berkeleyrecommend" onClick={() => setIsRecsOpen(false)}>
                  <h4>UC Berkeley</h4>
                  <p>Open Berkeley Recommendations</p>
                </a>
                <a className="gs-mega__card" href="/santacruzrecommend" onClick={() => setIsRecsOpen(false)}>
                  <h4>UC Santa Cruz</h4>
                  <p>Open UCSC Recommendations</p>
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {/* === rest of your page untouched === */}
      <section className="about-section">
        <div className="about-inner">
          <h2 className="about-title reveal">About Graduation Scope</h2>
          <p className="about-subtitle reveal">
            Graduation Scope helps you plan smarter. Track GE and major requirements,
            find classes that fit your schedule, and see professor info in one place.
          </p>

          <div className="about-grid">
            {/* … your cards exactly as before … */}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <FeatureRibbon /> {/* now inherits the navy background from .cta-section */}

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
