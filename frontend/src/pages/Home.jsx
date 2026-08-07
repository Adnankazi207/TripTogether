import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cinematic3DHero from '../components/Cinematic3DHero';
import FeatureSlider from '../components/FeatureSlider';

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
      title: 'Paris',
      country: 'France',
      category: 'Urban',
      costIndex: '₹₹₹',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
      description: 'Experience the magic of the City of Light. Walk the historical Champs-Élysées, explore the Louvre, and view the city from the top of the Eiffel Tower.'
    },
    {
      title: 'Manali',
      country: 'India',
      category: 'Nature',
      costIndex: '₹₹',
      rating: '4.7',
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
      description: 'Nestled deep in the Himalayas, Manali is a sanctuary for adventure lovers. Enjoy winter snowsports, paragliding, and serene forest hiking trails.'
    },
    {
      title: 'Bangalore',
      country: 'India',
      category: 'Urban',
      costIndex: '₹₹',
      rating: '4.6',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80',
      description: 'The greenest tech metropolis in India. Explore spacious public parks, historic palace sites, and a thriving craft cafe and pub culture.'
    }
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', background: 'var(--bg-primary)', paddingTop: '80px' }}>
      
      {/* Cinematic 3D Hero Section */}
      <Cinematic3DHero 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        handleSearchSubmit={handleSearchSubmit} 
      />

      <div className="container" style={{ marginTop: '60px' }}>
        {/* Core Features Grid */}
        <section style={{ margin: '100px 0' }}>
        <div className="section-header">
          <span className="section-tag">Key Features</span>
          <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Everything You Need to Plan</h2>
          <p className="section-desc">
            We simplify travel planning, budget control, and group coordination into a unified visual experience.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Smart Destination Search</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Search for any city worldwide. If it's not in our database, our Gemini AI integration automatically generates description guides, ideal stay durations, categories, and matches beautiful Unsplash photos on the fly.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💸</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Indian Rupee (₹) Financials</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Log transactions, allocate travel expenses, and track category ratios (Food, Lodging, Transit). Includes warning meters that alert you if you have used 75% or 100% of your budget.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Day-by-Day Timeline</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Plan out daily schedules, define specific event times, leave detailed reminder notes, and maintain a shared checklists log so you never miss flight boarding, dining bookings, or hiking trailheads.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Cooperative Trip Rooms</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Generate secure 6-character room codes. Share codes with travel partners to let them view itineraries, edit checklists, log expenses, and upload vacation pictures in a shared photo gallery.
            </p>
          </div>
        </div>
      </section>

         <FeatureSlider />

      {/* Visual Walkthrough: How it Works */}
      <section style={{ margin: '100px 0' }}>
        <div className="section-header">
          <span className="section-tag">Workflow</span>
          <h2 className="section-title" style={{ fontSize: '2.5rem' }}>How TripTogether Works</h2>
          <p className="section-desc">Follow these four simple steps to structure and launch your collaborative dream trip.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', margin: '40px 0' }}>
          <div className="step-card">
            <div className="step-num">1</div>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px', textAlign: 'center' }}>🗺️</div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: '700', textAlign: 'center' }}>Select Destination</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'center' }}>
              Search our global catalog or type in a new city to seed its travel profile instantly.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">2</div>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px', textAlign: 'center' }}>📅</div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: '700', textAlign: 'center' }}>Define Budget & Dates</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'center' }}>
              Input your trip dates and set budget ceilings in Rupees (₹) to prevent overspending.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">3</div>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px', textAlign: 'center' }}>👥</div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: '700', textAlign: 'center' }}>Invite Group Members</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'center' }}>
              Share unique 6-character room codes with friends to edit itineraries collaboratively.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">4</div>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px', textAlign: 'center' }}>🎒</div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '8px', fontWeight: '700', textAlign: 'center' }}>Track Live & Go</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', textAlign: 'center' }}>
              Log food, transit, and lodging costs live on the go, check off packing items, and share photos.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Destinations Section */}
      <section style={{ margin: '100px 0' }}>
        <div className="section-header">
          <span className="section-tag">Trending Escapes</span>
          <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Popular Places to Visit</h2>
          <p className="section-desc">Explore some of the most sought-after spots booked by travelers this month.</p>
        </div>

        <div className="destinations-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {trendingDestinations.map((dest, i) => (
            <div key={i} className="dest-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/destinations?search=${dest.title}`)}>
              <div className="dest-image-wrapper">
                <img src={dest.image} alt={dest.title} className="dest-img" />
                <span className={`dest-category-badge badge-${dest.category}`}>{dest.category}</span>
                <span className="dest-rating">⭐ {dest.rating}</span>
              </div>
              <div className="dest-body">
                <div className="dest-meta">📍 {dest.country}</div>
                <h3 className="dest-title" style={{ fontSize: '1.4rem', margin: '8px 0', fontWeight: '700' }}>{dest.title}</h3>
                <p className="dest-desc" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', minHeight: '60px', lineHeight: '1.5' }}>{dest.description}</p>
                <div className="dest-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                  <div className="dest-price">
                    <span className="price-label">Cost Index</span>
                    <span className="price-value" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{dest.costIndex}</span>
                  </div>
                  <span className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}>View Details</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="glass-panel cta-banner" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="cta-grid-pattern"></div>
        <div className="cta-glow-1"></div>
        <div className="cta-glow-2"></div>
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '650px', margin: '0 auto' }}>
          <span className="cta-tag">Start planning</span>
          <h2 className="cta-title">Ready for Your Next <span>Adventure?</span></h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '36px', fontSize: '1.05rem', lineHeight: '1.65' }}>
            Join thousands of travelers who plan, collaborate, and track their expenses with TripTogether. Create a secure, group-accessible room code in seconds.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/register" className="btn btn-primary cta-btn-primary">
              Create Account Free <span className="btn-arrow" style={{ display: 'inline-block', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>→</span>
            </Link>
            <Link to="/destinations" className="btn btn-secondary cta-btn-secondary">
              Browse Catalog
            </Link>
          </div>
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
        
        /* CTA Hover Effects */
        .cta-banner {
          background: var(--bg-secondary) !important;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border-color) !important;
          box-shadow: var(--shadow-lg), 0 10px 40px rgba(0, 0, 0, 0.03) !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          padding: 80px 40px !important;
          border-radius: 24px !important;
          text-align: center;
        }
        [data-theme='dark'] .cta-banner {
          background: linear-gradient(135deg, rgba(10, 10, 12, 0.7) 0%, rgba(3, 7, 18, 0.95) 100%) !important;
          box-shadow: var(--shadow-lg), 0 20px 50px rgba(0, 0, 0, 0.3) !important;
        }
        .cta-banner:hover {
          border-color: var(--color-primary) !important;
          box-shadow: var(--shadow-lg), var(--shadow-glow), 0 20px 60px rgba(37, 99, 235, 0.15) !important;
          transform: translateY(-4px);
        }
        .cta-grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.22;
          pointer-events: none;
          z-index: 1;
        }
        .cta-glow-1 {
          position: absolute;
          top: -50%;
          left: -20%;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 1;
          animation: ctaPulseGlow 8s ease-in-out infinite alternate;
        }
        [data-theme='light'] .cta-glow-1 {
          background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%);
        }
        .cta-glow-2 {
          position: absolute;
          bottom: -50%;
          right: -20%;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 1;
          animation: ctaPulseGlow 8s ease-in-out infinite alternate-reverse;
        }
        [data-theme='light'] .cta-glow-2 {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%);
        }
        @keyframes ctaPulseGlow {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.15); }
        }
        .cta-tag {
          text-transform: uppercase;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 4px;
          color: var(--color-primary);
          background: rgba(37, 99, 235, 0.06);
          padding: 6px 16px;
          border-radius: 100px;
          border: 1px solid rgba(37, 99, 235, 0.15);
          display: inline-block;
          margin-bottom: 24px;
        }
        .cta-title {
          font-size: 3rem !important;
          font-weight: 800 !important;
          letter-spacing: -1.5px;
          margin-bottom: 20px !important;
          font-family: var(--font-heading);
          color: var(--text-primary);
          line-height: 1.15;
        }
        .cta-title span {
          background: linear-gradient(135deg, #2563EB 0%, #38BDF8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 40px rgba(56, 189, 248, 0.1);
        }
        .cta-btn-primary {
          background: var(--gradient-accent) !important;
          border-color: transparent !important;
          padding: 16px 36px !important;
          font-weight: 700 !important;
          font-size: 0.95rem !important;
          border-radius: 100px !important;
          display: inline-flex !important;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25) !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
          color: white !important;
        }
        .cta-btn-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.45) !important;
        }
        .cta-btn-primary:hover .btn-arrow {
          transform: translateX(4px);
        }
        .cta-btn-secondary {
          padding: 16px 36px !important;
          font-weight: 700 !important;
          font-size: 0.95rem !important;
          border-radius: 100px !important;
          background: rgba(15, 23, 42, 0.02) !important;
          border: 1px solid var(--border-color) !important;
          color: var(--text-primary) !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        [data-theme='dark'] .cta-btn-secondary {
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .cta-btn-secondary:hover {
          background: var(--text-primary) !important;
          border-color: var(--text-primary) !important;
          color: var(--bg-primary) !important;
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
        }
        [data-theme='dark'] .cta-btn-secondary:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
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
