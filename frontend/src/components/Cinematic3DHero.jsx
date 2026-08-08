import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const CAROUSEL_DATA = [
  {
    id: 1,
    title: 'MACHU PICCHU - PERU',
    location: 'Peru',
    tag: '#South_America',
    tagline: 'Adventure is never far away',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=85',
    category: 'Adventure',
    searchQuery: 'Peru'
  },
  {
    id: 2,
    title: 'LADAKH - INDIA',
    location: 'India',
    tag: '#Himalayan_Passes',
    tagline: 'Where the earth touches the sky',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
    category: 'Mountains',
    searchQuery: 'Ladakh'
  },
  {
    id: 3,
    title: 'MANALI - INDIA',
    location: 'India',
    tag: '#Pine_Valleys',
    tagline: 'Serenity among snowy mountain peaks',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=85',
    category: 'Nature',
    searchQuery: 'Manali'
  },
  {
    id: 4,
    title: 'KERALA - INDIA',
    location: 'India',
    tag: '#Tropical_Backwaters',
    tagline: 'Sailing through emerald coconut groves',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85',
    category: 'Tropics',
    searchQuery: 'Kerala'
  },
  {
    id: 5,
    title: 'TAJ MAHAL - AGRA',
    location: 'India',
    tag: '#Royal_Heritage',
    tagline: 'An eternal monument to love & wonder',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85',
    category: 'Culture',
    searchQuery: 'Agra'
  },
  {
    id: 6,
    title: 'SANTORINI - GREECE',
    location: 'Greece',
    tag: '#Aegean_Cliffs',
    tagline: 'Whitewashed horizons & endless sunsets',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85',
    category: 'Coastline',
    searchQuery: 'Greece'
  },
  {
    id: 7,
    title: 'KYOTO - JAPAN',
    location: 'Japan',
    tag: '#East_Asia',
    tagline: 'Tranquil temples & blooming cherry gardens',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
    category: 'Heritage',
    searchQuery: 'Japan'
  }
];

export default function Cinematic3DHero({ searchQuery, setSearchQuery, handleSearchSubmit }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = CAROUSEL_DATA.length;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  // Auto advance timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [activeIndex, isAutoPlaying]);

  // Keyboard arrow controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
  };

  const activeSlide = CAROUSEL_DATA[activeIndex];

  // Compute offset for 3D card layout (-2, -1, 0, 1, 2)
  const getCardStyle = (index) => {
    let offset = index - activeIndex;

    // Handle circular wrapping for seamless coverflow loop
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;

    const absOffset = Math.abs(offset);

    // Active center card
    if (offset === 0) {
      return {
        transform: 'translateX(0%) translateZ(120px) rotateY(0deg) scale(1.05)',
        zIndex: 20,
        opacity: 1,
        filter: 'brightness(1.08) drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
        cursor: 'default',
        pointerEvents: 'auto',
      };
    }

    // Left card (-1)
    if (offset === -1) {
      return {
        transform: 'translateX(-65%) translateZ(0px) rotateY(28deg) scale(0.85)',
        zIndex: 14,
        opacity: 0.85,
        filter: 'brightness(0.7) contrast(1.1)',
        cursor: 'pointer',
        pointerEvents: 'auto',
      };
    }

    // Right card (+1)
    if (offset === 1) {
      return {
        transform: 'translateX(65%) translateZ(0px) rotateY(-28deg) scale(0.85)',
        zIndex: 14,
        opacity: 0.85,
        filter: 'brightness(0.7) contrast(1.1)',
        cursor: 'pointer',
        pointerEvents: 'auto',
      };
    }

    // Outer Left card (-2)
    if (offset === -2) {
      return {
        transform: 'translateX(-120%) translateZ(-100px) rotateY(42deg) scale(0.68)',
        zIndex: 8,
        opacity: 0.5,
        filter: 'brightness(0.45)',
        cursor: 'pointer',
        pointerEvents: 'auto',
      };
    }

    // Outer Right card (+2)
    if (offset === 2) {
      return {
        transform: 'translateX(120%) translateZ(-100px) rotateY(-42deg) scale(0.68)',
        zIndex: 8,
        opacity: 0.5,
        filter: 'brightness(0.45)',
        cursor: 'pointer',
        pointerEvents: 'auto',
      };
    }

    // Far cards (hidden)
    return {
      transform: `translateX(${offset > 0 ? 180 : -180}%) translateZ(-200px) scale(0.5)`,
      zIndex: 1,
      opacity: 0,
      pointerEvents: 'none',
    };
  };

  return (
    <section
      className="coverflow-hero-container"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '85vh',
        backgroundColor: '#0a0b0e',
        color: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0 60px 0',
      }}
    >
      {/* 1. Dynamic Cinematic Blurred Backdrop */}
      <div
        className="coverflow-backdrop"
        style={{
          position: 'absolute',
          inset: '-20px',
          backgroundImage: `url(${activeSlide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(36px) brightness(0.35) contrast(1.2)',
          transform: 'scale(1.15)',
          transition: 'background-image 0.8s ease-in-out',
          zIndex: 1,
        }}
      />

      {/* Radial vignette gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(10,11,14,0.2) 0%, rgba(10,11,14,0.85) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Floating subtle ambient particles */}
      <div className="ambient-orbs" style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,145,0,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
      </div>

      {/* 2. Top Nav / Subheader integrated branding */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '28px',
          maxWidth: '750px',
          padding: '0 20px',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            color: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.12)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            padding: '6px 18px',
            borderRadius: '100px',
            marginBottom: '14px',
            backdropFilter: 'blur(8px)',
          }}
        >
          CURATED EXPEDITIONS
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
            fontWeight: '800',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            color: '#ffffff',
            margin: '0 0 10px 0',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Discover The World's Great Wonders
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.72)', margin: 0, maxWidth: '600px', lineHeight: '1.5' }}>
          Explore iconic destinations, plan shared itineraries, and calculate group budgets in one seamless experience.
        </p>
      </div>

      {/* 3. 3D Coverflow Carousel Stage */}
      <div
        className="coverflow-stage"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1100px',
          height: '460px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1200px',
          transformStyle: 'preserve-3d',
          zIndex: 10,
          margin: '10px 0 30px 0',
        }}
      >
        {/* Left Arrow Nav Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 35,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}
          className="coverflow-arrow-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Right Arrow Nav Button */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 35,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          }}
          className="coverflow-arrow-btn"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Render 3D Coverflow Cards */}
        {CAROUSEL_DATA.map((item, idx) => {
          const style = getCardStyle(idx);
          const isCenter = idx === activeIndex;

          return (
            <div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              style={{
                position: 'absolute',
                width: '310px',
                height: '430px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: isCenter ? '0 25px 50px -12px rgba(0,0,0,0.7)' : '0 15px 30px rgba(0,0,0,0.5)',
                transition: 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.65s ease, filter 0.65s ease, border-color 0.4s ease',
                border: isCenter ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                ...style,
              }}
              className="coverflow-card"
            >
              {/* Card Image */}
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.8s ease',
                }}
              />

              {/* Gradient Dark Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)',
                }}
              />

              {/* Active Center Card Text Content Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  zIndex: 2,
                  textAlign: 'left',
                }}
              >
                {/* Top Hashtag / Category Badge */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      color: '#ffffff',
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      padding: '4px 12px',
                      borderRadius: '100px',
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                {/* Bottom Content Header & Subtitle */}
                <div>
                  <h3
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      lineHeight: 1.15,
                      color: '#ffffff',
                      margin: '0 0 10px 0',
                      textShadow: '0 4px 12px rgba(0,0,0,0.6)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {item.title}
                  </h3>

                  {/* Horizontal Accent Line */}
                  <div
                    style={{
                      width: '45px',
                      height: '3px',
                      backgroundColor: '#f97316',
                      borderRadius: '2px',
                      marginBottom: '10px',
                    }}
                  />

                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'rgba(255, 255, 255, 0.85)',
                      margin: '0 0 16px 0',
                      lineHeight: '1.4',
                      fontWeight: '400',
                    }}
                  >
                    {item.tagline}
                  </p>

                  {/* Action button visible on center active slide */}
                  {isCenter && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (searchQuery !== undefined && setSearchQuery) {
                          setSearchQuery(item.searchQuery);
                        }
                        navigate(`/destinations?search=${encodeURIComponent(item.searchQuery)}`);
                      }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#f97316',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '100px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)',
                        transition: 'all 0.3s ease',
                      }}
                      className="coverflow-cta-btn"
                    >
                      <span>Explore Destination</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Search Bar Integration & Pagination Dots */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '650px',
          padding: '0 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Search Bar */}
        {handleSearchSubmit && (
          <form
            onSubmit={handleSearchSubmit}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '100px',
              padding: '6px 8px 6px 22px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" style={{ marginRight: '12px', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search any destination worldwide (e.g. Manali, Paris, Goa)..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: '500',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#f97316',
                color: '#ffffff',
                border: 'none',
                borderRadius: '100px',
                padding: '10px 24px',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
              }}
              className="coverflow-search-btn"
            >
              Search
            </button>
          </form>
        )}

        {/* Carousel Dot Indicators */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {CAROUSEL_DATA.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === activeIndex ? '28px' : '8px',
                height: '8px',
                borderRadius: '100px',
                backgroundColor: i === activeIndex ? '#f97316' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Embedded Custom Styles */}
      <style>{`
        .coverflow-arrow-btn:hover {
          background-color: rgba(249, 115, 22, 0.85) !important;
          border-color: #f97316 !important;
          transform: translateY(-50%) scale(1.1) !important;
          box-shadow: 0 12px 35px rgba(249, 115, 22, 0.5) !important;
        }

        .coverflow-cta-btn:hover {
          background-color: #ea580c !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(249, 115, 22, 0.55) !important;
        }

        .coverflow-search-btn:hover {
          background-color: #ea580c !important;
          transform: scale(1.03);
        }

        .coverflow-card:hover img {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .coverflow-stage {
            height: 380px !important;
          }
          .coverflow-card {
            width: 250px !important;
            height: 360px !important;
          }
          .coverflow-arrow-btn {
            width: 44px !important;
            height: 44px !important;
          }
        }
      `}</style>
    </section>
  );
}
