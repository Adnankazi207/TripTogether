import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cinematic3DHero from '../components/Cinematic3DHero';
import BentoGridFeatures from '../components/BentoGridFeatures';

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
        
        {/* Live Travel Statistics Section */}
        <section className="my-16 py-8 border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-sky-400">12,850+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block"></span>
                Active Rooms
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-sky-400">4,200+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cities Generated</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-sky-400">₹4.8 Cr+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Ledger Budgets</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-sky-400">85,340+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Global Planners</span>
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

         <BentoGridFeatures />

        {/* Traveler Stories Section */}
        <section className="my-24">
          <div className="section-header mb-12">
            <span className="section-tag">Community</span>
            <h2 className="section-title text-3xl md:text-5xl font-extrabold tracking-tight" style={{ fontSize: '2.5rem' }}>Traveler Stories & Itineraries</h2>
            <p className="section-desc max-w-2xl">
              Explore successful group trips structured, calculated, and coordinated entirely on TripTogether.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Story Card 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-500/30 transition-all duration-300">
              <div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-sky-400">🏔️ Adventure</span>
                  <span className="text-[10px] text-slate-400 font-semibold">5 Members · 6 Days</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Spiti Valley Expedition</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  "Mapped high-altitude mountain transits, monitored shared ledger logs under a strict ₹25k limit warning per member, and kept checklists synchronized on off-road passes."
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-4 block font-semibold">🎒 Created by Adnan & Friends</span>
            </div>

            {/* Story Card 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-500/30 transition-all duration-300">
              <div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">🌴 Leisure</span>
                  <span className="text-[10px] text-slate-400 font-semibold">3 Members · 4 Days</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Wayanad Backwater Cruise</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  "Calculated joint resort and cruise rates, managed shared food costs dynamically, and uploaded 45 group snapshots directly to the shared photo gallery."
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-4 block font-semibold">📸 Created by Ananya K.</span>
            </div>

            {/* Story Card 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-500/30 transition-all duration-300">
              <div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500">🏰 Heritage</span>
                  <span className="text-[10px] text-slate-400 font-semibold">2 Members · 7 Days</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Rajasthan Golden Triangle</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  "Monitored palace stay costs, set budget warning limits to prevent overspending, and interactively chatted with AI Co-Pilot to map transit from Udaipur to Jodhpur."
                </p>
              </div>
              <span className="text-[10px] text-slate-400 mt-4 block font-semibold">✍️ Created by Rahul & Rohit</span>
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
