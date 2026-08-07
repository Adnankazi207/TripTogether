import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTrips: 0,
    totalBudget: 0,
    totalSpent: 0,
    countriesVisited: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If not logged in, redirect to login page
    if (!user) {
      navigate('/login');
      return;
    }

    const calculateStats = async () => {
      try {
        // Fetch all trips
        const tripsRes = await fetch('http://localhost:5050/api/trips', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (!tripsRes.ok) throw new Error();
        const tripsData = await tripsRes.json();

        // Count different countries
        const countries = new Set();
        tripsData.forEach((t) => {
          if (t.destination && t.destination.country) {
            countries.add(t.destination.country);
          }
        });

        // Sum budgets
        const sumBudget = tripsData.reduce((acc, t) => acc + t.budget, 0);

        // Fetch expenses for each trip and sum
        let sumExpenses = 0;
        await Promise.all(
          tripsData.map(async (trip) => {
            const expRes = await fetch(`http://localhost:5050/api/trips/${trip._id}/expenses`, {
              headers: {
                'Authorization': `Bearer ${user.token}`,
              },
            });
            if (expRes.ok) {
              const expData = await expRes.json();
              const tripExpSum = expData.reduce((acc, e) => acc + e.amount, 0);
              sumExpenses += tripExpSum;
            }
          })
        );

        setStats({
          totalTrips: tripsData.length,
          totalBudget: sumBudget,
          totalSpent: sumExpenses,
          countriesVisited: countries.size,
        });

      } catch (err) {
        console.error('Failed to load profile statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container page-container animate-fade-in" style={{ maxWidth: '800px' }}>
      
      <div className="profile-card glass-panel">
        
        {/* Profile Header */}
        <div className="profile-header-group">
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="profile-name-group">
            <h2>{user.name}</h2>
            <p>Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
          </div>
        </div>

        {/* User Details Grid */}
        <h3 style={{ marginBottom: '20px' }}>Account Information</h3>
        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <label>Name</label>
            <p>{user.name}</p>
          </div>
          <div className="profile-detail-item">
            <label>Email Address</label>
            <p>{user.email}</p>
          </div>
        </div>

        {/* Travel Stats Panel */}
        <h3 style={{ marginBottom: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>Travel Stats</h3>
        {loading ? (
          <p>Analyzing travel logs...</p>
        ) : (
          <div className="stats-container" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: '100%', margin: 0 }}>
            <div className="stat-card">
              <div className="stat-number">{stats.totalTrips}</div>
              <div className="stat-label">Trips Planned</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.countriesVisited}</div>
              <div className="stat-label">Countries Visited</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">${stats.totalBudget.toLocaleString()}</div>
              <div className="stat-label">Total Budget Allocated</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: 'var(--color-secondary)' }}>
                ${stats.totalSpent.toLocaleString()}
              </div>
              <div className="stat-label">Total Budget Spent</div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
