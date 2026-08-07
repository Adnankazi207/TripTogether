import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

export default function TripDetail() {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active planning states
  const [activeTab, setActiveTab] = useState('expenses'); // expenses | itinerary | packing | gallery
  const [activeDay, setActiveDay] = useState(1);

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

    // Auto-remove after 8 seconds
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

  // 1. Load Leaflet dynamically when Safety Radar tab is open
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
        script.onload = () => {
          setLeafletLoaded(true);
        };
        document.head.appendChild(script);
      } else {
        if (window.L) {
          setLeafletLoaded(true);
        } else {
          const script = document.getElementById(scriptId);
          const oldOnload = script.onload;
          script.onload = (e) => {
            if (oldOnload) oldOnload(e);
            setLeafletLoaded(true);
          };
        }
      }
    }
  }, [activeTab]);

  // 2. Initialize Leaflet map instance
  useEffect(() => {
    if (activeTab === 'locations' && leafletLoaded && trip && mapRef.current) {
      const L = window.L;
      if (!L) return;

      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
        markersRef.current = {};
      }

      let mapCenter = [20.5937, 78.9629]; // Default: India
      let zoomLevel = 5;

      const activeLocations = trip.locations || [];
      if (activeLocations.length > 0) {
        mapCenter = [activeLocations[0].latitude, activeLocations[0].longitude];
        zoomLevel = 13;
      }

      const map = L.map(mapRef.current).setView(mapCenter, zoomLevel);
      leafletMapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

  // 3. Reactively update markers when locations list changes
  useEffect(() => {
    if (activeTab === 'locations' && leafletMapInstanceRef.current && trip) {
      updateMapMarkers(trip.locations || []);
    }
  }, [trip?.locations, activeTab]);

  // 4. Global Background Polling for live updates and Safety Radar alerts
  useEffect(() => {
    let intervalId = null;

    if (user && tripId) {
      const pollTripUpdates = async () => {
        try {
          const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
            }
          });
          if (res.ok) {
            const data = await res.json();
            
            setTrip(prev => {
              if (prev) {
                const oldLocs = prev.locations || [];
                const newLocs = data.locations || [];
                
                newLocs.forEach(newLoc => {
                  const newUserId = newLoc.user._id ? newLoc.user._id.toString() : newLoc.user.toString();
                  if (newUserId !== user.id) {
                    const wasSharing = oldLocs.some(oldLoc => {
                      const oldUserId = oldLoc.user._id ? oldLoc.user._id.toString() : oldLoc.user.toString();
                      return oldUserId === newUserId;
                    });
                    
                    if (!wasSharing) {
                      triggerSafetyNotification(`⚠️ Safety Alert: ${newLoc.userName} has activated their live location radar. Go to "Safety Radar" to see their map location!`);
                    }
                  }
                });
              }
              
              return {
                ...prev,
                locations: data.locations || [],
                members: data.members || [],
                photos: data.photos || (prev ? prev.photos : [])
              };
            });
          }
        } catch (err) {
          console.error('Global background polling error:', err);
        }
      };

      // Poll every 12 seconds in the background
      intervalId = setInterval(pollTripUpdates, 12000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user, tripId]);

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (geolocationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geolocationWatchIdRef.current);
      }
    };
  }, []);

  const updateMapMarkers = (activeLocations) => {
    const L = window.L;
    const map = leafletMapInstanceRef.current;
    if (!L || !map) return;

    const currentLocUserIds = activeLocations.map(loc => loc.user.toString());
    Object.keys(markersRef.current).forEach(userId => {
      if (!currentLocUserIds.includes(userId)) {
        markersRef.current[userId].remove();
        delete markersRef.current[userId];
      }
    });

    activeLocations.forEach(loc => {
      const userId = loc.user.toString();
      const isSelf = userId === user.id;

      const popupContent = `
        <div style="font-family: var(--font-primary); color: #000; padding: 4px;">
          <strong style="font-size: 0.9rem;">${loc.userName} ${isSelf ? '(You)' : ''}</strong><br/>
          <span style="font-size: 0.75rem; color: #64748b;">
            Last active: ${new Date(loc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      `;

      if (markersRef.current[userId]) {
        markersRef.current[userId].setLatLng([loc.latitude, loc.longitude]);
        markersRef.current[userId].setPopupContent(popupContent);
      } else {
        const markerColor = isSelf ? '#6366f1' : '#f43f5e';
        const markerIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="
              width: 14px; 
              height: 14px; 
              background-color: ${markerColor}; 
              border: 2px solid #fff; 
              border-radius: 50%;
              box-shadow: 0 0 8px ${markerColor}, 0 0 16px ${markerColor};
            "></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: markerIcon })
          .addTo(map)
          .bindPopup(popupContent);

        markersRef.current[userId] = marker;
      }
    });

    if (activeLocations.length > 1) {
      const bounds = L.latLngBounds(activeLocations.map(loc => [loc.latitude, loc.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (activeLocations.length === 1) {
      map.setView([activeLocations[0].latitude, activeLocations[0].longitude], 14);
    }
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
        setTrip(prev => ({
          ...prev,
          locations: updatedLocations
        }));
      }
    } catch (err) {
      console.error('Error uploading live location:', err);
    }
  };

  const startSharingLocation = () => {
    if (!navigator.geolocation) {
      setSharingError('Geolocation is not supported by your browser.');
      return;
    }

    setSharingError(null);
    setIsSharingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        uploadLocation(latitude, longitude);

        if (leafletMapInstanceRef.current) {
          leafletMapInstanceRef.current.setView([latitude, longitude], 14);
        }
      },
      (err) => {
        setSharingError(`Failed to get initial location: ${err.message}`);
        setIsSharingLocation(false);
      },
      { enableHighAccuracy: true }
    );

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        uploadLocation(latitude, longitude);
      },
      (err) => {
        console.error('Geolocation watch error:', err);
        setSharingError(`Location tracking error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    geolocationWatchIdRef.current = watchId;
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
        headers: {
          'Authorization': `Bearer ${user.token}`,
        }
      });
      if (res.ok) {
        const updatedLocations = await res.json();
        setTrip(prev => ({
          ...prev,
          locations: updatedLocations
        }));
      }
    } catch (err) {
      console.error('Error stopping location sharing:', err);
    }
  };

  const fetchTripDetails = async () => {
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!res.ok) throw new Error('Trip not found or unauthorized');
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
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
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

  // Helper calculation functions
  const getDaysCount = () => {
    if (!trip) return 0;
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
    if (!trip || trip.budget === 0) return 0;
    return (getTotalSpent() / trip.budget) * 100;
  };

  const getGroupedPackingList = () => {
    const grouped = {
      Documents: [],
      Clothing: [],
      Toiletries: [],
      Electronics: [],
      Other: [],
    };
    (trip?.packingList || []).forEach((item) => {
      const cat = item.category || 'Other';
      if (grouped[cat]) {
        grouped[cat].push(item);
      } else {
        grouped.Other.push(item);
      }
    });
    return grouped;
  };

  const getMeterColor = (ratio) => {
    if (ratio >= 90) return 'var(--color-danger)';
    if (ratio >= 75) return 'var(--color-warning)';
    return 'var(--color-secondary)';
  };

  // 🥧 Expense Analytics Chart Math
  const categoryColors = {
    Food: '#f43f5e',      // Rose/Red
    Transport: '#3b82f6', // Blue
    Lodging: '#10b981',   // Emerald/Green
    Leisure: '#8b5cf6',   // Violet/Purple
    Shopping: '#ec4899',  // Magenta/Pink
    Other: '#64748b',     // Slate/Gray
  };

  const getCategoryBreakdown = () => {
    const breakdown = {
      Food: 0,
      Transport: 0,
      Lodging: 0,
      Leisure: 0,
      Shopping: 0,
      Other: 0,
    };
    expenses.forEach((exp) => {
      const cat = exp.category || 'Other';
      breakdown[cat] = (breakdown[cat] || 0) + exp.amount;
    });
    return breakdown;
  };

  const renderConicPieChart = () => {
    const breakdown = getCategoryBreakdown();
    const grandTotal = getTotalSpent();

    if (grandTotal === 0) {
      return (
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '3px dashed var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          margin: '0 auto 20px',
          textAlign: 'center',
          padding: '16px',
        }}>
          No expenses logged yet.
        </div>
      );
    }

    let currentPercent = 0;
    const slices = [];

    Object.entries(breakdown).forEach(([cat, amount]) => {
      if (amount === 0) return;
      const percent = (amount / grandTotal) * 100;
      const start = currentPercent;
      const end = currentPercent + percent;
      currentPercent = end;
      slices.push(`${categoryColors[cat]} ${start}% ${end}%`);
    });

    return (
      <div style={{
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: `conic-gradient(${slices.join(', ')})`,
        margin: '0 auto 20px',
        boxShadow: 'var(--shadow-md), var(--shadow-glow)',
      }}></div>
    );
  };

  // Actions: Expense management
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) {
      alert('Please fill out all fields');
      return;
    }

    setExpenseFormSubmitting(true);
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

      if (!res.ok) throw new Error('Failed to create expense');
      
      setExpenseForm({ title: '', amount: '', category: 'Food' });
      await fetchTripExpenses();
    } catch (err) {
      alert(err.message);
    } finally {
      setExpenseFormSubmitting(false);
    }
  };

  const setExpenseFormSubmitting = (val) => {
    setExpenseSubmitting(val);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete expense');
      await fetchTripExpenses();
    } catch (err) {
      alert(err.message);
    }
  };

  // Actions: Notes saving
  const handleSaveNotes = async () => {
    setNotesSaving(true);
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          notes: notesText,
        }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
      const updated = await res.json();
      setTrip(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setNotesSaving(false);
    }
  };

  // Actions: Itinerary planning
  const handleAddItinerary = async (e) => {
    e.preventDefault();
    if (!itineraryForm.activity) {
      alert('Activity title is required');
      return;
    }

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
      currentItinerary.push({
        day: activeDay,
        activities: [newActivity],
      });
    }

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          itinerary: currentItinerary,
        }),
      });
      if (!res.ok) throw new Error('Failed to add activity');
      const updated = await res.json();
      setTrip(updated);
      setItineraryForm({ time: '', activity: '', desc: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteActivity = async (day, activityIndex) => {
    if (!window.confirm('Remove this activity from your schedule?')) return;
    const currentItinerary = [...(trip.itinerary || [])];
    const dayIndex = currentItinerary.findIndex((item) => item.day === day);

    if (dayIndex > -1) {
      currentItinerary[dayIndex].activities.splice(activityIndex, 1);
      if (currentItinerary[dayIndex].activities.length === 0) {
        currentItinerary.splice(dayIndex, 1);
      }
    }

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          itinerary: currentItinerary,
        }),
      });
      if (!res.ok) throw new Error('Failed to delete activity');
      const updated = await res.json();
      setTrip(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  // Actions: Packing checklist
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
        body: JSON.stringify({
          packingList: currentPacking,
        }),
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
      if (item._id === itemId) {
        return { ...item, packed: !item.packed };
      }
      return item;
    });

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          packingList: currentPacking,
        }),
      });
      if (!res.ok) throw new Error('Failed to toggle item');
      const updated = await res.json();
      setTrip(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePackingItem = async (itemId) => {
    const currentPacking = (trip.packingList || []).filter((item) => item._id !== itemId);

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          packingList: currentPacking,
        }),
      });
      if (!res.ok) throw new Error('Failed to delete item');
      const updated = await res.json();
      setTrip(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  // Actions: Shared Gallery Upload/Submit
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
      
      // Update trip state to include the new photo
      setTrip(prev => ({
        ...prev,
        photos: [...(prev.photos || []), newPhoto]
      }));
      setPhotoUrl('');
    } catch (err) {
      alert(err.message);
    } finally {
      setPhotoSubmitting(false);
    }
  };

  const handleGalleryImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setPhotoSubmitting(true);
      try {
        const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/photos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({ url: base64Data }),
        });

        if (!res.ok) throw new Error('Failed to upload image file');
        const newPhoto = await res.json();
        
        setTrip(prev => ({
          ...prev,
          photos: [...(prev.photos || []), newPhoto]
        }));
      } catch (err) {
        alert(err.message);
      } finally {
        setPhotoSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadImage = async (url, filename) => {
    try {
      if (url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'trip-photo.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'trip-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback: Open in new tab so they can right-click save if CORS blocks fetch
      window.open(url, '_blank');
    }
  };

  // Actions: AI Itinerary suggestion planner
  const handleGenerateAISuggestions = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}/ai-itinerary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to generate AI itinerary suggestions');
      const data = await res.json();
      setAiSuggestions(data);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAISuggestions = async () => {
    if (!aiSuggestions || aiSuggestions.length === 0) return;
    if (!window.confirm('⚠️ Warning: Applying the AI itinerary will overwrite all your current activities on those days. Do you want to proceed?')) {
      return;
    }

    try {
      const res = await fetch(`https://triptogether-backend-f1j9.onrender.com/api/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          itinerary: aiSuggestions,
        }),
      });

      if (!res.ok) throw new Error('Failed to save AI itinerary to trip');
      const updated = await res.json();
      setTrip(updated);
      setActiveDay(1);
      alert('✨ Success! The AI suggested itinerary has been applied to your trip timeline.');
      setAiSuggestions(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container page-container loader-container">
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
          {error || 'The requested trip does not exist or you are not authorized to view it.'}
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Active Day Activities
  const dayActivities = trip.itinerary?.find((d) => d.day === activeDay)?.activities || [];
  
  // Packing calculation
  const packedCount = trip.packingList?.filter((i) => i.packed).length || 0;
  const totalPackingCount = trip.packingList?.length || 0;
  const packingPercent = totalPackingCount > 0 ? Math.round((packedCount / totalPackingCount) * 100) : 0;

  const totalSpent = getTotalSpent();
  const budgetRatio = getBudgetRatio();
  const meterColor = getMeterColor(budgetRatio);

  return (
    <div className="container page-container animate-fade-in" style={{ paddingBottom: '80px' }}>
      
      {/* Return Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '500', transition: 'color var(--transition-fast)' }} className="nav-back-link">
          <span>←</span> Back to Dashboard
        </Link>
      </div>

      {/* Hero Banner Header */}
      <div className="trip-hero-banner">
        <img 
          src={trip.destination?.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'} 
          alt={trip.destination?.title} 
          className="trip-hero-img"
        />
        <div className="trip-hero-overlay">
          <div className="trip-hero-content-wrapper">
            <div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span className="trip-badge" style={{ background: 'var(--gradient-accent)' }}>
                  {trip.destination?.category}
                </span>
                {trip.inviteCode && (
                  <span 
                    className="trip-badge" 
                    style={{ 
                      background: 'rgba(15, 23, 42, 0.75)', 
                      border: '1px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(trip.inviteCode);
                      alert(`Trip Invite Code copied: ${trip.inviteCode}`);
                    }}
                    title="Click to copy invite code"
                  >
                    🔑 Group Code: <strong>{trip.inviteCode}</strong> (Copy)
                  </span>
                )}
              </div>
              <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2' }}>
                {trip.destination?.title || 'Custom Adventure'}
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '4px' }}>
                {trip.destination?.country || 'Personal Spot'} • {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ({getDaysCount()} Days)
              </p>

              {/* Overlapping Travelers badge initials list */}
              {trip.members && trip.members.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600' }}>Travelers:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {trip.members.map((member, idx) => (
                      <div 
                        key={member._id || idx}
                        title={member.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'var(--gradient-accent)',
                          border: '2px solid rgba(15, 23, 42, 0.8)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: idx > 0 ? '-8px' : '0',
                          boxShadow: 'var(--shadow-sm)',
                          zIndex: 10 - idx
                        }}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    ))}
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', marginLeft: '8px' }}>
                      {trip.members.map(m => m.name.split(' ')[0]).join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Weather Overlay Widget */}
            {(trip.liveWeather || trip.destination?.weather) && (
              <div className="glass-panel" style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                minWidth: '220px',
                textAlign: 'left',
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}>
                {trip.liveWeather ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '600' }}>Live Weather</span>
                      <img 
                        src={`https://openweathermap.org/img/wn/${trip.liveWeather.iconCode}@2x.png`} 
                        alt={trip.liveWeather.skies} 
                        style={{ width: '32px', height: '32px', display: 'block', margin: 0 }}
                      />
                    </div>
                    <strong style={{ fontSize: '1.5rem', lineHeight: '1' }}>{trip.liveWeather.temp}°C</strong>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', margin: '4px 0 2px', textTransform: 'capitalize' }}>
                      {trip.liveWeather.desc}
                    </span>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', margin: 0 }}>
                      💨 Wind: {trip.liveWeather.wind} m/s • 💧 Humid: {trip.liveWeather.humidity}%
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8' }}>Weather Forecast</span>
                      <span style={{ fontSize: '1.2rem' }}>
                        {trip.destination.weather.skies.includes('Sun') ? '☀️' : 
                         trip.destination.weather.skies.includes('Rain') ? '🌧️' : 
                         trip.destination.weather.skies.includes('Snow') ? '❄️' : '☁️'}
                      </span>
                    </div>
                    <strong style={{ fontSize: '1.25rem' }}>{trip.destination.weather.temp}°C</strong>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'block', margin: '4px 0 6px' }}>
                      {trip.destination.weather.skies}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', margin: 0, fontStyle: 'italic' }}>
                      {trip.destination.weather.tips}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div className="trip-detail-grid">
        
        {/* LEFT COLUMN: Financials, Pie Chart & Add Expense */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Budget Meter */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '16px' }}>Budget Analytics</h3>
            <div className="budget-status-section" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '16px' }}>
              <div className="budget-meter-labels" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                <span>Spent: <strong>₹{totalSpent.toLocaleString()}</strong></span>
                <span>Limit: <strong>₹{trip.budget.toLocaleString()}</strong></span>
              </div>
              <div className="budget-progress-bar-bg" style={{ width: '100%', height: '10px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div 
                  className="budget-progress-bar-fill"
                  style={{
                    width: `${Math.min(budgetRatio, 100)}%`,
                    height: '100%',
                    background: meterColor,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease',
                  }}
                ></div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
                {budgetRatio > 100 
                  ? `⚠️ Overbudget by ₹${(totalSpent - trip.budget).toLocaleString()}!` 
                  : `Remaining budget: ₹${(trip.budget - totalSpent).toLocaleString()} (${Math.round(100 - budgetRatio)}% left)`}
              </p>
            </div>
          </div>

          {/* Expense Categories Pie Chart */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'left' }}>Expense Distribution</h3>
            {renderConicPieChart()}
            
            {totalSpent > 0 && (
              <div className="trip-pie-legend">
                {Object.entries(getCategoryBreakdown()).map(([cat, amount]) => {
                  if (amount === 0) return null;
                  const pct = Math.round((amount / totalSpent) * 100);
                  return (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: categoryColors[cat] }}></span>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat}:</span>
                      <strong>₹{amount} ({pct}%)</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Expense Form */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '16px' }}>Log New Expense</h3>
            <form onSubmit={handleExpenseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="expTitle" style={{ fontSize: '0.8rem' }}>Expense Description *</label>
                <input
                  type="text"
                  id="expTitle"
                  placeholder="e.g. Sushi lunch, Uber ride"
                  className="input-field"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="trip-form-row">
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="expAmount" style={{ fontSize: '0.8rem' }}>Amount (₹) *</label>
                  <input
                    type="number"
                    id="expAmount"
                    placeholder="e.g. 45"
                    className="input-field"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="expCat" style={{ fontSize: '0.8rem' }}>Category</label>
                  <select
                    id="expCat"
                    className="input-field"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    <option value="Food">🍔 Food</option>
                    <option value="Transport">🚗 Transport</option>
                    <option value="Lodging">🏨 Lodging</option>
                    <option value="Leisure">🎭 Leisure</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }} disabled={expenseSubmitting}>
                {expenseSubmitting ? 'Logging...' : 'Add Expense'}
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: Tab views (Expenses list, Itinerary, Packing Checklist) & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Tab Selection Bar */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('expenses')}
              className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
            >
              📊 Expense Log
            </button>
            <button 
              onClick={() => setActiveTab('itinerary')}
              className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
            >
              📅 Timeline Itinerary
            </button>
            <button 
              onClick={() => setActiveTab('packing')}
              className={`tab-btn ${activeTab === 'packing' ? 'active' : ''}`}
            >
              🎒 Packing List
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            >
              📸 Shared Gallery
            </button>
            <button 
              onClick={() => setActiveTab('weather')}
              className={`tab-btn ${activeTab === 'weather' ? 'active' : ''}`}
            >
              ⛅ Weather Forecast
            </button>
            <button 
              onClick={() => setActiveTab('ai')}
              className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
            >
              ✨ AI Planner
            </button>
            <button 
              onClick={() => setActiveTab('locations')}
              className={`tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
            >
              📍 Safety Radar
            </button>
          </div>

          {/* TAB 1: EXPENSE LOG LIST */}
          {activeTab === 'expenses' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '20px' }}>Logged Expenses</h3>
              {expenses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No expenses logged for this trip yet.</p>
              ) : (
                <div className="expense-table-wrapper no-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <table className="expense-table">
                    <thead>
                      <tr>
                        <th>Expense</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp._id}>
                          <td style={{ fontWeight: '600' }}>{exp.title}</td>
                          <td>
                            <span className={`expense-category-tag cat-${exp.category}`}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ fontWeight: '700' }}>₹{exp.amount.toLocaleString()}</td>
                          <td>
                            <button onClick={() => handleDeleteExpense(exp._id)} className="expense-delete-btn">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ITINERARY BUILDER */}
          {activeTab === 'itinerary' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '16px' }}>Day-by-Day Timeline</h3>
              
              {/* Day Quick selector */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {Array.from({ length: getDaysCount() }).map((_, index) => {
                  const dayNum = index + 1;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => setActiveDay(dayNum)}
                      className={`tab-btn ${activeDay === dayNum ? 'active' : ''}`}
                      style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
                    >
                      Day {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Day Timeline Activities list */}
              <div className="no-scrollbar timeline-container" style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {dayActivities.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No activities logged for Day {activeDay} yet. Add some below!</p>
                ) : (
                  dayActivities.map((act, index) => (
                    <div key={index} className="timeline-item" style={{ position: 'relative' }}>
                      <span className="timeline-node"></span>
                      <div className="timeline-activity-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ display: 'inline-block', fontSize: '0.82rem', color: 'var(--color-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {act.time || 'All Day'}
                          </strong>
                          <h4 style={{ margin: '4px 0', fontSize: '1.05rem', fontWeight: '700' }}>{act.activity}</h4>
                          {act.desc && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0', lineHeight: '1.4' }}>{act.desc}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteActivity(activeDay, index)}
                          style={{ color: 'var(--color-danger)', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                        >
                          &times; Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Activity inline form */}
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <h4 style={{ marginBottom: '12px' }}>Add Day {activeDay} Activity</h4>
                <form onSubmit={handleAddItinerary} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="trip-form-row">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="actTime" style={{ fontSize: '0.75rem' }}>Time / Period</label>
                      <input
                        type="text"
                        id="actTime"
                        placeholder="e.g. 09:00 AM, Morning"
                        className="input-field"
                        value={itineraryForm.time}
                        onChange={(e) => setItineraryForm({ ...itineraryForm, time: e.target.value })}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="actTitle" style={{ fontSize: '0.75rem' }}>Activity Name *</label>
                      <input
                        type="text"
                        id="actTitle"
                        placeholder="e.g. Visit Museum, Dine at restaurant"
                        className="input-field"
                        value={itineraryForm.activity}
                        onChange={(e) => setItineraryForm({ ...itineraryForm, activity: e.target.value })}
                        required
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="actDesc" style={{ fontSize: '0.75rem' }}>Short Description (Optional)</label>
                    <input
                      type="text"
                      id="actDesc"
                      placeholder="e.g. Meet guide at main entrance"
                      className="input-field"
                      value={itineraryForm.desc}
                      onChange={(e) => setItineraryForm({ ...itineraryForm, desc: e.target.value })}
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px', fontSize: '0.85rem', width: 'fit-content', alignSelf: 'flex-start' }}>
                    Add Activity
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 3: PACKING CHECKLIST */}
          {activeTab === 'packing' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '4px' }}>Packing Checklist</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                Packed: <strong>{packedCount}</strong> of <strong>{totalPackingCount}</strong> ({packingPercent}%)
              </p>

              {/* Progress Bar */}
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', height: '6px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ width: `${packingPercent}%`, height: '100%', background: 'var(--gradient-accent)', transition: 'width 0.4s ease' }}></div>
              </div>

              {/* Packing list items list */}
              {totalPackingCount === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 0 20px' }}>No checklist items registered. Add some below!</p>
              ) : (
                <div 
                  className="no-scrollbar"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px', 
                    marginBottom: '24px',
                    maxHeight: '350px',
                    overflowY: 'auto'
                  }}
                >
                  {Object.entries(getGroupedPackingList()).map(([catName, items]) => {
                    if (items.length === 0) return null;
                    
                    const catEmojis = {
                      Documents: '📄',
                      Clothing: '👕',
                      Toiletries: '🧴',
                      Electronics: '🔌',
                      Other: '🎒',
                    };
                    
                    return (
                      <div key={catName} style={{ marginBottom: '8px' }}>
                        <h4 style={{ 
                          fontSize: '0.85rem', 
                          color: 'var(--color-secondary)', 
                          marginBottom: '8px', 
                          borderBottom: '1px solid var(--border-color)', 
                          paddingBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>{catEmojis[catName] || '📦'}</span> {catName}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {items.map((pack) => (
                            <div 
                              key={pack._id} 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '8px 12px', 
                                background: pack.packed ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-tertiary)',
                                border: pack.packed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all var(--transition-fast)'
                              }}
                            >
                              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, margin: 0, fontWeight: '500', fontSize: '0.85rem' }}>
                                <input
                                  type="checkbox"
                                  checked={pack.packed}
                                  onChange={() => handleTogglePackingItem(pack._id)}
                                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-secondary)' }}
                                />
                                <span style={{ textDecoration: pack.packed ? 'line-through' : 'none', color: pack.packed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                  {pack.item}
                                </span>
                              </label>
                              <button 
                                onClick={() => handleDeletePackingItem(pack._id)}
                                style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add checklist item form */}
              <form onSubmit={handleAddPackingItem} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: 0 }}>Add New Item</h4>
                <div className="trip-form-row">
                  <input
                    type="text"
                    placeholder="e.g. Passport, Chargers, Sunglasses..."
                    className="input-field"
                    value={packingItem}
                    onChange={(e) => setPackingItem(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    required
                  />
                  <select
                    className="input-field"
                    value={packingCategory}
                    onChange={(e) => setPackingCategory(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <option value="Documents">📄 Documents</option>
                    <option value="Clothing">👕 Clothing</option>
                    <option value="Toiletries">🧴 Toiletries</option>
                    <option value="Electronics">🔌 Electronics</option>
                    <option value="Other">🎒 Other</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%', marginTop: '4px' }}>
                  ➕ Add to Luggage
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: SHARED GALLERY */}
          {activeTab === 'gallery' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '4px' }}>📸 Shared Photo Gallery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Upload photos of your trip. Everyone in the group can view and download them!
              </p>

              {/* Photo Upload Options Grid */}
              <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Share a Photo</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', alignItems: 'end' }} className="trip-form-row">
                  {/* File Uploader */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="galleryUploadFile" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Upload Image File</label>
                    <input
                      type="file"
                      id="galleryUploadFile"
                      accept="image/*"
                      onChange={handleGalleryImageUpload}
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      disabled={photoSubmitting}
                    />
                  </div>

                  {/* Paste URL */}
                  <form onSubmit={handlePhotoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="galleryUploadUrl" style={{ fontSize: '0.75rem', fontWeight: '600' }}>Or Paste Image URL</label>
                      <input
                        type="url"
                        id="galleryUploadUrl"
                        placeholder="e.g. https://images.unsplash.com/..."
                        className="input-field"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        disabled={photoSubmitting}
                      />
                    </div>
                  </form>
                </div>

                {photoUrl.trim() && (
                  <button 
                    onClick={handlePhotoSubmit}
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem', marginTop: '16px', width: 'fit-content' }}
                    disabled={photoSubmitting}
                  >
                    {photoSubmitting ? 'Sharing...' : '🔗 Add pasted URL'}
                  </button>
                )}
              </div>

              {/* Photos Grid */}
              {(!trip.photos || trip.photos.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 0', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '2.5rem' }}>📷</span>
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: '10px 0 0' }}>
                    No photos shared in this room yet. Be the first to share one!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {trip.photos.map((photo) => (
                    <div 
                      key={photo._id} 
                      className="glass-panel" 
                      style={{ 
                        borderRadius: 'var(--radius-sm)', 
                        overflow: 'hidden', 
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <div style={{ height: '150px', overflow: 'hidden', background: '#0f172a' }}>
                        <img 
                          src={photo.url} 
                          alt={`Uploaded by ${photo.uploadedBy}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '12px', background: 'var(--bg-secondary)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                          Shared by: <strong>{photo.uploadedBy}</strong>
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                          🕒 {new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button
                            onClick={() => setActiveLightboxImage(photo)}
                            className="btn btn-secondary"
                            style={{ 
                              flex: 1, 
                              padding: '6px 8px', 
                              fontSize: '0.75rem', 
                              justifyContent: 'center',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            🔍 View Full
                          </button>
                          <button
                            onClick={() => handleDownloadImage(photo.url, `trip-${tripId}-${photo._id}.jpg`)}
                            className="btn btn-secondary"
                            style={{ 
                              flex: 1, 
                              padding: '6px 8px', 
                              fontSize: '0.75rem', 
                              justifyContent: 'center',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: WEATHER FORECAST */}
          {activeTab === 'weather' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '4px' }}>⛅ 5-Day Weather Forecast</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Stay prepared! Preview daily temperature shifts, weather conditions, wind indexes, and humidity levels for {trip.destination?.title || 'your destination'}.
              </p>

              {(!trip.liveForecast || trip.liveForecast.length === 0) ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No forecast logs available for this destination.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                  {trip.liveForecast.slice(0, Math.max(5, getDaysCount())).map((day, idx) => {
                    const forecastDate = new Date(day.date);
                    const isToday = idx === 0;

                    return (
                      <div 
                        key={idx} 
                        className="glass-panel" 
                        style={{ 
                          borderRadius: 'var(--radius-sm)', 
                          padding: '20px', 
                          border: isToday ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                          background: isToday ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-secondary)',
                          textAlign: 'center',
                          transition: 'transform var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <strong style={{ fontSize: '0.9rem', color: isToday ? 'var(--color-primary)' : 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                          {isToday ? '📅 Today' : forecastDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Day {idx + 1} of Trip
                        </span>

                        <div style={{ margin: '12px 0' }}>
                          {day.iconCode ? (
                            <img 
                              src={`https://openweathermap.org/img/wn/${day.iconCode}@2x.png`} 
                              alt={day.skies} 
                              style={{ width: '48px', height: '48px', margin: '0 auto', display: 'block' }}
                            />
                          ) : (
                            <span style={{ fontSize: '2.25rem', display: 'block' }}>{day.mockIcon || '☀️'}</span>
                          )}
                        </div>

                        <strong style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>
                          {day.temp}°C
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'capitalize', marginBottom: '12px' }}>
                          {day.desc}
                        </span>

                        <div style={{ 
                          borderTop: '1px solid var(--border-color)', 
                          paddingTop: '10px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '4px', 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)',
                          textAlign: 'left'
                        }}>
                          <span>💧 Humidity: <strong>{day.humidity}%</strong></span>
                          <span>💨 Wind: <strong>{day.wind} m/s</strong></span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AI ITINERARY PLANNER */}
          {activeTab === 'ai' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✨</span> AI Travel Itinerary Planner
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Let AI construct custom suggested plans for each day of your trip to {trip.destination?.title || 'this city'}. Preview the suggestions below and apply them to your active timeline!
              </p>

              {aiError && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>{aiError}</div>}

              {aiLoading ? (
                <div style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '40px',
                  textAlign: 'center',
                  border: '1px dashed var(--border-color)'
                }} className="animate-pulse">
                  <div className="loader" style={{ margin: '0 auto 16px' }}></div>
                  <strong style={{ color: 'var(--color-primary)' }}>🤖 AI is crafting your daily timeline...</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>Analyzing destination spots, category tags, and duration limits...</p>
                </div>
              ) : aiSuggestions ? (
                <div style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--color-primary)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '24px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>✨ AI Suggested Timeline Preview</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={handleApplyAISuggestions} 
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        💾 Save to Timeline
                      </button>
                      <button 
                        onClick={() => setAiSuggestions(null)} 
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {aiSuggestions.map((dayPlan) => (
                      <div key={dayPlan.day} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <strong style={{ color: 'var(--color-secondary)', fontSize: '0.95rem', display: 'block', marginBottom: '12px' }}>
                          📅 Day {dayPlan.day} Suggestions
                        </strong>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {dayPlan.activities.map((act, idx) => (
                            <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', gap: '10px' }}>
                              <span style={{ color: 'var(--color-primary)', fontWeight: '600', minWidth: '70px' }}>{act.time}</span>
                              <div>
                                <strong>{act.activity}</strong>
                                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>{act.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}>🤖</span>
                  <h4>Ready to plan your trip?</h4>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '450px', margin: '8px auto 24px' }}>
                    AI will design a complete, optimized day-by-day plan for {trip.destination?.title || 'your destination'} in seconds.
                  </p>
                  <button 
                    onClick={handleGenerateAISuggestions} 
                    className="btn btn-primary" 
                    style={{ padding: '12px 32px', fontSize: '0.95rem' }}
                  >
                    🤖 Generate AI Daily Plan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SAFETY RADAR */}
          {activeTab === 'locations' && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderRadius: 'var(--radius-md)' }}>
              <style>{`
                @keyframes radar-pulse {
                  0% { transform: scale(0.6); opacity: 0.9; }
                  100% { transform: scale(2.2); opacity: 0; }
                }
              `}</style>
              <h3 style={{ marginBottom: '4px' }}>📍 Safety Radar & Live Location</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                Share your live coordinates with other members of this trip room so nobody gets lost. Location updates are shared until you stop them.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                
                {/* Control Panel / Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Share Toggle */}
                  <div style={{ 
                    background: 'var(--bg-tertiary)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-sm)', 
                    padding: '20px', 
                    textAlign: 'center' 
                  }}>
                    {isSharingLocation ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        {/* Glowing Radar animation */}
                        <div style={{ position: 'relative', width: '60px', height: '60px', marginBottom: '8px' }}>
                          <span style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: 'rgba(244, 63, 94, 0.2)',
                            borderRadius: '50%',
                            left: 0, top: 0,
                            animation: 'radar-pulse 2s infinite ease-out'
                          }}></span>
                          <span style={{
                            position: 'absolute',
                            width: '60%',
                            height: '60%',
                            background: 'var(--color-danger)',
                            borderRadius: '50%',
                            left: '20%', top: '20%',
                          }}></span>
                          <span style={{
                            position: 'absolute',
                            color: '#fff',
                            fontSize: '20px',
                            left: '33%', top: '28%',
                          }}>📡</span>
                        </div>
                        <strong style={{ color: 'var(--color-danger)', fontSize: '0.95rem' }}>Location Sharing Active</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Updating your position in real-time...</p>
                        <button 
                          onClick={stopSharingLocation} 
                          className="btn btn-secondary" 
                          style={{ 
                            width: '100%', 
                            padding: '10px', 
                            background: 'rgba(244, 63, 94, 0.1)', 
                            border: '1px solid var(--color-danger)', 
                            color: 'var(--color-danger)',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          ⏹️ Stop Sharing
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛰️</div>
                        <strong style={{ fontSize: '0.95rem' }}>Radar Inactive</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Your coordinates are private. Share location for safety.</p>
                        <button 
                          onClick={startSharingLocation} 
                          className="btn btn-primary" 
                          style={{ width: '100%', padding: '10px', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                        >
                          📡 Start Sharing Live
                        </button>
                      </div>
                    )}

                    {sharingError && (
                      <div style={{ 
                        marginTop: '12px', 
                        padding: '8px 12px', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid var(--color-danger)', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.75rem', 
                        color: 'var(--color-danger)' 
                      }}>
                        ⚠️ {sharingError}
                      </div>
                    )}
                  </div>

                  {/* Active List */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--color-secondary)' }}>Active Radar ({trip.locations?.length || 0})</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }} className="no-scrollbar">
                      {(!trip.locations || trip.locations.length === 0) ? (
                        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem', margin: 0 }}>
                          Nobody is currently sharing location.
                        </p>
                      ) : (
                        trip.locations.map(loc => {
                          const isSelf = loc.user.toString() === user.id;
                          return (
                            <div 
                              key={loc._id || loc.user} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: 'var(--bg-secondary)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: 'var(--radius-sm)', 
                                padding: '10px 12px' 
                              }}
                            >
                              <span style={{ 
                                display: 'inline-block', 
                                width: '10px', 
                                height: '10px', 
                                borderRadius: '50%', 
                                background: isSelf ? '#6366f1' : '#f43f5e',
                                boxShadow: isSelf ? '0 0 8px #6366f1' : '0 0 8px #f43f5e'
                              }}></span>
                              <div style={{ flex: 1 }}>
                                <strong style={{ fontSize: '0.85rem', display: 'block' }}>
                                  {loc.userName} {isSelf ? '(You)' : ''}
                                </strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  Active: {new Date(loc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* Map Display */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!leafletLoaded ? (
                    <div style={{ 
                      height: '350px', 
                      background: 'var(--bg-tertiary)', 
                      border: '1px dashed var(--border-color)', 
                      borderRadius: 'var(--radius-sm)', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center', 
                      alignItems: 'center',
                      gap: '12px' 
                    }}>
                      <div className="loader"></div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading radar map utilities...</p>
                    </div>
                  ) : (
                    <div 
                      ref={mapRef} 
                      style={{ 
                        height: '350px', 
                        width: '100%', 
                        background: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-sm)', 
                        overflow: 'hidden',
                        zIndex: 10
                      }}
                    ></div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* Persistent Quick Travel Notes Section */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '4px' }}>Quick Travel Notes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>Store check-in directions, flight references, or coordinates.</p>
            <textarea
              className="input-field"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="e.g. Flight booking reference: XY1234. Hotel check-in at 3 PM..."
              style={{ minHeight: '100px', resize: 'vertical', fontSize: '0.9rem', marginBottom: '12px' }}
            ></textarea>
            <button onClick={handleSaveNotes} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} disabled={notesSaving}>
              {notesSaving ? 'Saving Notes...' : '💾 Save Notes'}
            </button>
          </div>

        </div>

      </div>

      {/* Lightbox Modal for Shared Gallery */}
      {activeLightboxImage && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveLightboxImage(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              &times;
            </button>

            {/* Lightbox Image */}
            <img 
              src={activeLightboxImage.url} 
              alt="Shared Gallery Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            />

            {/* Info and Actions inside Lightbox */}
            <div style={{ 
              textAlign: 'center', 
              color: '#fff',
              background: 'rgba(15, 23, 42, 0.65)',
              padding: '16px 24px',
              borderRadius: 'var(--radius-md)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '100%',
              minWidth: '280px',
              maxWidth: '500px'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>
                Shared by: <strong>{activeLightboxImage.uploadedBy}</strong>
              </p>
              <p style={{ margin: '4px 0 12px 0', fontSize: '0.75rem', color: '#cbd5e1' }}>
                🕒 {new Date(activeLightboxImage.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <button
                onClick={() => handleDownloadImage(activeLightboxImage.url, `trip-${tripId}-${activeLightboxImage._id}.jpg`)}
                className="btn btn-primary"
                style={{ 
                  margin: '0 auto', 
                  padding: '8px 24px', 
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}
              >
                ⬇️ Download Image
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Safety Radar Floating Notification Banners */}
      {safetyNotifications.length > 0 && createPortal(
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '380px',
          width: 'calc(100vw - 40px)'
        }}>
          <style>{`
            @keyframes slideInRight {
              0% { transform: translateX(120%); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }
          `}</style>
          {safetyNotifications.map(n => (
            <div 
              key={n.id}
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderLeft: '4px solid var(--color-danger)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(244, 63, 94, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                backdropFilter: 'blur(12px)',
                animation: 'slideInRight 0.3s ease-out'
              }}
            >
              <div style={{ fontSize: '0.85rem', lineHeight: '1.4', fontWeight: '500' }}>
                {n.message}
              </div>
              <button 
                onClick={() => setSafetyNotifications(prev => prev.filter(item => item.id !== n.id))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
              >
                &times;
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}

    </div>
  );
}
