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
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=75',
    category: 'Adventure',
    searchQuery: 'Peru'
  },
  {
    id: 2,
    title: 'LADAKH - INDIA',
    location: 'India',
    tag: '#Himalayan_Passes',
    tagline: 'Where the earth touches the sky',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=75',
    category: 'Mountains',
    searchQuery: 'Ladakh'
  },
  {
    id: 3,
    title: 'MANALI - INDIA',
    location: 'India',
    tag: '#Pine_Valleys',
    tagline: 'Serenity among snowy mountain peaks',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=75',
    category: 'Nature',
    searchQuery: 'Manali'
  },
  {
    id: 4,
    title: 'KERALA - INDIA',
    location: 'India',
    tag: '#Tropical_Backwaters',
    tagline: 'Sailing through emerald coconut groves',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=75',
    category: 'Tropics',
    searchQuery: 'Kerala'
  },
  {
    id: 5,
    title: 'TAJ MAHAL - AGRA',
    location: 'India',
    tag: '#Royal_Heritage',
    tagline: 'An eternal monument to love & wonder',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=75',
    category: 'Culture',
    searchQuery: 'Agra'
  },
  {
    id: 6,
    title: 'SANTORINI - GREECE',
    location: 'Greece',
    tag: '#Aegean_Cliffs',
    tagline: 'Whitewashed horizons & endless sunsets',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=75',
    category: 'Coastline',
    searchQuery: 'Greece'
  },
  {
    id: 7,
    title: 'KYOTO - JAPAN',
    location: 'Japan',
    tag: '#East_Asia',
    tagline: 'Tranquil temples & blooming cherry gardens',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=75',
    category: 'Heritage',
    searchQuery: 'Japan'
  }
];

export default function Cinematic3DHero({ searchQuery, setSearchQuery, handleSearchSubmit }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const total = CAROUSEL_DATA.length;
  const isDark = theme === 'dark';

  // Window resize handler for smooth multi-breakpoint responsive math
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (diff > 40) nextSlide();
    if (diff < -40) prevSlide();
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  // GPU Hardware-accelerated Coverflow Card Styles
  const getCardStyle = (index) => {
    let offset = index - activeIndex;

    // Handle circular wrapping for seamless coverflow loop
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;

    // Responsive offsets based on viewport width
    if (offset === 0) {
      return {
        transform: isMobile 
          ? 'translate3d(0, 0, 50px) rotateY(0deg) scale(1.02)'
          : isTablet 
            ? 'translate3d(0, 0, 80px) rotateY(0deg) scale(1.04)'
            : 'translate3d(0, 0, 110px) rotateY(0deg) scale(1.06)',
        zIndex: 20,
        opacity: 1,
        cursor: 'default',
        pointerEvents: 'auto',
      };
    }

    if (offset === -1) {
      return {
        transform: isMobile
          ? 'translate3d(-34%, 0, 0) rotateY(22deg) scale(0.76)'
          : isTablet
            ? 'translate3d(-52%, 0, 0) rotateY(26deg) scale(0.82)'
            : 'translate3d(-60%, 0, 0) rotateY(28deg) scale(0.86)',
        zIndex: 14,
        opacity: isMobile ? 0.65 : 0.85,
        cursor: 'pointer',
        pointerEvents: 'auto',
      };
    }

    if (offset === 1) {
      return {
        transform: isMobile
          ? 'translate3d(34%, 0, 0) rotateY(-22deg) scale(0.76)'
          : isTablet
            ? 'translate3d(52%, 0, 0) rotateY(-26deg) scale(0.82)'
            : 'translate3d(60%, 0, 0) rotateY(-28deg) scale(0.86)',
        zIndex: 14,
        opacity: isMobile ? 0.65 : 0.85,
        cursor: 'pointer',
        pointerEvents: 'auto',
      };
    }

    if (offset === -2) {
      return {
        transform: isMobile
          ? 'translate3d(-65%, 0, -50px) rotateY(35deg) scale(0.55)'
          : isTablet
            ? 'translate3d(-92%, 0, -60px) rotateY(38deg) scale(0.62)'
            : 'translate3d(-112%, 0, -80px) rotateY(40deg) scale(0.68)',
        zIndex: 8,
        opacity: isMobile ? 0 : 0.45,
        cursor: 'pointer',
        pointerEvents: isMobile ? 'none' : 'auto',
      };
    }

    if (offset === 2) {
      return {
        transform: isMobile
          ? 'translate3d(65%, 0, -50px) rotateY(-35deg) scale(0.55)'
          : isTablet
            ? 'translate3d(92%, 0, -60px) rotateY(-38deg) scale(0.62)'
            : 'translate3d(112%, 0, -80px) rotateY(-40deg) scale(0.68)',
        zIndex: 8,
        opacity: isMobile ? 0 : 0.45,
        cursor: 'pointer',
        pointerEvents: isMobile ? 'none' : 'auto',
      };
    }

    // Hidden far slides
    return {
      transform: `translate3d(${offset > 0 ? 150 : -150}%, 0, -150px) scale(0.4)`,
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
        minHeight: isMobile ? '78vh' : '85vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '36px 0 40px 0' : '40px 0 50px 0',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}
    >
      {/* 1. GPU Composited Atmosphere Backdrop Crossfade */}
      <div className="coverflow-backdrop-stack" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {CAROUSEL_DATA.map((item, idx) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              inset: '-20px',
              backgroundImage: `url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: idx === activeIndex ? (isDark ? 0.25 : 0.14) : 0,
              filter: 'blur(30px) contrast(1.15)',
              transform: 'scale(1.15)',
              transition: 'opacity 0.6s ease-out',
              willChange: 'opacity',
            }}
          />
        ))}
      </div>

      {/* Theme Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark 
            ? 'radial-gradient(ellipse at center, rgba(11,15,25,0.1) 0%, rgba(11,15,25,0.85) 100%)'
            : 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.92) 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* 2. Top Header integrated branding */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: isMobile ? '16px' : '24px',
          maxWidth: '850px',
          padding: '0 20px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
            fontWeight: '800',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            margin: '0 0 12px 0',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Discover The World's Great Wonders
        </h1>
        <p style={{ fontSize: isMobile ? '0.95rem' : '1.1rem', color: 'var(--text-muted)', margin: 0, maxWidth: '620px', lineHeight: '1.55' }}>
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
          height: isMobile ? '360px' : isTablet ? '400px' : '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: isMobile ? '800px' : '1200px',
          transformStyle: 'preserve-3d',
          zIndex: 10,
          margin: '10px 0 20px 0',
        }}
      >
        {/* Left Arrow Nav Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: isMobile ? '8px' : '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 35,
            width: isMobile ? '42px' : '50px',
            height: isMobile ? '42px' : '50px',
            borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.1)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(15, 23, 42, 0.18)',
            color: isDark ? '#ffffff' : '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s ease',
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
          }}
          className="coverflow-arrow-btn"
        >
          <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Right Arrow Nav Button */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: isMobile ? '8px' : '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 35,
            width: isMobile ? '42px' : '50px',
            height: isMobile ? '42px' : '50px',
            borderRadius: '50%',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.1)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(15, 23, 42, 0.18)',
            color: isDark ? '#ffffff' : '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s ease',
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)',
          }}
          className="coverflow-arrow-btn"
        >
          <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Render Hardware Accelerated 3D Coverflow Cards */}
        {CAROUSEL_DATA.map((item, idx) => {
          const style = getCardStyle(idx);
          const isCenter = idx === activeIndex;

          return (
            <div
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              style={{
                position: 'absolute',
                width: isMobile ? '230px' : isTablet ? '270px' : '310px',
                height: isMobile ? '340px' : isTablet ? '380px' : '420px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: isCenter ? '0 20px 45px rgba(0,0,0,0.65)' : '0 10px 25px rgba(0,0,0,0.35)',
                transition: 'transform 0.5s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.5s ease',
                border: isCenter ? '1.5px solid rgba(255, 255, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                willChange: 'transform, opacity',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                ...style,
              }}
              className="coverflow-card"
            >
              {/* Card Image */}
              <img
                src={item.image}
                alt={item.title}
                loading="eager"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Dark Gradient Text Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                }}
              />

              {/* Text Content Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  padding: isMobile ? '20px 16px' : '26px 22px',
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
                      fontSize: isMobile ? '0.65rem' : '0.72rem',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      color: '#ffffff',
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.32)',
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
                      fontSize: isMobile ? '1.35rem' : '1.65rem',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      lineHeight: 1.15,
                      color: '#ffffff',
                      margin: '0 0 8px 0',
                      textShadow: '0 3px 10px rgba(0,0,0,0.7)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    {item.title}
                  </h3>

                  {/* Horizontal Accent Line */}
                  <div
                    style={{
                      width: '40px',
                      height: '3px',
                      backgroundColor: '#f97316',
                      borderRadius: '2px',
                      marginBottom: '8px',
                    }}
                  />

                  <p
                    style={{
                      fontSize: isMobile ? '0.8rem' : '0.88rem',
                      color: 'rgba(255, 255, 255, 0.88)',
                      margin: '0 0 14px 0',
                      lineHeight: '1.35',
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
                        padding: isMobile ? '8px 16px' : '10px 20px',
                        backgroundColor: '#f97316',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '100px',
                        fontSize: isMobile ? '0.75rem' : '0.82rem',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)',
                        transition: 'all 0.25s ease',
                      }}
                      className="coverflow-cta-btn"
                    >
                      <span>Explore</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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

      {/* 4. Bottom Search Bar & Carousel Indicators */}
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
          gap: '16px',
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
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.85)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: '100px',
              padding: isMobile ? '4px 6px 4px 16px' : '6px 8px 6px 22px',
              backdropFilter: 'blur(12px)',
              boxShadow: isDark ? '0 10px 28px rgba(0,0,0,0.3)' : '0 10px 28px rgba(0,0,0,0.08)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(255,255,255,0.7)" : "#64748b"} strokeWidth="2.5" style={{ marginRight: '10px', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder={isMobile ? "Search destinations..." : "Search any destination worldwide (e.g. Manali, Paris, Goa)..."}
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
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
                padding: isMobile ? '8px 18px' : '10px 24px',
                fontSize: isMobile ? '0.8rem' : '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
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
                width: i === activeIndex ? '26px' : '8px',
                height: '8px',
                borderRadius: '100px',
                backgroundColor: i === activeIndex ? '#f97316' : (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'),
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Embedded Responsive & Hover Styles */}
      <style>{`
        .coverflow-arrow-btn:hover {
          background-color: rgba(249, 115, 22, 0.88) !important;
          border-color: #f97316 !important;
          color: #ffffff !important;
          transform: translateY(-50%) scale(1.08) !important;
          box-shadow: 0 10px 30px rgba(249, 115, 22, 0.5) !important;
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
      `}</style>
    </section>
  );
}
