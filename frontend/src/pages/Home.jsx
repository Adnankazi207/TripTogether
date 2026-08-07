import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cinematic3DHero from '../components/Cinematic3DHero';
import Globe3D from '../components/Globe3D';
import ScrollRevealSection from '../components/ScrollRevealSection';

// ── Data ────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🔍',
    title: 'Smart AI Destination Search',
    desc: 'Search any city worldwide. Gemini AI auto-generates travel guides, stay durations, and beautiful Unsplash imagery if the destination is not in our database.',
  },
  {
    icon: '💸',
    title: 'Indian Rupee (₹) Financials',
    desc: 'Log transactions, allocate costs across Food, Lodging, and Transit. Smart budget meters alert you at 75% and 100% of your ceiling.',
  },
  {
    icon: '📅',
    title: 'Day-by-Day Timeline',
    desc: 'Plan daily schedules with event times, reminder notes, and shared checklists — so no flight boarding or hiking trail is ever missed.',
  },
  {
    icon: '👥',
    title: 'Cooperative Trip Rooms',
    desc: 'Generate secure 6-character room codes. Invite friends to view itineraries, edit checklists, log expenses, and upload vacation photos together.',
  },
];

const STEPS = [
  { num: 1, icon: '🗺️', title: 'Select Destination', desc: 'Search our global catalog or type any new city — AI fills the profile instantly.' },
  { num: 2, icon: '📅', title: 'Define Budget & Dates', desc: 'Set trip dates and budget ceilings in Rupees (₹) to prevent overspending.' },
  { num: 3, icon: '👥', title: 'Invite Group Members', desc: 'Share a unique 6-character code with friends to edit the trip collaboratively.' },
  { num: 4, icon: '🎒', title: 'Track Live & Go', desc: 'Log costs, check off packing lists, and share photos as you explore.' },
];

const GLOBE_DESTS = [
  { name: 'Ladakh, India',   tag: 'Mountain Expedition' },
  { name: 'Kerala, India',   tag: 'Backwater Escape' },
  { name: 'Goa, India',      tag: 'Beach Paradise' },
  { name: 'Manali, India',   tag: 'Snow Adventure' },
  { name: 'Udaipur, India',  tag: 'Royal Heritage' },
];

const STATS = [
  { num: '50K+', label: 'Active Travelers' },
  { num: '120+', label: 'Destinations Catalogued' },
  { num: '₹2Cr+', label: 'Expenses Tracked' },
  { num: '4.9★', label: 'Average Rating' },
];

// ── Animated Counter ─────────────────────────────────────────────────────
function AnimatedStat({ num, label }) {
  const ref = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTriggered(true); obs.unobserve(el); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="stat-apple-card">
      <span className="stat-apple-number" style={{ opacity: triggered ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
        {num}
      </span>
      <span className="stat-apple-label">{label}</span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/destinations?search=${encodeURIComponent(searchQuery)}` : '/destinations');
  };

  return (
    <div style={{ background: 'var(--bg-primary)', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════════════
          CHAPTER 1 — 3D Cinematic Hero (300vh scroll track)
      ══════════════════════════════════════════════════════════════════ */}
      <Cinematic3DHero />

      {/* ══════════════════════════════════════════════════════════════════
          CHAPTER 2 — Core Features
      ══════════════════════════════════════════════════════════════════ */}
      <section className="chapter-section">
        <div className="container">
          <ScrollRevealSection style={{ textAlign: 'center' }}>
            <span className="chapter-eyebrow">Key Features</span>
            <h2 className="chapter-title">Everything You Need<br />To <span className="accent">Plan Perfectly</span></h2>
            <p className="chapter-desc">
              We distill travel planning, budget control, and group coordination into a unified, beautiful workspace.
            </p>
          </ScrollRevealSection>

          <div className="apple-feature-grid">
            {FEATURES.map((f, i) => (
              <ScrollRevealSection key={f.title} delay={i * 110} className={`sr-delay-${i + 1}`}>
                <div className="apple-feature-card">
                  <div className="apple-feature-icon-wrap">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </ScrollRevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CHAPTER 3 — How It Works
      ══════════════════════════════════════════════════════════════════ */}
      <section className="chapter-section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <ScrollRevealSection style={{ textAlign: 'center' }}>
            <span className="chapter-eyebrow">Workflow</span>
            <h2 className="chapter-title">Four Steps to Your<br /><span className="accent">Dream Trip</span></h2>
            <p className="chapter-desc">Follow these steps to structure and launch a collaborative group adventure in minutes.</p>
          </ScrollRevealSection>

          <div className="steps-flow">
            {STEPS.map((s, i) => (
              <ScrollRevealSection key={s.num} delay={i * 120}>
                <div className="step-flow-card">
                  <div className="step-flow-num">{s.num}</div>
                  <div className="step-flow-icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </ScrollRevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CHAPTER 4 — Interactive 3D Globe
      ══════════════════════════════════════════════════════════════════ */}
      <section className="chapter-section globe-chapter">
        <div className="container">
          <div className="globe-layout">
            {/* Left: Globe canvas */}
            <ScrollRevealSection>
              <Globe3D />
            </ScrollRevealSection>

            {/* Right: Destination list */}
            <div>
              <ScrollRevealSection>
                <span className="chapter-eyebrow">Trending Escapes</span>
                <h2 className="chapter-title" style={{ textAlign: 'left' }}>
                  Discover<br /><span className="accent">India's Finest</span>
                </h2>
                <p className="chapter-desc" style={{ margin: 0, textAlign: 'left' }}>
                  Drag the globe to explore. Click any destination to begin planning your next adventure.
                </p>
              </ScrollRevealSection>

              <div className="globe-dest-list">
                {GLOBE_DESTS.map((d, i) => (
                  <ScrollRevealSection key={d.name} delay={i * 90}>
                    <div
                      className="globe-dest-pill"
                      onClick={() => navigate(`/destinations?search=${d.name.split(',')[0]}`)}
                    >
                      <div className="globe-dest-dot" />
                      <div className="globe-dest-info">
                        <strong>{d.name}</strong>
                        <span>{d.tag}</span>
                      </div>
                      <svg style={{ marginLeft: 'auto', color: 'var(--text-muted)', flexShrink: 0 }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </ScrollRevealSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CHAPTER 5 — Stats + CTA
      ══════════════════════════════════════════════════════════════════ */}

      {/* Stats strip */}
      <section className="chapter-section" style={{ padding: '100px 0' }}>
        <div className="container">
          <ScrollRevealSection style={{ textAlign: 'center' }}>
            <span className="chapter-eyebrow">By The Numbers</span>
            <h2 className="chapter-title">Trusted By<br /><span className="accent">Thousands of Travelers</span></h2>
          </ScrollRevealSection>

          <div className="stats-grid-apple">
            {STATS.map((s, i) => (
              <AnimatedStat key={s.label} num={s.num} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-chapter">
        <div className="cta-chapter-inner">
          <ScrollRevealSection>
            <span className="chapter-eyebrow">Start Today</span>
            <h2 className="cta-chapter-title">
              Ready for Your Next<br /><span className="accent">Adventure?</span>
            </h2>
            <p className="cta-chapter-desc">
              Join thousands of travelers who plan, collaborate, and track their expenses with TripTogether. Create a secure group room in seconds — completely free.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to="/register" className="cta-primary-pill">
                Create Account Free
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/destinations" className="cta-secondary-pill">
                Browse Destinations
              </Link>
            </div>
          </ScrollRevealSection>
        </div>
      </section>

    </div>
  );
}
