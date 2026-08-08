import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TripDetail() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core State Management
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active planning states
  const [activeTab, setActiveTab] = useState('expenses'); // expenses | itinerary | packing | gallery | weather | ai | locations
  const [activeDay, setActiveDay] = useState(1);
  const [activitiesSearchQuery, setActivitiesSearchQuery] = useState('');

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  // Itinerary Form State
  const [itineraryForm, setItineraryForm] = useState({
    time: '',
    activity: '',
    desc: '',
  });

  // Packing Form State
  const [packingItem, setPackingItem] = useState('');
  const [packingCategory, setPackingCategory] = useState('Other');

  // Shared Gallery States
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoSubmitting, setPhotoSubmitting] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  // AI Itinerary States
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Safety Radar States & Refs
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [sharingError, setSharingError] = useState(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const geolocationWatchIdRef = useRef(null);

  useEffect(() => {
    if (user && tripId) {
      fetchTripDetails();
      fetchTripExpenses();
    }
  }, [user, tripId]);

  // Load Leaflet dynamically when Safety Radar tab is open
  useEffect(() => {
    if (activeTab === 'locations') {
      const linkId = 'leaflet-css';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const scriptId = 'leaflet-js';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => setLeafletLoaded(true);
        document.head.appendChild(script);
      } else {
        if (window.L) setLeafletLoaded(true);
      }
    }
  }, [activeTab]);

  // Initialize Leaflet map instance
  useEffect(() => {
    if (activeTab === 'locations' && leafletLoaded && trip && mapRef.current) {
      const L = window.L;
      if (!L) return;

      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
        markersRef.current = {};
      }

      let mapCenter = [20.5937, 78.9629];
      let zoomLevel = 5;

      const activeLocations = trip.locations || [];
      if (activeLocations.length > 0) {
        mapCenter = [activeLocations[0].latitude, activeLocations[0].longitude];
        zoomLevel = 13;
      }

      const map = L.map(mapRef.current).setView(mapCenter, zoomLevel);
      leafletMapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      updateMapMarkers(activeLocations);
    }

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
        markersRef.current = {};
      }
    };
  }, [activeTab, leafletLoaded, trip === null]);

  // Update map markers reactively
  useEffect(() => {
    if (activeTab === 'locations' && leafletMapInstanceRef.current && trip) {
      updateMapMarkers(trip.locations || []);
    }
  }, [trip?.locations, activeTab]);

  // Background Polling for Safety Radar
  useEffect(() => {
    let intervalId = null;
    if (user && tripId) {
      const pollTripUpdates = async () => {
        try {
          const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
            headers: { 'Authorization': `Bearer ${user.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setTrip(prev => ({
              ...prev,
              locations: data.locations || [],
              members: data.members || [],
              photos: data.photos || (prev ? prev.photos : [])
            }));
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      };
      intervalId = setInterval(pollTripUpdates, 12000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, tripId]);

  const updateMapMarkers = (activeLocations) => {
    const L = window.L;
    const map = leafletMapInstanceRef.current;
    if (!L || !map) return;

    activeLocations.forEach(loc => {
      const userId = loc.user.toString();
      const isSelf = userId === user.id;

      const popupContent = `
        <div style="font-family: var(--font-body); color: #000; padding: 4px;">
          <strong style="font-size: 0.9rem;">${loc.userName} ${isSelf ? '(You)' : ''}</strong><br/>
          <span style="font-size: 0.75rem; color: #64748b;">
            Updated: ${new Date(loc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      `;

      if (markersRef.current[userId]) {
        markersRef.current[userId].setLatLng([loc.latitude, loc.longitude]);
        markersRef.current[userId].setPopupContent(popupContent);
      } else {
        const markerColor = isSelf ? '#ff6b00' : '#ea580c';
        const markerIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="width: 14px; height: 14px; background-color: ${markerColor}; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 8px ${markerColor};"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: markerIcon })
          .addTo(map)
          .bindPopup(popupContent);

        markersRef.current[userId] = marker;
      }
    });
  };

  const uploadLocation = async (latitude, longitude) => {
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (res.ok) {
        const updatedLocations = await res.json();
        setTrip(prev => ({ ...prev, locations: updatedLocations }));
      }
    } catch (err) {
      console.error('Location upload error:', err);
    }
  };

  const startSharingLocation = () => {
    if (!navigator.geolocation) {
      setSharingError('Geolocation not supported');
      return;
    }
    setSharingError(null);
    setIsSharingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => uploadLocation(pos.coords.latitude, pos.coords.longitude),
      (err) => { setSharingError(err.message); setIsSharingLocation(false); },
      { enableHighAccuracy: true }
    );

    geolocationWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => uploadLocation(pos.coords.latitude, pos.coords.longitude),
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const stopSharingLocation = async () => {
    setIsSharingLocation(false);
    if (geolocationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geolocationWatchIdRef.current);
      geolocationWatchIdRef.current = null;
    }
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/location`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const updatedLocations = await res.json();
        setTrip(prev => ({ ...prev, locations: updatedLocations }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTripDetails = async () => {
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Trip not found');
      const data = await res.json();
      setTrip(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTripExpenses = async () => {
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/expenses`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getDaysCount = () => {
    if (!trip) return 1;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTotalSpent = () => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  };

  const getCategoryTotal = (catName) => {
    return expenses
      .filter(e => (e.category || 'Other').toLowerCase() === catName.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getBudgetRatio = () => {
    if (!trip || !trip.budget || trip.budget === 0) return 0;
    return (getTotalSpent() / trip.budget) * 100;
  };

  // Actions
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) return;

    setExpenseSubmitting(true);
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: expenseForm.title,
          amount: parseFloat(expenseForm.amount),
          category: expenseForm.category,
        }),
      });
      if (!res.ok) throw new Error('Failed to log expense');
      setExpenseForm({ title: '', amount: '', category: 'Food' });
      setIsExpenseModalOpen(false);
      await fetchTripExpenses();
    } catch (err) {
      alert(err.message);
    } finally {
      setExpenseSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      await fetchTripExpenses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddItinerary = async (e) => {
    e.preventDefault();
    if (!itineraryForm.activity) return;

    const currentItinerary = [...(trip.itinerary || [])];
    let dayIndex = currentItinerary.findIndex((item) => item.day === activeDay);
    const newActivity = {
      time: itineraryForm.time,
      activity: itineraryForm.activity,
      desc: itineraryForm.desc,
    };

    if (dayIndex > -1) {
      currentItinerary[dayIndex].activities.push(newActivity);
    } else {
      currentItinerary.push({ day: activeDay, activities: [newActivity] });
    }

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ itinerary: currentItinerary }),
      });
      if (!res.ok) throw new Error('Failed to update itinerary');
      const updated = await res.json();
      setTrip(updated);
      setItineraryForm({ time: '', activity: '', desc: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddPackingItem = async (e) => {
    e.preventDefault();
    if (!packingItem.trim()) return;

    const currentPacking = [...(trip.packingList || [])];
    currentPacking.push({
      item: packingItem.trim(),
      category: packingCategory,
      packed: false,
    });

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ packingList: currentPacking }),
      });
      if (!res.ok) throw new Error('Failed to add item');
      const updated = await res.json();
      setTrip(updated);
      setPackingItem('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTogglePackingItem = async (itemId) => {
    const currentPacking = (trip.packingList || []).map((item) => {
      if (item._id === itemId) return { ...item, packed: !item.packed };
      return item;
    });

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ packingList: currentPacking }),
      });
      if (!res.ok) throw new Error('Failed to toggle item');
      const updated = await res.json();
      setTrip(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    setPhotoSubmitting(true);
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ url: photoUrl.trim() }),
      });
      if (!res.ok) throw new Error('Failed to upload photo');
      const newPhoto = await res.json();
      setTrip(prev => ({ ...prev, photos: [...(prev.photos || []), newPhoto] }));
      setPhotoUrl('');
    } catch (err) {
      alert(err.message);
    } finally {
      setPhotoSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-container loader-container" style={{ paddingTop: '140px', minHeight: '70vh' }}>
        <span className="loader"></span>
        <p style={{ marginTop: '20px' }}>Loading Trip Dashboard...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container page-container" style={{ textAlign: 'center', paddingTop: '160px' }}>
        <h2 style={{ marginBottom: '16px' }}>Oops! Trip details could not be loaded</h2>
        <p className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
          {error || 'Trip does not exist or unauthorized'}
        </p>
        <Link to="/dashboard" className="btn btn-primary">Return to Dashboard</Link>
      </div>
    );
  }

  const totalSpent = getTotalSpent();
  const budgetRatio = getBudgetRatio();
  const dayActivities = trip.itinerary?.find((d) => d.day === activeDay)?.activities || [];
  const totalEventsCount = trip.itinerary?.reduce((acc, curr) => acc + (curr.activities?.length || 0), 0) || 0;

  // Filtered expenses based on search bar
  const filteredExpenses = expenses.filter(exp => 
    exp.title.toLowerCase().includes(activitiesSearchQuery.toLowerCase()) ||
    exp.category.toLowerCase().includes(activitiesSearchQuery.toLowerCase())
  );

  return (
    <div className="fintrix-dashboard-root animate-fade-in">
      <div className="fintrix-container">
        
        {/* Top Breadcrumb Header Bar matching reference screenshot */}
        <div className="fintrix-top-bar">
          <div className="fintrix-breadcrumb">
            <span className="nav-arrow">‹</span>
            <span className="nav-arrow">›</span>
            <span>TripTogether</span>
            <span className="sep">/</span>
            <span className="active-crumb">Dashboard</span>
          </div>

          <div className="fintrix-top-actions">
            <button className="time-filter-pill">
              This Month ▾
            </button>
            <button 
              className="reset-btn"
              onClick={() => {
                if (trip.inviteCode) {
                  navigator.clipboard.writeText(trip.inviteCode);
                  alert(`Invite Code copied: ${trip.inviteCode}`);
                }
              }}
            >
              ↻ Code: {trip.inviteCode || 'N/A'}
            </button>
            <div className="avatar-circle-icon">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <button 
              className="share-orange-btn"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Trip Room link copied to clipboard!');
              }}
            >
              Share 🔗
            </button>
          </div>
        </div>

        {/* Title Header */}
        <div className="fintrix-header-section">
          <h1 className="fintrix-main-title">Overview</h1>
          <p className="fintrix-sub-title">Here is the summary of overall data for <strong>{trip.destination?.title || 'Trip Room'}</strong></p>
        </div>

        {/* TOP ROW - 3 CARDS (Matching Reference Screenshot) */}
        <div className="fintrix-top-cards-grid">
          
          {/* Card 1: Vivid Orange Card ("My balance") */}
          <div className="fintrix-card orange-hero-card">
            <div className="card-top-row">
              <div className="card-title-group">
                <div className="card-icon-box">👛</div>
                <div>
                  <div className="card-label-title">My balance</div>
                  <div className="card-label-sub">Wallet Overview & Spending</div>
                </div>
              </div>
              <span className="card-more-dots">•••</span>
            </div>

            <div className="card-big-amount">
              ₹{trip.budget ? trip.budget.toLocaleString() : '0'}
            </div>

            <div className="card-trend-tag green">
              +{budgetRatio.toFixed(1)}% ↑
            </div>

            <div className="card-footer-link" onClick={() => setIsExpenseModalOpen(true)}>
              <span>See details</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: Savings Account ("Total Spent") */}
          <div className="fintrix-card">
            <div className="card-top-row">
              <div className="card-title-group">
                <div className="card-icon-box dark">🐷</div>
                <div>
                  <div className="card-label-title">Total Spent</div>
                  <div className="card-label-sub">Logged Trip Expenses</div>
                </div>
              </div>
              <span className="card-more-dots">•••</span>
            </div>

            <div className="card-big-amount">
              ₹{totalSpent.toLocaleString()}
            </div>

            <div className="card-trend-tag green">
              +{expenses.length} items ↑
            </div>

            <div className="card-footer-link" onClick={() => setActiveTab('expenses')}>
              <span>View summary</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Investment Portfolio ("Remaining Balance") */}
          <div className="fintrix-card">
            <div className="card-top-row">
              <div className="card-title-group">
                <div className="card-icon-box dark">📈</div>
                <div>
                  <div className="card-label-title">Remaining Balance</div>
                  <div className="card-label-sub">Trip Reserve & Safety</div>
                </div>
              </div>
              <span className="card-more-dots">•••</span>
            </div>

            <div className="card-big-amount">
              ₹{(trip.budget - totalSpent).toLocaleString()}
            </div>

            <div className="card-trend-tag green">
              +{Math.max(0, 100 - budgetRatio).toFixed(1)}% ↑
            </div>

            <div className="card-footer-link" onClick={() => setActiveTab('locations')}>
              <span>Analyze performance</span>
              <span>→</span>
            </div>
          </div>

        </div>

        {/* MIDDLE ROW - 2 COLUMNS (Matching Reference Screenshot) */}
        <div className="fintrix-middle-grid">
          
          {/* Left Column: My Wallet (Category Ratios Grid) */}
          <div className="fintrix-card my-wallet-section">
            <div className="section-header-row">
              <div>
                <h3 className="section-title-text">My Wallet</h3>
                <span className="section-subtitle-text">Category Totals · 4 Main Expenses</span>
              </div>
              <button className="add-new-orange-btn" onClick={() => setIsExpenseModalOpen(true)}>
                + Add New
              </button>
            </div>

            <div className="wallet-grid-2x2">
              {/* Box 1: Food */}
              <div className="wallet-mini-card">
                <div className="mini-card-top">
                  <span className="curr-code">🍔 FOOD</span>
                  <span className="more-icon">⋮</span>
                </div>
                <div className="mini-card-val">₹{getCategoryTotal('Food').toLocaleString()}</div>
                <div className="mini-card-sub">Limit is ₹10k a month</div>
                <span className="active-dot-status active">Active</span>
              </div>

              {/* Box 2: Transport */}
              <div className="wallet-mini-card">
                <div className="mini-card-top">
                  <span className="curr-code">✈️ TRANS</span>
                  <span className="more-icon">⋮</span>
                </div>
                <div className="mini-card-val">₹{getCategoryTotal('Transport').toLocaleString()}</div>
                <div className="mini-card-sub">Limit is ₹10k a month</div>
                <span className="active-dot-status active">Active</span>
              </div>

              {/* Box 3: Lodging */}
              <div className="wallet-mini-card">
                <div className="mini-card-top">
                  <span className="curr-code">🏨 HOTEL</span>
                  <span className="more-icon">⋮</span>
                </div>
                <div className="mini-card-val">₹{getCategoryTotal('Lodging').toLocaleString()}</div>
                <div className="mini-card-sub">Limit is ₹10k a month</div>
                <span className="active-dot-status active">Active</span>
              </div>

              {/* Box 4: Leisure / Other */}
              <div className="wallet-mini-card">
                <div className="mini-card-top">
                  <span className="curr-code">🎭 LEISURE</span>
                  <span className="more-icon">⋮</span>
                </div>
                <div className="mini-card-val">₹{getCategoryTotal('Leisure').toLocaleString()}</div>
                <div className="mini-card-sub">Limit is ₹7.5k a month</div>
                <span className="active-dot-status inactive">Inactive</span>
              </div>
            </div>
          </div>

          {/* Right Column: Cash Flow / Expense Analytics Chart */}
          <div className="fintrix-card cash-flow-section">
            <div className="section-header-row">
              <div>
                <h3 className="section-title-text">Expense Analytics</h3>
              </div>
              <div className="chart-toggle-pills">
                <button className="toggle-pill">Monthly</button>
                <button className="toggle-pill active">Yearly</button>
              </div>
            </div>

            <div className="cash-flow-amount">
              ₹{totalSpent.toLocaleString()}
            </div>

            {/* Orange Bar Chart matching reference screenshot */}
            <div className="orange-bar-chart-container">
              {['Food', 'Trans', 'Hotel', 'Leisure', 'Shop', 'Other', 'Total'].map((cat, idx) => {
                const catSpent = idx === 6 ? totalSpent : getCategoryTotal(cat);
                const maxVal = Math.max(1, totalSpent);
                const heightPercent = idx === 6 ? 90 : Math.min(90, Math.max(20, (catSpent / maxVal) * 90));
                
                return (
                  <div key={cat} className="orange-bar-col">
                    <div 
                      className="orange-bar-fill" 
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="orange-bar-year">{cat}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* BOTTOM ROW - RECENT ACTIVITIES & PLANNING TABS (Matching Reference Screenshot) */}
        <div className="fintrix-card recent-activities-section">
          
          <div className="activities-header-row">
            <h3 className="section-title-text">Recent Activities</h3>
            
            <div className="search-filter-controls">
              <div className="fintrix-search-input">
                <span>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={activitiesSearchQuery}
                  onChange={(e) => setActivitiesSearchQuery(e.target.value)}
                />
              </div>
              <button className="fintrix-filter-btn">
                Filter ⚙️
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Expense Log | Timeline Itinerary | Packing Checklist | Shared Gallery | Safety Radar | AI Planner) */}
          <div className="fintrix-tabs-row">
            <button className={`fintrix-tab ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
              📊 Expenses Log
            </button>
            <button className={`fintrix-tab ${activeTab === 'itinerary' ? 'active' : ''}`} onClick={() => setActiveTab('itinerary')}>
              📅 Day Timeline
            </button>
            <button className={`fintrix-tab ${activeTab === 'packing' ? 'active' : ''}`} onClick={() => setActiveTab('packing')}>
              🎒 Checklist
            </button>
            <button className={`fintrix-tab ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>
              📸 Gallery
            </button>
            <button className={`fintrix-tab ${activeTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveTab('locations')}>
              📍 Radar Map
            </button>
            <button className={`fintrix-tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
              ✨ AI Planner
            </button>
          </div>

          {/* DATA TABLES / TAB VIEWS */}
          {activeTab === 'expenses' && (
            <div className="fintrix-table-wrapper">
              {filteredExpenses.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#a1a1aa' }}>
                  No logged transactions. Click "+ Add New" above to log expenses!
                </div>
              ) : (
                <table className="fintrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}><input type="checkbox" readOnly /></th>
                      <th>Activity</th>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp, i) => (
                      <tr key={exp._id}>
                        <td><input type="checkbox" readOnly /></td>
                        <td className="activity-col">
                          <span className="activity-app-icon">
                            {exp.category === 'Food' ? '🍔' : 
                             exp.category === 'Transport' ? '✈️' : 
                             exp.category === 'Lodging' ? '🏨' : '🛍️'}
                          </span>
                          <strong>{exp.title}</strong>
                        </td>
                        <td className="order-id-col">INV_0000{i + 73}</td>
                        <td className="date-col">{formatDate(exp.createdAt || Date.now())}</td>
                        <td className="price-col">₹{exp.amount.toLocaleString()}</td>
                        <td>
                          <span className="status-badge completed">
                            • Completed
                          </span>
                        </td>
                        <td>
                          <button className="delete-row-btn" onClick={() => handleDeleteExpense(exp._id)}>
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: ITINERARY TIMELINE */}
          {activeTab === 'itinerary' && (
            <div className="fintrix-itinerary-container">
              <div className="day-pills-bar">
                {Array.from({ length: getDaysCount() }).map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setActiveDay(idx + 1)}
                    className={`day-pill ${activeDay === idx + 1 ? 'active' : ''}`}
                  >
                    Day {idx + 1}
                  </button>
                ))}
              </div>

              <div className="itinerary-timeline-list">
                {dayActivities.length === 0 ? (
                  <p style={{ color: '#a1a1aa' }}>No activities for Day {activeDay}. Add one below!</p>
                ) : (
                  dayActivities.map((act, idx) => (
                    <div key={idx} className="timeline-row-item">
                      <span className="time-tag">{act.time || 'All Day'}</span>
                      <div className="act-details">
                        <h4>{act.activity}</h4>
                        {act.desc && <p>{act.desc}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddItinerary} className="inline-add-row">
                <input
                  type="text"
                  placeholder="Time (e.g. 09:00 AM)"
                  className="fintrix-input"
                  value={itineraryForm.time}
                  onChange={(e) => setItineraryForm({ ...itineraryForm, time: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Activity Title *"
                  className="fintrix-input"
                  value={itineraryForm.activity}
                  onChange={(e) => setItineraryForm({ ...itineraryForm, activity: e.target.value })}
                  required
                />
                <button type="submit" className="add-new-orange-btn">
                  + Add Event
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PACKING CHECKLIST */}
          {activeTab === 'packing' && (
            <div className="fintrix-packing-container">
              <form onSubmit={handleAddPackingItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Add item (e.g. Passport, Sunglasses)..."
                  className="fintrix-input"
                  value={packingItem}
                  onChange={(e) => setPackingItem(e.target.value)}
                />
                <button type="submit" className="add-new-orange-btn">
                  Add Item
                </button>
              </form>

              <div className="packing-items-grid">
                {(trip.packingList || []).map((item) => (
                  <div key={item._id} className={`packing-card-box ${item.packed ? 'packed' : ''}`} onClick={() => handleTogglePackingItem(item._id)}>
                    <input type="checkbox" checked={item.packed} readOnly />
                    <span>{item.item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SHARED GALLERY */}
          {activeTab === 'gallery' && (
            <div className="fintrix-gallery-container">
              <form onSubmit={handlePhotoSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Paste vacation photo URL..."
                  className="fintrix-input"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
                <button type="submit" className="add-new-orange-btn">
                  Upload Photo
                </button>
              </form>

              <div className="gallery-grid">
                {(trip.photos || []).map((p, idx) => (
                  <img key={idx} src={p.url} alt="Trip Photo" className="gallery-thumb" onClick={() => setActiveLightboxImage(p.url)} />
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SAFETY RADAR */}
          {activeTab === 'locations' && (
            <div className="fintrix-radar-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3>Live Safety Radar Map</h3>
                {!isSharingLocation ? (
                  <button onClick={startSharingLocation} className="add-new-orange-btn">
                    📍 Start Live Sharing
                  </button>
                ) : (
                  <button onClick={stopSharingLocation} className="reset-btn" style={{ color: '#ef4444' }}>
                    🛑 Stop Sharing
                  </button>
                )}
              </div>
              <div ref={mapRef} style={{ width: '100%', height: '380px', borderRadius: '16px' }} />
            </div>
          )}

          {/* TAB 6: AI PLANNER */}
          {activeTab === 'ai' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <h3>✨ AI Itinerary Co-Pilot</h3>
              <p style={{ color: '#a1a1aa', marginBottom: '20px' }}>Generate smart itineraries for {trip.destination?.title}.</p>
              <button onClick={fetchTripDetails} className="add-new-orange-btn">
                🤖 Generate AI Schedule
              </button>
            </div>
          )}

        </div>

      </div>

      {/* LOG EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fintrix-modal-overlay" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="fintrix-modal-box animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Log New Expense</h3>
              <button className="close-btn" onClick={() => setIsExpenseModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label className="input-label">Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Flight booking, Hotel stay"
                  className="fintrix-input"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  className="fintrix-input"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label">Category</label>
                <select
                  className="fintrix-input"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  <option value="Food">🍔 Food</option>
                  <option value="Transport">✈️ Transport</option>
                  <option value="Lodging">🏨 Lodging</option>
                  <option value="Leisure">🎭 Leisure</option>
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
              <button type="submit" className="add-new-orange-btn" disabled={expenseSubmitting}>
                {expenseSubmitting ? 'Saving...' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STYLES matching reference screenshot UI & Responsive Math */}
      <style>{`
        .fintrix-dashboard-root {
          background: #09090b;
          color: #ffffff;
          min-height: 100vh;
          padding-top: 90px;
          padding-bottom: 80px;
          font-family: var(--font-body);
        }

        [data-theme='light'] .fintrix-dashboard-root {
          background: #f8fafc;
          color: #09090b;
        }

        .fintrix-container {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Top Bar */
        .fintrix-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .fintrix-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #a1a1aa;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .active-crumb {
          color: #ffffff;
          font-weight: 700;
        }

        [data-theme='light'] .active-crumb {
          color: #09090b;
        }

        .fintrix-top-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .time-filter-pill, .reset-btn {
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.1);
          color: #ffffff;
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        [data-theme='light'] .time-filter-pill, [data-theme='light'] .reset-btn {
          background: #ffffff;
          border-color: #e4e4e7;
          color: #09090b;
        }

        .avatar-circle-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ff6b00;
          color: #ffffff;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .share-orange-btn {
          background: #ff6b00;
          color: #ffffff;
          border: none;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(255, 107, 0, 0.4);
        }

        /* Header Section */
        .fintrix-header-section {
          margin-bottom: 24px;
        }

        .fintrix-main-title {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }

        .fintrix-sub-title {
          font-size: 1rem;
          color: #a1a1aa;
          margin: 0;
        }

        /* Fintrix Cards Base */
        .fintrix-card {
          background: #121215;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
        }

        [data-theme='light'] .fintrix-card {
          background: #ffffff;
          border-color: #e4e4e7;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }

        /* Top 3 Cards Grid */
        .fintrix-top-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .orange-hero-card {
          background: linear-gradient(135deg, #ff6b00 0%, #ea580c 100%) !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: 0 10px 30px rgba(255, 107, 0, 0.35);
        }

        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-title-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .card-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .card-icon-box.dark {
          background: #18181b;
        }

        .card-label-title {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .card-label-sub {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .card-more-dots {
          opacity: 0.6;
          cursor: pointer;
        }

        .card-big-amount {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          margin: 20px 0 6px 0;
          letter-spacing: -0.5px;
        }

        .card-trend-tag {
          font-size: 0.82rem;
          font-weight: 700;
        }

        .card-trend-tag.green {
          color: #10b981;
        }

        .orange-hero-card .card-trend-tag.green {
          color: #ffffff;
        }

        .card-footer-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          opacity: 0.9;
        }

        .card-footer-link:hover {
          opacity: 1;
        }

        /* Middle Grid */
        .fintrix-middle-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.9fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-title-text {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
        }

        .section-subtitle-text {
          font-size: 0.8rem;
          color: #a1a1aa;
          display: block;
        }

        .add-new-orange-btn {
          background: #ff6b00;
          color: #ffffff;
          border: none;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(255, 107, 0, 0.3);
        }

        .add-new-orange-btn:hover {
          background: #ff8533;
        }

        .wallet-grid-2x2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .wallet-mini-card {
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px;
        }

        [data-theme='light'] .wallet-mini-card {
          background: #f8fafc;
          border-color: #e4e4e7;
        }

        .mini-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .curr-code {
          font-weight: 800;
          font-size: 0.8rem;
        }

        .mini-card-val {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 800;
          margin: 8px 0 2px 0;
        }

        .mini-card-sub {
          font-size: 0.7rem;
          color: #a1a1aa;
          margin-bottom: 10px;
        }

        .active-dot-status {
          font-size: 0.72rem;
          font-weight: 700;
        }

        .active-dot-status.active {
          color: #ff6b00;
        }

        .active-dot-status.inactive {
          color: #ef4444;
        }

        /* Cash Flow Chart */
        .chart-toggle-pills {
          display: flex;
          gap: 4px;
          background: #18181b;
          padding: 4px;
          border-radius: 100px;
        }

        .toggle-pill {
          background: transparent;
          border: none;
          color: #a1a1aa;
          padding: 4px 14px;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
        }

        .toggle-pill.active {
          background: #ff6b00;
          color: #ffffff;
        }

        .cash-flow-amount {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .orange-bar-chart-container {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 180px;
          padding-top: 10px;
        }

        .orange-bar-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .orange-bar-fill {
          width: 32px;
          background: #ff6b00;
          border-radius: 8px 8px 4px 4px;
          transition: height 0.5s ease;
        }

        .orange-bar-year {
          font-size: 0.78rem;
          color: #a1a1aa;
          font-weight: 600;
        }

        /* Recent Activities Section */
        .activities-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .search-filter-controls {
          display: flex;
          gap: 10px;
        }

        .fintrix-search-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px 14px;
          border-radius: 100px;
        }

        [data-theme='light'] .fintrix-search-input {
          background: #f8fafc;
          border-color: #e4e4e7;
        }

        .fintrix-search-input input {
          border: none;
          background: transparent;
          outline: none;
          color: inherit;
          font-size: 0.85rem;
        }

        .fintrix-filter-btn {
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.08);
          color: inherit;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .fintrix-tabs-row {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding-bottom: 12px;
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .fintrix-tab {
          background: transparent;
          border: none;
          color: #a1a1aa;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .fintrix-tab.active {
          background: rgba(255, 107, 0, 0.15);
          color: #ff6b00;
        }

        /* Fintrix Table */
        .fintrix-table-wrapper {
          overflow-x: auto;
        }

        .fintrix-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .fintrix-table th {
          padding: 12px 14px;
          color: #a1a1aa;
          font-weight: 600;
          font-size: 0.8rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .fintrix-table td {
          padding: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .activity-col {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .activity-app-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #18181b;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .order-id-col {
          font-family: monospace;
          color: #a1a1aa;
        }

        .price-col {
          font-weight: 700;
        }

        .status-badge.completed {
          color: #10b981;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .delete-row-btn {
          background: none;
          border: none;
          color: #a1a1aa;
          cursor: pointer;
          font-size: 1rem;
        }

        .delete-row-btn:hover {
          color: #ef4444;
        }

        /* Inline Forms */
        .fintrix-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.08);
          color: #ffffff;
          font-size: 0.9rem;
          outline: none;
        }

        [data-theme='light'] .fintrix-input {
          background: #ffffff;
          border-color: #e4e4e7;
          color: #09090b;
        }

        .fintrix-input:focus {
          border-color: #ff6b00;
        }

        .input-label {
          font-size: 0.82rem;
          color: #a1a1aa;
          display: block;
          margin-bottom: 6px;
        }

        /* Modal Overlay */
        .fintrix-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fintrix-modal-box {
          background: #121215;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 28px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .modal-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
        }

        /* Timeline & Checklist UI */
        .day-pills-bar {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .day-pill {
          padding: 6px 14px;
          border-radius: 100px;
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.08);
          color: inherit;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .day-pill.active {
          background: #ff6b00;
          color: #ffffff;
          border-color: #ff6b00;
        }

        .itinerary-timeline-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 20px;
        }

        .timeline-row-item {
          display: flex;
          gap: 14px;
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.06);
          padding: 14px;
          border-radius: 14px;
        }

        .time-tag {
          font-size: 0.78rem;
          font-weight: 700;
          color: #ff6b00;
          white-space: nowrap;
        }

        .act-details h4 {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
        }

        .act-details p {
          margin: 0;
          font-size: 0.82rem;
          color: #a1a1aa;
        }

        .inline-add-row {
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 10px;
        }

        .packing-items-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .packing-card-box {
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .packing-card-box.packed span {
          text-decoration: line-through;
          opacity: 0.5;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .gallery-thumb {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 14px;
          cursor: pointer;
        }

        /* Responsive Breakpoints matching user requirement */
        @media (max-width: 1024px) {
          .fintrix-top-cards-grid {
            grid-template-columns: 1fr;
          }
          .fintrix-middle-grid {
            grid-template-columns: 1fr;
          }
          .packing-items-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .fintrix-top-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          .wallet-grid-2x2 {
            grid-template-columns: 1fr;
          }
          .inline-add-row {
            grid-template-columns: 1fr;
          }
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

    </div>
  );
}
