import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResults, titleFor, deleteResponse } from '../api.js';

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadResults();
  }, [id]);

  function loadResults() {
    getResults(id).then(setData).catch((e) => setError(e.message));
  }

  async function handleDelete(respId) {
    if (!confirm('Remove this entry from the leaderboard?')) return;
    setDeletingId(respId);
    try {
      await deleteResponse(id, respId);
      setData((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.id !== respId),
      }));
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  }

  const quizLink = `${location.origin}/q/${id}`;
  const shareText = `🔥 See where you rank on my friendship leaderboard! Take my quiz: ${quizLink}`;

  async function copyLink() {
    await navigator.clipboard.writeText(quizLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) {
    return (
      <section className="stack center" style={{ marginTop: '40px' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>⚠️</span>
          <h2 className="big sm" style={{ margin: 0 }}>Error Loading Board</h2>
          <p className="lead">{error}</p>
          <Link to="/" className="btn lemon">Back to Home</Link>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <div className="stack center" style={{ marginTop: '60px' }}>
        <div className="doodle-badge floating" style={{ background: 'var(--lemon)' }}>
          <span>🏆</span>
          <span>Loading Leaderboard...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="stack" style={{ gap: '22px' }}>
      {/* Header */}
      <div className="stack" style={{ gap: '8px' }}>
        <div className="doodle-badge" style={{ alignSelf: 'flex-start', background: 'var(--lemon)' }}>
          <span>🏆</span>
          <span>Friendship Leaderboard</span>
        </div>
        <h2 className="big sm" style={{ margin: 0 }}>
          Who knows <span className="scribble">{data.ownerName}</span> best?
        </h2>
        <p className="lead">
          Ranked from <strong>Certified Besties</strong> to the <strong>Fake Friends</strong>!
        </p>
      </div>

      {/* Share / Invite Banner */}
      <div className="card" style={{ padding: '16px 18px', background: 'var(--white)', gap: '12px' }}>
        <div className="card-top">
          <span className="doodle-badge" style={{ background: 'var(--mint)' }}>
            👥 {data.players.length} {data.players.length === 1 ? 'Friend' : 'Friends'} Tested
          </span>
          <span className="hint">
            {data.total} Questions Quiz
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-sm swap" onClick={copyLink} style={{ flex: 1, justifyContent: 'center' }}>
            {copied ? '✓ Link Copied!' : '📋 Copy Quiz Link'}
          </button>
          <a
            className="btn-sm active"
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}
          >
            💬 Share on WhatsApp
          </a>
        </div>
      </div>

      {/* Empty State */}
      {data.players.length === 0 ? (
        <div className="card center" style={{ padding: '36px 20px', gap: '14px' }}>
          <div className="tape-accent" />
          <span style={{ fontSize: '3.5rem' }}>📭</span>
          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Nobody has taken the test yet!</h3>
          <p className="lead" style={{ maxWidth: '360px' }}>
            Send your quiz link to your friends or group chat to see who scores highest.
          </p>
          <button className="btn lemon" onClick={copyLink}>
            {copied ? '✓ Copied Link!' : '📋 Copy Quiz Link to Send'}
          </button>
        </div>
      ) : (
        /* Leaderboard List */
        <ol className="board">
          {data.players.map((p, i) => {
            const verdict = titleFor(p.score, data.total);
            const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
            const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';

            return (
              <li key={p.id || i} className="board-card">
                <div className="board-left">
                  <span className={`rank-badge ${rankClass}`}>{rankEmoji}</span>
                  <div className="player-info">
                    <span className="player-name">{p.name}</span>
                    <span className="player-status">
                      <span className={`verdict-tag ${verdict.color}`} style={{ fontSize: '0.74rem', padding: '1px 6px', marginRight: '6px' }}>
                        {verdict.badge}
                      </span>
                      {verdict.emoji} {verdict.text}
                    </span>
                  </div>
                </div>

                <div className="board-right">
                  <div className="player-score">
                    {p.score}/{data.total}
                    <small style={{ fontSize: '0.78rem', display: 'block', opacity: 0.7, textAlign: 'right' }}>
                      {verdict.pct}%
                    </small>
                  </div>
                  {p.id && (
                    <button
                      type="button"
                      className="btn-sm danger"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      title="Remove from leaderboard"
                      style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Footer Navigation */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
        <Link className="btn pink" to={`/q/${id}`}>
          🎮 Play This Quiz
        </Link>
        <Link className="btn white" to="/create">
          ✨ Make Your Own Quiz
        </Link>
      </div>
    </section>
  );
}
