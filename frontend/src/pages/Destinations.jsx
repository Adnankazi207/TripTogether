import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Destinations() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // URL Query Parameters
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || 'All';

  // Page States
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const [tripForm, setTripForm] = useState({
    startDate: '',
    endDate: '',
    budget: '',
    notes: '',
  });
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Sync Search state if URL changes
  useEffect(() => {
    setSearch(queryParams.get('search') || '');
    setCategory(queryParams.get('category') || 'All');
  }, [location.search]);

  // Fetch Destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        let url = 'https://triptogether-backend-f1j9.onrender.com/api/destinations';
        const params = [];
        
        if (category && category !== 'All') {
          params.push(`category=${category}`);
        }
        if (search) {
          params.push(`search=${encodeURIComponent(search)}`);
        }
        
        if (params.length > 0) {
          url += `?${params.join('&')}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to retrieve destinations data.');
        const data = await res.json();
        setDestinations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [search, category]);

  const handleAddTripClick = (dest) => {
    if (!user) {
      // Redirect to login if user not logged in
      navigate('/login?redirect=destinations');
      return;
    }
    setSelectedDest(dest);
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setTripForm({
      ...tripForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const { startDate, endDate, budget, notes } = tripForm;

    if (!startDate || !endDate || !budget) {
      setFormError('Please enter all required fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setFormError('End Date must occur after the Start Date.');
      return;
    }

    if (parseFloat(budget) <= 0) {
      setFormError('Budget must be a positive number.');
      return;
    }

    setFormSubmitting(true);

    try {
      const res = await fetch('https://triptogether-backend-f1j9.onrender.com/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          destinationId: selectedDest._id,
          startDate,
          endDate,
          budget: parseFloat(budget),
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create trip.');
      }

      // Reset form and close modal
      setTripForm({ startDate: '', endDate: '', budget: '', notes: '' });
      setIsModalOpen(false);
      
      // Redirect to dashboard to view the newly created trip
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const getLiveDuration = () => {
    if (!tripForm.startDate || !tripForm.endDate) return null;
    const start = new Date(tripForm.startDate);
    const end = new Date(tripForm.endDate);
    if (end < start) return 'Invalid dates';
    const diff = Math.abs(end - start);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
  };

  const categories = ['All', 'Adventure', 'Beach', 'Cultural', 'Nature', 'Urban'];
  const categoryEmojis = {
    All: '🗺️',
    Adventure: '🧗',
    Beach: '🏖️',
    Cultural: '🏛️',
    Nature: '🌲',
    Urban: '🏙️'
  };

  return (
    <>
      <div className="container page-container animate-fade-in">
      <div className="section-header">
        <span className="section-tag">Destinations</span>
        <h2 className="section-title">Find Your Perfect Escape</h2>
        <p className="section-desc">
          Browse through our handpicked travel spots. Choose from sunny beaches, historical cities, wilderness trails, or high-energy cities.
        </p>
      </div>

      <div className="destinations-layout">
        
        {/* Sidebar Filters */}
        <aside className="filter-sidebar glass-panel" style={{ borderRadius: 'var(--radius-md)', padding: '24px', alignSelf: 'start' }}>
          <div className="filter-section" style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Search</h4>
            <input
              type="text"
              placeholder="Search by keywords..."
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Categories</h4>
            <div className="category-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-full)',
                    background: category === cat ? 'var(--gradient-accent)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: category === cat ? 'white' : 'var(--text-primary)',
                    fontWeight: '600',
                    fontSize: '0.92rem',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                    boxShadow: category === cat ? 'var(--shadow-md)' : 'none'
                  }}
                  onMouseOver={(e) => {
                    if (category !== cat) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (category !== cat) {
                      e.currentTarget.style.background = 'var(--bg-primary)';
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  <span>{cat}</span>
                  <span style={{ fontSize: '1.15rem' }}>{categoryEmojis[cat]}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Catalog Grid */}
        <main>
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
              <p style={{ marginTop: '16px' }}>Loading destinations...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : destinations.length === 0 ? (
            <div className="no-trips">
              <h3>No Destinations Found</h3>
              <p>Try resetting filters or typing another keyword.</p>
              <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn btn-secondary">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="destinations-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px' }}>
              {destinations.map((dest) => (
                <div key={dest._id} className="dest-card animate-fade-in" onClick={() => handleAddTripClick(dest)}>
                  
                  {/* Card Image */}
                  <div className="dest-image-wrapper">
                    <img 
                      src={dest.image || 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80'} 
                      alt={dest.title} 
                      className="dest-img" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80'; }}
                    />
                  </div>

                  {/* Gradient Text Overlay */}
                  <div className="dest-card-gradient" />

                  {/* Top Glass Price Badge */}
                  <div className="starts-at-badge">
                    starts at {dest.costIndex ? dest.costIndex.replace(/\$/g, '₹') : '₹3,500'}
                  </div>

                  {/* Card Body */}
                  <div className="dest-body">
                    <h3 className="dest-title">{dest.title}</h3>
                    
                    <div className="dest-meta">
                      <span>{dest.category || 'Travel'}</span>
                      <span style={{ opacity: 0.5 }}>|</span>
                      <span>⭐ {Number(dest.rating || 4.7).toFixed(1)} (1k+)</span>
                    </div>

                    <div className="dest-location" style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="location-pin-icon">📍</span>
                        <span>{dest.country}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTripClick(dest);
                        }}
                        style={{
                          backgroundColor: '#f97316',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '100px',
                          padding: '6px 14px',
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        }}
                      >
                        + Plan Trip
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>

      {/* Add Trip Config Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Plan Trip to ${selectedDest?.title}`}
      >
        {formError && <div className="alert alert-danger">{formError}</div>}
        
        {getLiveDuration() && (
          <div style={{
            background: 'var(--bg-tertiary)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.95rem',
            fontWeight: '600',
            color: 'var(--color-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            border: '1px solid var(--border-color)',
            width: '100%',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            ✈ Estimated Duration: <strong>{getLiveDuration()}</strong>
          </div>
        )}
        
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="input-field"
              value={tripForm.startDate}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="input-field"
              value={tripForm.endDate}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="budget">Starting Budget (₹) *</label>
            <input
              type="number"
              id="budget"
              name="budget"
              placeholder="e.g. 1500"
              className="input-field"
              value={tripForm.budget}
              onChange={handleFormChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Itinerary Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="List down hotel details, flight info, or key sights..."
              className="input-field"
              value={tripForm.notes}
              onChange={handleFormChange}
              style={{ minHeight: '100px', resize: 'vertical' }}
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={formSubmitting}
          >
            {formSubmitting ? 'Creating Trip...' : 'Confirm & Create Trip'}
          </button>
        </form>
      </Modal>
    </>
  );
}
