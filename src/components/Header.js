import React, { useState, useEffect } from 'react';
import './Header.css';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IoIosHome, IoIosArrowBack } from 'react-icons/io';
import { GiBrain } from 'react-icons/gi';
import { FaCircleInfo } from 'react-icons/fa6';

function Header({ isAuthenticated, onLogout, onShowSignUp, onShowLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUniPicker, setShowUniPicker] = useState(false);
  const isMobile = window.innerWidth <= 700;

  const isHome = location.pathname === '/' || location.pathname === '/home';

  const recommendRouteByUni = (id) =>
    ({
      sjsu: '/recommend',
      chico: '/chicorecommend',
      berkeley: '/berkeleyrecommend',
    }[id] || '/recommend');

  const goRecommendFor = (id) => {
    localStorage.setItem('recentUniversity', id);
    navigate(recommendRouteByUni(id));
    setShowUniPicker(false);
  };

 // inside Header.jsx

const handleRecommendClick = (e) => {
  if (!isHome) return;        // only intercept on Home
  e.preventDefault();
  setShowUniPicker(true);     // always show the picker
};


  // Close picker on ESC
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setShowUniPicker(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const getNavLinks = () => {
    if (location.pathname.startsWith('/recommend')) {
      return [
        { to: '/', Icon: IoIosHome, label: 'Home' },
        { to: '/sjsu', Icon: IoIosArrowBack, label: 'Back' },
        { to: '/about', Icon: FaCircleInfo, label: 'About' },
      ];
    }
    if (location.pathname.startsWith('/chicorecommend')) {
      return [
        { to: '/', Icon: IoIosHome, label: 'Home' },
        { to: '/chico', Icon: IoIosArrowBack, label: 'Back' },
        { to: '/about', Icon: FaCircleInfo, label: 'About' },
      ];
    }
    if (location.pathname.startsWith('/berkeleyrecommend')) {
      return [
        { to: '/', Icon: IoIosHome, label: 'Home' },
        { to: '/berkeley', Icon: IoIosArrowBack, label: 'Back' },
        { to: '/about', Icon: FaCircleInfo, label: 'About' },
      ];
    }
    if (location.pathname.startsWith('/chico')) {
      return [
        { to: '/', Icon: IoIosHome, label: 'Home' },
        { to: '/chicorecommend', Icon: GiBrain, label: 'Recommend' },
        { to: '/about', Icon: FaCircleInfo, label: 'About' },
      ];
    }
    if (location.pathname.startsWith('/berkeley')) {
      return [
        { to: '/', Icon: IoIosHome, label: 'Home' },
        { to: '/berkeleyrecommend', Icon: GiBrain, label: 'Recommend' },
        { to: '/about', Icon: FaCircleInfo, label: 'About' },
      ];
    }
    if (location.pathname.startsWith('/sjsu')) {
      return [
        { to: '/', Icon: IoIosHome, label: 'Home' },
        { to: '/recommend', Icon: GiBrain, label: 'Recommend' },
        { to: '/about', Icon: FaCircleInfo, label: 'About' },
      ];
    }
    // Home / default
    return [
      { to: '/', Icon: IoIosHome, label: 'Home' },
      // 'to' is a no-op on Home; we intercept click
      { to: '/recommend', Icon: GiBrain, label: 'Recommend', isHomeRecommend: true },
      { to: '/about', Icon: FaCircleInfo, label: 'About' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header
      className="navy-header"
      style={{ backgroundColor: '#0A1128', height: '100px', display: 'flex', alignItems: 'center' }}
    >
      <div
        className="navy-header-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 20px',
          position: 'relative',
          height: '100%',
          flexWrap: 'nowrap',
          overflow: 'visible',
        }}
      >
        {/* Left: logo + title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexShrink: 0,
            minWidth: window.innerWidth <= 768 ? '50%' : 'auto',
            transform: window.innerWidth <= 768 ? 'translate(90px, 25px)' : 'none',
          }}
        >
          <div className="logo-circle-wrapper" style={{ position: 'relative' }}>
            <div className="navy-circle"></div>
            <img
              src="/graduation-scope-logo.png"
              alt="Graduation Scope Logo"
              className="navy-logo"
              style={{
                width: window.innerWidth <= 768 ? 65 : 85,
                height: window.innerWidth <= 768 ? 65 : 85,
                objectFit: 'contain',
                zIndex: 2,
                transform: window.innerWidth <= 768 ? 'translateX(-2px)' : 'none',
              }}
            />
          </div>
          <span
            style={{
              fontWeight: 500,
              fontSize: window.innerWidth <= 768 ? '0.95rem' : '1.6rem',
              color: '#fff',
              whiteSpace: 'nowrap',
              userSelect: 'none',
              overflow: 'visible',
              display: 'inline-block',
              position: 'relative',
              left: window.innerWidth <= 768 ? '-108px' : '-10px',
              top: window.innerWidth <= 768 ? '-30px' : '0',
            }}
          >
            Graduation Scope
          </span>
        </div>

        {/* Center: icon bar (hidden on mobile) */}
        <nav
          className="ge-icon-bar"
          aria-label="Primary navigation"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: window.innerWidth <= 768 ? 'none' : 'flex',
            gap: 48,
            zIndex: 2,
          }}
        >
          {navLinks.map(({ to, Icon, label, isHomeRecommend }) => {
            const isRecommend = label === 'Recommend';

            // On Home, Recommend opens the picker / fast nav
            if (isHomeRecommend) {
              return (
                <button
                  key={label}
                  onClick={handleRecommendClick}
                  className={`ge-icon-link ${isRecommend ? 'recommend-cta' : ''}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                  aria-label={label}
                  type="button"
                >
                  <Icon style={{ fontSize: '2.07rem', color: '#fff' }} />
                  <span style={{ marginTop: 2, textDecoration: 'underline' }}>{label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `ge-icon-link ${isActive ? 'active' : ''} ${isRecommend ? 'recommend-cta' : ''}`
                }
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '1rem',
                }}
                aria-label={label}
              >
                <Icon style={{ fontSize: '2.07rem', color: '#fff' }} />
                <span style={{ marginTop: 2, textDecoration: 'underline' }}>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Auth */}
        <div
          className="auth-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            position: window.innerWidth <= 768 ? 'static' : 'absolute',
            right: window.innerWidth <= 768 ? 'auto' : -102,
            top: window.innerWidth <= 768 ? 'auto' : '50%',
            transform: window.innerWidth <= 768 ? 'none' : 'translateY(-50%)',
            marginLeft: window.innerWidth <= 768 ? 20 : undefined,
            marginTop: window.innerWidth <= 768 ? -7.5 : 0,
            zIndex: 3,
            flexDirection: 'row',
            gap: window.innerWidth <= 768 ? 8 : 16,
          }}
        >
{isAuthenticated ? (
  <>
    <NavLink
  to="/plus"
  style={{
    ...(window.innerWidth <= 768
      ? {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.65rem',
          fontWeight: 600,
          color: '#fff',
          padding: 0,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          marginLeft: '8px',
        }
      : {
          color: '#fff',           // <-- desktop: force white
          textDecoration: 'none',
          fontWeight: 600,
        }),
  }}
>
  Get Premium
</NavLink>
    <button
      onClick={onLogout}
      type="button"
      style={{
        ...(window.innerWidth <= 768
          ? {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: '#fff',
              padding: 0,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              marginLeft: '8px',   // <-- nudge toward center
            }
          : {}),
      }}
    >
      Log Out
    </button>
  </>
) : (
  <>
    <button
      onClick={onShowSignUp}
      type="button"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: window.innerWidth <= 768 ? '0.65rem' : '1rem',
        fontWeight: 600,
        color: '#fff',
      }}
    >
      Sign Up
    </button>
    <button
      onClick={onShowLogin}
      type="button"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: window.innerWidth <= 768 ? '0.65rem' : '1rem',
        fontWeight: 600,
        color: '#fff',
      }}
    >
      Log In
    </button>
  </>
)}

        </div>
      </div>

      {/* University Picker (Home -> Recommend) */}
      {showUniPicker && (
        <div
          onClick={() => setShowUniPicker(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 440,
              maxWidth: '92vw',
              background: '#fff',
              borderRadius: 14,
              padding: 20,
              boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Choose your university</h3>
            <p style={{ marginTop: 0, color: '#555' }}>We’ll remember this for next time.</p>
            <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
              <button
                onClick={() => goRecommendFor('sjsu')}
                style={btn()}
                type="button"
              >
                San José State — Recommend
              </button>
              <button
                onClick={() => goRecommendFor('chico')}
                style={btn()}
                type="button"
              >
                Chico State — Recommend
              </button>
              <button
                onClick={() => goRecommendFor('berkeley')}
                style={btn()}
                type="button"
              >
                UC Berkeley — Recommend
              </button>
            </div>
            <button
              onClick={() => setShowUniPicker(false)}
              style={{ marginTop: 14, background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

// small helper for modal buttons
const btn = () => ({
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #e0e0e0',
  background: '#f8fafc',
  cursor: 'pointer',
  textAlign: 'left',
  fontWeight: 600,
});

export default Header;
