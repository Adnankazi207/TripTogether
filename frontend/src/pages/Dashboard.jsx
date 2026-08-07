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
      const res = await fetch('http://localhost:5050/api/trips', {
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
      const res = await fetch(`http://localhost:5050/api/trips/${tripId}`, {
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
        ? `http://localhost:5050/api/trips/${editingTripId}` 
        : 'http://localhost:5050/api/trips';
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
      const res = await fetch('http://localhost:5050/api/trips/join', {
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
        const res = await fetch(`http://localhost:5050/api/trips/${trip._id}/expenses`, {
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

  return (
    <div className="trip-card animate-fade-in" style={{ marginBottom: '24px' }}>
      
      {/* Left side: destination thumbnail */}
      <div className="trip-image-side">
        <img src={trip.destination.image} alt={trip.destination.title} />
        <div className="trip-image-overlay">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="trip-badge">{trip.destination.category}</span>
            {trip.user !== user?._id ? (
              <span className="trip-badge" style={{ background: 'var(--color-secondary)' }}>
                👥 Joined Group
              </span>
            ) : (trip.members && trip.members.length > 1 && (
              <span className="trip-badge" style={{ background: 'var(--color-primary)' }}>
                👑 Owner (Group)
              </span>
            ))}
            {trip.inviteCode && (
              <span 
                className="trip-badge" 
                style={{ 
                  background: 'rgba(15, 23, 42, 0.85)', 
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(trip.inviteCode);
                  alert(`Trip Invite Code copied: ${trip.inviteCode}`);
                }}
                title="Click to copy invite code"
              >
                🔑 {trip.inviteCode} (Copy)
              </span>
            )}
          </div>
          <div className="trip-dest-info">
            <h2>{trip.destination.title}</h2>
            <p>📍 {trip.destination.country}</p>
            
            {/* Weather Widget */}
            <div className="trip-weather-widget" style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: '#f8fafc',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <span>{weather.icon}</span>
              <span><strong>{weather.temp}</strong> • {weather.desc}</span>
            </div>

          </div>
        </div>
      </div>

      {/* Right side: details and expandable sections */}
      <div className="trip-content-side">
        
        {/* Meta details */}
        <div className="trip-meta-grid">
          <div className="trip-meta-item">
            <span>Duration</span>
            <strong>⏱ {getDaysCount(trip.startDate, trip.endDate)}</strong>
          </div>
          <div className="trip-meta-item">
            <span>Date Interval</span>
            <strong>📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</strong>
          </div>
          <div className="trip-meta-item">
            <span>Total Budget</span>
            <strong>💵 ₹{budget.toLocaleString()}</strong>
          </div>
        </div>

        {/* Budget Status Meter */}
        <div className="budget-status-section">
          <div className="budget-meter-labels">
            <span style={{ color: 'var(--text-secondary)' }}>
              Spent: <strong>₹{totalSpent.toLocaleString()}</strong> of ₹{budget.toLocaleString()}
            </span>
            <span style={{ 
              color: ratio >= 100 ? 'var(--color-danger)' : ratio >= 75 ? 'var(--color-warning)' : 'var(--color-secondary)',
              fontWeight: 'bold'
            }}>
              {ratio.toFixed(0)}% Used
            </span>
          </div>

          <div className="budget-progress-bar-bg">
            <div 
              className={`budget-progress-bar-fill ${meterColorClass}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {ratio >= 100 && (
            <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
              ⚠️ Alert: You have exceeded your planned budget!
            </p>
          )}
          {ratio >= 75 && ratio < 100 && (
            <p style={{ color: 'var(--color-warning)', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
              ⚠️ Caution: You have used over 75% of your budget.
            </p>
          )}

          {/* Weather recommendation tag */}
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            <span><strong>Weather Tip:</strong> {weather.tip}</span>
          </div>
        </div>

        {trip.notes && (
          <div className="trip-notes">
            <strong>Notes:</strong> {trip.notes}
          </div>
        )}

        {/* Action button rows */}
        <div className="trip-actions">
          <button 
            onClick={onDelete} 
            className="btn btn-secondary" 
            style={{ 
              borderColor: 'var(--color-danger)', 
              color: 'var(--color-danger)', 
              padding: '8px 16px',
              fontSize: '0.9rem' 
            }}
          >
            Cancel Trip
          </button>

          {trip.user === user?._id && (
            <button 
              onClick={onEdit} 
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
              ✏️ Edit Details
            </button>
          )}
          
          <Link 
            to={`/trip/${trip._id}`}
            className="btn btn-primary" 
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            Manage Trip
          </Link>
        </div>
      </div>
    </div>
  );
}
