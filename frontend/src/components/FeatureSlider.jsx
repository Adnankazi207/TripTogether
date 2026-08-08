import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    tag: "Gemini AI Search",
    title: "Smart Destination Guide Generator",
    desc: "Search for any city worldwide. If it's not in our database, our Gemini AI automatically compiles descriptive guides, ideal stay durations, packing lists, and matches beautiful Unsplash photos on the fly.",
    type: "search",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    highlights: [
      { label: "Global Catalog", desc: "Search any city in the world" },
      { label: "Instant Profiles", desc: "Generates packing lists instantly" },
      { label: "Rich Images", desc: "Fetches beautiful matching photos" }
    ]
  },
  {
    tag: "Rupee Control",
    title: "Indian Rupee (₹) Expense Tracking",
    desc: "Log daily transit, food, and lodging costs in Indian Rupees. Collaborative warning meters pulse red to alert your group members when you cross 75% or 100% of your allocated budget ceiling.",
    type: "budget",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V15a2 2 0 01-2 2z" />
      </svg>
    ),
    highlights: [
      { label: "Smart Alerts", desc: "Get notified at 75% and 100% usage" },
      { label: "Group Aware", desc: "Everyone stays updated in real-time" },
      { label: "Stay on Track", desc: "Keep expenses within budget" }
    ]
  },
  {
    tag: "Time Management",
    title: "Day-by-Day Timeline & Checklist",
    desc: "Coordinate daily timelines with precise event slots. Maintain shared packing lists, checklist logs, and booking reminders in real-time so your travel group never misses a flight or reservation.",
    type: "timeline",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    highlights: [
      { label: "Precise Slots", desc: "Plan day by day down to minutes" },
      { label: "Shared Checklist", desc: "Check off packing lists together" },
      { label: "Live Reminders", desc: "Never miss a booking or flight" }
    ]
  },
  {
    tag: "Group Collaboration",
    title: "Cooperative Trip Rooms",
    desc: "Generate secure 6-character room codes. Share codes with travel partners to let them edit timelines collectively, track shared ledger balances, and build a group vacation picture gallery.",
    type: "rooms",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    highlights: [
      { label: "6-Char Codes", desc: "Secure invite codes for friends" },
      { label: "Collab Ledger", desc: "Real-time cost splitting rooms" },
      { label: "Shared Gallery", desc: "Upload vacation pictures live" }
    ]
  },
  {
    tag: "AI Chat Console",
    title: "AI Co-Pilot Travel Agent",
    desc: "Chat interactively with our Co-Pilot to map transit connections, request local restaurant advice, calculate distance timings, and construct custom itineraries tailored to current weather seasons.",
    type: "chat",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    highlights: [
      { label: "Custom Routes", desc: "Ask for personalized routes" },
      { label: "Local Advice", desc: "Get transit and restaurant guides" },
      { label: "Weather Smart", desc: "Itineraries adjusted for weather" }
    ]
  }
];

export default function FeatureSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [typedText, setTypedText] = useState("");
  
  // Auto-play state (automatically cycles slides every 5.5s)
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5500);
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
    }, 60);

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
    switch (type) {
      case 'search':
        return (
          <div className="slider-mockup-window glass-panel explore-mockup-fade-in">
            {/* Window bar */}
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">Gemini Smart Assistant</span>
            </div>
            
            {/* Content area */}
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="mockup-search-input-box">
                <span className="input-search-icon">🔍</span>
                <span className="mockup-typing-text">{typedText}<span className="blink-caret">|</span></span>
              </div>

              {typedText.length > 15 ? (
                <div className="mockup-card animate-fade-in search-result-card">
                  <div className="search-result-header">
                    <span className="search-result-title">✨ Paris Guide Generated</span>
                    <span className="search-result-duration">Ideal stay: 4 Days</span>
                  </div>
                  <div className="search-result-body">
                    <img 
                      src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=120&q=80" 
                      alt="Paris" 
                      className="search-result-thumbnail"
                    />
                    <div className="search-result-details">
                      <p className="search-result-desc">
                        "The City of Light. Experience historic architecture along the Seine. Ideal visit during Autumn. Packing: light jackets, walking shoes."
                      </p>
                      <div className="search-result-tags">
                        <span>🌤️ 22°C Clear</span>
                        <span>🥐 Top Food: Croissants</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="search-placeholder-content">
                  <div className="placeholder-pulse-bar short"></div>
                  <div className="placeholder-pulse-bar long"></div>
                  <div className="placeholder-pulse-bar medium"></div>
                </div>
              )}
            </div>
          </div>
        );

      case 'budget':
        return (
          <div className="slider-mockup-window glass-panel explore-mockup-fade-in">
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Trip Budget Ledger 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12" style={{ color: 'var(--color-primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </span>
            </div>
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Ledger Summary Stats Row */}
              <div className="ledger-stats-row">
                <div className="ledger-stat-box">
                  <div>
                    <div className="ledger-stat-label">TOTAL BUDGET</div>
                    <div className="ledger-stat-value">₹50,000</div>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1627252824823-5297be73f5c5?auto=format&fit=crop&w=80&q=80" 
                    alt="Wallet" 
                    className="ledger-stat-image"
                  />
                </div>
                <div className="ledger-stat-box">
                  <div>
                    <div className="ledger-stat-label">TOTAL EXPENSES</div>
                    <div className="ledger-stat-value expense-total-value">₹39,000</div>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=80&q=80" 
                    alt="Receipt" 
                    className="ledger-stat-image"
                  />
                </div>
              </div>

              {/* Progress bar with glowing alert */}
              <div className="ledger-progress-container">
                <div className="ledger-progress-header">
                  <span className="progress-percentage-label">Usage Meter: 78%</span>
                  <span className="pulsing-warning-text">⚠️ 75% BUDGET ALERT</span>
                </div>
                <div className="ledger-progress-bar-bg">
                  <div className="ledger-progress-bar-fill" style={{ width: '78%' }}></div>
                </div>
              </div>

              {/* Expense list with detailed thumbnails */}
              <div className="ledger-items-list">
                <div className="ledger-list-item">
                  <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=80&q=80" alt="Hotel" className="ledger-item-thumbnail" />
                  <span className="ledger-item-title">Paris Hotel (Lodging)</span>
                  <span className="ledger-item-price">₹25,000</span>
                </div>
                <div className="ledger-list-item">
                  <img src="https://images.unsplash.com/photo-1542640244-7e672d6cef21?auto=format&fit=crop&w=80&q=80" alt="Train" className="ledger-item-thumbnail" />
                  <span className="ledger-item-title">Metro Pass (Transit)</span>
                  <span className="ledger-item-price">₹8,000</span>
                </div>
                <div className="ledger-list-item">
                  <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=80&q=80" alt="Food" className="ledger-item-thumbnail" />
                  <span className="ledger-item-title">Local Food (Food)</span>
                  <span className="ledger-item-price">₹4,500</span>
                </div>
                <div className="ledger-list-item">
                  <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=80&q=80" alt="Sightseeing" className="ledger-item-thumbnail" />
                  <span className="ledger-item-title">Sightseeing (Activities)</span>
                  <span className="ledger-item-price">₹1,500</span>
                </div>
              </div>

              {/* Mockup Footer */}
              <div className="ledger-mockup-footer">
                <div className="ledger-sync-badge">
                  <svg className="sync-icon-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                  </svg>
                  <span>All expenses are auto-synced with your group.</span>
                </div>
                <button type="button" className="ledger-footer-btn" onClick={(e) => e.preventDefault()}>
                  View All Expenses →
                </button>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className="slider-mockup-window glass-panel explore-mockup-fade-in">
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">Itinerary Timeline</span>
            </div>
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="timeline-mockup-list">
                
                <div className="timeline-mockup-item">
                  <div className="time-badge">09:30 AM</div>
                  <div className="timeline-connector-line"></div>
                  <div className="timeline-mockup-card">
                    <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=80&q=80" alt="Flight" className="timeline-card-thumb" />
                    <div>
                      <div className="timeline-card-title">✈ Boarding Flight CDG</div>
                      <div className="timeline-card-subtitle">Terminal 2B · Gate 14</div>
                    </div>
                  </div>
                </div>

                <div className="timeline-mockup-item">
                  <div className="time-badge">02:00 PM</div>
                  <div className="timeline-connector-line"></div>
                  <div className="timeline-mockup-card">
                    <img src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=80&q=80" alt="Hotel" className="timeline-card-thumb" />
                    <div>
                      <div className="timeline-card-title">🏨 Hotel Check-In</div>
                      <div className="timeline-card-subtitle">Hotel Plaza Athénée Paris</div>
                    </div>
                  </div>
                </div>

                <div className="timeline-mockup-item">
                  <div className="time-badge">05:30 PM</div>
                  <div className="timeline-mockup-card">
                    <img src="https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=80&q=80" alt="Eiffel" className="timeline-card-thumb" />
                    <div>
                      <div className="timeline-card-title">🗼 Eiffel Tower Summit</div>
                      <div className="timeline-card-subtitle">E-tickets preloaded in App</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sub-checklists inside mockup */}
              <div className="timeline-checklist-box">
                <span className="checklist-box-title">Packing Checklist Checklist</span>
                <div className="checklist-box-row">
                  <label className="checklist-label-checked">
                    <input type="checkbox" defaultChecked disabled /> 
                    <span>Pack warm jackets</span>
                  </label>
                  <label className="checklist-label-unchecked">
                    <input type="checkbox" disabled /> 
                    <span>Preload Eiffel summit tickets</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rooms':
        return (
          <div className="slider-mockup-window glass-panel explore-mockup-fade-in">
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">Collaborative Dashboard</span>
            </div>
            <div className="mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Room Code */}
              <div className="room-code-share-widget">
                <div>
                  <span className="room-code-label">ROOM SHARE CODE</span>
                  <span className="room-code-value">FR-P41</span>
                </div>
                <button type="button" className="room-code-copy-btn">
                  📋 Copy Code
                </button>
              </div>

              {/* Members List */}
              <div className="online-partners-widget">
                <span className="online-partners-label">ONLINE TRAVEL PARTNERS (3)</span>
                <div className="partners-avatars-row">
                  <div className="member-avatar-pill">
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" alt="Adnan" className="partner-avatar-img" />
                    <span>Adnan (Host)</span>
                  </div>
                  <div className="member-avatar-pill">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Kazi" className="partner-avatar-img" />
                    <span>Kazi</span>
                  </div>
                  <div className="member-avatar-pill">
                    <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80" alt="Rahul" className="partner-avatar-img" />
                    <span>Rahul</span>
                  </div>
                </div>
              </div>

              {/* Group Gallery Widget */}
              <div className="room-gallery-widget">
                <span className="room-gallery-label">GROUP TRIP GALLERY</span>
                <div className="room-gallery-grid">
                  <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=80&q=80" alt="Paris" />
                  <img src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=80&q=80" alt="Paris 2" />
                  <img src="https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=80&q=80" alt="Paris 3" />
                  <div className="gallery-add-more">+4</div>
                </div>
              </div>

              {/* Activity Logger */}
              <div className="room-activity-log">
                💬 <strong>Kazi</strong> updated Day 2 timeline (Louvre Museum visit) 10m ago
              </div>
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="slider-mockup-window glass-panel explore-mockup-fade-in">
            <div className="mockup-header">
              <span className="dot dot-r"></span><span className="dot dot-y"></span><span className="dot dot-g"></span>
              <span className="mockup-title-text">🤖 Co-Pilot Chat Agent</span>
            </div>
            <div className="mockup-body chat-mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '260px' }}>
              <div className="chat-conversation-wrapper">
                {/* User Message */}
                <div className="chat-bubble chat-bubble-user">
                  Suggest the best local restaurant guides in Manali near Mall Road?
                </div>
                {/* AI Response */}
                <div className="chat-bubble chat-bubble-ai">
                  <div className="ai-avatar-badge">🤖</div>
                  <div>
                    <strong>Co-Pilot:</strong> "Try <strong>Johnson's Cafe</strong> (famous for fresh local Himalayan trout fish, 5m walk from Mall Road) or <strong>Chopsticks</strong> for excellent Tibetan cuisine."
                  </div>
                </div>
              </div>
              {/* Chat Input Field Mockup */}
              <div className="chat-input-field-mock">
                <span>Type message to Co-Pilot...</span>
                <button type="button" className="chat-send-btn-mock">
                  <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
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
      
      {/* Section Header (Outside the banner) */}
      <div className="section-header" style={{ position: 'relative', zIndex: 5, marginBottom: '40px' }}>
        <span className="section-tag" style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '8px' }}>
          EXPLORE FUNCTIONALITY
        </span>
        <h2 className="section-title explore-title" style={{ fontSize: '2.85rem', fontWeight: '800' }}>
          Visual Travel Toolkit
        </h2>
        <p className="section-desc explore-desc">
          Experience the core interactive workflows built to coordinate and control your dream trip.
        </p>
        <div className="explore-title-accent-line"></div>
      </div>

      {/* Slider Wrapper (Contains the background banner, the overlapping gear, and the glass panel) */}
      <div className="explore-slider-wrapper">

        {/* Background Section Image with scenic coast */}
        <div className="explore-section-bg" style={{ backgroundImage: "url('/explore_bg.png')" }}>
          <div className="explore-section-bg-overlay"></div>
        </div>

        {/* Next & Previous Navigation Buttons (Placed here to avoid clipping by overflow: hidden) */}
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

        {/* Slider Viewport Frosted Glass Container */}
        <div className="slider-viewport-container explore-glass-container">
          
          {/* Core Slide Wrapper */}
          <div className={`slider-grid ${isAnimating ? 'slider-animating' : ''}`}>
            
            {/* Left Side: Editorial Content */}
            <div className="slider-content-column explore-slider-content">
              
              <div className="slider-feature-badge" style={{ color: 'var(--color-primary)' }}>
                <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>{slide.icon}</span>
                {slide.tag}
              </div>
              
              <h3 className="slider-feature-title explore-slide-title">
                {slide.title}
              </h3>
              
              <p className="slider-feature-desc explore-slide-desc">
                {slide.desc}
              </p>

              {/* Bottom highlights capsule containing tailored bullet stats */}
              <div className="slide-highlights-capsule">
                {slide.highlights.map((highlight, idx) => (
                  <div key={idx} className="highlight-capsule-item">
                    <div className="highlight-item-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="highlight-item-label">{highlight.label}</div>
                      <div className="highlight-item-desc">{highlight.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots navigation */}
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

      </div>
    </section>
  );
}
