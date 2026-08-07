import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

export default function BudgetCalculator() {
  const navigate = useNavigate();

  // Primary parameters state
  const [category, setCategory] = useState('Cultural');
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(1);
  const [comfortLevel, setComfortLevel] = useState('mid');

  // Search specific area/city state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [aiTips, setAiTips] = useState(null);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Custom daily rates state
  const [useCustomRates, setUseCustomRates] = useState(false);
  const [customLodg, setCustomLodg] = useState(5000);
  const [customFood, setCustomFood] = useState(2000);
  const [customTrans, setCustomTrans] = useState(1200);
  const [customAct, setCustomAct] = useState(1200);

  // Overheads and travel additions state
  const [transitMode, setTransitMode] = useState('flight'); // flight | train | car
  const [transitCost, setTransitCost] = useState('');
  const [shopping, setShopping] = useState('');

  // Calculations results state
  const [breakdown, setBreakdown] = useState({
    accommodation: 0,
    food: 0,
    transport: 0,
    activities: 0,
    transit: 0,
    shopping: 0,
    total: 0,
  });

  // Comfort Tiers standard defaults (in Rupees ₹)
  const rates = {
    budget: { lodg: 1500, food: 800, trans: 500, act: 400 },
    mid: { lodg: 5000, food: 2000, trans: 1200, act: 1200 },
    luxury: { lodg: 18000, food: 6000, trans: 4000, act: 4500 },
  };

  // Category multipliers to scale standard assumptions
  const categoryMultipliers = {
    Beach: { lodg: 1.1, food: 1.0, trans: 0.9, act: 1.2 },
    Cultural: { lodg: 0.9, food: 1.1, trans: 1.0, act: 1.1 },
    Urban: { lodg: 1.3, food: 1.2, trans: 1.2, act: 1.0 },
    Nature: { lodg: 0.8, food: 0.9, trans: 1.1, act: 0.9 },
    Adventure: { lodg: 0.9, food: 1.0, trans: 1.1, act: 1.4 },
  };

  // Sync custom rates with comfort/category changes unless manual override is active
  useEffect(() => {
    if (!useCustomRates) {
      const calcRates = rates[comfortLevel];
      const mults = categoryMultipliers[category] || { lodg: 1, food: 1, trans: 1, act: 1 };
      
      setCustomLodg(Math.round(calcRates.lodg * mults.lodg));
      setCustomFood(Math.round(calcRates.food * mults.food));
      setCustomTrans(Math.round(calcRates.trans * mults.trans));
      setCustomAct(Math.round(calcRates.act * mults.act));
    }
  }, [comfortLevel, category, useCustomRates]);

  // Recalculate full totals dynamically
  useEffect(() => {
    const lodgingCost = customLodg * days * travelers;
    const foodCost = customFood * days * travelers;
    const transportCost = customTrans * days * travelers;
    const activitiesCost = customAct * days * travelers;
    
    let transit = 0;
    if (transitCost) {
      const parsedTransit = parseInt(transitCost);
      if (transitMode === 'car') {
        transit = parsedTransit; // Flat group rate for car
      } else {
        transit = parsedTransit * travelers; // Per person rate
      }
    }

    const shop = shopping ? parseInt(shopping) : 0;
    const total = lodgingCost + foodCost + transportCost + activitiesCost + transit + shop;

    setBreakdown({
      accommodation: lodgingCost,
      food: foodCost,
      transport: transportCost,
      activities: activitiesCost,
      transit,
      shopping: shop,
      total,
    });
  }, [days, travelers, customLodg, customFood, customTrans, customAct, transitMode, transitCost, shopping]);

  // Centralized AI tips loader
  const fetchAIBudgetTips = async () => {
    setTipsLoading(true);
    try {
      let url = '';
      if (selectedCity) {
        url = `http://localhost:5050/api/destinations/tips?city=${encodeURIComponent(selectedCity.title)}`;
      } else {
        url = `http://localhost:5050/api/destinations/tips?category=${category}&comfort=${comfortLevel}&transit=${transitMode}&days=${days}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAiTips(data.tips);
      }
    } catch (err) {
      console.error('[Fetch Tips Error]', err);
    } finally {
      setTipsLoading(false);
    }
  };

  // Automatically trigger AI tips whenever any calculation query parameters are modified
  useEffect(() => {
    fetchAIBudgetTips();
  }, [category, comfortLevel, transitMode, days, selectedCity]);

  // City Search Handler: queries backend and updates budget baseline values
  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setTipsLoading(true);
    setSearchError(null);
    try {
      // Fetch matching destination profile (if not exist, seeds dynamically!)
      const res = await fetch(`http://localhost:5050/api/destinations?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const dest = data[0];
          setSelectedCity(dest);
          setCategory(dest.category);
          
          // Match cost index to comfort tier
          if (dest.costIndex === '$$$') {
            setComfortLevel('luxury');
          } else if (dest.costIndex === '$') {
            setComfortLevel('budget');
          } else {
            setComfortLevel('mid');
          }
        } else {
          setSearchError('No destinations matched or could be generated.');
        }
      } else {
        setSearchError('Search failed to retrieve city data.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Server connection error.');
    } finally {
      setTipsLoading(false);
    }
  };

  const handleResetCity = () => {
    setSelectedCity(null);
    setSearchQuery('');
    setAiTips(null);
    setSearchError(null);
  };

  // Save selection and load to dashboard pre-filled form
  const handleStartPlanning = () => {
    sessionStorage.setItem('prefilledBudget', breakdown.total);
    sessionStorage.setItem('prefilledCategory', category);
    sessionStorage.setItem('prefilledDays', days);
    if (selectedCity) {
      sessionStorage.setItem('prefilledCity', selectedCity.title);
    }
    navigate('/dashboard');
  };

  // Helper to sanitize emoji glyphs out of strings for standard PDF font rendering compatibility
  const cleanTextForPDF = (text) => {
    if (!text) return '';
    return text
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '•')
      .replace(/•\s*/g, '• ');
  };

  // PDF report builder with custom colors and grids
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [220, 38, 38]; // Crimson #dc2626
    const secondaryColor = [31, 41, 55]; // Gray #1f2937
    const borderColor = [229, 231, 235]; // Gray border #e5e7eb

    // 1. Color Banner header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 38, 'F');

    // Title text inside banner
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('TripTogether Travel Budget', 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text('Premium travel cost estimation report', 15, 27);

    // Generation Date
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    doc.text(`Generated: ${today}`, 195, 18, { align: 'right' });

    // 2. Summary Grid Block
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('1. Overview Parameters', 15, 52);
    
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.line(15, 55, 195, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);

    const locationText = selectedCity ? `${selectedCity.title}, ${selectedCity.country}` : `Custom (${category} Trip Category)`;
    doc.text('Location:', 15, 64);
    doc.text('Duration:', 15, 71);
    doc.text('Travelers Count:', 15, 78);

    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(locationText, 45, 64);
    doc.text(`${days} Days`, 45, 71);
    doc.text(`${travelers} ${travelers === 1 ? 'Traveler' : 'Travelers'}`, 45, 78);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Comfort Tier:', 110, 64);
    doc.text('Transit Mode:', 110, 71);

    const transitLabel = transitMode === 'flight' ? 'Flight' : transitMode === 'train' ? 'Train' : 'Car / Road Trip';
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(useCustomRates ? 'Manual Custom Rates' : comfortLevel.toUpperCase(), 140, 64);
    doc.text(transitLabel, 140, 71);

    // 3. Breakdown Details Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('2. Expense Breakdown', 15, 93);
    doc.line(15, 96, 195, 96);

    // Table Header
    doc.setFillColor(243, 244, 246);
    doc.rect(15, 101, 180, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text('Category Item', 20, 106.5);
    doc.text('Estimate Amount', 185, 106.5, { align: 'right' });

    // Populate rows
    const rows = [
      { label: 'Accommodation Lodging', value: breakdown.accommodation },
      { label: 'Food & Dining Allowance', value: breakdown.food },
      { label: 'Transit & Local Sightseeing', value: breakdown.transport },
      { label: 'Activities & Attractions Entry', value: breakdown.activities }
    ];

    if (breakdown.transit > 0) {
      const label = transitMode === 'flight' ? 'Flight Tickets' : transitMode === 'train' ? 'Train Tickets' : 'Fuel / Car Rental';
      rows.push({ label, value: breakdown.transit });
    }

    if (breakdown.shopping > 0) {
      rows.push({ label: 'Shopping Allocation', value: breakdown.shopping });
    }

    let currentY = 109;
    doc.setFont('helvetica', 'normal');
    rows.forEach((row, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(249, 250, 251);
        doc.rect(15, currentY, 180, 8, 'F');
      }
      doc.text(row.label, 20, currentY + 5.5);
      doc.text(`Rs. ${row.value.toLocaleString('en-IN')}`, 185, currentY + 5.5, { align: 'right' });
      currentY += 8;
    });

    // Draw total row outline
    doc.setFillColor(254, 242, 242);
    doc.rect(15, currentY, 180, 11, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, currentY, 195, currentY);
    doc.line(15, currentY + 11, 195, currentY + 11);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(9.5);
    doc.text('Estimated Total Budget', 20, currentY + 7);
    doc.text(`Rs. ${breakdown.total.toLocaleString('en-IN')}`, 185, currentY + 7, { align: 'right' });

    // Daily Average
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Average Daily Rate: Rs. ${Math.round(breakdown.total / days).toLocaleString('en-IN')} / day`, 15, currentY + 17);

    // 4. AI Cost Saving Tips Box
    const tipsY = currentY + 26;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('3. Smart AI Budget Saving Tips', 15, tipsY);
    doc.line(15, tipsY + 3, 195, tipsY + 3);

    // Box parameters
    const rawTips = aiTips || budgetTips[category] || 'Consider setting aside emergency contingency reserve funds and look for local transport passes.';
    const cleanTips = cleanTextForPDF(rawTips);
    const splitTips = doc.splitTextToSize(cleanTips, 170);
    const boxHeight = splitTips.length * 5.2 + 10;

    // Draw light warning border box
    doc.setFillColor(255, 251, 243);
    doc.setDrawColor(254, 215, 170);
    doc.setLineWidth(0.3);
    doc.rect(15, tipsY + 7, 180, boxHeight, 'FD');

    // Draw text inside box
    doc.setTextColor(120, 53, 4); // Dark brown
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(splitTips, 20, tipsY + 14);

    // Footer
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.text('TripTogether Travel Budget Planner • Keep moving, keep sharing.', 105, 284, { align: 'center' });

    // Trigger local PDF download
    const fileName = selectedCity
      ? `TripTogether_Budget_${selectedCity.title.replace(/\s+/g, '_')}.pdf`
      : 'TripTogether_Budget_Report.pdf';
    doc.save(fileName);
  };

  // Smart advice categories mapping
  const budgetTips = {
    Beach: '🏖️ Sunscreen, beach gear, and towels are cheaper to buy locally than pay airlines baggage fees. Rental scooters offer better transport rates than private cabs.',
    Cultural: '🏛️ Look for city history passes or free museum entry days (usually Sundays). Rent local guides at historic monument entry gates for negotiable rates.',
    Urban: '🏙️ Stay slightly outside central downtown cores near metro link tracks to save on lodging. Purchase 3-day or 7-day subway transit tickets.',
    Nature: '🌲 Homestays or eco-cabins provide authentic lodging at lower rates than resorts. Pre-pack snack energy bars and camping utilities.',
    Adventure: '🧗 Rent trekking gears, tents, and boots at basecamp sites instead of checking heavy equipment baggages on commercial flights.'
  };

  return (
    <div className="container page-container animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="section-tag">Finance Tools</span>
        <h1 className="gradient-text" style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '16px' }}>
          Travel Budget Planner
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Estimate your upcoming adventure expenses. Search a specific city or configure custom daily rates and transit options.
        </p>
      </div>

      {/* City Search Bar */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: '700' }}>🗺️ Select Specific City / Region</h3>
        <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="Type any city (e.g. Bangalore, Goa, Paris, Surat...)"
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, margin: 0 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontWeight: '600' }} disabled={tipsLoading}>
            {tipsLoading ? 'Searching...' : '🔍 Search City'}
          </button>
          {selectedCity && (
            <button type="button" onClick={handleResetCity} className="btn btn-secondary" style={{ padding: '12px 18px' }}>
              Reset
            </button>
          )}
        </form>
        {selectedCity && (
          <p style={{ margin: '12px 0 0', fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: '600' }}>
            📍 Selected City: {selectedCity.title}, {selectedCity.country} ({selectedCity.category} category • Cost index: {selectedCity.costIndex.replace(/\$/g, '₹')})
          </p>
        )}
        {searchError && (
          <p style={{ margin: '12px 0 0', fontSize: '0.9rem', color: 'var(--color-danger)', fontWeight: '600' }}>
            ⚠️ {searchError}
          </p>
        )}
      </div>

      <div className="trip-detail-grid">
        
        {/* LEFT COLUMN: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Parameters Panel */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>1. Basic Parameters</h3>
            
            {/* Category selection */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="calcCategory" style={{ fontWeight: '600' }}>Trip Category</label>
              <select
                id="calcCategory"
                className="input-field"
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSelectedCity(null); }}
              >
                <option value="Cultural">🏛️ Cultural & Historical</option>
                <option value="Beach">🏖️ Beach & Coastal</option>
                <option value="Urban">🏙️ Urban Explorer</option>
                <option value="Nature">🌲 Nature & Relaxation</option>
                <option value="Adventure">🧗 Sport & Adventure</option>
              </select>
            </div>

            {/* Stay Days & Travelers */}
            <div className="trip-form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Stay Duration</span>
                  <span style={{ color: 'var(--color-primary)' }}><strong>{days} Days</strong></span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', cursor: 'pointer', outline: 'none' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Travelers Count</span>
                  <span style={{ color: 'var(--color-secondary)' }}><strong>{travelers} {travelers === 1 ? 'Person' : 'People'}</strong></span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value))}
                  style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', cursor: 'pointer', outline: 'none' }}
                />
              </div>
            </div>

            {/* Comfort Tiers */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontWeight: '600', marginBottom: '10px' }}>Comfort Tier Defaults</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div 
                  onClick={() => { setComfortLevel('budget'); setUseCustomRates(false); }}
                  style={{
                    border: comfortLevel === 'budget' && !useCustomRates ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    background: comfortLevel === 'budget' && !useCustomRates ? 'rgba(220, 38, 38, 0.04)' : 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🎒</div>
                  <h4 style={{ fontSize: '0.88rem', margin: '0 0 2px', fontWeight: '700' }}>Budget</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~₹3,200/d</span>
                </div>

                <div 
                  onClick={() => { setComfortLevel('mid'); setUseCustomRates(false); }}
                  style={{
                    border: comfortLevel === 'mid' && !useCustomRates ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    background: comfortLevel === 'mid' && !useCustomRates ? 'rgba(220, 38, 38, 0.04)' : 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>🏨</div>
                  <h4 style={{ fontSize: '0.88rem', margin: '0 0 2px', fontWeight: '700' }}>Mid-Range</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~₹9,400/d</span>
                </div>

                <div 
                  onClick={() => { setComfortLevel('luxury'); setUseCustomRates(false); }}
                  style={{
                    border: comfortLevel === 'luxury' && !useCustomRates ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    background: comfortLevel === 'luxury' && !useCustomRates ? 'rgba(220, 38, 38, 0.04)' : 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>👑</div>
                  <h4 style={{ fontSize: '0.88rem', margin: '0 0 2px', fontWeight: '700' }}>Luxury</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~₹32,500/d</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Custom Rates Panel */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>2. Customize Daily Rates</h3>
              <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                <input 
                  type="checkbox" 
                  checked={useCustomRates} 
                  onChange={(e) => setUseCustomRates(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                Enable Manual Adjustments
              </label>
            </div>

            {useCustomRates ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
                {/* Accommodation Lodging slider */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
                    <span>Lodging (₹ per night/room)</span>
                    <span style={{ color: 'var(--color-primary)' }}>₹{customLodg}</span>
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="40000"
                    step="500"
                    value={customLodg}
                    onChange={(e) => setCustomLodg(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Food slider */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
                    <span>Food (₹ per traveler/day)</span>
                    <span style={{ color: 'var(--color-primary)' }}>₹{customFood}</span>
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="15000"
                    step="100"
                    value={customFood}
                    onChange={(e) => setCustomFood(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Transit slider */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
                    <span>Local Transport (₹ per traveler/day)</span>
                    <span style={{ color: 'var(--color-primary)' }}>₹{customTrans}</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="50"
                    value={customTrans}
                    onChange={(e) => setCustomTrans(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Activities slider */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600' }}>
                    <span>Activities & Entry (₹ per traveler/day)</span>
                    <span style={{ color: 'var(--color-primary)' }}>₹{customAct}</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="15000"
                    step="100"
                    value={customAct}
                    onChange={(e) => setCustomAct(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, fontStyle: 'italic' }}>
                Toggle "Enable Manual Adjustments" to fine-tune rates. Currently using standard multipliers for {category} category.
              </p>
            )}
          </div>

          {/* Overheads and Extra items Panel */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>3. Add Overheads & Transit</h3>
            
            {/* Transit Mode & Cost */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="transitMode" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Transit Mode</label>
                <select
                  id="transitMode"
                  className="input-field"
                  value={transitMode}
                  onChange={(e) => { setTransitMode(e.target.value); setTransitCost(''); }}
                >
                  <option value="flight">✈️ Flight</option>
                  <option value="train">🚄 Train</option>
                  <option value="car">🚗 Car / Road Trip</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="calcTransit" style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                  {transitMode === 'flight' && 'Flight Cost (₹ per person)'}
                  {transitMode === 'train' && 'Train Ticket (₹ per person)'}
                  {transitMode === 'car' && 'Fuel/Rental (₹ total)'}
                </label>
                <input
                  type="number"
                  id="calcTransit"
                  placeholder={
                    transitMode === 'flight' ? 'e.g. 15000' :
                    transitMode === 'train' ? 'e.g. 1500' : 'e.g. 6000'
                  }
                  className="input-field"
                  value={transitCost}
                  onChange={(e) => setTransitCost(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            {/* Shopping Cost */}
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="calcShopping" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Shopping Fund (₹ total)</label>
              <input
                type="number"
                id="calcShopping"
                placeholder="e.g. 10000 (optional)"
                className="input-field"
                value={shopping}
                onChange={(e) => setShopping(e.target.value)}
                min="0"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Results & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Estimated Cost Display */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '1.2rem', fontWeight: '700' }}>Estimated Travel Cost Summary</h3>
            
            {/* Total Indicator Panel */}
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '28px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: '600' }}>
                Estimated Total
              </span>
              <h2 style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--color-primary)', margin: '4px 0 8px' }}>
                ₹{breakdown.total.toLocaleString()}
              </h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                approx. <strong>₹{Math.round(breakdown.total / days).toLocaleString()}</strong> / day total
              </span>
            </div>

            {/* Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {/* Accommodation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                  <span>🏠 Accommodation</span>
                  <span>₹{breakdown.accommodation.toLocaleString()} ({Math.round((breakdown.accommodation / breakdown.total) * 100 || 0)}%)</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(breakdown.accommodation / breakdown.total) * 100 || 0}%`, height: '100%', background: '#3b82f6' }}></div>
                </div>
              </div>

              {/* Food */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                  <span>🍔 Food & Dining</span>
                  <span>₹{breakdown.food.toLocaleString()} ({Math.round((breakdown.food / breakdown.total) * 100 || 0)}%)</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(breakdown.food / breakdown.total) * 100 || 0}%`, height: '100%', background: '#10b981' }}></div>
                </div>
              </div>

              {/* Transport */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                  <span>🚗 Local Transport</span>
                  <span>₹{breakdown.transport.toLocaleString()} ({Math.round((breakdown.transport / breakdown.total) * 100 || 0)}%)</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(breakdown.transport / breakdown.total) * 100 || 0}%`, height: '100%', background: '#f59e0b' }}></div>
                </div>
              </div>

              {/* Activities */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                  <span>🧗 Activities & Sightseeing</span>
                  <span>₹{breakdown.activities.toLocaleString()} ({Math.round((breakdown.activities / breakdown.total) * 100 || 0)}%)</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(breakdown.activities / breakdown.total) * 100 || 0}%`, height: '100%', background: '#8b5cf6' }}></div>
                </div>
              </div>

              {/* Transit */}
              {breakdown.transit > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                    <span>
                      {transitMode === 'flight' && '✈️ Flight Tickets'}
                      {transitMode === 'train' && '🚄 Train Tickets'}
                      {transitMode === 'car' && '🚗 Fuel / Car Rental'}
                    </span>
                    <span>₹{breakdown.transit.toLocaleString()} ({Math.round((breakdown.transit / breakdown.total) * 100 || 0)}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(breakdown.transit / breakdown.total) * 100 || 0}%`, height: '100%', background: '#ec4899' }}></div>
                  </div>
                </div>
              )}

              {/* Shopping */}
              {breakdown.shopping > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
                    <span>🛍️ Shopping Allowance</span>
                    <span>₹{breakdown.shopping.toLocaleString()} ({Math.round((breakdown.shopping / breakdown.total) * 100 || 0)}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(breakdown.shopping / breakdown.total) * 100 || 0}%`, height: '100%', background: '#14b8a6' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button 
                onClick={handleStartPlanning}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: '600' }}
              >
                📅 Plan Trip with this Budget
              </button>
              <button 
                onClick={handleDownloadPDF}
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '10px', fontSize: '0.9rem', fontWeight: '600' }}
              >
                📥 Download PDF Summary
              </button>
            </div>

          </div>

          {/* AI Travel Tip Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.02) 0%, rgba(244, 63, 94, 0.04) 100%)', border: '1px solid rgba(220, 38, 38, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span> Smart AI Cost-Saving Tips {selectedCity ? `for ${selectedCity.title}` : `(${category})`}
              </h4>
              <button 
                onClick={fetchAIBudgetTips}
                className="btn btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', margin: 0 }}
                disabled={tipsLoading}
              >
                🔄 Refresh
              </button>
            </div>
            {tipsLoading ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                Fetching custom money-saving hacks from Gemini AI...
              </p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                {aiTips || budgetTips[category] || 'Consider setting aside emergency contingency reserve funds and look for local transport passes.'}
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
