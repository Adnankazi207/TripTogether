import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubsubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubsubscribed(true);
      setEmail('');
      setTimeout(() => setSubsubscribed(false), 5000);
    }
  };

  return (
    <footer className="footer animate-fade-in">
      <div className="container">
        
        <div className="footer-grid">
          
          {/* Column 1: Brand Info */}
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon">✈</div>
              <div className="logo-text">Trip<span>Together</span></div>
            </Link>
            <p>
              Plan, organize, and track your adventures together. Manage expenses, discover beautiful destinations, and create memories that last a lifetime.
            </p>
            <div className="footer-socials">
              <a href="#" className="btn-icon" aria-label="Facebook">🌐</a>
              <a href="#" className="btn-icon" aria-label="Twitter">🐦</a>
              <a href="#" className="btn-icon" aria-label="Instagram">📸</a>
              <a href="#" className="btn-icon" aria-label="LinkedIn">🔗</a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/destinations">Destinations</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/profile">My Profile</Link></li>
            </ul>
          </div>

          {/* Column 3: Destination Categories */}
          <div className="footer-col">
            <h4>Explore</h4>
            <ul className="footer-links">
              <li><Link to="/destinations?category=Adventure">Adventure</Link></li>
              <li><Link to="/destinations?category=Beach">Beach Trips</Link></li>
              <li><Link to="/destinations?category=Cultural">Cultural Travel</Link></li>
              <li><Link to="/destinations?category=Nature">Nature Retreats</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="footer-col">
            <div className="footer-newsletter">
              <h4>Newsletter</h4>
              <p>Subscribe to receive travel tips, exclusive offers, and destination recommendations directly in your inbox.</p>
              
              {subscribed ? (
                <div className="alert alert-success" style={{ margin: 0, padding: '10px 14px' }}>
                  🎉 Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px 14px' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} TripTogether. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-muted)' }}>Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
