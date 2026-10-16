import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Create from './pages/Create.jsx';
import Play from './pages/Play.jsx';
import Results from './pages/Results.jsx';
import { isMuted, toggleSound } from './utils/sound.js';
import './styles.css';

function Header() {
  const location = useLocation();
  const isCreate = location.pathname === '/create';
  const [muted, setMuted] = useState(() => isMuted());

  function handleSoundClick() {
    const next = toggleSound();
    setMuted(next);
  }

  return (
    <header className="top">
      <Link to="/" className="logo">
        <span>✨</span>
        <span>Trust Me?</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          className="sound-toggle"
          onClick={handleSoundClick}
          title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        {!isCreate && (
          <Link to="/create" className="btn-sm swap" style={{ textDecoration: 'none' }}>
            ✏️ Make Quiz
          </Link>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/q/:id" element={<Play />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<App />);
