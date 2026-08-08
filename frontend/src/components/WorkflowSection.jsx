import React from 'react';

const steps = [
  {
    id: '01',
    title: 'Select Destination',
    desc: 'Search our global catalog or type in a new city to seed its travel profile instantly.',
    image: '/workflow_step1.png',
    blobRadius: '38% 62% 63% 37% / 41% 44% 56% 59%',
    blobRadiusHover: '48% 52% 52% 48% / 50% 50% 50% 50%',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    id: '02',
    title: 'Define Budget & Dates',
    desc: 'Input your trip dates and set budget ceilings in Rupees (₹) to prevent overspending.',
    image: '/workflow_step2.png',
    blobRadius: '60% 40% 55% 45% / 50% 40% 60% 50%',
    blobRadiusHover: '48% 52% 45% 55% / 52% 48% 52% 48%',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: '03',
    title: 'Invite Group Members',
    desc: 'Share unique 6-character room codes with friends to edit itineraries collaboratively.',
    image: '/workflow_step3.png',
    blobRadius: '42% 58% 45% 55% / 45% 55% 45% 55%',
    blobRadiusHover: '55% 45% 58% 42% / 55% 45% 55% 45%',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    id: '04',
    title: 'Track Live & Go',
    desc: 'Log food, transit, and lodging costs live on the go, check off packing items, and share photos.',
    image: '/workflow_step4.png',
    blobRadius: '50% 50% 65% 35% / 40% 60% 40% 60%',
    blobRadiusHover: '55% 45% 50% 50% / 45% 55% 50% 50%',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  }
];

const features = [
  {
    title: 'Secure & Private',
    desc: 'Your data and trips are always protected.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    title: 'Real-time Sync',
    desc: 'All updates reflect instantly for your group.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
      </svg>
    )
  },
  {
    title: 'Access Anywhere',
    desc: 'Plan on web, update on mobile — anytime.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    )
  },
  {
    title: 'Made for Travelers',
    desc: 'Everything you need, built for the way you travel.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="22" height="22">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  }
];

export default function WorkflowSection() {
  return (
    <section className="workflow-section-container">
      {/* Decorative location pin background icon (top-left) */}
      <div className="decor-icon decor-left">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="120" height="120">
          <path d="M30,50 C20,30 40,10 50,25 C60,10 80,30 70,50" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3,5" opacity="0.25" />
          <path d="M47,25 A3,3 0 1,1 53,25 A3,3 0 1,1 47,25" fill="var(--color-primary)" opacity="0.3" />
          <path d="M50,15 A5,5 0 0,0 45,20 C45,25 50,30 50,30 C50,30 55,25 55,20 A5,5 0 0,0 50,15 Z" fill="var(--color-primary)" opacity="0.4" />
        </svg>
      </div>

      {/* Decorative paper plane background icon (top-right) */}
      <div className="decor-icon decor-right">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="140" height="140">
          <path d="M10,80 Q40,40 85,25" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4,6" opacity="0.25" />
          <g transform="translate(80, 20) rotate(-15)">
            <path d="M0,0 L20,8 L12,12 L8,20 Z" fill="var(--color-primary)" opacity="0.5" />
          </g>
        </svg>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <span className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          ✦ WORKFLOW ✦
        </span>
        <h2 className="section-title workflow-main-title">
          How <span className="highlight-text">TripTogether</span> Works
        </h2>
        <p className="section-desc">
          Follow these four simple steps to structure and launch your collaborative dream trip.
        </p>
      </div>

      {/* Steps Wrapper */}
      <div className="workflow-steps-wrapper">
        {/* Dynamic Dotted Connector Line (Desktop Only) */}
        <div className="desktop-connector-svg">
          <svg viewBox="0 0 1000 200" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            {/* Wave Path */}
            <path 
              d="M 125,90 Q 250,135 375,90 T 625,90 T 875,90" 
              fill="none" 
              stroke="var(--color-primary)" 
              strokeWidth="2" 
              strokeDasharray="6,8" 
              opacity="0.4" 
            />
            {/* Connector dots */}
            <circle cx="250" cy="107" r="4.5" fill="var(--color-primary)" />
            <circle cx="500" cy="90" r="4.5" fill="var(--color-primary)" />
            <circle cx="750" cy="90" r="4.5" fill="var(--color-primary)" />
          </svg>
        </div>

        {/* Step Items Grid */}
        <div className="workflow-grid">
          {steps.map((step) => (
            <div key={step.id} className="workflow-step-card">
              
              {/* Image & Badges Frame Container */}
              <div className="workflow-image-container">
                
                {/* Floating Index Badge */}
                <div className="step-index-badge">
                  {step.id}
                </div>

                {/* Blob Frame Wrapper */}
                <div 
                  className="organic-blob-wrapper"
                  style={{ 
                    '--blob-radius': step.blobRadius,
                    '--blob-radius-hover': step.blobRadiusHover
                  }}
                >
                  <img src={step.image} alt={step.title} className="organic-blob-img" />
                </div>

                {/* Bottom Center Floating Icon Badge */}
                <div className="step-icon-badge">
                  {step.icon}
                </div>

              </div>

              {/* Step Text Info */}
              <div className="workflow-text-block">
                <h4 className="workflow-step-title">{step.title}</h4>
                <p className="workflow-step-desc">{step.desc}</p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Bottom Features Capsule Bar */}
      <div className="workflow-features-bar">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-bar-item">
            <div className="feature-bar-icon-wrapper">
              {feature.icon}
            </div>
            <div className="feature-bar-text">
              <h5 className="feature-bar-title">{feature.title}</h5>
              <p className="feature-bar-desc">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Scoped CSS Styles for Visual Excellence */}
      <style>{`
        .workflow-section-container {
          position: relative;
          padding: 80px 0;
          margin: 60px 0;
          background: radial-gradient(circle at center, rgba(234, 88, 12, 0.02) 0%, transparent 70%);
          overflow: hidden;
        }

        [data-theme='dark'] .workflow-section-container {
          background: radial-gradient(circle at center, rgba(255, 107, 0, 0.04) 0%, transparent 70%);
        }

        /* Decorative background icons */
        .decor-icon {
          position: absolute;
          pointer-events: none;
          z-index: 1;
        }
        .decor-left {
          top: 10px;
          left: 5%;
        }
        .decor-right {
          top: 5px;
          right: 5%;
        }

        .workflow-main-title {
          font-size: 2.85rem !important;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 16px;
        }

        .highlight-text {
          color: var(--color-primary);
          position: relative;
          display: inline-block;
        }

        .workflow-steps-wrapper {
          position: relative;
          margin: 60px 0 80px 0;
          z-index: 2;
        }

        .desktop-connector-svg {
          position: absolute;
          top: 70px;
          left: 0;
          width: 100%;
          height: 120px;
          pointer-events: none;
          display: none;
        }

        @media (min-width: 992px) {
          .desktop-connector-svg {
            display: block;
          }
        }

        .workflow-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }

        @media (min-width: 768px) {
          .workflow-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 48px 32px;
          }
        }

        @media (min-width: 992px) {
          .workflow-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        /* Step Card */
        .workflow-step-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }

        /* Image Frame Container */
        .workflow-image-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 1200px) {
          .workflow-image-container {
            width: 200px;
            height: 200px;
          }
        }

        /* Organic shape blob wrapper */
        .organic-blob-wrapper {
          width: 100%;
          height: 100%;
          border-radius: var(--blob-radius);
          background: linear-gradient(135deg, var(--border-color) 0%, rgba(234, 88, 12, 0.15) 100%);
          padding: 3px;
          box-shadow: var(--shadow-md);
          transition: border-radius 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                      transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      box-shadow 0.6s ease;
          overflow: hidden;
          cursor: pointer;
        }

        [data-theme='dark'] .organic-blob-wrapper {
          background: linear-gradient(135deg, var(--border-color) 0%, rgba(255, 107, 0, 0.25) 100%);
        }

        .organic-blob-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: inherit;
          transition: transform 0.6s ease;
        }

        /* Hover animations */
        .workflow-step-card:hover .organic-blob-wrapper {
          border-radius: var(--blob-radius-hover);
          transform: scale(1.06) rotate(2deg);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .workflow-step-card:hover .organic-blob-img {
          transform: scale(1.08);
        }

        /* Floating step index badge */
        .step-index-badge {
          position: absolute;
          top: -6px;
          left: -6px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--color-primary);
          font-weight: 800;
          font-family: var(--font-heading);
          font-size: 0.95rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          box-shadow: var(--shadow-sm);
        }

        /* Bottom floating icon badge */
        .step-icon-badge {
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-primary);
          border: 2px solid var(--color-primary);
          color: var(--color-primary);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          box-shadow: var(--shadow-md);
          transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
        }

        .workflow-step-card:hover .step-icon-badge {
          transform: translateX(-50%) scale(1.1);
          background: var(--gradient-accent);
          color: white;
          border-color: transparent;
        }

        /* Step Text */
        .workflow-text-block {
          margin-top: 8px;
          padding: 0 10px;
        }

        .workflow-step-title {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
        }

        .workflow-step-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }

        /* Bottom Features Capsule Bar */
        .workflow-features-bar {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 30px 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          box-shadow: var(--shadow-md);
          z-index: 2;
          position: relative;
        }

        @media (min-width: 768px) {
          .workflow-features-bar {
            grid-template-columns: repeat(2, 1fr);
            padding: 36px 40px;
            gap: 32px;
          }
        }

        @media (min-width: 1200px) {
          .workflow-features-bar {
            grid-template-columns: repeat(4, 1fr);
            border-radius: 9999px; /* Fully capsule pill shape on desktop */
            padding: 24px 44px;
            gap: 24px;
          }
        }

        .feature-bar-item {
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
        }

        .feature-bar-icon-wrapper {
          flex-shrink: 0;
          background: var(--bg-primary);
          border: 1.5px solid var(--color-primary);
          color: var(--color-primary);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .feature-bar-text {
          display: flex;
          flex-direction: column;
        }

        .feature-bar-title {
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .feature-bar-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.35;
        }

        @media (max-width: 576px) {
          .workflow-main-title {
            font-size: 2.1rem !important;
          }
          .workflow-features-bar {
            border-radius: var(--radius-md);
            padding: 24px 16px;
          }
        }
      `}</style>
    </section>
  );
}
