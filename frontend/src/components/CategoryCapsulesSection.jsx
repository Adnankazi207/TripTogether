import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES_DATA = [
  {
    id: 'pyramid',
    title: 'Pyramid',
    categoryFilter: 'Cultural',
    image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=600&q=80',
    glowColor: 'rgba(234, 179, 8, 0.45)', // Golden Amber Glow
    floatDelay: '0s'
  },
  {
    id: 'mountain',
    title: 'Mountain',
    categoryFilter: 'Nature',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    glowColor: 'rgba(16, 185, 129, 0.45)', // Emerald Alpine Glow
    floatDelay: '0.4s'
  },
  {
    id: 'mosque',
    title: 'The Mosque',
    categoryFilter: 'Cultural',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    glowColor: 'rgba(99, 102, 241, 0.45)', // Indigo Sapphire Glow
    floatDelay: '0.8s'
  },
  {
    id: 'desert',
    title: 'Desert',
    categoryFilter: 'Adventure',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
    glowColor: 'rgba(249, 115, 22, 0.45)', // Sunset Orange Glow
    floatDelay: '1.2s'
  },
  {
    id: 'tower',
    title: 'Tower',
    categoryFilter: 'Urban',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80',
    glowColor: 'rgba(14, 165, 233, 0.45)', // Sky Blue Glow
    floatDelay: '1.6s'
  },
  {
    id: 'beach',
    title: 'Beach',
    categoryFilter: 'Beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    glowColor: 'rgba(6, 182, 212, 0.45)', // Cyan Ocean Glow
    floatDelay: '2.0s'
  }
];

export default function CategoryCapsulesSection() {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const handleCategoryClick = (catName) => {
    navigate(`/destinations?category=${encodeURIComponent(catName)}`);
  };

  return (
    <section className="categories-capsule-section" style={{ margin: '100px 0', position: 'relative' }}>
      {/* Header Container matching reference design with yellow brush underline */}
      <div className="section-header" style={{ textAlign: 'left', marginBottom: '40px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <h2 className="categories-heading-title">
            Categories
          </h2>
          {/* Animated Brush Accent Line under title */}
          <div className="title-brush-stroke">
            <svg viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '14px' }}>
              <path 
                d="M 5 12 Q 50 3, 100 11 T 195 9" 
                stroke="#f59e0b" 
                strokeWidth="6" 
                strokeLinecap="round" 
                className="brush-line-anim"
              />
            </svg>
          </div>
        </div>
        
        <p className="categories-subtitle-desc" style={{ marginTop: '14px', maxWidth: '650px', fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Here are lots of interesting destinations to visit, but don't be confused—they're already grouped by category.
        </p>
      </div>

      {/* Categories Horizontal Capsule Grid Container */}
      <div className="capsules-flex-container">
        {CATEGORIES_DATA.map((cat, idx) => {
          const isHovered = hoveredIdx === idx;
          
          return (
            <div 
              key={cat.id}
              className={`capsule-item-wrapper ${isHovered ? 'hovered' : ''}`}
              style={{ animationDelay: cat.floatDelay }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => handleCategoryClick(cat.categoryFilter)}
            >
              {/* Outer Glow Halo Ring */}
              <div 
                className="capsule-glow-halo"
                style={{
                  boxShadow: isHovered 
                    ? `0 25px 60px ${cat.glowColor}, 0 0 30px ${cat.glowColor}` 
                    : '0 10px 25px rgba(0,0,0,0.06)'
                }}
              />

              {/* Capsule Image Oval Pill Frame */}
              <div className="capsule-pill-frame">
                {/* Light Sweep Shimmer Beam */}
                <div className="capsule-shimmer-sweep" />

                <img 
                  src={cat.image} 
                  alt={cat.title} 
                  className="capsule-img" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80'; }}
                />

                {/* Subtle Glass Gradient Tint inside capsule */}
                <div className="capsule-inner-tint" />
              </div>

              {/* Category Label Underneath */}
              <h4 className="capsule-label-text">
                {cat.title}
              </h4>
            </div>
          );
        })}
      </div>

      <style>{`
        /* Categories Heading Brush Underline */
        .categories-heading-title {
          font-size: 2.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0;
          color: var(--text-primary);
          position: relative;
          z-index: 2;
        }

        .title-brush-stroke {
          position: relative;
          width: 170px;
          margin-top: -6px;
        }

        .brush-line-anim {
          stroke-dasharray: 220;
          stroke-dashoffset: 0;
          animation: strokeDashPulse 4s ease-in-out infinite alternate;
        }

        @keyframes strokeDashPulse {
          0% { stroke-dashoffset: 20; stroke: #f59e0b; }
          50% { stroke-dashoffset: 0; stroke: #fbbf24; }
          100% { stroke-dashoffset: 40; stroke: #d97706; }
        }

        /* Capsules Layout Flex Container */
        .capsules-flex-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 24px;
          justify-items: center;
          align-items: flex-start;
          padding: 20px 0;
        }

        /* Capsule Item Wrapper with Idle Floating Levitation */
        .capsule-item-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          position: relative;
          width: 100%;
          max-width: 170px;
          animation: floatLevitate 5s ease-in-out infinite;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .capsule-item-wrapper:hover {
          animation-play-state: paused;
          transform: translateY(-16px) scale(1.08);
          z-index: 10;
        }

        /* Idle floating animation keyframes */
        @keyframes floatLevitate {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Outer Glow Halo */
        .capsule-glow-halo {
          position: absolute;
          top: 0;
          width: 100%;
          aspect-ratio: 1 / 1.75;
          border-radius: 120px;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          pointer-events: none;
          z-index: 1;
        }

        /* Stadium / Oval Pill Frame */
        .capsule-pill-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1.75;
          border-radius: 120px;
          overflow: hidden;
          background: #0a0f1d;
          border: 3px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          z-index: 2;
        }

        [data-theme='light'] .capsule-pill-frame {
          border: 3px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.1);
        }

        .capsule-item-wrapper:hover .capsule-pill-frame {
          border-color: rgba(255, 255, 255, 0.65);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.3);
        }

        /* Image Zoom & Motion inside Capsule */
        .capsule-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        .capsule-item-wrapper:hover .capsule-img {
          transform: scale(1.22);
        }

        /* Light Sweep Shimmer Beam */
        .capsule-shimmer-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.45) 50%, transparent 70%);
          transform: translateX(-150%);
          transition: transform 0.75s ease;
          z-index: 4;
          pointer-events: none;
        }

        .capsule-item-wrapper:hover .capsule-shimmer-sweep {
          transform: translateX(150%);
        }

        /* Inner Subtle Vignette Overlay */
        .capsule-inner-tint {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%);
          z-index: 3;
          pointer-events: none;
        }

        /* Label Underneath */
        .capsule-label-text {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 16px;
          text-align: center;
          letter-spacing: -0.2px;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .capsule-item-wrapper:hover .capsule-label-text {
          color: var(--color-primary);
          transform: translateY(2px);
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .categories-heading-title {
            font-size: 2.2rem;
          }
          .capsules-flex-container {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .capsule-label-text {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 480px) {
          .capsules-flex-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
        }
      `}</style>
    </section>
  );
}
