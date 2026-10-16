import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createQuiz } from '../api.js';
import { CATEGORIES, QUESTION_BANK, DEFAULT_10_QUESTIONS } from '../data/questions.js';

const blank = () => ({
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  category: 'quirks',
});

const cloneQuestions = (list) =>
  list.map((q) => ({
    text: q.text,
    options: [...q.options],
    correctIndex: q.correctIndex ?? 0,
    category: q.category || 'all',
  }));

export default function Create() {
  const [searchParams] = useSearchParams();
  const [ownerName, setOwnerName] = useState(() => searchParams.get('name') || '');
  const [questions, setQuestions] = useState(() => cloneQuestions(DEFAULT_10_QUESTIONS));
  const [activeCategory, setActiveCategory] = useState('all');
  const [showBankModalFor, setShowBankModalFor] = useState(null); // index of question being swapped
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [quizId, setQuizId] = useState(null);

  const update = (i, patch) =>
    setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  const setOption = (i, k, val) =>
    update(i, { options: questions[i].options.map((o, n) => (n === k ? val : o)) });

  function resetToDefaults() {
    setQuestions(cloneQuestions(DEFAULT_10_QUESTIONS));
    setError('');
  }

  function shuffleAllIdeas() {
    const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
    const count = Math.max(questions.length, 10);
    setQuestions(cloneQuestions(shuffled.slice(0, Math.min(count, 15))));
    setError('');
  }

  function swapQuestion(i) {
    const currentTexts = new Set(questions.map((q) => q.text.trim()));
    const targetCategory = questions[i]?.category;
    let pool = QUESTION_BANK.filter((s) => !currentTexts.has(s.text.trim()));
    if (targetCategory && targetCategory !== 'all') {
      const catPool = pool.filter((s) => s.category === targetCategory);
      if (catPool.length > 0) pool = catPool;
    }
    if (pool.length === 0) pool = QUESTION_BANK;

    const pick = pool[Math.floor(Math.random() * pool.length)];
    update(i, {
      text: pick.text,
      options: [...pick.options],
      correctIndex: 0,
      category: pick.category,
    });
  }

  function pickFromBank(i, bankItem) {
    update(i, {
      text: bankItem.text,
      options: [...bankItem.options],
      correctIndex: 0,
      category: bankItem.category,
    });
    setShowBankModalFor(null);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = ownerName.trim();
    if (!trimmedName) return setError('Please enter your name.');

    const cleaned = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qText = q.text.trim();
      if (!qText) return setError(`Question ${i + 1} needs a question title.`);

      const kept = q.options
        .map((o, idx) => ({ text: o.trim(), idx }))
        .filter((x) => x.text.length > 0);

      if (kept.length < 2) {
        return setError(`Question ${i + 1} needs at least 2 options.`);
      }

      const newCorrectIdx = kept.findIndex((x) => x.idx === q.correctIndex);
      if (newCorrectIdx === -1) {
        return setError(`Please select your correct answer for Question ${i + 1}.`);
      }

      cleaned.push({
        text: qText,
        options: kept.map((x) => x.text),
        correctIndex: newCorrectIdx,
      });
    }

    setBusy(true);
    try {
      const { id, adminKey } = await createQuiz({ ownerName: trimmedName, questions: cleaned });
      if (adminKey) {
        try { localStorage.setItem(`quiz_admin_${id}`, adminKey); } catch {}
      }
      setQuizId(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (quizId) return <Share id={quizId} name={ownerName} />;

  // Filter bank items if modal is open
  const bankModalItems = showBankModalFor !== null
    ? QUESTION_BANK.filter(
        (item) => activeCategory === 'all' || item.category === activeCategory
      )
    : [];

  return (
    <form className="stack" onSubmit={submit}>
      {/* Page Title & Intro */}
      <div className="stack" style={{ gap: '8px' }}>
        <div className="doodle-badge" style={{ alignSelf: 'flex-start', background: 'var(--lemon)' }}>
          <span>📝</span>
          <span>Friendship Test Creator</span>
        </div>
        <h2 className="big sm">Build Your Quiz</h2>
        <p className="lead">
          We prepared <strong>10 questions</strong> for you! You can freely edit any question, modify the options, choose your real answer, or swap questions from the bank.
        </p>
      </div>

      {/* Creator Name Field */}
      <label className="field">
        Your Name / Nickname
        <input
          placeholder="e.g. Alex, Sam, Adarsh..."
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          maxLength={40}
          required
        />
      </label>

      {/* Action Toolbar */}
      <div className="action-bar">
        <span className="action-bar-info">
          🎯 <strong>{questions.length}</strong> questions in quiz
        </span>
        <div className="action-bar-left">
          <button
            type="button"
            className="btn-sm swap"
            onClick={resetToDefaults}
            title="Reset to 10 curated starter questions"
          >
            ⚡ Reset 10 Starter
          </button>
          <button
            type="button"
            className="btn-sm"
            onClick={shuffleAllIdeas}
            title="Shuffle questions from entire bank"
          >
            🎲 Randomize All
          </button>
          {questions.length < 20 && (
            <button
              type="button"
              className="btn-sm"
              onClick={() => setQuestions([...questions, blank()])}
            >
              ➕ Add Blank
            </button>
          )}
        </div>
      </div>

      {/* Question Cards */}
      {questions.map((q, i) => (
        <fieldset
          key={i}
          className="card"
          style={{ '--tilt': i % 2 ? '0.4deg' : '-0.4deg' }}
        >
          <div className="tape-accent" />
          <div className="card-top">
            <legend>Question {i + 1} of {questions.length}</legend>
            <div className="card-actions">
              <button
                type="button"
                className="btn-sm swap"
                onClick={() => swapQuestion(i)}
                title="Swap with a random question"
              >
                🎲 Quick Swap
              </button>
              <button
                type="button"
                className="btn-sm"
                onClick={() => setShowBankModalFor(i)}
                title="Choose from categorized question bank"
              >
                📚 Pick Idea
              </button>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn-sm danger"
                  onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                  title="Remove this question"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Question Text Input */}
          <label className="field">
            <input
              placeholder="e.g. What is my absolute favorite food?"
              value={q.text}
              onChange={(e) => update(i, { text: e.target.value })}
              maxLength={200}
              required
            />
          </label>

          {/* 4 Editable Option Rows */}
          <div className="stack" style={{ gap: '8px' }}>
            {q.options.map((o, k) => {
              const isSelected = q.correctIndex === k;
              return (
                <div
                  className={`opt-row ${isSelected ? 'is-correct' : ''}`}
                  key={k}
                  onClick={() => update(i, { correctIndex: k })}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    id={`q${i}-opt${k}`}
                    name={`correct-${i}`}
                    checked={isSelected}
                    onChange={() => update(i, { correctIndex: k })}
                    aria-label={`Mark option ${k + 1} as correct`}
                  />
                  <input
                    placeholder={`Option ${k + 1}${k < 2 ? '' : ' (optional)'}`}
                    value={o}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setOption(i, k, e.target.value)}
                    maxLength={100}
                    required={k < 2}
                  />
                  {isSelected && <span className="opt-badge">✓ True Answer</span>}
                </div>
              );
            })}
          </div>

          <p className="hint">
            👉 Tap an option or radio button to mark it as your real answer.
          </p>
        </fieldset>
      ))}

      {/* Add another question button */}
      <div className="action-bar" style={{ marginTop: '8px' }}>
        {questions.length < 20 && (
          <button
            type="button"
            className="btn lemon"
            onClick={() => setQuestions([...questions, blank()])}
          >
            ➕ Add Another Question
          </button>
        )}
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {/* Submit Button */}
      <button className="btn pink" disabled={busy} style={{ marginTop: '12px', fontSize: '1.15rem' }}>
        {busy ? 'Creating Your Quiz…' : `🎉 Save & Share Quiz (${questions.length} Questions)`}
      </button>

      {/* Question Bank Modal */}
      {showBankModalFor !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(24, 25, 43, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
          onClick={() => setShowBankModalFor(null)}
        >
          <div
            className="card"
            style={{
              maxHeight: '85vh',
              width: '100%',
              maxWidth: '560px',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              transform: 'none',
              background: 'var(--white)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-top">
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                💡 Pick a Question for #{showBankModalFor + 1}
              </h3>
              <button
                type="button"
                className="btn-sm danger"
                onClick={() => setShowBankModalFor(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="category-bar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Questions list to pick */}
            <div className="stack" style={{ gap: '10px' }}>
              {bankModalItems.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '12px 14px',
                    gap: '6px',
                    transform: 'none',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  onClick={() => pickFromBank(showBankModalFor, item)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.98rem' }}>{item.text}</strong>
                    <button type="button" className="btn-sm swap" style={{ flexShrink: 0, marginLeft: '8px' }}>
                      Select ➔
                    </button>
                  </div>
                  <div className="hint" style={{ fontSize: '0.82rem' }}>
                    {item.options.slice(0, 3).join(' • ')}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function Share({ id, name }) {
  const link = `${location.origin}/q/${id}`;
  const [copied, setCopied] = useState(false);
  const text = `🔥 Which of my friends actually know me? Take my quiz and see if you are a Real Bestie or a Fake Friend: ${link}`;

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="stack center" style={{ gap: '20px' }}>
      <div className="scorecard">
        <div className="tape-accent" />
        <div className="emoji">🎉</div>
        <h2 className="big sm" style={{ margin: 0 }}>Your Quiz is Live!</h2>
        <p className="lead">
          Share this link with {name ? `${name}'s` : 'your'} friends & group chats to see who scores highest!
        </p>

        <code className="linkbox">{link}</code>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <button className="btn lemon" onClick={copy}>
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy Quiz Link'}
          </button>
          <a
            className="btn mint"
            href={`https://wa.me/?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noreferrer"
          >
            💬 Share on WhatsApp
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <Link className="btn lavender" to={`/results/${id}`}>
          🏆 View Live Leaderboard
        </Link>
        <Link className="link" to={`/q/${id}`}>
          Test play quiz ➔
        </Link>
      </div>
    </section>
  );
}
