import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cinematic3DHero from '../components/Cinematic3DHero';
import FeatureSlider from '../components/FeatureSlider';
import DestinationCard from '../components/DestinationCard';
import CategoryCapsulesSection from '../components/CategoryCapsulesSection';

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
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', background: 'var(--bg-primary)', paddingTop: '0px' }}>
      
      {/* Cinematic 3D Hero Section */}
      <Cinematic3DHero 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        handleSearchSubmit={handleSearchSubmit} 
      />

      <div className="container" style={{ marginTop: '60px' }}>
        {/* Categories Stadium Capsules Section */}
        <CategoryCapsulesSection />

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
      <section className="glass-panel cta-banner" style={{ padding: '60px 40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="cta-glow-1"></div>
        <div className="cta-glow-2"></div>
        
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
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }
        .cta-banner:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
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
