import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

// Helper to mock weather based on travel categories
const getWeatherForDest = (category, city) => {
  const mockWeather = {
    Beach: { temp: '29°C', desc: 'Sunny & Warm', icon: '☀️', tip: 'Great beach day! Bring sunscreen and swimwear 🏖️' },
    Nature: { temp: '17°C', desc: 'Clear & Crisp', icon: '🌲', tip: 'Fresh mountain breeze. Layer up for trails 🏔️' },
    Adventure: { temp: '14°C', desc: 'Partly Cloudy', icon: '⛅', tip: 'Windy peaks. Keep a windbreaker handy 🥾' },
    Cultural: { temp: '21°C', desc: 'Scattered Clouds', icon: '☁️', tip: 'Ideal sightseeing weather. Walk comfortably 🏛️' },
    Urban: { temp: '23°C', desc: 'Mild Overcast', icon: '🌥️', tip: 'Calm city skies. Perfect for urban exploration 🏙️' }
  };
  return mockWeather[category] || { temp: '20°C', desc: 'Fair', icon: '☀️', tip: 'Enjoy your travel itinerary today!' };
};

export default function Dashboard() {
  const { user } = useAuth();
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom Trip form state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);
  const [customForm, setCustomForm] = useState({
    title: '',
    country: '',
    category: 'Urban',
    image: '',
    startDate: '',
    endDate: '',
    budget: '',
    notes: '',
  });
  const [customError, setCustomError] = useState(null);
  const [customSubmitting, setCustomSubmitting] = useState(false);

  // Join Trip Room states
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState(null);
  const [joinSubmitting, setJoinSubmitting] = useState(false);

  // Fetch Trips
  const fetchTrips = async () => {
    try {
      const res = await fetch('https://triptogether-backend-f1j9.onrender.com/api/trips', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to retrieve user trips.');
      const data = await res.json();
      setTrips(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrips();

      // Check for pre-filled budget from budget calculator
      const prefilledBudget = sessionStorage.getItem('prefilledBudget');
      const prefilledCategory = sessionStorage.getItem('prefilledCategory');
      const prefilledDays = sessionStorage.getItem('prefilledDays');

      if (prefilledBudget) {
        const today = new Date().toISOString().split('T')[0];
        const daysCount = parseInt(prefilledDays) || 1;
        const endDateObj = new Date();
        endDateObj.setDate(endDateObj.getDate() + daysCount - 1);
        const endDateStr = endDateObj.toISOString().split('T')[0];

        setCustomForm(prev => ({
          ...prev,
          budget: prefilledBudget,
          category: prefilledCategory || 'Urban',
          startDate: today,
          endDate: endDateStr,
        }));
        setIsCustomModalOpen(true);

        // Clear session storage so it doesn't open the modal repeatedly on reload
        sessionStorage.removeItem('prefilledBudget');
        sessionStorage.removeItem('prefilledCategory');
        sessionStorage.removeItem('prefilledDays');
      }
    }
  }, [user]);

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip and all its logged expenses?')) {
      return;
    }

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to remove the trip.');

      // Refresh list
      setTrips(trips.filter((t) => t._id !== tripId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (trip) => {
    setCustomForm({
      title: trip.destination.title,
      country: trip.destination.country || 'Unknown',
      category: trip.destination.category,
      image: trip.destination.image || '',
      startDate: trip.startDate.split('T')[0],
      endDate: trip.endDate.split('T')[0],
      budget: trip.budget,
      notes: trip.notes || '',
    });
    setEditingTripId(trip._id);
    setIsCustomModalOpen(true);
  };

  const handleCloseCustomModal = () => {
    setIsCustomModalOpen(false);
    setEditingTripId(null);
    setCustomForm({
      title: '',
      country: '',
      category: 'Urban',
      image: '',
      startDate: '',
      endDate: '',
      budget: '',
      notes: '',
    });
    setCustomError(null);
  };

  // Handle local image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('Image is too large. Please select an image under 4MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomForm(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom Trip submission (POST to create or PUT to edit)
  const handleCustomTripSubmit = async (e) => {
    e.preventDefault();
    setCustomError(null);
    
    const { title, country, category, image, startDate, endDate, budget, notes } = customForm;
    
    if (!title || !category || !startDate || !endDate || !budget) {
      setCustomError('Please enter all required fields.');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setCustomError('End Date must occur after the Start Date.');
      return;
    }
    
    if (parseFloat(budget) <= 0) {
      setCustomError('Budget must be positive.');
      return;
    }
    
    setCustomSubmitting(true);
    
    try {
      const url = editingTripId 
        ? `https://triptogether-backend-f1j9.onrender.com/api/trips/${editingTripId}` 
        : 'https://triptogether-backend-f1j9.onrender.com/api/trips';
      const method = editingTripId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          budget: parseFloat(budget),
          notes,
          customDestination: {
            title,
            country: country || 'Unknown',
            category,
            image: image || undefined
          }
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to submit trip details.');
      
      handleCloseCustomModal();
      await fetchTrips();
    } catch (err) {
      setCustomError(err.message);
    } finally {
      setCustomSubmitting(false);
    }
  };

  const handleJoinTripSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setJoinSubmitting(true);
    setJoinError(null);

    try {
      const res = await fetch('https://triptogether-backend-f1j9.onrender.com/api/trips/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to join trip room.');

      setInviteCode('');
      setIsJoinModalOpen(false);
      await fetchTrips();
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoinSubmitting(false);
    }
  };

  // Helpers
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysCount = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e - s);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
  };

  return (
    <>
      <div className="container page-container animate-fade-in">
      
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>My Trips Planner</h1>
          <p>Create itineraries, set starting budgets, and log expenses to stay within limits.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setIsJoinModalOpen(true)} 
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.95rem', borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)' }}
          >
            👥 Join Group Trip
          </button>
          <button 
            onClick={() => setIsCustomModalOpen(true)} 
            className="btn btn-secondary"
            style={{ padding: '12px 20px', fontSize: '0.95rem' }}
          >
            ➕ Plan Custom Trip
          </button>
          <Link to="/destinations" className="btn btn-primary" style={{ padding: '12px 20px', fontSize: '0.95rem' }}>
            Explore Destinations
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
          <p style={{ marginTop: '16px' }}>Loading trips...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : trips.length === 0 ? (
        <div className="no-trips animate-fade-in">
          <h3>No Planned Trips Yet</h3>
          <p>Start your travel planning journey by discovering a destination or creating a custom trip.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button onClick={() => setIsCustomModalOpen(true)} className="btn btn-secondary">
              ➕ Plan Custom Trip
            </button>
            <Link to="/destinations" className="btn btn-primary">
              Browse Destinations
            </Link>
          </div>
        </div>
      ) : (
        <div className="trips-list">
          {trips.map((trip) => {
            return <TripCard 
              key={trip._id} 
              trip={trip} 
              onDelete={() => handleDeleteTrip(trip._id)}
              onEdit={() => handleEditClick(trip)}
              formatDate={formatDate}
              getDaysCount={getDaysCount}
            />;
          })}
        </div>
      )}
      </div>

      {/* Plan / Edit Trip Modal */}
      <Modal
        isOpen={isCustomModalOpen}
        onClose={handleCloseCustomModal}
        title={editingTripId ? "Edit Trip Details" : "Plan Custom Trip"}
      >
        {customError && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{customError}</div>}
        
        <form onSubmit={handleCustomTripSubmit}>
          {/* Destination Name & Location Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="customTitle">Destination Name *</label>
              <input
                type="text"
                id="customTitle"
                placeholder="e.g. Geneva, Mount Fuji"
                className="input-field"
                value={customForm.title}
                onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customCountry">Country / Location</label>
              <input
                type="text"
                id="customCountry"
                placeholder="e.g. Switzerland"
                className="input-field"
                value={customForm.country}
                onChange={(e) => setCustomForm({ ...customForm, country: e.target.value })}
              />
            </div>
          </div>

          {/* Category & Budget Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="customCategory">Category *</label>
              <select
                id="customCategory"
                className="input-field"
                value={customForm.category}
                onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                required
              >
                <option value="Urban">🏙️ Urban</option>
                <option value="Beach">🏖️ Beach</option>
                <option value="Nature">🌲 Nature</option>
                <option value="Adventure">🧗 Adventure</option>
                <option value="Cultural">🏛️ Cultural</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="customBudget">Total Budget (₹) *</label>
              <input
                type="number"
                id="customBudget"
                placeholder="e.g. 2000"
                className="input-field"
                value={customForm.budget}
                onChange={(e) => setCustomForm({ ...customForm, budget: e.target.value })}
                required
                min="1"
              />
            </div>
          </div>

          {/* Dates Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="customStart">Start Date *</label>
              <input
                type="date"
                id="customStart"
                className="input-field"
                value={customForm.startDate}
                onChange={(e) => setCustomForm({ ...customForm, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customEnd">End Date *</label>
              <input
                type="date"
                id="customEnd"
                className="input-field"
                value={customForm.endDate}
                onChange={(e) => setCustomForm({ ...customForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Image Upload & URL Link Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="customImageFile">Upload Image from Gallery</label>
              <input
                type="file"
                id="customImageFile"
                accept="image/*"
                onChange={handleImageUpload}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label htmlFor="customImage">Or Paste Image URL</label>
              <input
                type="url"
                id="customImage"
                placeholder="e.g. https://images.unsplash.com/..."
                className="input-field"
                value={customForm.image.startsWith('data:') ? '' : customForm.image}
                onChange={(e) => setCustomForm({ ...customForm, image: e.target.value })}
              />
            </div>
          </div>

          {customForm.image && (
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label>Image Preview</label>
              <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                <img 
                  src={customForm.image} 
                  alt="Upload Preview" 
                  style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', objectFit: 'cover' }} 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="customNotes">Itinerary Notes (Optional)</label>
            <textarea
              id="customNotes"
              placeholder="List down hotel details, flight info, or key sights..."
              className="input-field"
              value={customForm.notes}
              onChange={(e) => setCustomForm({ ...customForm, notes: e.target.value })}
              style={{ minHeight: '80px', resize: 'vertical' }}
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={customSubmitting}
          >
            {customSubmitting 
              ? (editingTripId ? 'Saving Changes...' : 'Creating Custom Trip...') 
              : (editingTripId ? 'Save Changes' : 'Plan Trip')}
          </button>
        </form>
      </Modal>

      {/* Join Trip Room Modal */}
      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)}>
        <h2 className="modal-title">Join Group Trip</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Enter the unique 6-character trip code shared by your friends to join their trip room and manage details together.
        </p>

        {joinError && <div className="alert alert-danger">{joinError}</div>}

        <form onSubmit={handleJoinTripSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="joinInviteCode" style={{ fontWeight: '600' }}>Invite Code</label>
            <input
              type="text"
              id="joinInviteCode"
              placeholder="e.g. AJM-X12"
              className="input-field"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              maxLength="8"
              style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={joinSubmitting}
          >
            {joinSubmitting ? 'Joining Trip...' : '👥 Join Trip'}
          </button>
        </form>
      </Modal>
    </>
  );
}

// Inner TripCard helper component to isolate fetch queries and rendering
function TripCard({ 
  trip, 
  onDelete, 
  onEdit,
  formatDate,
  getDaysCount
}) {
  const { user } = useAuth();
  const token = user?.token;
  const [totalSpent, setTotalSpent] = useState(0);

  // Fetch the summary total spent for this specific trip
  useEffect(() => {
    const calculateTotal = async () => {
      if (!token) return;
      try {
        const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${trip._id}/expenses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const total = data.reduce((sum, item) => sum + item.amount, 0);
          setTotalSpent(total);
        }
      } catch (err) {
        console.error(err);
      }
    };
    calculateTotal();
  }, [trip, token]);

  const budget = trip.budget;
  const ratio = budget > 0 ? (totalSpent / budget) * 100 : 0;
  const percentage = Math.min(ratio, 100);

  // Weather lookup
  const weather = getWeatherForDest(trip.destination.category, trip.destination.title);

  // Meter color logic
  let meterColorClass = 'bg-safe';
  if (ratio >= 100) {
    meterColorClass = 'bg-danger';
  } else if (ratio >= 75) {
    meterColorClass = 'bg-warning';
  }

  const getDurationInfo = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e - s);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    const nights = Math.max(0, days - 1);
    return {
      daysStr: `${days} ${days === 1 ? 'Day' : 'Days'}`,
      nightsStr: `${nights} ${nights === 1 ? 'Night' : 'Nights'}`
    };
  };

  const getWeekdayInterval = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const options = { weekday: 'long' };
    const startDay = s.toLocaleDateString('en-US', options);
    const endDay = e.toLocaleDateString('en-US', options);
    return `${startDay} to ${endDay}`;
  };

  const duration = getDurationInfo(trip.startDate, trip.endDate);
  const weekdayInterval = getWeekdayInterval(trip.startDate, trip.endDate);
  const isGroup = (trip.members && trip.members.length > 1) || (trip.user !== user?._id);

  return (
    <div className="dashboard-trip-card animate-fade-in">
      
      {/* Top Main Split Section */}
      <div className="trip-main-split">
        
        {/* Left Panel: Graphic Thumb Card */}
        <div className="trip-graphic-panel" style={{ backgroundImage: `url(${trip.destination.image})` }}>
          <div className="trip-graphic-overlay"></div>
          
          {/* Top Badges */}
          <div className="trip-graphic-top-badges">
            <span className="graphic-badge badge-category">
              {trip.destination.category === 'Adventure' ? '🧗' : 
               trip.destination.category === 'Beach' ? '🏖️' : 
               trip.destination.category === 'Nature' ? '🌲' : 
               trip.destination.category === 'Cultural' ? '🏛️' : '🏙️'}{' '}
              {trip.destination.category}
            </span>
            {isGroup && (
              <span className="graphic-badge badge-group">
                👥 Joined Group
              </span>
            )}
            {trip.inviteCode && (
              <button 
                className="graphic-badge badge-copy-code"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(trip.inviteCode);
                  alert(`Trip Invite Code copied: ${trip.inviteCode}`);
                }}
                title="Click to copy invite code"
              >
                🔑 {trip.inviteCode} (Copy)
              </button>
            )}
          </div>

          {/* Bottom Destination Info */}
          <div className="trip-graphic-bottom-info">
            <h2 className="dest-title-lc">{trip.destination.title.toLowerCase()}</h2>
            <p className="dest-country-row">
              <span className="pin-icon">📍</span> {trip.destination.country}
            </p>
            
            {/* Weather Widget */}
            <div className="trip-weather-pill">
              <span className="weather-icon">{weather.icon}</span>
              <span className="weather-stats"><strong>{weather.temp}</strong> • {weather.desc}</span>
            </div>
          </div>

        </div>

        {/* Right Panel: Metrics Details */}
        <div className="trip-metrics-panel">
          
          {/* Header Metric Grid */}
          <div className="metrics-header-grid">
            
            {/* Duration */}
            <div className="metric-col">
              <div className="metric-label">DURATION</div>
              <div className="metric-value-row">
                <span className="metric-icon clock-orange">⏱️</span>
                <div>
                  <div className="metric-main-value">{duration.daysStr}</div>
                  <div className="metric-sub-value">{duration.nightsStr}</div>
                </div>
              </div>
            </div>

            <div className="metric-col-divider"></div>

            {/* Date Interval */}
            <div className="metric-col">
              <div className="metric-label">DATE INTERVAL</div>
              <div className="metric-value-row">
                <span className="metric-icon calendar-orange">📅</span>
                <div>
                  <div className="metric-main-value">
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </div>
                  <div className="metric-sub-value">{weekdayInterval}</div>
                </div>
              </div>
            </div>

            <div className="metric-col-divider"></div>

            {/* Total Budget */}
            <div className="metric-col">
              <div className="metric-label">TOTAL BUDGET</div>
              <div className="metric-value-row">
                <span className="metric-icon wallet-orange">👛</span>
                <div>
                  <div className="metric-main-value">₹{budget.toLocaleString()}</div>
                  <div className="metric-sub-value">{isGroup ? 'Group Budget' : 'Personal Budget'}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Spent Progress Section */}
          <div className="spent-progress-section">
            <div className="spent-labels-row">
              <span className="spent-text">
                Spent: <strong>₹{totalSpent.toLocaleString()}</strong> of ₹{budget.toLocaleString()}
              </span>
              <span className="spent-percentage">
                {ratio.toFixed(0)}% Used
              </span>
            </div>
            
            {/* Progress Bar Track */}
            <div className="spent-progress-track">
              <div 
                className={`spent-progress-fill ${meterColorClass}`} 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>

            {/* Weather Tip Bar */}
            <div className="weather-tip-alert-box">
              <span className="lightbulb-icon">💡</span>
              <span className="weather-tip-text">
                <strong>Weather Tip:</strong> {weather.tip}
              </span>
            </div>

            {ratio >= 100 && (
              <div className="budget-alert-line exceeded" style={{ color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>
                ⚠️ Alert: You have exceeded your planned budget!
              </div>
            )}
            {ratio >= 75 && ratio < 100 && (
              <div className="budget-alert-line warning" style={{ color: 'var(--color-warning)', fontSize: '0.8rem', fontWeight: 600, marginTop: '8px' }}>
                ⚠️ Caution: You have used over 75% of your budget.
              </div>
            )}
          </div>

          {/* Footer Control Row */}
          <div className="metrics-footer-controls">
            
            {/* Notes Snippet */}
            <div className="notes-snippet-wrapper">
              {trip.notes ? (
                <>
                  <span className="notes-icon">📝</span>
                  <span className="notes-text"><strong>Notes:</strong> {trip.notes}</span>
                </>
              ) : (
                <>
                  <span className="notes-icon">📝</span>
                  <span className="notes-text" style={{ color: 'var(--text-muted)' }}>No trip notes added yet.</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="controls-buttons-group">
              <button onClick={onDelete} className="btn-cancel-trip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ marginRight: '6px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Cancel Trip
              </button>

              {trip.user === user?._id && (
                <button onClick={onEdit} className="btn-edit-trip" title="Edit Trip Details">
                  ✏️ Edit
                </button>
              )}

              <Link to={`/trip/${trip._id}`} className="btn-manage-trip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ marginRight: '6px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage Trip
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Full-width Bottom Ribbon */}
      <div className="trip-card-bottom-ribbon">
        <div className="ribbon-item">
          <div className="ribbon-icon-wrapper orange-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <div className="ribbon-title">Group Collaboration</div>
            <div className="ribbon-desc">Plan together, stay updated</div>
          </div>
        </div>
        
        <div className="ribbon-divider"></div>

        <div className="ribbon-item">
          <div className="ribbon-icon-wrapper orange-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <div className="ribbon-title">Secure & Private</div>
            <div className="ribbon-desc">Only invited members</div>
          </div>
        </div>

        <div className="ribbon-divider"></div>

        <div className="ribbon-item">
          <div className="ribbon-icon-wrapper orange-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <div className="ribbon-title">Real-time Updates</div>
            <div className="ribbon-desc">Changes reflect instantly</div>
          </div>
        </div>
      </div>

    </div>
  );
}
