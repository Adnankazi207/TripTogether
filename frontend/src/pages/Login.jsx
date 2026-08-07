import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Clear errors on load
  useEffect(() => {
    setError(null);
  }, []);

  // Determine redirection path
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') ? `/${queryParams.get('redirect')}` : '/dashboard';

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate(redirectPath);
    }
  };

  return (
    <div className="container page-container auth-layout">
      <div className="auth-card glass-panel animate-fade-in">
        
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to start planning your next travel itinerary</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            Log In
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}
