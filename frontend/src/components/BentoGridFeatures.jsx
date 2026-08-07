import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function BentoGridFeatures() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for AI Chat mockup (Block 1)
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "🤖 Hello! I am your AI Co-Pilot. Click one of the preset prompts below to test my recommendations!" }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const triggerChatPreset = (presetText, replyText) => {
    if (isChatLoading) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: presetText }]);
    setIsChatLoading(true);

    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'ai', text: `🤖 ${replyText}` }]);
      setIsChatLoading(false);
    }, 1200);
  };

  // State for Expense control mockup (Block 2)
  const [budgetVal, setBudgetVal] = useState(50000);
  const [expenseVal, setExpenseVal] = useState(32000);
  const [customExpenseInput, setCustomExpenseInput] = useState("");

  const addExpense = (e) => {
    e.preventDefault();
    const val = parseFloat(customExpenseInput);
    if (!isNaN(val) && val > 0) {
      setExpenseVal(prev => prev + val);
      setCustomExpenseInput("");
    }
  };

  const expensePercent = Math.min(Math.round((expenseVal / budgetVal) * 100), 100);

  // State for Timeline checklist mockup (Block 3)
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Pack warm jackets for mountains", checked: true },
    { id: 2, text: "Preload Eiffel Tower Summit tickets", checked: false },
    { id: 3, text: "Transit hotel CDG check-in", checked: false }
  ]);

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const completedChecks = checklist.filter(c => c.checked).length;

  // State for Room Codes (Block 4)
  const [roomCode, setRoomCode] = useState("FR-P41");
  const [copied, setCopied] = useState(false);

  const generateNewRoom = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as 3-3 code
    const formatted = `${code.substring(0,3)}-${code.substring(3)}`;
    setRoomCode(formatted);
    setCopied(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // State for Search Destination guide simulation (Block 5)
  const [searchText, setSearchText] = useState("Paris Guide...");
  const [guideData, setGuideData] = useState(null);

  const generateGuide = () => {
    setGuideData({
      destination: "Paris, France",
      duration: "4 Days Recommended",
      season: "Ideal in Autumn / Spring",
      packing: "Light jackets, walking shoes, umbrella",
      description: "Experience the historic architectures along the Seine river. Don't miss Louvre at sunset."
    });
  };

  return (
    <section className="w-full py-16 px-4 md:px-8">
      {/* Bento Grid Header */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-3">
          Interactive Bento Dashboard
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Ultimate Visual Toolkit
        </h2>
        <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-sm md:text-base">
          Click, test, and interact with live simulations of the core features powering your group vacation.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(240px,_auto)]">
        
        {/* BLOCK 1: AI Co-Pilot Chat Console (Col span 2, Row span 1) */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-sky-400 uppercase tracking-widest block mb-1">🤖 AI Agent Console</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">AI Travel Co-Pilot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-lg">
              Interactively ask our Co-Pilot for transit, lodging, and packing guidance. Click a preset below to see it answer:
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            {/* Chat Box */}
            <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/40 h-[180px] overflow-y-auto flex flex-col gap-3 text-[11px] leading-relaxed">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-2.5 rounded-lg max-w-[85%] ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white self-end rounded-br-none' 
                      : 'bg-slate-200/60 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 self-start rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="text-slate-400 dark:text-slate-500 italic animate-pulse self-start">
                  🤖 Co-Pilot is typing...
                </div>
              )}
            </div>

            {/* Presets List */}
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => triggerChatPreset(
                  "Suggest best restaurants in Manali near Mall Road?",
                  "Try Johnson's Cafe for fresh Himalayan trout fish (5m walk from Mall) or Chopsticks for excellent Tibetan cuisine."
                )}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
              >
                🍽️ Manali Local Restaurant Guides?
              </button>
              <button 
                onClick={() => triggerChatPreset(
                  "What should I pack for Ladakh mountains in Autumn?",
                  "Pack thermal innerwear, down jackets, windcheaters, sunscreen, lip balm, and warm woolen socks. Temperature dips below zero."
                )}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
              >
                🎒 Mountain Packing Essentials list?
              </button>
              <button 
                onClick={() => triggerChatPreset(
                  "How to travel from Udaipur to Jodhpur transit?",
                  "Direct luxury Volvo buses or AC trains run daily (4-5 hours transit). Hiring a private taxi allows sightseeing Kumbalgarh Fort along the route."
                )}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
              >
                🚗 Udaipur to Jodhpur Transit guide?
              </button>
            </div>
          </div>
        </div>

        {/* BLOCK 2: Budget warning progress (Col span 1, Row span 2) - Tall block */}
        <div className="md:row-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block mb-1">💸 Budget Limit Warning</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Collaborative Ledger</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Track joint costs live in Rupees. Simulate adding an expense to watch the limit warning trigger:
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Live Meter Card */}
            <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Budget</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Expenses Log</span>
              </div>
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">₹{budgetVal.toLocaleString()}</span>
                <span className={`text-xl font-extrabold ${expensePercent >= 75 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  ₹{expenseVal.toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    expensePercent >= 90 
                      ? 'bg-red-600' 
                      : expensePercent >= 75 
                        ? 'bg-amber-500' 
                        : 'bg-blue-600'
                  }`}
                  style={{ width: `${expensePercent}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-500 dark:text-slate-400">Limit: {expensePercent}%</span>
                {expensePercent >= 75 && (
                  <span className="text-red-500 font-extrabold animate-pulse">⚠️ {expensePercent >= 90 ? 'OVER LIMIT WARNING' : '75% BUDGET ALERT'}</span>
                )}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={addExpense} className="flex gap-2">
              <input 
                type="number" 
                value={customExpenseInput}
                onChange={(e) => setCustomExpenseInput(e.target.value)}
                placeholder="Log cost (e.g. ₹5,000)..." 
                className="flex-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 bg-white dark:bg-slate-950 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
              />
              <button 
                type="submit" 
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-3 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-all"
              >
                Log
              </button>
            </form>

            <button 
              onClick={() => setExpenseVal(32000)}
              className="text-center text-[10px] text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Reset Simulation ledger
            </button>
          </div>
        </div>

        {/* BLOCK 3: Day-by-Day Checklist (Col span 1, Row span 1) */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block mb-1">📅 Itinerary Timeline</span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">Day-by-Day Checklists</h3>
            <span className="text-[10px] text-slate-400 block mb-3 font-semibold">Timeline Progress: {completedChecks}/{checklist.length}</span>
          </div>

          <div className="flex flex-col gap-2">
            {checklist.map(item => (
              <label 
                key={item.id} 
                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all border border-slate-100/50 dark:border-slate-800/30"
              >
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  onChange={() => toggleCheck(item.id)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span className={`text-[11px] font-medium leading-tight ${item.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* BLOCK 4: Group Share Code Generator (Col span 1, Row span 1) */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">👥 Cooperative Rooms</span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3">Group Share Codes</h3>
          </div>

          <div className="flex flex-col gap-3">
            {/* Display Code */}
            <div className="flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-700 p-2.5 rounded-lg">
              <div>
                <span className="text-[9px] text-slate-400 block font-semibold">ROOM SHARE CODE</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-sky-400 tracking-wider font-mono">{roomCode}</span>
              </div>
              <button 
                onClick={copyCode} 
                className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded text-xs hover:scale-105 active:scale-95 transition-all"
              >
                {copied ? '✅ Copied' : '📋 Copy'}
              </button>
            </div>

            <button 
              onClick={generateNewRoom}
              className="w-full bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold py-2 rounded-lg hover:opacity-90 active:scale-98 transition-all"
            >
              Generate New Code
            </button>
          </div>
        </div>

        {/* BLOCK 5: Search Typing simulation (Col span 1, Row span 1) */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">🔍 Destination Guides</span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">Smart Guide Generator</h3>
          </div>

          <div className="flex flex-col gap-2">
            {!guideData ? (
              <button 
                onClick={generateGuide}
                className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/20 text-xs font-semibold text-slate-700 dark:text-slate-300 text-left transition-all flex items-center justify-between"
              >
                <span>🔍 Paris Guide (Generate)</span>
                <span>✨</span>
              </button>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 text-[10px] leading-relaxed">
                <div className="flex justify-between font-extrabold text-indigo-600 mb-1">
                  <span>✨ {guideData.destination}</span>
                  <span>{guideData.duration}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                  {guideData.description}
                </p>
                <button 
                  onClick={() => setGuideData(null)}
                  className="mt-1 text-[9px] text-blue-600 dark:text-sky-400 hover:underline block"
                >
                  Clear guide
                </button>
              </div>
            )}
            
            <span className="text-[9px] text-slate-400 dark:text-slate-500">
              Generates custom stay limits, pack lists, and description metrics dynamically.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
