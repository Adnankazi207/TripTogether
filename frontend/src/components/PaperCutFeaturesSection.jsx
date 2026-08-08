import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURE_BADGES = [
  {
    num: 1,
    title: 'Smart AI Search',
    desc: 'Automated itinerary generation & Unsplash imagery.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    )
  },
  {
    num: 2,
    title: 'Rupee Control',
    desc: 'Track live ₹ ledger & set 75% warning alert thresholds.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    )
  },
  {
    num: 3,
    title: 'Day Timeline',
    desc: 'Coordinate hour-by-hour itineraries & booking check-ins.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <polyline points="16 11 18 13 22 9"/>
      </svg>
    )
  },
  {
    num: 4,
    title: 'Group Rooms',
    desc: 'Share 6-character room codes with friends to plan live.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
      </svg>
    )
  }
];

const FILTER_TAGS = ['All', 'Bangkok', 'California', 'Maldives', 'Spain', 'Thailand', 'Tokyo'];

const MINI_DESTINATIONS = [
  {
    title: 'Maldives Overwater Resort',
    tag: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80',
    price: '$850'
  },
  {
    title: 'California Yosemite Trail',
    tag: 'California',
    image: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=80',
    price: '$620'
  },
  {
    title: 'Tokyo Cherry Blossom',
    tag: 'Tokyo',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    price: '$940'
  },
  {
    title: 'Bangkok Floating Market',
    tag: 'Bangkok',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80',
    price: '$480'
  }
];

export default function PaperCutFeaturesSection() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [sliderIndex, setSliderIndex] = useState(0);
  const [heroTransform, setHeroTransform] = useState('');
  const heroRef = useRef(null);

  // Filter mini destinations
  const filteredMiniDests = activeFilter === 'All' 
    ? MINI_DESTINATIONS 
    : MINI_DESTINATIONS.filter(d => d.tag === activeFilter || activeFilter === 'All');

  const handlePrevSlide = () => {
    setSliderIndex(prev => (prev === 0 ? filteredMiniDests.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setSliderIndex(prev => (prev + 1) % filteredMiniDests.length);
  };

  // 3D Parallax Tilt for the Torn Hero Image
  const handleHeroMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setHeroTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.03)`);
  };

  const handleHeroMouseLeave = () => {
    setHeroTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
  };

  return (
    <section className="paper-cut-section">
      {/* Top Ripped Paper Divider SVG */}
      <div className="paper-divider paper-divider-top">
        <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path 
            d="M0,32L40,42.7C80,53,160,75,240,74.7C320,75,400,53,480,48C560,43,640,53,720,64C800,75,880,85,960,80C1040,75,1120,53,1200,48C1280,43,1360,53,1400,58.7L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" 
            fill="var(--bg-primary)"
          />
        </svg>
      </div>

      <div className="paper-cut-inner-container">
        
        {/* Left Side: Header, 2x2 Feature Grid, Filter Pills, Slider */}
        <div className="paper-cut-left-col">
          
          {/* Header */}
          <div className="paper-cut-header">
            <span className="paper-cut-script-tag">
              Trending Destination & Features
            </span>
            <h2 className="paper-cut-main-title">
              Craft Your Ultimate Travel Experience
            </h2>
            <p className="paper-cut-desc">
              These destinations and planning toolkits offer authentic experiences, natural beauty, and friendly access for modern travelers worldwide.
            </p>
          </div>

          {/* 2x2 Numbered Feature Badges Grid matching reference design */}
          <div className="paper-cut-badges-grid">
            {FEATURE_BADGES.map((badge) => (
              <div key={badge.num} className="paper-cut-badge-card">
                {/* Number Pill Badge */}
                <div className="badge-num-circle">
                  {badge.num}
                </div>

                <div className="badge-card-content">
                  <div className="badge-icon-box">
                    {badge.icon}
                  </div>
                  <h4 className="badge-title">{badge.title}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* Category Filter Pills Row matching reference design */}
          <div className="paper-cut-filter-pills">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                className={`paper-filter-btn ${activeFilter === tag ? 'active' : ''}`}
                onClick={() => {
                  setActiveFilter(tag);
                  setSliderIndex(0);
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Mini Destination Preview Slider & Round Orange Navigation Arrows */}
          <div className="paper-cut-slider-wrapper">
            <div className="mini-cards-row">
              {filteredMiniDests.slice(sliderIndex, sliderIndex + 2).map((item, i) => (
                <div 
                  key={i} 
                  className="mini-dest-card animate-fade-in"
                  onClick={() => navigate(`/destinations?search=${encodeURIComponent(item.title)}`)}
                >
                  <img src={item.image} alt={item.title} className="mini-dest-img" />
                  <div className="mini-dest-overlay">
                    <span className="mini-dest-title">{item.title}</span>
                    <span className="mini-dest-price">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Orange Navigation Arrows matching reference design */}
            <div className="slider-arrow-controls">
              <button 
                className="slider-round-arrow" 
                onClick={handlePrevSlide}
                aria-label="Previous destination preview"
              >
                ‹
              </button>
              <button 
                className="slider-round-arrow" 
                onClick={handleNextSlide}
                aria-label="Next destination preview"
              >
                ›
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Artistic Ripped Edge Hero Mountain Scenery */}
        <div className="paper-cut-right-col">
          <div 
            ref={heroRef}
            className="torn-hero-frame"
            style={{ transform: heroTransform }}
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
          >
            {/* Scenery Photo */}
            <img 
              src="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80" 
              alt="Mountain Explorer Traveler" 
              className="torn-hero-img"
            />

            {/* Glowing Accent Shimmer Sweep */}
            <div className="torn-hero-glare" />

            {/* Floating Scenic Badge Pill */}
            <div className="floating-scenic-badge">
              <span className="badge-dot"></span>
              <span>Machu Picchu · Peru</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Ripped Paper Divider SVG */}
      <div className="paper-divider paper-divider-bottom">
        <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path 
            d="M0,64L40,58.7C80,53,160,43,240,48C320,53,400,75,480,80C560,85,640,75,720,64C800,53,880,43,960,48C1040,53,1120,75,1200,74.7C1280,75,1360,53,1400,42.7L1440,32L1440,120L1400,120C1360,120,1280,120,1200,120C1120,120,1040,120,960,120C880,120,800,120,720,120C640,120,560,120,480,120C400,120,320,120,240,120C160,120,80,120,40,120L0,120Z" 
            fill="var(--bg-primary)"
          />
        </svg>
      </div>

      <style>{`
        /* Section Layout & Paper-Torn Background */
        .paper-cut-section {
          position: relative;
          background: linear-gradient(135deg, rgba(13, 148, 136, 0.05) 0%, rgba(20, 184, 166, 0.08) 50%, rgba(14, 165, 233, 0.05) 100%);
          padding: 120px 0;
          margin: 100px 0;
          overflow: hidden;
        }

        [data-theme='dark'] .paper-cut-section {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(13, 71, 78, 0.4) 50%, rgba(15, 23, 42, 0.98) 100%);
        }

        .paper-divider {
          position: absolute;
          left: 0;
          width: 100%;
          overflow: hidden;
          line-height: 0;
          z-index: 10;
        }

        .paper-divider-top {
          top: 0;
        }

        .paper-divider-bottom {
          bottom: 0;
        }

        .paper-divider svg {
          position: relative;
          display: block;
          width: 100%;
          height: 60px;
        }

        .paper-cut-inner-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 50px;
          align-items: center;
          position: relative;
          z-index: 5;
        }

        /* Left Side Typography */
        .paper-cut-script-tag {
          font-family: 'Brush Script MT', 'Segoe Script', cursive, sans-serif;
          font-size: 1.8rem;
          color: #0d9488;
          font-weight: 700;
          display: block;
          margin-bottom: 6px;
        }

        [data-theme='dark'] .paper-cut-script-tag {
          color: #2dd4bf;
        }

        .paper-cut-main-title {
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text-primary);
          margin-bottom: 16px;
          line-height: 1.15;
        }

        .paper-cut-desc {
          font-size: 1.02rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 36px;
          max-width: 580px;
        }

        /* 2x2 Numbered Feature Badges Grid */
        .paper-cut-badges-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 36px;
        }

        .paper-cut-badge-card {
          position: relative;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
          transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }

        .paper-cut-badge-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: #0d9488;
          box-shadow: 0 16px 36px rgba(13, 148, 136, 0.2);
        }

        .badge-num-circle {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0f766e;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(15, 118, 110, 0.35);
          transition: transform 0.4s ease, background 0.4s ease;
        }

        .paper-cut-badge-card:hover .badge-num-circle {
          transform: translateX(-50%) rotate(360deg) scale(1.15);
          background: #0d9488;
        }

        .badge-card-content {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 6px;
        }

        .badge-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(13, 148, 136, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .badge-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        /* Filter Pills matching reference photo */
        .paper-cut-filter-pills {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .paper-filter-btn {
          padding: 8px 18px;
          border-radius: 100px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.86rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .paper-filter-btn:hover {
          border-color: #0d9488;
          color: #0d9488;
          transform: translateY(-2px);
        }

        .paper-filter-btn.active {
          background: #0f766e;
          border-color: #0f766e;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(15, 118, 110, 0.3);
        }

        /* Mini Destination Slider & Controls */
        .paper-cut-slider-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .mini-cards-row {
          display: flex;
          gap: 20px;
          flex: 1;
        }

        .mini-dest-card {
          position: relative;
          height: 140px;
          flex: 1;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .mini-dest-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
        }

        .mini-dest-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .mini-dest-card:hover .mini-dest-img {
          transform: scale(1.15);
        }

        .mini-dest-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%);
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 12px 16px;
          color: #ffffff;
        }

        .mini-dest-title {
          font-weight: 700;
          font-size: 0.88rem;
        }

        .mini-dest-price {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        /* Round Orange Arrow Buttons matching reference photo */
        .slider-arrow-controls {
          display: flex;
          gap: 10px;
        }

        .slider-round-arrow {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f59e0b;
          color: #ffffff;
          border: none;
          font-size: 1.6rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
          transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          line-height: 0;
          padding-bottom: 3px;
        }

        .slider-round-arrow:hover {
          background: #d97706;
          transform: scale(1.12) translateY(-2px);
          box-shadow: 0 10px 22px rgba(245, 158, 11, 0.55);
        }

        /* Right Column: Torn Edge Cut Hero Image */
        .paper-cut-right-col {
          display: flex;
          justify-content: center;
        }

        .torn-hero-frame {
          position: relative;
          width: 100%;
          max-width: 480px;
          height: 540px;
          border-radius: 36px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          cursor: pointer;

          /* Ripped Brush Cut Edge Border Mask */
          clip-path: polygon(
            0% 4%, 4% 0%, 15% 3%, 30% 0%, 45% 4%, 60% 0%, 75% 3%, 90% 0%, 100% 5%,
            97% 20%, 100% 35%, 96% 50%, 100% 65%, 97% 80%, 100% 95%, 95% 100%,
            80% 97%, 65% 100%, 50% 96%, 35% 100%, 20% 97%, 5% 100%, 0% 95%,
            3% 80%, 0% 65%, 4% 50%, 0% 35%, 3% 20%
          );
        }

        .torn-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.75s ease;
        }

        .torn-hero-frame:hover .torn-hero-img {
          transform: scale(1.12);
        }

        .torn-hero-glare {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
          pointer-events: none;
        }

        .floating-scenic-badge {
          position: absolute;
          bottom: 24px;
          left: 24px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 8px 16px;
          border-radius: 100px;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        /* Mobile Responsiveness */
        @media (max-width: 992px) {
          .paper-cut-inner-container {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .paper-cut-main-title {
            font-size: 2.2rem;
          }
          .torn-hero-frame {
            height: 420px;
          }
        }

        @media (max-width: 576px) {
          .paper-cut-badges-grid {
            grid-template-columns: 1fr;
          }
          .mini-cards-row {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}
