import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AICopilot() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const activeTrip = trips.find(t => t._id === selectedTripId);

  // Fetch user's trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/trips', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch trips');
        const data = await res.json();
        setTrips(data);
        if (data.length > 0) {
          // Default to first trip
          setSelectedTripId(data[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTrips(false);
      }
    };

    if (user) {
      fetchTrips();
    }
  }, [user]);

  // Reset chat messages when trip changes
  useEffect(() => {
    if (activeTrip) {
      const cityName = activeTrip.destination?.title || 'your destination';
      setMessages([
        {
          role: 'assistant',
          text: `🤖 **Hello ${user.name.split(' ')[0]}!** I am your AI Travel Co-Pilot.\n\nI have loaded details about your upcoming trip to **${cityName}** (${activeTrip.destination?.category || 'Urban'} style).\n\nHow can I help you today? You can ask me about routes, must-see sights, packing recommendations, or local restaurants!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setMessages([]);
    }
  }, [selectedTripId, trips]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const msgText = textToSend || inputMessage;
    if (!msgText.trim() || !selectedTripId) return;

    if (!textToSend) {
      setInputMessage('');
    }

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...messages, { role: 'user', text: msgText, time: userTime }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Build history for API (excluding the current user message)
      const chatHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch(`http://localhost:5050/api/trips/${selectedTripId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          message: msgText,
          history: chatHistory
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'AI failed to respond');
      }
      const data = await res.json();
      
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ **Server Error:** ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMarkdown = (text) => {
    // Basic Markdown helper for bolding (**text**) and bullet points (* point)
    return text.split('\n').map((line, idx) => {
      let content = line;
      
      // Bold matches
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        parts.push(content.substring(lastIndex, match.index));
        parts.push(<strong key={match.index}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(content.substring(lastIndex));
      
      // Bullet list item
      if (line.trim().startsWith('* ')) {
        return (
          <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px', listStyleType: 'disc' }}>
            {parts.length > 0 ? parts : line.substring(2)}
          </li>
        );
      }
      
      // Numbered list item
      if (/^\d+\.\s/.test(line.trim())) {
        const dotIdx = line.indexOf('.');
        return (
          <li key={idx} style={{ marginLeft: '20px', marginBottom: '6px', listStyleType: 'decimal' }}>
            {parts.length > 0 ? parts : line.substring(dotIdx + 2)}
          </li>
        );
      }

      return (
        <p key={idx} style={{ marginBottom: line.trim() === '' ? '12px' : '6px', minHeight: line.trim() === '' ? '10px' : 'auto' }}>
          {parts}
        </p>
      );
    });
  };

  return (
    <div className="container page-container animate-fade-in" style={{ paddingBottom: '40px', maxWidth: '960px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✨ AI Travel Co-Pilot</h1>
        <p style={{ color: 'var(--text-muted)' }}>Discuss transit, attractions, and local cuisine with your intelligent travel companion.</p>
      </div>

      {loadingTrips ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span className="loader"></span>
          <p style={{ marginTop: '16px' }}>Synchronizing your travel documents...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎒</div>
          <h3 style={{ marginBottom: '12px' }}>No Active Trips Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 24px' }}>
            You need an active trip in your schedule to discuss itineraries with your AI Co-Pilot. Let's create your first adventure!
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Create a Trip Room
          </Link>
        </div>
      ) : (
        <div className="trip-detail-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
          
          {/* Trip Selector Toolbar */}
          <div className="glass-panel" style={{ padding: '16px 24px', borderRadius: 'var(--radius-md)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1 }}>
              <span style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Select Trip:</span>
              <select 
                value={selectedTripId} 
                onChange={(e) => setSelectedTripId(e.target.value)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 16px',
                  color: 'var(--text-primary)',
                  fontWeight: '500',
                  outline: 'none',
                  flexGrow: 1,
                  maxWidth: '320px'
                }}
              >
                {trips.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.destination?.title || 'Custom Trip'} ({new Date(t.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' })})
                  </option>
                ))}
              </select>
            </div>
            
            {activeTrip && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="trip-badge" style={{ background: 'var(--gradient-accent)', padding: '6px 12px', fontSize: '0.85rem' }}>
                  {activeTrip.destination?.category}
                </span>
                <span className="trip-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', fontSize: '0.85rem' }}>
                  Invite Code: {activeTrip.inviteCode}
                </span>
              </div>
            )}
          </div>

          {/* Main Chat Box */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '600px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
            
            {/* Chat Body */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.01)' }}>
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div 
                    style={{
                      background: msg.role === 'user' ? 'var(--gradient-accent)' : 'var(--bg-tertiary)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      padding: '14px 18px',
                      borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      boxShadow: 'var(--shadow-sm)',
                      fontSize: '0.98rem',
                      lineHeight: '1.5'
                    }}
                  >
                    {renderMarkdown(msg.text)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                    {msg.time}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div style={{ display: 'flex', alignSelf: 'flex-start', gap: '6px', padding: '12px 18px', background: 'var(--bg-tertiary)', borderRadius: '20px 20px 20px 4px', alignItems: 'center' }}>
                  <div className="typing-dot" style={{ animationDelay: '0s' }}></div>
                  <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                  <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggesters */}
            {activeTrip && (
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', gap: '10px', overflowX: 'auto', whiteSpace: 'nowrap' }} className="no-scrollbar">
                <button 
                  onClick={() => handleSendMessage(`What are the best transit routes and how do I travel around ${activeTrip.destination?.title || 'the city'}?`)}
                  className="tab-btn" 
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}
                >
                  🗺️ Best Routes
                </button>
                <button 
                  onClick={() => handleSendMessage(`What are the top attractions and places to visit in ${activeTrip.destination?.title || 'the area'}?`)}
                  className="tab-btn" 
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}
                >
                  🏛️ Places to Visit
                </button>
                <button 
                  onClick={() => handleSendMessage(`What signature foods, dishes, or restaurants should I try in ${activeTrip.destination?.title || 'the city'}?`)}
                  className="tab-btn" 
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}
                >
                  🍔 Must-Try Foods
                </button>
                <button 
                  onClick={() => handleSendMessage(`Can you give me a packing checklist and tips for this ${activeTrip.destination?.category || 'Urban'} trip?`)}
                  className="tab-btn" 
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}
                >
                  🎒 Packing Tips
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={activeTrip ? `Ask your travel co-pilot about ${activeTrip.destination?.title || 'your trip'}...` : 'Select a trip to begin...'}
                disabled={!activeTrip}
                rows={1}
                style={{
                  flexGrow: 1,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  maxHeight: '100px'
                }}
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || !activeTrip}
                className="btn btn-primary"
                style={{
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-sm)',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Send
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                </svg>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Typing Dot CSS Inject */}
      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-muted);
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>

    </div>
  );
}
