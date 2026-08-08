import React, { useState } from 'react';

export default function DestinationCard({ 
  destination, 
  onActionClick, 
  actionLabel = "Book now",
  showBookmark = true
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Extract properties with fallbacks
  const {
    _id,
    title = 'Destination',
    country = '',
    category = 'Travel',
    costIndex = '$620',
    priceTag,
    rating = 4.8,
    reviews = '1.2k',
    image = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80',
    description = 'Experience an unforgettable retreat with iconic views and a peaceful atmosphere.',
    duration = '3 Day Escape'
  } = destination;

  // Format price tag cleanly
  const displayPrice = priceTag || (costIndex ? (costIndex.startsWith('$') || costIndex.startsWith('₹') ? costIndex : `₹${costIndex}`) : '$620');

  // Determine dynamic gradient color tint based on category / title to match reference photo aesthetics
  const getGradientClass = (cat, name) => {
    const textKey = (cat + ' ' + name).toLowerCase();
    if (textKey.includes('nature') || textKey.includes('jungle') || textKey.includes('bali') || textKey.includes('forest')) {
      return 'tint-teal';
    } else if (textKey.includes('dubai') || textKey.includes('city') || textKey.includes('urban') || textKey.includes('suite') || textKey.includes('vigan')) {
      return 'tint-espresso';
    } else if (textKey.includes('santorini') || textKey.includes('sunset') || textKey.includes('beach') || textKey.includes('el nido') || textKey.includes('siargao')) {
      return 'tint-slate';
    }
    return 'tint-slate';
  };

  const tintClass = getGradientClass(category, title);

  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div 
      className={`luxury-dest-card ${tintClass} animate-fade-in`}
      onClick={() => onActionClick && onActionClick(destination)}
    >
      {/* Background Image Wrapper */}
      <div className="card-img-wrapper">
        <img 
          src={image} 
          alt={title} 
          className="card-img" 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80'; }}
        />
      </div>

      {/* Dynamic Tinted Gradient Overlay */}
      <div className="card-gradient-overlay" />

      {/* Top Floating Bookmark Button */}
      {showBookmark && (
        <button 
          className={`card-bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={handleBookmarkToggle}
          title={isBookmarked ? "Remove from saved" : "Bookmark destination"}
          aria-label="Bookmark destination"
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill={isBookmarked ? "#ffffff" : "none"} 
            stroke="#ffffff" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {/* Bottom Content Container */}
      <div className="card-body-content">
        {/* Title & Price Pill Header */}
        <div className="card-header-row">
          <h3 className="card-title-text">{title}</h3>
          <div className="card-price-pill">
            {displayPrice}
          </div>
        </div>

        {/* Short Description */}
        <p className="card-description-text">
          {description}
        </p>

        {/* Tags Array */}
        <div className="card-tags-row">
          <span className="card-tag-pill rating-tag">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>{Number(rating).toFixed(1)}</span>
          </span>

          <span className="card-tag-pill">
            {category}
          </span>

          <span className="card-tag-pill">
            {duration}
          </span>
        </div>

        {/* Full-width Pure White Pill CTA Button */}
        <button 
          className="card-cta-button"
          onClick={(e) => {
            e.stopPropagation();
            if (onActionClick) onActionClick(destination);
          }}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
