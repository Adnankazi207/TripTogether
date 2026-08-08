import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`full-sticky-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="full-navbar-container">
        
        {/* SOLID Color Brand Logo matching reference image (NO Gradient) */}
        <Link to="/" className="solid-brand-logo" onClick={() => setIsOpen(false)}>
          <div className="solid-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.1-2.1.8l-.5.7 6.5 4.5-4 4-2.5-.5L1 18l4 4 1.7-1.7-.5-2.5 4-4 4.5 6.5.7-.5c.7-.5 1-1.3.8-2.1z"/>
            </svg>
          </div>
          <div className="solid-logo-text">
            Trip<span className="solid-logo-accent">Together</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="full-nav-menu">
          <Link 
            to="/" 
            className={`full-nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Home
          </Link>

          <Link 
            to="/destinations" 
            className={`full-nav-link ${isActive('/destinations') ? 'active' : ''}`}
          >
            Destinations
          </Link>

          {user && (
            <Link 
              to="/dashboard" 
              className={`full-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}

          <Link 
            to="/budget-calculator" 
            className={`full-nav-link ${isActive('/budget-calculator') ? 'active' : ''}`}
          >
            Budget Calculator
          </Link>

          <Link 
            to="/ai-copilot" 
            className={`full-nav-link ${isActive('/ai-copilot') ? 'active' : ''}`}
          >
            ✨ AI Co-Pilot
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="full-nav-actions">
          {/* Theme Switcher Button */}
          <button 
            className="theme-pill-btn" 
            onClick={toggleTheme} 
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {user ? (
            <div className="user-profile-menu">
              <Link to="/profile" className="user-avatar-btn">
                <div className="avatar-icon-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="solid-btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-solid-group">
              <Link to="/login" className="solid-btn-ghost">
                Login
              </Link>
              <Link to="/register" className="solid-btn-action">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button 
            className={`hamburger-btn ${isOpen ? 'active' : ''}`} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="mobile-drawer-backdrop animate-fade-in">
          <div className="mobile-drawer-sheet">
            <div className="drawer-header-top">
              <Link to="/" className="solid-brand-logo" onClick={() => setIsOpen(false)}>
                <div className="solid-logo-icon">✈</div>
                <div className="solid-logo-text">Trip<span className="solid-logo-accent">Together</span></div>
              </Link>
              <button className="drawer-close-icon" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="drawer-menu-links">
              <Link to="/" className={`drawer-nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                🏠 Home
              </Link>
              <Link to="/destinations" className={`drawer-nav-item ${isActive('/destinations') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                🗺️ Destinations
              </Link>
              {user && (
                <Link to="/dashboard" className={`drawer-nav-item ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                  📊 Dashboard
                </Link>
              )}
              <Link to="/budget-calculator" className={`drawer-nav-item ${isActive('/budget-calculator') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                💸 Budget Calculator
              </Link>
              <Link to="/ai-copilot" className={`drawer-nav-item ${isActive('/ai-copilot') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                ✨ AI Co-Pilot
              </Link>
            </div>

            <div className="drawer-bottom-actions">
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  <Link to="/profile" className="user-avatar-btn" style={{ justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
                    <div className="avatar-icon-circle">{user.name?.charAt(0).toUpperCase()}</div>
                    <span>{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="solid-btn-logout" style={{ width: '100%' }}>
                    Logout
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <Link to="/login" className="solid-btn-ghost" style={{ flex: 1, textAlign: 'center' }} onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="solid-btn-action" style={{ flex: 1, textAlign: 'center' }} onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Full Width Edge-to-Edge Sticky Navbar */
        .full-sticky-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          background: var(--glass-bg);
          -webkit-backdrop-filter: blur(18px);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.35s ease;
        }

        .full-sticky-navbar.is-scrolled {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border-bottom-color: rgba(249, 115, 22, 0.3);
        }

        .full-navbar-container {
          max-width: 1380px;
          margin: 0 auto;
          padding: 16px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Solid Color Logo (Orange & Black / White) */
        .solid-brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          cursor: pointer;
        }

        .solid-logo-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #ff6b00; /* Vivid Electric Orange */
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(255, 107, 0, 0.4);
          transition: transform 0.3s ease, background 0.3s ease;
        }

        [data-theme='light'] .solid-logo-icon {
          background: #ea580c;
        }

        .solid-brand-logo:hover .solid-logo-icon {
          transform: rotate(12deg) scale(1.08);
          background: #ff8533;
        }

        .solid-logo-text {
          font-family: var(--font-heading);
          font-size: 1.55rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.5px;
        }

        .solid-logo-accent {
          color: #ff6b00; /* Vivid Electric Orange - NO gradient */
          font-weight: 800;
        }

        [data-theme='light'] .solid-logo-accent {
          color: #ea580c;
        }

        /* Desktop Nav Menu */
        .full-nav-menu {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .full-nav-link {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 8px 18px;
          border-radius: 100px;
          transition: all 0.25s ease;
        }

        .full-nav-link:hover {
          color: var(--text-primary);
          background: rgba(249, 115, 22, 0.1);
        }

        .full-nav-link.active {
          color: #ea580c !important;
          background: rgba(234, 88, 12, 0.12);
          border: 1px solid rgba(234, 88, 12, 0.25);
          font-weight: 700;
        }

        [data-theme='dark'] .full-nav-link.active {
          color: #ff6b00 !important;
          background: rgba(255, 107, 0, 0.16);
          border-color: rgba(255, 107, 0, 0.35);
        }

        /* Right Actions */
        .full-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .theme-pill-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .theme-pill-btn:hover {
          transform: scale(1.08);
          border-color: #ff6b00;
          color: #ff6b00;
        }

        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 4px 14px 4px 4px;
          border-radius: 100px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
        }

        .avatar-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ff6b00;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-solid-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .solid-btn-ghost {
          text-decoration: none;
          padding: 9px 20px;
          border-radius: 100px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.25s ease;
        }

        .solid-btn-ghost:hover {
          border-color: #ff6b00;
          transform: translateY(-2px);
        }

        .solid-btn-action {
          text-decoration: none;
          padding: 9px 24px;
          border-radius: 100px;
          background: #ff6b00; /* Vivid Neon Orange */
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 14px rgba(255, 107, 0, 0.4);
          transition: all 0.25s ease;
        }

        [data-theme='light'] .solid-btn-action {
          background: #ea580c;
        }

        .solid-btn-action:hover {
          background: #ff8533;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(255, 107, 0, 0.6);
        }

        .solid-btn-action:hover {
          background: #0369a1;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(2, 132, 199, 0.5);
        }

        .solid-btn-logout {
          background: transparent;
          border: 1px solid var(--color-danger);
          color: var(--color-danger);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .solid-btn-logout:hover {
          background: var(--color-danger);
          color: white;
        }

        /* Mobile Hamburger */
        .hamburger-btn {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .hamburger-btn .bar {
          width: 22px;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s ease;
        }

        /* Mobile Drawer */
        .mobile-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 1200;
          display: flex;
          justify-content: flex-end;
        }

        .mobile-drawer-sheet {
          width: 320px;
          height: 100%;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.7);
        }

        .drawer-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .drawer-close-icon {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 1.2rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .drawer-menu-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .drawer-nav-item {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary) !important;
          text-decoration: none;
          padding: 12px 18px;
          border-radius: 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .drawer-nav-item:hover, .drawer-nav-item.active {
          background: rgba(255, 107, 0, 0.15) !important;
          color: var(--color-primary) !important;
          border-color: rgba(255, 107, 0, 0.3) !important;
        }

        .drawer-nav-item.active {
          background: rgba(2, 132, 199, 0.12);
          color: #0284c7;
        }

        @media (max-width: 992px) {
          .full-nav-menu {
            display: none;
          }
          .auth-solid-group {
            display: none;
          }
          .user-profile-menu {
            display: none;
          }
          .hamburger-btn {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}
