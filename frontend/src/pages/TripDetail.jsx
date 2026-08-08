import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

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

  // Persistent Notes State
  const [notesText, setNotesText] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

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

  // Safety Notifications State
  const [safetyNotifications, setSafetyNotifications] = useState([]);

  const triggerSafetyNotification = (message) => {
    const id = Date.now() + Math.random().toString();
    setSafetyNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setSafetyNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  };

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

  // Update markers on locations change
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
      setNotesText(data.notes || '');
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

  const getBudgetRatio = () => {
    if (!trip || !trip.budget || trip.budget === 0) return 0;
    return (getTotalSpent() / trip.budget) * 100;
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
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
        <p style={{ marginTop: '20px' }}>Loading Trip Executive Dashboard...</p>
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
    <div className="trip-exec-dashboard-root animate-fade-in">
      <div className="container" style={{ maxWidth: '1380px', paddingBottom: '80px', paddingTop: '100px' }}>
        
        {/* Return Link */}
        <div style={{ marginBottom: '16px' }}>
          <Link to="/dashboard" className="exec-back-btn">
            ← Back to All Trips
          </Link>
        </div>

        {/* 1. TOP GREETING HEADER (Matching Reference Screenshot) */}
        <div className="exec-greeting-header">
          <h1 className="exec-greeting-title">
            Good {getGreetingTime()}, {user?.name ? user.name.split(' ')[0] : 'Traveler'}
          </h1>
          <p className="exec-greeting-sub">
            Stay on top of your travel expenses, itineraries, and room members for <strong>{trip.destination?.title || 'Trip Room'}</strong>.
          </p>
        </div>

        {/* 2. TOP GRID LAYOUT - 3 COLUMNS (Matching Reference Screenshot) */}
        <div className="exec-top-grid">
          
          {/* COLUMN 1: Total Trip Budget Card */}
          <div className="exec-card exec-budget-card">
            <div className="exec-card-top-row">
              <span className="exec-card-label">Total Trip Budget</span>
              <span className="exec-currency-badge">INR ₹</span>
            </div>

            <div className="exec-big-amount">
              ₹{trip.budget ? trip.budget.toLocaleString() : '0'}
            </div>

            <div className="exec-trend-pill">
              <span className="trend-arrow">↑</span> 
              <strong>{budgetRatio.toFixed(0)}%</strong> 
              <span>utilized than target limit</span>
            </div>

            {/* 2 Main Action Buttons */}
            <div className="exec-btn-row">
              <button className="exec-btn-primary" onClick={() => setIsExpenseModalOpen(true)}>
                ⇆ Log Expense
              </button>
              <button 
                className="exec-btn-secondary"
                onClick={() => {
                  if (trip.inviteCode) {
                    navigator.clipboard.writeText(trip.inviteCode);
                    alert(`Room Code copied: ${trip.inviteCode}`);
                  }
                }}
              >
                🔑 Code: {trip.inviteCode || 'N/A'}
              </button>
            </div>

            {/* Wallets / Total 3 Stats Section */}
            <div className="exec-wallets-section">
              <div className="wallets-header-title">Wallets | Total 3 stats</div>
              <div className="wallets-cards-row">
                <div className="wallet-mini-box">
                  <span className="wallet-flag-icon">🇮🇳</span>
                  <div>
                    <div className="wallet-name">Target</div>
                    <div className="wallet-num">₹{trip.budget?.toLocaleString()}</div>
                    <span className="wallet-status-dot active">Active</span>
                  </div>
                </div>

                <div className="wallet-mini-box">
                  <span className="wallet-flag-icon">💸</span>
                  <div>
                    <div className="wallet-name">Spent</div>
                    <div className="wallet-num">₹{totalSpent.toLocaleString()}</div>
                    <span className="wallet-status-dot active">Active</span>
                  </div>
                </div>

                <div className="wallet-mini-box">
                  <span className="wallet-flag-icon">🔒</span>
                  <div>
                    <div className="wallet-name">Balance</div>
                    <div className="wallet-num">₹{(trip.budget - totalSpent).toLocaleString()}</div>
                    <span className={`wallet-status-dot ${budgetRatio > 90 ? 'danger' : 'active'}`}>
                      {budgetRatio > 90 ? 'Warning' : 'Under Limit'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: 4-Quadrant Metric Cards Grid (Matching Reference Screenshot) */}
          <div className="exec-quadrant-grid">
            
            {/* Card 1: Vivid Orange Card! */}
            <div className="quad-card vivid-orange-quad">
              <div className="quad-header-row">
                <span>Total Spent</span>
                <div className="quad-icon-badge">👛</div>
              </div>
              <div className="quad-amount-text">₹{totalSpent.toLocaleString()}</div>
              <div className="quad-trend-text">↑ {budgetRatio.toFixed(0)}% This trip</div>
            </div>

            {/* Card 2: White/Dark Card */}
            <div className="quad-card">
              <div className="quad-header-row">
                <span>Total Remaining</span>
                <div className="quad-icon-badge">🔒</div>
              </div>
              <div className="quad-amount-text">₹{(trip.budget - totalSpent).toLocaleString()}</div>
              <div className="quad-trend-text warning">↓ {Math.max(0, 100 - budgetRatio).toFixed(0)}% Left</div>
            </div>

            {/* Card 3: White/Dark Card */}
            <div className="quad-card">
              <div className="quad-header-row">
                <span>Itinerary Events</span>
                <div className="quad-icon-badge">📅</div>
              </div>
              <div className="quad-amount-text">{totalEventsCount} Events</div>
              <div className="quad-trend-text success">↑ {getDaysCount()} Days Plan</div>
            </div>

            {/* Card 4: White/Dark Card */}
            <div className="quad-card">
              <div className="quad-header-row">
                <span>Room Members</span>
                <div className="quad-icon-badge">👥</div>
              </div>
              <div className="quad-amount-text">{trip.members?.length || 1} Active</div>
              <div className="quad-trend-text success">↑ Group Sync</div>
            </div>

          </div>

          {/* COLUMN 3: Category Allocation Bar Chart (Matching Reference Screenshot) */}
          <div className="exec-card exec-chart-card">
            <div className="exec-card-top-row" style={{ marginBottom: '12px' }}>
              <div>
                <h3 className="exec-card-title">Budget Allocation</h3>
                <p className="exec-card-sub">Category spending ratio across travel items</p>
              </div>
              <div className="chart-legend">
                <span className="legend-item"><span className="legend-dot orange"></span> Target</span>
                <span className="legend-item"><span className="legend-dot black"></span> Spent</span>
              </div>
            </div>

            {/* Custom Stacked Bar Chart SVG matching reference screenshot */}
            <div className="stacked-bar-chart-wrapper">
              {['Food', 'Transport', 'Lodging', 'Leisure', 'Shopping', 'Other'].map((cat, idx) => {
                const catSpent = expenses.filter(e => (e.category || 'Other') === cat).reduce((s, e) => s + e.amount, 0);
                const maxVal = Math.max(1, totalSpent);
                const spentHeightPercent = Math.min(100, Math.max(15, (catSpent / maxVal) * 100));
                
                return (
                  <div key={cat} className="bar-column">
                    <div className="bar-stack">
                      {/* Top Orange Segment */}
                      <div 
                        className="bar-segment-orange"
                        style={{ height: `${spentHeightPercent}%` }}
                      />
                      {/* Bottom Black Segment */}
                      <div 
                        className="bar-segment-black"
                        style={{ height: `${Math.max(20, 100 - spentHeightPercent)}%` }}
                      />
                    </div>
                    <span className="bar-label">{cat.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 3. BOTTOM GRID LAYOUT - 2 COLUMNS (Matching Reference Screenshot) */}
        <div className="exec-bottom-grid">
          
          {/* LEFT COLUMN: Spending Limit Gauge & My Cards */}
          <div className="exec-bottom-left-col">
            
            {/* Monthly Spending Limit Gauge */}
            <div className="exec-card limit-card">
              <h4 className="limit-card-title">Trip Spending Limit</h4>
              <div className="limit-progress-bar">
                <div 
                  className="limit-progress-fill" 
                  style={{ width: `${Math.min(budgetRatio, 100)}%` }}
                />
              </div>
              <div className="limit-labels-row">
                <span><strong>₹{totalSpent.toLocaleString()}</strong> spent out of</span>
                <span><strong>₹{trip.budget.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* My Cards / Traveler Member Cards matching reference photo */}
            <div className="exec-card my-cards-wrapper">
              <div className="my-cards-header">
                <span className="exec-card-title">💳 My Cards</span>
                <button className="add-radar-btn" onClick={() => setActiveTab('locations')}>
                  + Add Radar
                </button>
              </div>

              <div className="credit-cards-container">
                {/* Black Credit Card */}
                <div className="credit-card-item black-credit-card">
                  <div className="card-top-header">
                    <span className="card-chip-tag">📶 Active</span>
                    <div className="card-mastercard-circles">
                      <span className="c-red"></span>
                      <span className="c-yellow"></span>
                    </div>
                  </div>
                  <div className="card-number-display">**** **** 6782</div>
                  <div className="card-footer-info">
                    <div>
                      <span className="c-label">CARD MEMBER</span>
                      <div className="c-val">{user?.name ? user.name.toUpperCase() : 'TRAVELER'}</div>
                    </div>
                    <div>
                      <span className="c-label">EXP</span>
                      <div className="c-val">09/29</div>
                    </div>
                    <div>
                      <span className="c-label">CVV</span>
                      <div className="c-val">611</div>
                    </div>
                  </div>
                </div>

                {/* Vivid Orange Credit Card */}
                <div className="credit-card-item orange-credit-card">
                  <div className="card-top-header">
                    <span className="card-chip-tag">📶 Active</span>
                    <span className="card-sparkle">✨</span>
                  </div>
                  <div className="card-number-display">**** **** 4356</div>
                  <div className="card-footer-info">
                    <div>
                      <span className="c-label">DESTINATION</span>
                      <div className="c-val">{trip.destination?.title?.toUpperCase() || 'COLLAB ROOM'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Recent Activities Data Table (Matching Reference Screenshot) */}
          <div className="exec-card recent-activities-card">
            
            {/* Header + Search Bar */}
            <div className="activities-header-bar">
              <h3 className="exec-card-title">Recent Activities</h3>
              
              <div className="activities-search-controls">
                <div className="activities-search-input-box">
                  <span>🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search activity, expense..." 
                    value={activitiesSearchQuery}
                    onChange={(e) => setActivitiesSearchQuery(e.target.value)}
                  />
                </div>
                <button className="activities-filter-btn">
                  Filter ⚙️
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Expense Log | Timeline Itinerary | Packing Checklist | Shared Gallery | Safety Radar | AI Planner) */}
            <div className="exec-tabs-list">
              <button 
                className={`exec-tab-item ${activeTab === 'expenses' ? 'active' : ''}`}
                onClick={() => setActiveTab('expenses')}
              >
                📊 Expenses Log
              </button>
              <button 
                className={`exec-tab-item ${activeTab === 'itinerary' ? 'active' : ''}`}
                onClick={() => setActiveTab('itinerary')}
              >
                📅 Timeline Itinerary
              </button>
              <button 
                className={`exec-tab-item ${activeTab === 'packing' ? 'active' : ''}`}
                onClick={() => setActiveTab('packing')}
              >
                🎒 Checklist
              </button>
              <button 
                className={`exec-tab-item ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                📸 Shared Gallery
              </button>
              <button 
                className={`exec-tab-item ${activeTab === 'locations' ? 'active' : ''}`}
                onClick={() => setActiveTab('locations')}
              >
                📍 Safety Radar
              </button>
              <button 
                className={`exec-tab-item ${activeTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai')}
              >
                ✨ AI Planner
              </button>
            </div>

            {/* TAB VIEW 1: EXPENSE LOG TABLE (Matching Reference Screenshot) */}
            {activeTab === 'expenses' && (
              <div className="table-responsive-wrapper">
                {filteredExpenses.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No expense records found. Click "+ Log Expense" above to add transactions!
                  </div>
                ) : (
                  <table className="exec-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}><input type="checkbox" readOnly /></th>
                        <th>Order ID</th>
                        <th>Activity</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((exp, i) => (
                        <tr key={exp._id}>
                          <td><input type="checkbox" readOnly /></td>
                          <td className="code-cell">INV_0000{i + 70}</td>
                          <td className="activity-cell">
                            <span className="activity-icon-badge">
                              {exp.category === 'Food' ? '🍔' : 
                               exp.category === 'Transport' ? '✈️' : 
                               exp.category === 'Lodging' ? '🏨' : '🛍️'}
                            </span>
                            <strong>{exp.title}</strong>
                          </td>
                          <td className="price-cell">₹{exp.amount.toLocaleString()}</td>
                          <td>
                            <span className="status-badge completed">
                              • Completed
                            </span>
                          </td>
                          <td className="date-cell">{formatDate(exp.createdAt || Date.now())}</td>
                          <td>
                            <button className="table-delete-btn" onClick={() => handleDeleteExpense(exp._id)}>
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

            {/* TAB VIEW 2: TIMELINE ITINERARY */}
            {activeTab === 'itinerary' && (
              <div className="itinerary-view-container">
                <div className="day-selector-row">
                  {Array.from({ length: getDaysCount() }).map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setActiveDay(idx + 1)}
                      className={`day-pill-btn ${activeDay === idx + 1 ? 'active' : ''}`}
                    >
                      Day {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="day-timeline-list">
                  {dayActivities.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No activities planned for Day {activeDay}. Add one below!</p>
                  ) : (
                    dayActivities.map((act, idx) => (
                      <div key={idx} className="timeline-card-item">
                        <span className="timeline-node-dot"></span>
                        <div className="timeline-content">
                          <span className="time-badge">{act.time || 'All Day'}</span>
                          <h4>{act.activity}</h4>
                          {act.desc && <p>{act.desc}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Activity Form */}
                <form onSubmit={handleAddItinerary} className="inline-add-form">
                  <input
                    type="text"
                    placeholder="Time (e.g. 10:00 AM)"
                    className="input-field"
                    value={itineraryForm.time}
                    onChange={(e) => setItineraryForm({ ...itineraryForm, time: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Activity Name *"
                    className="input-field"
                    value={itineraryForm.activity}
                    onChange={(e) => setItineraryForm({ ...itineraryForm, activity: e.target.value })}
                    required
                  />
                  <button type="submit" className="exec-btn-primary" style={{ padding: '8px 16px' }}>
                    + Add Event
                  </button>
                </form>
              </div>
            )}

            {/* TAB VIEW 3: PACKING CHECKLIST */}
            {activeTab === 'packing' && (
              <div className="packing-view-container">
                <form onSubmit={handleAddPackingItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Add item (e.g. Passport, Camera)..."
                    className="input-field"
                    value={packingItem}
                    onChange={(e) => setPackingItem(e.target.value)}
                  />
                  <button type="submit" className="exec-btn-primary" style={{ padding: '8px 18px' }}>
                    Add Item
                  </button>
                </form>

                <div className="packing-items-grid">
                  {(trip.packingList || []).map((item) => (
                    <div key={item._id} className={`packing-card ${item.packed ? 'packed' : ''}`} onClick={() => handleTogglePackingItem(item._id)}>
                      <input type="checkbox" checked={item.packed} readOnly />
                      <span>{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 4: SHARED GALLERY */}
            {activeTab === 'gallery' && (
              <div className="gallery-view-container">
                <form onSubmit={handlePhotoSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    placeholder="Paste image URL..."
                    className="input-field"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                  <button type="submit" className="exec-btn-primary">
                    Upload
                  </button>
                </form>

                <div className="gallery-grid">
                  {(trip.photos || []).map((p, idx) => (
                    <img key={idx} src={p.url} alt="Trip Vacation" className="gallery-img-thumb" onClick={() => setActiveLightboxImage(p.url)} />
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 5: SAFETY RADAR */}
            {activeTab === 'locations' && (
              <div className="radar-view-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3>Live Safety Radar Map</h3>
                  {!isSharingLocation ? (
                    <button onClick={startSharingLocation} className="exec-btn-primary">
                      📍 Start Live Sharing
                    </button>
                  ) : (
                    <button onClick={stopSharingLocation} className="exec-btn-secondary" style={{ color: 'var(--color-danger)' }}>
                      🛑 Stop Sharing
                    </button>
                  )}
                </div>
                <div ref={mapRef} style={{ width: '100%', height: '380px', borderRadius: '16px' }} />
              </div>
            )}

            {/* TAB VIEW 6: AI PLANNER */}
            {activeTab === 'ai' && (
              <div className="ai-view-container" style={{ textAlign: 'center', padding: '30px 0' }}>
                <h3>✨ AI Itinerary Co-Pilot</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Generate an AI-suggested daily itinerary for {trip.destination?.title}.
                </p>
                <button onClick={fetchTripDetails} className="exec-btn-primary">
                  🤖 Generate AI Itinerary
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* LOG EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsExpenseModalOpen(false)}>
          <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log New Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div>
                <label>Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Flight booking, Hotel stay"
                  className="input-field"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  className="input-field"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Category</label>
                <select
                  className="input-field"
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
              <button type="submit" className="exec-btn-primary" disabled={expenseSubmitting}>
                {expenseSubmitting ? 'Saving...' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STYLES matching reference screenshot */}
      <style>{`
        .trip-exec-dashboard-root {
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-body);
        }

        .exec-back-btn {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .exec-back-btn:hover {
          color: var(--color-primary);
        }

        /* Greeting Header */
        .exec-greeting-header {
          margin-bottom: 28px;
        }

        .exec-greeting-title {
          font-family: var(--font-heading);
          font-size: 2.6rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .exec-greeting-sub {
          font-size: 1.05rem;
          color: var(--text-muted);
          margin: 0;
        }

        /* Top Grid - 3 Columns */
        .exec-top-grid {
          display: grid;
          grid-template-columns: 1.1fr 1.35fr 1.1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .exec-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }

        .exec-card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .exec-card-label {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .exec-currency-badge {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .exec-big-amount {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 4px 0 8px 0;
          letter-spacing: -0.5px;
        }

        .exec-trend-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .exec-btn-row {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }

        .exec-btn-primary {
          flex: 1;
          padding: 12px 18px;
          border-radius: 100px;
          background: var(--color-primary);
          color: #ffffff;
          border: none;
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(255, 107, 0, 0.35);
        }

        .exec-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 0, 0.5);
        }

        .exec-btn-secondary {
          flex: 1;
          padding: 12px 18px;
          border-radius: 100px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .exec-btn-secondary:hover {
          border-color: var(--color-primary);
        }

        /* Wallets Row */
        .exec-wallets-section {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
        }

        .wallets-header-title {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 12px;
        }

        .wallets-cards-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .wallet-mini-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 10px;
          border-radius: 14px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .wallet-name {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .wallet-num {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .wallet-status-dot {
          font-size: 0.68rem;
          font-weight: 700;
        }

        .wallet-status-dot.active {
          color: #10b981;
        }

        .wallet-status-dot.danger {
          color: #ef4444;
        }

        /* Quadrant Grid */
        .exec-quadrant-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .quad-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .vivid-orange-quad {
          background: linear-gradient(135deg, #ff6b00 0%, #ea580c 100%) !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: 0 10px 30px rgba(255, 107, 0, 0.35);
        }

        .vivid-orange-quad .quad-header-row span,
        .vivid-orange-quad .quad-amount-text,
        .vivid-orange-quad .quad-trend-text {
          color: #ffffff !important;
        }

        .quad-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.86rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .quad-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,0,0,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quad-amount-text {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 10px 0 4px 0;
        }

        .quad-trend-text {
          font-size: 0.78rem;
          font-weight: 600;
          color: #10b981;
        }

        .quad-trend-text.warning {
          color: #f59e0b;
        }

        /* Stacked Bar Chart */
        .exec-chart-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .exec-card-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
        }

        .exec-card-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 2px 0 0 0;
        }

        .chart-legend {
          display: flex;
          gap: 12px;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .legend-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 4px;
        }

        .legend-dot.orange { background: #ff6b00; }
        .legend-dot.black { background: #18181b; }

        .stacked-bar-chart-wrapper {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 180px;
          padding-top: 20px;
        }

        .bar-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .bar-stack {
          width: 24px;
          height: 140px;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: var(--bg-tertiary);
        }

        .bar-segment-orange {
          background: #ff6b00;
          width: 100%;
          transition: height 0.5s ease;
        }

        .bar-segment-black {
          background: #18181b;
          width: 100%;
          transition: height 0.5s ease;
        }

        .bar-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        /* Bottom Grid Layout */
        .exec-bottom-grid {
          display: grid;
          grid-template-columns: 1.1fr 2.4fr;
          gap: 20px;
        }

        .exec-bottom-left-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Limit Card */
        .limit-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .limit-progress-bar {
          width: 100%;
          height: 12px;
          background: var(--bg-tertiary);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .limit-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff6b00 0%, #ea580c 100%);
          border-radius: 100px;
          transition: width 0.5s ease;
        }

        .limit-labels-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        /* My Cards */
        .my-cards-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .add-radar-btn {
          background: none;
          border: 1px solid var(--border-color);
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        .credit-cards-container {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 12px;
        }

        .credit-card-item {
          border-radius: 20px;
          padding: 18px;
          height: 140px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #ffffff;
        }

        .black-credit-card {
          background: #121215;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .orange-credit-card {
          background: linear-gradient(135deg, #ff6b00 0%, #ea580c 100%);
        }

        .card-top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-chip-tag {
          font-size: 0.68rem;
          background: rgba(255,255,255,0.15);
          padding: 2px 8px;
          border-radius: 100px;
          font-weight: 700;
        }

        .card-mastercard-circles {
          display: flex;
        }

        .card-mastercard-circles .c-red {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ef4444;
        }

        .card-mastercard-circles .c-yellow {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f59e0b;
          margin-left: -6px;
        }

        .card-number-display {
          font-family: monospace;
          font-size: 0.95rem;
          letter-spacing: 2px;
          opacity: 0.9;
        }

        .card-footer-info {
          display: flex;
          gap: 16px;
        }

        .c-label {
          font-size: 0.6rem;
          opacity: 0.6;
          display: block;
        }

        .c-val {
          font-size: 0.72rem;
          font-weight: 700;
        }

        /* Recent Activities Data Table */
        .activities-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .activities-search-controls {
          display: flex;
          gap: 10px;
        }

        .activities-search-input-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 6px 14px;
          border-radius: 100px;
        }

        .activities-search-input-box input {
          border: none;
          background: transparent;
          outline: none;
          color: var(--text-primary);
          font-size: 0.85rem;
        }

        .activities-filter-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        .exec-tabs-list {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
          margin-bottom: 16px;
          overflow-x: auto;
        }

        .exec-tab-item {
          padding: 8px 16px;
          border-radius: 100px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .exec-tab-item.active {
          background: rgba(255, 107, 0, 0.12);
          color: #ff6b00;
        }

        /* Data Table */
        .exec-data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.88rem;
        }

        .exec-data-table th {
          padding: 12px 14px;
          color: var(--text-muted);
          font-weight: 600;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.8rem;
        }

        .exec-data-table td {
          padding: 14px;
          border-bottom: 1px solid var(--border-color);
        }

        .code-cell {
          font-family: monospace;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .activity-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .activity-icon-badge {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .price-cell {
          font-weight: 700;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .status-badge.completed {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
        }

        .table-delete-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1rem;
        }

        .table-delete-btn:hover {
          color: #ef4444;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 28px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header button {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 1.2rem;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .exec-top-grid {
            grid-template-columns: 1fr;
          }
          .exec-bottom-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

    </div>
  );
}
