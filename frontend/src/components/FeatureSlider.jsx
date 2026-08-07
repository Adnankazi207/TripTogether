import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const SLIDES = [
  {
    tag: "Gemini AI Search",
    title: "Smart Destination Guide Generator",
    desc: "Search for any city worldwide. If it's not in our database, our Gemini AI automatically compiles descriptive guides, ideal stay durations, packing lists, and matches beautiful Unsplash photos on the fly.",
    type: "search",
    icon: "🔍"
  },
  {
    tag: "Rupee Control",
    title: "Indian Rupee (₹) Expense Tracking",
    desc: "Log daily transit, food, and lodging costs in Indian Rupees. Collaborative warning meters pulse red to alert your group members when you cross 75% or 100% of your allocated budget ceiling.",
    type: "budget",
    icon: "💸"
  },
  {
    tag: "Time Management",
    title: "Day-by-Day Timeline & Checklist",
    desc: "Coordinate daily timelines with precise event slots. Maintain shared packing lists, checklist logs, and booking reminders in real-time so your travel group never misses a flight or reservation.",
    type: "timeline",
    icon: "📅"
  },
  {
    tag: "Group Collaboration",
    title: "Cooperative Trip Rooms",
    desc: "Generate secure 6-character room codes. Share codes with travel partners to let them edit timelines collectively, track shared ledger balances, and build a group vacation picture gallery.",
    type: "rooms",
    icon: "👥"
  },
  {
    tag: "AI Chat Console",
    title: "AI Co-Pilot Travel Agent",
    desc: "Chat interactively with our Co-Pilot to map transit connections, request local restaurant advice, calculate distance timings, and construct custom itineraries tailored to current weather seasons.",
    type: "chat",
    icon: "🤖"
  }
];

export default function FeatureSlider() {
  const { theme } = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [typedText, setTypedText] = useState("");
  
  // Auto-play state
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8500);
    return () => clearInterval(timer);
  }, [activeSlide]);

  // Simulate typing search mockup when search slide is active
  useEffect(() => {
    if (activeSlide !== 0) {
      setTypedText("");
      return;
    }
    let currentIdx = 0;
    const targetText = "Paris guides, weather, and budget tips...";
    setTypedText("");
    
    const typingInterval = setInterval(() => {
      if (currentIdx < targetText.length) {
        setTypedText(prev => prev + targetText.charAt(currentIdx));
        currentIdx++;
      } else {
        clearInterval(typingInterval);
      }
    }, 70);

    return () => clearInterval(typingInterval);
  }, [activeSlide]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Render the interactive mockup based on feature type
  const renderMockup = (type) => {
    const isDark = theme === 'dark';
    
    switch (type) {
      case 'search':
        return (
          <div className="slider-mockup-window glass-panel">
            {/* Window bar */}
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">Gemini Smart Assistant</span>
            </div>
            
            {/* Content area */}
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="mockup-search-input-box" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)' }}>
                <span>🔍</span>
                <span className="mockup-typing-text">{typedText}<span className="blink-caret">|</span></span>
              </div>

              {typedText.length > 15 && (
                <div className="mockup-card animate-fade-in" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#2563EB' }}>✨ Paris Guide Generated</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ideal stay: 4 Days</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    "The City of Light. Experience historic architecture along the Seine. Ideal visit during Autumn. Packing: light jackets, walking shoes."
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="slider-mockup-window glass-panel">
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">Trip Budget Ledger</span>
            </div>
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL BUDGET LIMIT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹50,000</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL EXPENSES</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#EF4444' }}>₹39,000</div>
                </div>
              </div>

              {/* Progress bar with glowing alert */}
              <div>
                <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', fontWeight: '600' }}>
                  <span>Usage Meter: 78%</span>
                  <span className="pulsing-warning-text" style={{ color: '#EF4444' }}>⚠️ 75% BUDGET ALERT</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Expense list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                  <span>🏨 Paris Hotel (Lodging)</span>
                  <span style={{ fontWeight: '700' }}>₹25,000</span>
                </div>
                <div style={{ display: 'flex', justifycontent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                  <span>🚇 Metro Pass (Transit)</span>
                  <span style={{ fontWeight: '700' }}>₹8,000</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="slider-mockup-window glass-panel">
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">Itinerary Timeline</span>
            </div>
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="timeline-mockup-item">
                <div className="time-badge">09:30 AM</div>
                <div className="timeline-connector"></div>
                <div className="timeline-mockup-card">
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>✈ Boarding Flight CDG</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Terminal 2B · Gate 14</div>
                </div>
              </div>
              <div className="timeline-mockup-item">
                <div className="time-badge">02:00 PM</div>
                <div className="timeline-connector"></div>
                <div className="timeline-mockup-card">
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>🏨 Hotel Check-In</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Hotel Plaza Athénée</div>
                </div>
              </div>
              <div className="timeline-mockup-item">
                <div className="time-badge">05:30 PM</div>
                <div className="timeline-mockup-card">
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>🗼 Eiffel Tower Summit Visit</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>E-tickets preloaded in App</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rooms':
        return (
          <div className="slider-mockup-window glass-panel">
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">Collaborative Dashboard</span>
            </div>
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Room Code */}
              <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>ROOM SHARE CODE</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#2563EB', letterSpacing: '2px' }}>FR-P41</span>
                </div>
                <button className="btn-icon" style={{ borderRadius: '50%', width: '36px', height: '36px' }}>📋</button>
              </div>

              {/* Members Grid */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>ONLINE TRAVEL PARTNERS (3)</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="member-avatar-pill">
                    <span className="avatar-circle" style={{ background: '#2563EB' }}>A</span>
                    <span>Adnan (Host)</span>
                  </div>
                  <div className="member-avatar-pill">
                    <span className="avatar-circle" style={{ background: '#F43F5E' }}>K</span>
                    <span>Kazi</span>
                  </div>
                  <div className="member-avatar-pill">
                    <span className="avatar-circle" style={{ background: '#059669' }}>R</span>
                    <span>Rahul</span>
                  </div>
                </div>
              </div>

              {/* Activity Logger */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid #059669' }}>
                💬 <strong>Kazi</strong> updated Day 2 timeline (Louvre Museum visit) 10m ago
              </div>
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="slider-mockup-window glass-panel">
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">🤖 Co-Pilot Chat Agent</span>
            </div>
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '220px', justifycontent: 'flex-end' }}>
              {/* Message 1 */}
              <div style={{ alignSelf: 'flex-end', background: '#2563EB', color: '#ffffff', padding: '10px 14px', borderRadius: '14px 14px 2px 14px', fontSize: '0.82rem', maxWidth: '80%', lineHeight: '1.4' }}>
                Suggest the best local restaurant guides in Manali near Mall Road?
              </div>
              {/* Message 2 */}
              <div style={{ alignSelf: 'flex-start', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', padding: '12px 14px', borderRadius: '14px 14px 14px 2px', fontSize: '0.82rem', maxWidth: '85%', border: '1px solid var(--border-color)', lineHeight: '1.4' }}>
                🤖 <strong>Co-Pilot:</strong> "Try **Johnson's Cafe** (famous for fresh local Himalayan trout fish, 5m walk from Mall Road) or **Chopsticks** for excellent Tibetan cuisine."
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const slide = SLIDES[activeSlide];

  return (
    <section className="luxury-slider-section" style={{ margin: '100px 0', position: 'relative' }}>
      <div className="section-header">
        <span className="section-tag">Explore Functionality</span>
        <h2 className="section-title" style={{ fontSize: '2.5rem' }}>Visual Travel Toolkit</h2>
        <p className="section-desc">Experience the core interactive workflows built to coordinate and control your dream trip.</p>
      </div>

      <div className="slider-viewport-container">
        {/* Next & Previous Navigation Buttons */}
        <button className="slider-nav-btn btn-prev" onClick={handlePrev} aria-label="Previous Slide">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button className="slider-nav-btn btn-next" onClick={handleNext} aria-label="Next Slide">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Core Slide Wrapper */}
        <div className={`slider-grid ${isAnimating ? 'slider-animating' : ''}`}>
          {/* Left Side: Editorial Content */}
          <div className="slider-content-column">
            <div className="slider-feature-badge" style={{ color: theme === 'light' ? '#2563EB' : '#38BDF8' }}>
              <span style={{ marginRight: '8px' }}>{slide.icon}</span>
              {slide.tag}
            </div>
            
            <h3 className="slider-feature-title" style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.2' }}>
              {slide.title}
            </h3>
            
            <p className="slider-feature-desc" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {slide.desc}
            </p>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`slider-dot-indicator ${activeSlide === i ? 'active' : ''}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side: Interactive GUI Mockup */}
          <div className="slider-mockup-column">
            {renderMockup(slide.type)}
          </div>
        </div>
      </div>
    </section>
  );
}
