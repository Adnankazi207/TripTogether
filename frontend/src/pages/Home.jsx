import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cinematic3DHero from '../components/Cinematic3DHero';
import FeatureSlider from '../components/FeatureSlider';
import DestinationCard from '../components/DestinationCard';
import CategoryCapsulesSection from '../components/CategoryCapsulesSection';
import WorkflowSection from '../components/WorkflowSection';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/destinations');
    }
  };

  const trendingDestinations = [
    {
      title: 'Bali Jungle Villa',
      country: 'Ubud, Indonesia',
      category: 'Nature Stay',
      priceTag: '$620',
      rating: '4.7',
      reviews: '1.2k',
      image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
      description: 'Escape to a peaceful retreat tucked in Ubud\'s lush jungle, perfect for a slow, mindful reset.',
      duration: '3 Day Escape'
    },
    {
      title: 'Santorini Sunset Loft',
      country: 'Oia, Greece',
      category: 'Romantic Stay',
      priceTag: '$890',
      rating: '4.8',
      reviews: '950',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
      description: 'Experience a cliffside loft with iconic white walls, blue domes, and magical sunset views.',
      duration: '2 Night Trip'
    },
    {
      title: 'Dubai Skyline Suite',
      country: 'Downtown, Dubai',
      category: 'Couples Stay',
      priceTag: '$1,050',
      rating: '4.9',
      reviews: '2k',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      description: 'Romantic views of the Burj Khalifa with floor-to-ceiling windows and a private balcony.',
      duration: 'City Lights'
    }
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', background: 'var(--bg-primary)', paddingTop: '70px' }}>
      
      {/* Cinematic 3D Hero Section */}
      <Cinematic3DHero 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        handleSearchSubmit={handleSearchSubmit} 
      />

      <div className="container" style={{ marginTop: '60px' }}>
        {/* Categories Stadium Capsules Section */}
        <CategoryCapsulesSection />

        <FeatureSlider />

      {/* Visual Walkthrough: How it Works */}
      <WorkflowSection />

      {/* Trending Destinations Section */}
      <section style={{ margin: '100px 0' }}>
        <div className="section-header">
          <span className="section-tag">Trending Escapes</span>
          <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Popular Places to Visit</h2>
          <p className="section-desc">Explore some of the most sought-after spots booked by travelers this month.</p>
        </div>

        <div className="destinations-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '28px' }}>
          {trendingDestinations.map((dest, i) => (
            <DestinationCard
              key={i}
              destination={dest}
              actionLabel="Book now"
              onActionClick={() => navigate(`/destinations?search=${encodeURIComponent(dest.title)}`)}
            />
          ))}
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="glass-panel premium-cta-section">
        {/* Left Side Content Column */}
        <div className="cta-content-column">
          
          {/* Tagline Header with map icon and plane path */}
          <div className="cta-tagline-row">
            <div className="cta-map-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <span className="cta-tagline">START PLANNING</span>
            
            {/* Plane Dotted Path */}
            <div className="cta-plane-trail">
              <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="30">
                <path d="M5,25 Q40,5 85,15" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3,4" opacity="0.4" />
                <g transform="translate(80, 14) rotate(15)">
                  <path d="M0,0 L10,4 L6,6 L4,10 Z" fill="var(--color-primary)" opacity="0.6" />
                </g>
              </svg>
            </div>
          </div>

          {/* Symmetrical Two-Tone Heading */}
          <h2 className="cta-main-title">
            Ready for Your <span className="highlight-text-orange">Next Adventure?</span>
          </h2>
          <div className="cta-title-accent-line"></div>

          <p className="cta-description">
            Join thousands of travelers who plan, collaborate, and track their expenses with TripTogether. Create a secure, group-accessible room code in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="cta-buttons-row">
            <Link to="/register" className="btn btn-primary cta-btn-primary">
              Create Account Free
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link to="/destinations" className="btn btn-secondary cta-btn-secondary">
              Browse Catalog
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Three highlights capsule footer */}
          <div className="cta-footer-highlights">
            <div className="cta-highlight-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Secure & Private</span>
            </div>
            <div className="cta-highlight-item-divider"></div>
            <div className="cta-highlight-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Group Collaboration</span>
            </div>
            <div className="cta-highlight-item-divider"></div>
            <div className="cta-highlight-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Instant Access</span>
            </div>
          </div>

        </div>

        {/* Background Image of travelers on the right */}
        <div className="cta-image-wrapper">
          <div className="cta-image-bg" style={{ backgroundImage: "url('/workflow_step3.png')" }}></div>
          <div className="cta-image-overlay"></div>
          
          {/* Top Floating Widget: 50K+ Travelers */}
          <div className="cta-floating-widget widget-top animate-fade-in">
            <div className="avatar-group">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" alt="Traveler 1" className="avatar" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Traveler 2" className="avatar" />
              <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" alt="Traveler 3" className="avatar" />
            </div>
            <div>
              <div className="widget-title">50K+ Travelers</div>
              <div className="widget-desc">already planning together</div>
            </div>
          </div>

          {/* Bottom Floating Widget: Your plans. Your people. */}
          <div className="cta-floating-widget widget-bottom animate-fade-in">
            <div className="widget-lock-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div>
              <div className="widget-title">Your plans. Your people.</div>
              <div className="widget-desc">Always private, always yours.</div>
            </div>
          </div>
        </div>

        {/* Floating Center Backpack Badge */}
        <div className="cta-center-backpack-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      </section>

      </div> {/* Closing container wrapper */}

      <style>{`
        /* Feature Cards Premium 3D Tilt Transitions */
        .features-grid {
          perspective: 1000px;
        }
        .feature-card {
          padding: 36px 28px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), 
                      border-color 0.4s ease, 
                      box-shadow 0.4s ease;
          position: relative;
          overflow: hidden;
          text-align: left;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--gradient-accent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-8px) rotateX(2deg) rotateY(2deg);
          border-color: var(--color-primary);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        .feature-card:hover::before {
          opacity: 1;
        }

        /* Step Card Styling with Numbers */
        .step-card {
          padding: 40px 28px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), 
                      border-color 0.4s ease, 
                      box-shadow 0.4s ease;
          position: relative;
        }
        .step-card:hover {
          transform: translateY(-6px);
          border-color: var(--color-primary);
          box-shadow: var(--shadow-lg);
        }
        .step-num {
          position: absolute;
          top: 16px;
          left: 16px;
          background: var(--gradient-accent);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.88rem;
          box-shadow: 0 4px 10px rgba(29, 78, 216, 0.2);
        }
        [data-theme='dark'] .step-num {
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        /* Trending Destinations Zoom Transition */
        .dest-card {
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), 
                      border-color 0.4s ease, 
                      box-shadow 0.4s ease;
          overflow: hidden;
          text-align: left;
        }
        .dest-card:hover {
          transform: translateY(-10px);
          border-color: var(--color-primary);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        .dest-image-wrapper {
          overflow: hidden;
          position: relative;
        }
        .dest-img {
          transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .dest-card:hover .dest-img {
          transform: scale(1.08);
        }
        
        /* Premium CTA Section Redesign */
        .premium-cta-section {
          display: grid;
          grid-template-columns: 1fr;
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
          background: var(--bg-secondary) !important;
          border: 1px solid var(--border-color) !important;
          box-shadow: var(--shadow-lg) !important;
          margin-top: 100px;
        }

        @media (min-width: 992px) {
          .premium-cta-section {
            grid-template-columns: 1.2fr 1fr;
          }
        }

        .cta-content-column {
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          z-index: 5;
        }

        @media (min-width: 576px) {
          .cta-content-column {
            padding: 50px 40px;
          }
        }

        @media (min-width: 1200px) {
          .cta-content-column {
            padding: 60px 50px;
          }
        }

        .cta-tagline-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .cta-map-icon-wrapper {
          background: rgba(234, 88, 12, 0.1);
          color: var(--color-primary);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        [data-theme='dark'] .cta-map-icon-wrapper {
          background: rgba(255, 107, 0, 0.15);
        }

        .cta-tagline {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 2px;
          color: var(--color-primary);
        }

        .cta-plane-trail {
          margin-left: 4px;
        }

        .cta-main-title {
          font-family: var(--font-heading);
          font-size: 2.5rem !important;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .highlight-text-orange {
          color: var(--color-primary);
        }

        .cta-title-accent-line {
          width: 50px;
          height: 3px;
          background: var(--color-primary);
          border-radius: 1.5px;
          margin-bottom: 24px;
        }

        .cta-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .cta-buttons-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 32px;
          width: 100%;
        }

        .cta-btn-primary {
          background: var(--gradient-accent);
          color: white;
          padding: 14px 28px !important;
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
        }

        .cta-btn-primary:hover {
          background: var(--gradient-accent-hover);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 6px 20px rgba(234, 88, 12, 0.45);
        }

        .cta-btn-secondary {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 14px 28px !important;
        }

        .cta-btn-secondary:hover {
          background: var(--bg-tertiary);
          border-color: var(--color-primary);
          transform: translateY(-3px) scale(1.02);
        }

        .cta-btn-primary svg, .cta-btn-secondary svg {
          transition: transform 0.3s ease;
        }

        .cta-btn-primary:hover svg, .cta-btn-secondary:hover svg {
          transform: translateX(4px);
        }

        /* 3 highlights footer */
        .cta-footer-highlights {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
          width: 100%;
        }

        .cta-highlight-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .cta-highlight-item svg {
          color: #10B981; /* Green check */
        }

        .cta-highlight-item-divider {
          width: 1px;
          height: 12px;
          background: var(--border-color);
          display: none;
        }

        @media (min-width: 576px) {
          .cta-highlight-item-divider {
            display: block;
          }
        }

        /* Right image wrapper */
        .cta-image-wrapper {
          position: relative;
          min-height: 250px;
          overflow: hidden;
        }

        @media (min-width: 992px) {
          .cta-image-wrapper {
            height: 100%;
            min-height: 100%;
          }
        }

        .cta-image-bg {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          position: absolute;
          top: 0;
          left: 0;
        }

        .cta-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, transparent 40%, transparent 70%, var(--bg-secondary) 100%);
        }

        @media (min-width: 992px) {
          .cta-image-overlay {
            background: linear-gradient(90deg, var(--bg-secondary) 0%, rgba(248, 250, 252, 0.4) 30%, transparent 60%, transparent 90%, var(--bg-secondary) 100%);
          }
          [data-theme='dark'] .cta-image-overlay {
            background: linear-gradient(90deg, var(--bg-secondary) 0%, rgba(9, 9, 11, 0.4) 30%, transparent 60%, transparent 90%, var(--bg-secondary) 100%);
          }
        }

        /* Floating Center Backpack Badge */
        .cta-center-backpack-badge {
          position: absolute;
          top: 50%;
          left: 54.5%;
          transform: translate(-50%, -50%);
          background: var(--bg-secondary);
          border: 1.5px solid var(--color-primary);
          color: var(--color-primary);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          z-index: 10;
          display: none;
        }

        @media (min-width: 992px) {
          .cta-center-backpack-badge {
            display: flex;
          }
        }

        /* Floating widgets inside image */
        .cta-floating-widget {
          position: absolute;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 10;
        }

        .widget-top {
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
        }

        @media (min-width: 992px) {
          .widget-top {
            top: 40px;
            left: 30px;
            transform: none;
          }
        }

        .widget-bottom {
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 280px;
        }

        @media (min-width: 992px) {
          .widget-bottom {
            bottom: 40px;
            right: 30px;
            left: auto;
            transform: none;
            width: auto;
            max-width: none;
          }
        }

        .widget-top .avatar-group {
          display: flex;
        }

        .widget-top .avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid var(--bg-primary);
          margin-left: -6px;
        }

        .widget-top .avatar:first-child {
          margin-left: 0;
        }

        .widget-title {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 2px;
        }

        .widget-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.1;
        }

        .widget-lock-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(234, 88, 12, 0.1);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        [data-theme='dark'] .widget-lock-circle {
          background: rgba(255, 107, 0, 0.15);
        }
        .cta-glow-1 {
          position: absolute;
          top: -40%;
          left: -20%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(29, 78, 216, 0.06) 0%, transparent 75%);
          pointer-events: none;
        }
        [data-theme='dark'] .cta-glow-1 {
          background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 75%);
        }
        .cta-glow-2 {
          position: absolute;
          bottom: -40%;
          right: -20%;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(180, 83, 9, 0.06) 0%, transparent 75%);
          pointer-events: none;
        }
        [data-theme='dark'] .cta-glow-2 {
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 75%);
        }

        /* Responsive Mobile Styles */
        @media (max-width: 768px) {
          .hero-section {
            padding: 40px 20px;
            margin-bottom: 40px;
          }
          .hero-title {
            font-size: 2.2rem;
            line-height: 1.25;
            margin-bottom: 16px;
          }
          .hero-subtitle {
            font-size: 1.05rem;
            margin-bottom: 28px;
          }
          .hero-search-bar {
            flex-direction: column;
            gap: 12px;
            background: transparent;
            border: none;
            box-shadow: none;
            margin-bottom: 40px;
          }
          .hero-search-bar input {
            background: var(--bg-secondary) !important;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm) !important;
            width: 100%;
            padding: 14px 16px;
          }
          .hero-search-bar button {
            width: 100%;
            padding: 14px;
            border-radius: var(--radius-sm) !important;
          }
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .section-title {
            font-size: 1.8rem !important;
          }
          .features-grid {
            gap: 20px;
            margin: 40px 0;
          }
          .feature-card {
            padding: 24px;
          }
          .cta-banner {
            padding: 40px 20px !important;
          }
        }
        @media (max-width: 480px) {
          .stats-container {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 1.85rem;
          }
        }
      `}</style>

    </div>
  );
}
