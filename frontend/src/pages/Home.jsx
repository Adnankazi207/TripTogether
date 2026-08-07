import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="container page-container animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Hero Section */}
      <section className="hero-section" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', background: 'var(--gradient-hero)' }}>
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        
        <div className="hero-content">
          <span className="hero-tagline">✨ Your Ultimate Travel Companion</span>
          <h1 className="hero-title">
            Explore the World, <br />
            <span className="gradient-text">Plan with Confidence</span>
          </h1>
          <p className="hero-subtitle">
            Create custom itineraries, manage budgets in Rupees, track daily expenses collaboratively, and discover top-rated destinations worldwide. Everything for your next adventure.
          </p>

          <form onSubmit={handleSearchSubmit} className="hero-search-bar" style={{ border: '1px solid var(--border-color)' }}>
            <input
              type="text"
              placeholder="Search destinations (e.g. Paris, Manali, Bangalore...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-sm)' }}>
              Search
            </button>
          </form>
        </div>

        {/* Stats Grid */}
        <div className="stats-container">
          <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="stat-number">30k+</div>
            <div className="stat-label">Trips Planned</div>
          </div>
          <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="stat-number">4.9★</div>
            <div className="stat-label">User Rating</div>
          </div>
          <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="stat-number">120+</div>
            <div className="stat-label">Cities Covered</div>
          </div>
          <div className="stat-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="stat-number">100%</div>
            <div className="stat-label">Free to Use</div>
          </div>
        </div>
      </section>

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

         <section className="glass-panel ai-showcase-section">
        <div className="ai-showcase-grid">
          <div>
            <span className="section-tag">Artificial Intelligence</span>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '16px', fontWeight: '800' }}>Smart Travel Planning Powered by AI</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1.02rem', lineHeight: '1.6' }}>
              We leverage modern language models to handle scheduling logistics and answer travel questions, allowing you to focus on enjoying the journey.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/ai-copilot" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 'var(--radius-sm)' }}>
                ✨ Try AI Co-Pilot
              </Link>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* AI Card 1 */}
            <div className="feature-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: '2rem', lineHeight: '1' }}>🤖</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '6px', fontWeight: '700', color: 'var(--text-primary)' }}>Automatic AI Itineraries</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Generate custom day-by-day sightseeing and activity schedules instantly. Tailored to local climates, cost index, and categories.
                </p>
              </div>
            </div>
            {/* AI Card 2 */}
            <div className="feature-card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: '2rem', lineHeight: '1' }}>💬</div>
              <div>
                <h4 style={{ fontSize: '1.15rem', marginBottom: '6px', fontWeight: '700', color: 'var(--text-primary)' }}>AI Co-Pilot Travel Chat</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Chat with our co-pilot to plan transit routes, request local restaurant advice, find shopping spots, and get dynamic packing lists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <section className="glass-panel cta-banner" style={{ padding: '60px 40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.02) 0%, rgba(244, 63, 94, 0.05) 100%)', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40%', left: '-20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 75%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-40%', right: '-20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244, 63, 94, 0.08) 0%, transparent 75%)', pointerEvents: 'none' }}></div>
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', margin: '0 auto' }}>
          <span className="section-tag" style={{ marginBottom: '12px' }}>Start planning</span>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: '800' }}>Ready for Your Next Adventure?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Join thousands of travelers who plan, collaborate, and track their expenses with TripTogether. Create a secure, group-accessible room code in seconds.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px' }}>
              Create Account Free
            </Link>
            <Link to="/destinations" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Premium CSS transitions and animations */}
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
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
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
          border-color: rgba(220, 38, 38, 0.22);
          box-shadow: 0 20px 40px rgba(220, 38, 38, 0.05), var(--shadow-glow);
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
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), 
                      border-color 0.4s ease, 
                      box-shadow 0.4s ease;
          position: relative;
        }
        .step-card:hover {
          transform: translateY(-6px);
          border-color: rgba(220, 38, 38, 0.18);
          box-shadow: 0 15px 30px rgba(220, 38, 38, 0.04);
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
          fontWeight: 800;
          font-size: 0.88rem;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.3);
        }

        /* Trending Destinations Zoom Transition */
        .dest-card {
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), 
                      border-color 0.4s ease, 
                      box-shadow 0.4s ease;
          overflow: hidden;
          text-align: left;
        }
        .dest-card:hover {
          transform: translateY(-10px);
          border-color: rgba(220, 38, 38, 0.22);
          box-shadow: 0 30px 50px rgba(220, 38, 38, 0.06);
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
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .cta-banner:hover {
          border-color: rgba(220, 38, 38, 0.15);
          box-shadow: 0 20px 45px rgba(220, 38, 38, 0.04);
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
