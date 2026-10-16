import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [samplePick, setSamplePick] = useState(null);

  const sampleOptions = [
    { text: '🍕 Cold pizza from the fridge', correct: true },
    { text: '🍜 2 AM spicy instant ramen', correct: false },
    { text: '🍦 Ice cream tub in bed', correct: false },
    { text: '🍪 An entire packet of cookies', correct: false },
  ];

  return (
    <section className="stack center" style={{ gap: '24px' }}>
      {/* Hero Badge */}
      <div className="doodle-badge floating" style={{ background: 'var(--lemon)', transform: 'rotate(-2deg)' }}>
        <span>🔥</span>
        <span>The Viral Friendship Compatibility Test</span>
      </div>

      {/* Main Headline */}
      <h1 className="big">
        Find out who your <span className="scribble">Real Friends</span> actually are!
      </h1>

      <p className="lead" style={{ maxWidth: '480px' }}>
        Create a 10-question quiz about your quirks, habits, and secrets. Share the link with your group chat and find out who is a <strong>Certified Bestie 👑</strong> vs a <strong>Fake Friend 🚨</strong>!
      </p>

      {/* Primary Action Button */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
        <Link to="/create" className="btn pink" style={{ fontSize: '1.2rem', padding: '16px 32px' }}>
          ⚡ Create My Quiz Now
        </Link>
        <span className="hint">Takes under 60 seconds • 100% free • No signup needed</span>
      </div>

      {/* Interactive Note-Card Teaser */}
      <div className="card" style={{ width: '100%', maxWidth: '480px', marginTop: '10px', transform: 'rotate(0.5deg)' }}>
        <div className="tape-accent" />
        <div className="card-top">
          <legend>SAMPLE QUESTION PREVIEW</legend>
          <span className="doodle-badge" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Try picking one!</span>
        </div>
        
        <h3 style={{ margin: '4px 0', fontSize: '1.25rem', textAlign: 'left' }}>
          "What is my midnight snack of choice?"
        </h3>

        <div className="stack" style={{ gap: '8px' }}>
          {sampleOptions.map((opt, idx) => {
            const isPicked = samplePick === idx;
            return (
              <button
                key={idx}
                type="button"
                className={`choice ${isPicked ? (opt.correct ? 'opt-row is-correct' : '') : ''}`}
                style={{ padding: '12px 14px', fontSize: '0.95rem' }}
                onClick={() => setSamplePick(idx)}
              >
                <span className="opt-letter">{['A', 'B', 'C', 'D'][idx]}</span>
                <span>{opt.text}</span>
                {isPicked && (
                  <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: '0.85rem' }}>
                    {opt.correct ? '🎉 Correct!' : '❌ Nope!'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {samplePick !== null && (
          <p className="hint" style={{ fontWeight: 700, color: 'var(--ink)' }}>
            💡 In your quiz, your friends will answer 10 questions just like this!
          </p>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', width: '100%', marginTop: '8px' }}>
        <div className="card" style={{ padding: '14px', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
          <span style={{ fontSize: '2rem' }}>🍕</span>
          <strong style={{ fontSize: '0.95rem' }}>10 Curated Themes</strong>
          <span className="hint">Food, sleep, texting, quirks & music</span>
        </div>
        <div className="card" style={{ padding: '14px', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
          <span style={{ fontSize: '2rem' }}>👑</span>
          <strong style={{ fontSize: '0.95rem' }}>Viral Scorecards</strong>
          <span className="hint">Funny verdicts from Soulmate to Fake Friend</span>
        </div>
        <div className="card" style={{ padding: '14px', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
          <span style={{ fontSize: '2rem' }}>🏆</span>
          <strong style={{ fontSize: '0.95rem' }}>Live Leaderboard</strong>
          <span className="hint">Rank medals & share on WhatsApp/Snap</span>
        </div>
      </div>
    </section>
  );
}
