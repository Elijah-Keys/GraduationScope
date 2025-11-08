// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
// at top
import { FiMenu, FiX } from "react-icons/fi";


function Header({ isAuthenticated, onLogout, onShowSignUp, onShowLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(900); // 900px breakpoint (tweak if you want)

// put this above the component (same file or a utils file)
function useIsMobile(max = 900) {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth <= max : false
  );
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width:${max}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange) || mq.addListener(onChange);
    return () =>
      mq.removeEventListener?.("change", onChange) || mq.removeListener(onChange);
  }, [max]);
  return isMobile;
}

  // Refs for positioning
  const barRef = useRef(null);
  const trackerLinkRef = useRef(null);
  const recsLinkRef = useRef(null);

  // State
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isRecsOpen, setIsRecsOpen] = useState(false);
  const [arrowShift, setArrowShift] = useState(0);
// State
// which view is showing in the mobile sheet: 'root' | 'tracker' | 'recs'
const [mobileView, setMobileView] = useState('root');

// reset the subview when the sheet closes or route changes


const [sheetTop, setSheetTop] = useState(0);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// height of the top bar (so the sheet can start under it)
const [barH, setBarH] = useState(64);
useEffect(() => { if (!isMobileMenuOpen) setMobileView('root'); }, [isMobileMenuOpen]);
useEffect(() => { setMobileView('root'); }, [location.pathname]);
useEffect(() => {
  const measure = () => setBarH(barRef.current ? barRef.current.offsetHeight : 64);
  measure();
  window.addEventListener("resize", measure);
  return () => window.removeEventListener("resize", measure);
}, []);

// helpers
const toggleMobileMenu = () => setIsMobileMenuOpen(o => !o);
const closeMobileMenu = () => setIsMobileMenuOpen(false);

// lock background scroll when menu is open
useEffect(() => {
  document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
  return () => (document.body.style.overflow = "");
}, [isMobileMenuOpen]);
  // ---- ROUTE FLAGS (ORDER MATTERS) ----
// ---- ROUTE FLAGS (ORDER MATTERS) ----
// ---- ROUTE FLAGS (ORDER MATTERS) ----
const isHome = location.pathname === "/" || location.pathname === "/home";
const isAbout = location.pathname === "/about";
const isLogin = location.pathname === "/login";
const isSurvey = location.pathname === "/survey"; // ← add this
const onUcscRec = location.pathname.startsWith("/santacruzrecommend");
const isTrackerPage =
  /^\/(tracker|sjsu|chico|berkeley|santacruz)/.test(location.pathname);
const isRecsPage =
  /^\/(recommend|chicorecommend|berkeleyrecommend|santacruzrecommend)/.test(
    location.pathname
  );

// include isSurvey
const isSticky = isHome || isAbout || isTrackerPage || isRecsPage || isLogin || isSurvey;
const onLight  = isAbout || isTrackerPage || isRecsPage || isLogin || isSurvey;



// near the top of Header()


  // ⬇️ NEW: map current path to the correct Tracker/Recommendations pair
  const routeSets = {
    sjsu:       { tracker: "/sjsu",       recs: "/recommend" },
    chico:      { tracker: "/chico",      recs: "/chicorecommend" },
    berkeley:   { tracker: "/berkeley",   recs: "/berkeleyrecommend" },
    santacruz:  { tracker: "/santacruz",  recs: "/santacruzrecommend" },
    default:    { tracker: "/tracker",    recs: "/recommend" },
  };
  const currentRoutes = (() => {
    const p = location.pathname;
    if (p.startsWith("/chico") || p.startsWith("/chicorecommend")) return routeSets.chico;
    if (p.startsWith("/berkeley") || p.startsWith("/berkeleyrecommend")) return routeSets.berkeley;
    if (p.startsWith("/santacruz") || p.startsWith("/santacruzrecommend")) return routeSets.santacruz;
    if (p.startsWith("/sjsu") || p.startsWith("/tracker") || p.startsWith("/recommend")) return routeSets.sjsu;
    return routeSets.default;
  })();
  // ---- helpers ----
  const computeArrow = (anchorRef) => {
    if (!barRef.current || !anchorRef.current) return 0;
    const bar = barRef.current.getBoundingClientRect();
    const link = anchorRef.current.getBoundingClientRect();
    const barCenter = bar.left + bar.width / 2;
    const linkCenter = link.left + link.width / 2;
    return linkCenter - barCenter;
  };

  // Close popovers on ESC / click outside
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsTrackerOpen(false);
        setIsRecsOpen(false);
        setIsMobileMenuOpen(false);  // ⬅️ close on ESC
      }
    };
    const onClickOutside = (e) => {
      if (!barRef.current) return;
      if (!barRef.current.contains(e.target)) {
        setIsTrackerOpen(false);
        setIsRecsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  // Close popovers on any route change
  useEffect(() => {
    setIsTrackerOpen(false);
    setIsRecsOpen(false);
      setIsMobileMenuOpen(false);   // ⬅️ close mobile sheet on route change
  }, [location.pathname]);

  // Recompute arrow when a popover opens or on resize
  useEffect(() => {
  const compute = () => {
    if (!barRef.current) { setSheetTop(0); return; }
    const rect = barRef.current.getBoundingClientRect();
    setSheetTop(rect.bottom + 0); // add +6 or +8 if you want a tiny gap
  };
  compute();
  window.addEventListener("resize", compute);
  window.addEventListener("scroll", compute, { passive: true });
  return () => {
    window.removeEventListener("resize", compute);
    window.removeEventListener("scroll", compute);
  };
}, []);


  // Toggles
  const onTrackerClick = (e) => {
    if (!isHome) return; // normal nav off Home
    e.preventDefault();
    setIsRecsOpen(false);
    setIsTrackerOpen((o) => {
      const next = !o;
      if (next) setArrowShift(computeArrow(trackerLinkRef));
      return next;
    });
  };

  const onRecsClick = (e) => {
    if (!isHome) return; // normal nav off Home
    e.preventDefault();
    setIsTrackerOpen(false);
    setIsRecsOpen((o) => {
      const next = !o;
      if (next) setArrowShift(computeArrow(recsLinkRef));
      return next;
    });
  };

  return (
    <header className={`gs-header ${isSticky ? "is-sticky" : ""} ${onLight ? "on-light" : ""}`}>
      <div className="gs-header__bar" ref={barRef}>
        {/* Brand */}
      <button
  className="gs-header__brand"
  onClick={() => (onUcscRec ? (window.location.href = "/") : navigate("/"))}
  type="button"
  aria-label="Graduation Scope Home"
>
  <img className="gs-header__logo" src="/graduation-scope-logo.png" alt="" />
  <span className="gs-header__title">Graduation Scope</span>
</button>


  {/* Center nav */}
{!isMobile && (
  <nav className="gs-header__nav" aria-label="Primary">
    {isHome ? (
      <a
        href={currentRoutes.tracker}
        ref={trackerLinkRef}
        className={`gs-header__link ${isTrackerOpen ? "is-active" : ""}`}
        onClick={onTrackerClick}
      >
        Tracker
      </a>
    ) : (
      <NavLink
        to={currentRoutes.tracker}
        reloadDocument={onUcscRec}
        className={({ isActive }) => `gs-header__link ${isActive ? "is-active" : ""}`}
      >
        Tracker
      </NavLink>
    )}

    {isHome ? (
      <a
        href={currentRoutes.recs}
        ref={recsLinkRef}
        className={`gs-header__link ${isRecsOpen ? "is-active" : ""}`}
        onClick={onRecsClick}
      >
        Recommendations
      </a>
    ) : (
      <NavLink
        to={currentRoutes.recs}
        reloadDocument={onUcscRec}
        className={({ isActive }) => `gs-header__link ${isActive ? "is-active" : ""}`}
      >
        Recommendations
      </NavLink>
    )}
  </nav>
)}

<div className="gs-header__spacer" />

{/* Right actions (desktop only) */}
{!isMobile && (
  <div className="gs-header__actions">
  
    {isAuthenticated ? (
      <button className="gs-header__ghostBtn" onClick={onLogout} type="button">Log Out</button>
    ) : (
      <>
        <button className="gs-header__ghostBtn" onClick={onShowLogin} type="button">
          Log In
        </button>
        <button className="gs-header__ghostBtn" onClick={onShowSignUp} type="button">
          Sign Up
        </button>
      </>
    )}
  </div>
)}


{/* Hamburger (mobile only) */}
{isMobile && (
  <button
    className="gs-hamburger"
    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
    aria-expanded={isMobileMenuOpen}
    aria-controls="gs-mobile-menu"
    onClick={toggleMobileMenu}
    type="button"
  >
    {isMobileMenuOpen ? <FiX size={22} color="#20A7EF" /> : <FiMenu size={22} color="#20A7EF" />}
  </button>
)}


        {/* === Tracker mega (Home only) === */}
        {isHome && isTrackerOpen && (
          <>
            <div className="gs-mega__backdrop" onClick={() => setIsTrackerOpen(false)} />
            <div
              className="gs-mega gs-mega--dark"
              style={{ "--arrow-shift": `${arrowShift}px` }}
              role="dialog"
              aria-label="Tracker menu"
            >
              <div className="gs-mega__row gs-mega__row--four">
                <NavLink to="/sjsu" className="gs-mega__card" onClick={() => setIsTrackerOpen(false)}>
                  <h4>San José State</h4>
                  <p>Open SJSU GE Tracker</p>
                </NavLink>
                <NavLink to="/chico" className="gs-mega__card" onClick={() => setIsTrackerOpen(false)}>
                  <h4>Chico State</h4>
                  <p>Open Chico GE Tracker</p>
                </NavLink>
                <NavLink to="/berkeley" className="gs-mega__card" onClick={() => setIsTrackerOpen(false)}>
                  <h4>UC Berkeley</h4>
                  <p>Open Berkeley GE Tracker</p>
                </NavLink>
                <NavLink to="/santacruz" className="gs-mega__card" onClick={() => setIsTrackerOpen(false)}>
                  <h4>UC Santa Cruz</h4>
                  <p>Open UCSC GE Tracker</p>
                </NavLink>
              </div>
            </div>
          </>
        )}

        {/* === Recommendations mega (Home only) — IDENTICAL LOOK === */}
        {isHome && isRecsOpen && (
          <>
            <div className="gs-mega__backdrop" onClick={() => setIsRecsOpen(false)} />
            <div
              className="gs-mega gs-mega--dark"
              style={{ "--arrow-shift": `${arrowShift}px` }}
              role="dialog"
              aria-label="Recommendations menu"
            >
              <div className="gs-mega__row gs-mega__row--four">
                <NavLink to="/recommend" className="gs-mega__card" onClick={() => setIsRecsOpen(false)}>
                  <h4>San José State</h4>
                  <p>Open SJSU Recommendations</p>
                </NavLink>
                <NavLink to="/chicorecommend" className="gs-mega__card" onClick={() => setIsRecsOpen(false)}>
                  <h4>Chico State</h4>
                  <p>Open Chico Recommendations</p>
                </NavLink>
                <NavLink to="/berkeleyrecommend" className="gs-mega__card" onClick={() => setIsRecsOpen(false)}>
                  <h4>UC Berkeley</h4>
                  <p>Open Berkeley Recommendations</p>
                </NavLink>
                <NavLink to="/santacruzrecommend" className="gs-mega__card" onClick={() => setIsRecsOpen(false)}>
                  <h4>UC Santa Cruz</h4>
                  <p>Open UCSC Recommendations</p>
                </NavLink>
              </div>
            </div>
          </>
        )}
      </div>
     

{/* Mobile overlay */}
<div
  className={`gs-overlay ${isMobileMenuOpen ? "is-open" : ""}`}
  onClick={closeMobileMenu}
  style={{ top: sheetTop }}   // ⬅️ was barH
/>

{/* Mobile sheet */}
<div
  id="gs-mobile-menu"
  className={`gs-sheet ${isMobileMenuOpen ? "is-open" : ""}`}
  role="dialog"
  aria-modal="true"
  onClick={closeMobileMenu}
  style={{
    top: sheetTop,                               // ⬅️ was barH
    maxHeight: `calc(85vh - ${sheetTop}px)`,
    overflow: "auto",
  }}
>
<nav className="gs-sheet__nav" onClick={(e) => e.stopPropagation()}>
  {mobileView === 'root' && (
    <>
      <button type="button" className="gs-sheet__link" onClick={() => setMobileView('tracker')}>
        Tracker
      </button>

      {/* NOW a subview for Recommendations too */}
      <button type="button" className="gs-sheet__link" onClick={() => setMobileView('recs')}>
        Recommendations
      </button>



      {isAuthenticated ? (
        <button onClick={() => { onLogout(); closeMobileMenu(); }} className="gs-sheet__btn" type="button">
          Log Out
        </button>
      ) : (
        <div className="gs-sheet__row">
          <button className="gs-sheet__btn" onClick={() => { onShowLogin(); closeMobileMenu(); }} type="button">
            Log In
          </button>
          <button className="gs-sheet__btn gs-sheet__btn--outline" onClick={() => { onShowSignUp(); closeMobileMenu(); }} type="button">
            Sign Up
          </button>
        </div>
      )}
    </>
  )}

  {mobileView === 'tracker' && (
    <>
      <button type="button" className="gs-sheet__back" onClick={() => setMobileView('root')}>
        ← Back
      </button>
      <div className="gs-sheet__grid">
        <NavLink to="/sjsu"      onClick={closeMobileMenu} className="gs-sheet__link">San José State</NavLink>
        <NavLink to="/chico"     onClick={closeMobileMenu} className="gs-sheet__link">Chico State</NavLink>
        <NavLink to="/berkeley"  onClick={closeMobileMenu} className="gs-sheet__link">UC Berkeley</NavLink>
        <NavLink to="/santacruz" onClick={closeMobileMenu} className="gs-sheet__link">UC Santa Cruz</NavLink>
      </div>
    </>
  )}

  {/* NEW: Recommendations subview */}
  {mobileView === 'recs' && (
    <>
      <button type="button" className="gs-sheet__back" onClick={() => setMobileView('root')}>
        ← Back
      </button>
      <div className="gs-sheet__grid">
        <NavLink to="/recommend"           onClick={closeMobileMenu} className="gs-sheet__link">San José State</NavLink>
        <NavLink to="/chicorecommend"     onClick={closeMobileMenu} className="gs-sheet__link">Chico State</NavLink>
        <NavLink to="/berkeleyrecommend"  onClick={closeMobileMenu} className="gs-sheet__link">UC Berkeley</NavLink>
        <NavLink to="/santacruzrecommend" onClick={closeMobileMenu} className="gs-sheet__link">UC Santa Cruz</NavLink>
      </div>
    </>
  )}
</nav>

</div>

    </header>
  );
}

export default Header;
