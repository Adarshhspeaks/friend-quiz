import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Create from './pages/Create.jsx';
import Play from './pages/Play.jsx';
import Results from './pages/Results.jsx';
import './styles.css';

function App() {
  return (
    <BrowserRouter>
      <header className="top">
        <Link to="/" className="logo">trust me?</Link>
      </header>
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
