import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createQuiz } from '../api.js';
import { DEFAULT_10_QUESTIONS, QUESTION_SUGGESTIONS } from '../data/questions.js';

const blank = () => ({ text: '', options: ['', '', '', ''], correctIndex: 0 });

const cloneQuestions = (list) =>
  list.map((q) => ({
    text: q.text,
    options: [...q.options],
    correctIndex: q.correctIndex ?? 0,
  }));

export default function Create() {
  const [ownerName, setOwnerName] = useState('');
  const [questions, setQuestions] = useState(() => cloneQuestions(DEFAULT_10_QUESTIONS));
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
    const shuffled = [...QUESTION_SUGGESTIONS].sort(() => Math.random() - 0.5);
    const count = Math.max(questions.length, 10);
    setQuestions(cloneQuestions(shuffled.slice(0, Math.min(count, 15))));
    setError('');
  }

  function swapQuestion(i) {
    const currentTexts = new Set(questions.map((q) => q.text.trim()));
    const available = QUESTION_SUGGESTIONS.filter((s) => !currentTexts.has(s.text.trim()));
    const pool = available.length > 0 ? available : QUESTION_SUGGESTIONS;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    update(i, {
      text: randomPick.text,
      options: [...randomPick.options],
      correctIndex: 0,
    });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = ownerName.trim();
    if (!trimmedName) return setError('Please enter your name.');

    // Validate and drop trailing empty options while preserving correctIndex
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
        return setError(`Please select the correct answer for Question ${i + 1}.`);
      }

      cleaned.push({
        text: qText,
        options: kept.map((x) => x.text),
        correctIndex: newCorrectIdx,
      });
    }

    setBusy(true);
    try {
      const { id } = await createQuiz({ ownerName: trimmedName, questions: cleaned });
      setQuizId(id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (quizId) return <Share id={quizId} name={ownerName} />;

  return (
    <form className="stack" onSubmit={submit}>
      <div className="stack">
        <h2 className="big sm">Build your quiz</h2>
        <p className="lead">
          We prepared <strong>10 questions</strong> for you! You can freely edit any question, change options, pick your answers, or swap questions.
        </p>
      </div>

      <label className="field">
        Your name
        <input
          placeholder="e.g. Alex"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          maxLength={40}
          required
        />
      </label>

      <div className="action-bar">
        <span className="action-bar-info">{questions.length} questions ready</span>
        <div className="action-bar-left">
          <button type="button" className="btn-sm swap" onClick={resetToDefaults} title="Reset to the 10 starter questions">
            ⚡ Reset 10 prebuilt
          </button>
          <button type="button" className="btn-sm" onClick={shuffleAllIdeas} title="Randomize questions from question bank">
            🎲 Shuffle ideas
          </button>
          {questions.length < 20 && (
            <button type="button" className="btn-sm" onClick={() => setQuestions([...questions, blank()])}>
              ➕ Add blank
            </button>
          )}
        </div>
      </div>

      {questions.map((q, i) => (
        <fieldset key={i} className="card" style={{ '--tilt': i % 2 ? '0.3deg' : '-0.3deg' }}>
          <div className="card-top">
            <legend>Question {i + 1} of {questions.length}</legend>
            <div className="card-actions">
              <button
                type="button"
                className="btn-sm swap"
                onClick={() => swapQuestion(i)}
                title="Swap this question with another idea"
              >
                💡 Swap idea
              </button>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn-sm danger"
                  onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                  title="Remove this question"
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>

          <label className="field">
            <input
              placeholder="e.g. What's my favorite food?"
              value={q.text}
              onChange={(e) => update(i, { text: e.target.value })}
              maxLength={200}
              required
            />
          </label>

          <div className="stack" style={{ gap: '8px' }}>
            {q.options.map((o, k) => {
              const isSelected = q.correctIndex === k;
              return (
                <div className={`opt-row ${isSelected ? 'is-correct' : ''}`} key={k}>
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
                    onChange={(e) => setOption(i, k, e.target.value)}
                    maxLength={100}
                    required={k < 2}
                  />
                  {isSelected && <span className="opt-label">✓ Correct</span>}
                </div>
              );
            })}
          </div>

          <p className="hint">Select the radio button next to your true answer so your friends can be scored.</p>
        </fieldset>
      ))}

      <div className="action-bar" style={{ marginTop: '10px' }}>
        {questions.length < 20 && (
          <button type="button" className="btn lemon" onClick={() => setQuestions([...questions, blank()])}>
            ➕ Add another question
          </button>
        )}
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn pink" disabled={busy} style={{ marginTop: '8px' }}>
        {busy ? 'Creating quiz…' : `Save & Share Quiz (${questions.length} Questions)`}
      </button>
    </form>
  );
}

function Share({ id, name }) {
  const link = `${location.origin}/q/${id}`;
  const [copied, setCopied] = useState(false);
  const text = `How well do you know ${name}? Take my quiz: ${link}`;

  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="stack center">
      <h2 className="big sm">Your quiz is live! 🎉</h2>
      <p className="lead">Send this link to your friends and see who actually knows you.</p>
      <code className="linkbox">{link}</code>
      <button className="btn lemon" onClick={copy}>{copied ? '✓ Copied!' : 'Copy link'}</button>
      <a className="btn mint" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
        Share on WhatsApp
      </a>
      <Link className="link" to={`/results/${id}`}>See the leaderboard</Link>
    </section>
  );
}
