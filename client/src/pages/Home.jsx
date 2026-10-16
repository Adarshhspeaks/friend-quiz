import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      navigate(`/create?name=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/create');
    }
  }

  return (
    <section className="stack center" style={{ gap: '22px', marginTop: '12px' }}>
      {/* Hero Badge */}
      <div className="doodle-badge floating" style={{ background: 'var(--lemon)', transform: 'rotate(-2deg)' }}>
        <span>🔥</span>
        <span>The Viral Friendship Test</span>
      </div>

      {/* Main Headline */}
      <h1 className="big">
        Which friends <span className="scribble">actually</span> know you?
      </h1>

      <p className="lead" style={{ maxWidth: '460px' }}>
        Create a 10-question quiz about yourself. Share the link with your friends and see who is a <strong>Real Bestie 👑</strong> vs a <strong>Fake Friend 🚨</strong>!
      </p>

      {/* Name Input & Start Card */}
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ maxWidth: '420px', width: '100%', gap: '16px', marginTop: '6px' }}
      >
        <div className="tape-accent" />
        <label className="field">
          Enter your name to start:
          <input
            placeholder="e.g. Alex, Sam, Adarsh..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus
          />
        </label>

        <button type="submit" className="btn pink" style={{ fontSize: '1.15rem', width: '100%' }}>
          ⚡ Start Creating My Quiz
        </button>
      </form>

      <span className="hint">10 prebuilt questions ready to customize • Takes under 1 minute</span>
    </section>
  );
}
