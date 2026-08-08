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

  // Handle scrolled background
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
    <header className={`navbar-header-root ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-pill-wrapper">
        <div className="navbar-pill-inner">
          
          {/* Logo with matching Theme colors */}
          <Link to="/" className="brand-logo" onClick={() => setIsOpen(false)}>
            <div className="brand-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.1-2.1.8l-.5.7 6.5 4.5-4 4-2.5-.5L1 18l4 4 1.7-1.7-.5-2.5 4-4 4.5 6.5.7-.5c.7-.5 1-1.3.8-2.1z"/>
              </svg>
            </div>
            <div className="brand-logo-text">
              Trip<span className="brand-accent-text">Together</span>
            </div>
            <span className="brand-pro-tag">COLLAB</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav-menu">
            <Link 
              to="/" 
              className={`nav-pill-item ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>

            <Link 
              to="/destinations" 
              className={`nav-pill-item ${isActive('/destinations') ? 'active' : ''}`}
            >
              Destinations
            </Link>

            {user && (
              <Link 
                to="/dashboard" 
                className={`nav-pill-item ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            )}

            <Link 
              to="/budget-calculator" 
              className={`nav-pill-item ${isActive('/budget-calculator') ? 'active' : ''}`}
            >
              Budget Calculator
            </Link>

            <Link 
              to="/ai-copilot" 
              className={`nav-pill-item ${isActive('/ai-copilot') ? 'active' : ''}`}
            >
              ✨ AI Co-Pilot
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="navbar-right-actions">
            {/* Theme Switcher Button */}
            <button 
              className="theme-toggle-btn" 
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
                <Link to="/profile" className="user-avatar-pill">
                  <div className="avatar-circle-icon">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name-text">{user.name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="nav-btn-logout">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-btn-group">
                <Link to="/login" className="nav-btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="nav-btn-primary">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button 
              className={`mobile-hamburger-btn ${isOpen ? 'active' : ''}`} 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Navigation Drawer"
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="mobile-drawer-overlay animate-fade-in">
          <div className="mobile-drawer-card">
            <div className="drawer-header-row">
              <Link to="/" className="brand-logo" onClick={() => setIsOpen(false)}>
                <div className="brand-logo-icon">✈</div>
                <div className="brand-logo-text">Trip<span className="brand-accent-text">Together</span></div>
              </Link>
              <button className="drawer-close-btn" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="drawer-links-list">
              <Link to="/" className={`drawer-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                🏠 Home
              </Link>
              <Link to="/destinations" className={`drawer-link ${isActive('/destinations') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                🗺️ Destinations
              </Link>
              {user && (
                <Link to="/dashboard" className={`drawer-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                  📊 Dashboard
                </Link>
              )}
              <Link to="/budget-calculator" className={`drawer-link ${isActive('/budget-calculator') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                💸 Budget Calculator
              </Link>
              <Link to="/ai-copilot" className={`drawer-link ${isActive('/ai-copilot') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                ✨ AI Co-Pilot
              </Link>
            </div>

            <div className="drawer-footer-actions">
              {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  <Link to="/profile" className="user-avatar-pill" style={{ justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
                    <div className="avatar-circle-icon">{user.name?.charAt(0).toUpperCase()}</div>
                    <span>{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="nav-btn-logout" style={{ width: '100%' }}>
                    Logout
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <Link to="/login" className="nav-btn-secondary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="nav-btn-primary" style={{ flex: 1, textAlign: 'center' }} onClick={() => setIsOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Root Navbar Positioning */
        .navbar-header-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 16px 20px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .navbar-header-root.is-scrolled {
          padding: 10px 20px;
        }

        .navbar-pill-wrapper {
          max-width: 1240px;
          margin: 0 auto;
        }

        /* Floating Frosted Glass Container */
        .navbar-pill-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px;
          border-radius: 100px;
          background: var(--glass-bg);
          -webkit-backdrop-filter: blur(16px);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.35s ease;
        }

        .is-scrolled .navbar-pill-inner {
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
          border-color: rgba(13, 148, 136, 0.25);
        }

        /* Brand Logo */
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .brand-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0d9488 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
          transition: transform 0.3s ease;
        }

        .brand-logo:hover .brand-logo-icon {
          transform: rotate(15deg) scale(1.08);
        }

        .brand-logo-text {
          font-family: var(--font-heading);
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.3px;
        }

        .brand-accent-text {
          background: linear-gradient(135deg, #0d9488 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 800;
        }

        .brand-pro-tag {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 1px;
          background: rgba(13, 148, 136, 0.15);
          color: #0d9488;
          border: 1px solid rgba(13, 148, 136, 0.3);
          padding: 2px 7px;
          border-radius: 100px;
          margin-left: 2px;
        }

        [data-theme='dark'] .brand-pro-tag {
          color: #2dd4bf;
        }

        /* Desktop Nav Items */
        .desktop-nav-menu {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-pill-item {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 100px;
          transition: all 0.25s ease;
          border: 1px solid transparent;
        }

        .nav-pill-item:hover {
          color: var(--text-primary);
          background: rgba(13, 148, 136, 0.08);
        }

        .nav-pill-item.active {
          color: #0d9488 !important;
          background: rgba(13, 148, 136, 0.12);
          border-color: rgba(13, 148, 136, 0.25);
          font-weight: 700;
        }

        [data-theme='dark'] .nav-pill-item.active {
          color: #2dd4bf !important;
        }

        /* Right Actions */
        .navbar-right-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .theme-toggle-btn {
          width: 38px;
          height: 38px;
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

        .theme-toggle-btn:hover {
          transform: scale(1.1);
          border-color: #0d9488;
          color: #0d9488;
        }

        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 4px 12px 4px 4px;
          border-radius: 100px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
        }

        .avatar-circle-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .nav-btn-secondary {
          text-decoration: none;
          padding: 8px 18px;
          border-radius: 100px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.25s ease;
        }

        .nav-btn-secondary:hover {
          border-color: #0d9488;
          transform: translateY(-2px);
        }

        .nav-btn-primary {
          text-decoration: none;
          padding: 8px 20px;
          border-radius: 100px;
          background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);
          transition: all 0.25s ease;
        }

        .nav-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(13, 148, 136, 0.5);
        }

        .nav-btn-logout {
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

        .nav-btn-logout:hover {
          background: var(--color-danger);
          color: white;
        }

        /* Mobile Hamburger */
        .mobile-hamburger-btn {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .mobile-hamburger-btn .bar {
          width: 22px;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s ease;
        }

        /* Mobile Drawer */
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1200;
          display: flex;
          justify-content: flex-end;
        }

        .mobile-drawer-card {
          width: 300px;
          height: 100%;
          background: var(--bg-primary);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
        }

        .drawer-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .drawer-close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-primary);
          cursor: pointer;
        }

        .drawer-links-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .drawer-link {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 10px 16px;
          border-radius: 12px;
        }

        .drawer-link.active {
          background: rgba(13, 148, 136, 0.12);
          color: #0d9488;
        }

        @media (max-width: 900px) {
          .desktop-nav-menu {
            display: none;
          }
          .auth-btn-group {
            display: none;
          }
          .user-profile-menu {
            display: none;
          }
          .mobile-hamburger-btn {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}
