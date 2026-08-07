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
    <div className={`navbar-wrapper ${scrolled ? 'glass-panel' : ''}`} style={{ borderBottom: scrolled ? '1px solid var(--border-color)' : 'none' }}>
      <div className="container navbar-container">
        
        {/* Logo */}
        <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
          <div className="logo-icon">✈</div>
          <div className="logo-text">Trip<span>Together</span></div>
        </Link>

        {/* Hamburger Menu Toggle (Mobile) */}
        <div className={`menu-toggle ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Nav Links */}
        <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
          {/* Drawer Header (Mobile-Only) */}
          <div className="drawer-header">
            <div className="logo" style={{ pointerEvents: 'none' }}>
              <div className="logo-icon">✈</div>
              <div className="logo-text">Trip<span>Together</span></div>
            </div>
            <button className="drawer-close" onClick={() => setIsOpen(false)} aria-label="Close Menu">
              &times;
            </button>
          </div>

          <div className="drawer-body">
            <div className="menu-group-label">Explore</div>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </span> 
              Home
            </Link>
            <Link 
              to="/destinations" 
              className={`nav-link ${isActive('/destinations') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </span> 
              Destinations
            </Link>
            
            <div className="menu-group-label">Planning</div>
            {user && (
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="nav-icon">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </span> 
                Dashboard
              </Link>
            )}

            <Link 
              to="/budget-calculator" 
              className={`nav-link ${isActive('/budget-calculator') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span> 
              Budget Calculator
            </Link>

            <Link 
              to="/ai-copilot" 
              className={`nav-link ${isActive('/ai-copilot') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="nav-icon">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L8.188 15.904L3 15L8.188 14.096L9 9L9.813 14.096L15 15L9.813 15.904ZM19.071 4.929L18.5 8L17.929 4.929L15 4.357L17.929 3.786L18.5 0.714L19.071 3.786L22.071 4.357L19.071 4.929Z" />
                </svg>
              </span> 
              ✨ AI Co-Pilot
            </Link>

            {/* Mobile Nav Actions (Theme & Profile inside menu) */}
            <div className="mobile-nav-actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '12px' }}>
                {/* Light/Dark Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Theme:</span>
                  <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle Theme" style={{ width: '44px', height: '44px', borderRadius: '50%' }}>
                    {theme === 'light' ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                      </svg>
                    )}
                  </button>
                </div>

                {user ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                    <Link to="/profile" className="profile-link" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }} onClick={() => setIsOpen(false)}>
                      <div 
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: 'var(--gradient-accent)',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</span>
                    </Link>
                    <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', padding: '10px' }}>
                      Logout
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                    <Link to="/login" className="btn btn-secondary" style={{ width: '100%', padding: '10px', textAlign: 'center' }} onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="btn btn-primary" style={{ width: '100%', padding: '10px', textAlign: 'center' }} onClick={() => setIsOpen(false)}>
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop Nav Actions */}
        <div className="nav-actions desktop-nav-actions">
          {/* Light/Dark Toggle */}
          <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? (
              /* Moon Icon */
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              /* Sun Icon */
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/profile" className="profile-link" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setIsOpen(false)}>
                <div 
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--gradient-accent)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="nav-link" style={{ padding: 0, border: 'none' }}>{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setIsOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
