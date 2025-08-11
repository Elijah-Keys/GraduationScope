import React from 'react';
import './Header.css';
import { NavLink, useLocation } from 'react-router-dom';
import { IoIosHome, IoIosArrowBack } from 'react-icons/io';
import { GiBrain } from 'react-icons/gi';
import { FaCircleInfo } from 'react-icons/fa6';

function Header({ isAuthenticated, onLogout, onShowSignUp, onShowLogin }) {
  const location = useLocation();

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
    return [
      { to: '/', Icon: IoIosHome, label: 'Home' },
      { to: '/recommend', Icon: GiBrain, label: 'Recommend' },
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
    flexWrap: 'nowrap', // Prevent collapse
    overflow: 'visible', // Prevent hiding logo
  }}
>


        {/* Left section: logo + title */}
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
    minWidth: window.innerWidth <= 768 ? '50%' : 'auto',
    transform:
      window.innerWidth <= 768 ? 'translate(90px, 25px)' : 'none',
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
    display: window.innerWidth <= 768 ? 'none' : 'flex', // hide on mobile
    gap: 48,
    zIndex: 2,
  }}
>
{navLinks.map(({ to, Icon, label }) => {
  const isRecommend = label === 'Recommend';

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
      {/* same size for all icons */}
      <Icon style={{ fontSize: '2.07rem', color: '#fff' }} />
      <span style={{ marginTop: 2, textDecoration: 'underline' }}>{label}</span>
    </NavLink>
  );
})}

</nav>


        {/* Right: Auth section */}
     {/* Right: Auth section */}
{/* Right: Auth section */}
<div
  className="auth-links"
  style={{
    display: 'flex',
    alignItems: 'center',
    position: window.innerWidth <= 768 ? 'static' : 'absolute',
    right: window.innerWidth <= 768 ? 'auto' : -102,
    top: window.innerWidth <= 768 ? 'auto' : '50%',
    transform: window.innerWidth <= 768 ? 'none' : 'translateY(-50%)',
    marginLeft: window.innerWidth <= 768 ? 20 : undefined, // ← horizontal move
    marginTop: window.innerWidth <= 768 ? -7.5 : 0, // ← vertical adjustment for mobile
    zIndex: 3,
    flexDirection: window.innerWidth <= 768 ? 'row' : 'row',
    gap: window.innerWidth <= 768 ? 8 : 16,
  }}
>




  {isAuthenticated ? (
    <>
      <NavLink
        to="/account"
        className="account-link"
        style={{
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '1rem',
        }}
      >
        Account Settings
      </NavLink>
      <button
        onClick={onLogout}
        className="logout-button"
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          padding: '8px 14px',
          borderRadius: 8,
          border: 'none',
          background: '#14213d',
          color: '#fff',
          cursor: 'pointer',
        }}
        type="button"
      >
        Log Out
      </button>
    </>
  ) : (
    <>
      <button
        onClick={onShowSignUp}
        className="signup-link"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
         fontSize: window.innerWidth <= 768 ? '0.65rem' : '1rem',
          fontWeight: 600,
          color: '#fff',
        }}
        type="button"
      >
        Sign Up
      </button>
      <button
        onClick={onShowLogin}
        className="login-link"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
         fontSize: window.innerWidth <= 768 ? '0.65rem' : '1rem',
          fontWeight: 600,
          color: '#fff',
        }}
        type="button"
      >
        Log In
      </button>
    </>
  )}
</div>


      </div>
    </header>
  );
}

export default Header;
