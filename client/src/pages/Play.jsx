import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuiz, submitAnswers, titleFor } from '../api.js';

export default function Play() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getQuiz(id).then(setQuiz).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <section className="stack center" style={{ marginTop: '40px' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <h2 className="big sm" style={{ margin: 0 }}>Quiz Not Found</h2>
          <p className="lead">{error}</p>
          <Link to="/" className="btn lemon">Back to Home</Link>
        </div>
      </section>
    );
  }

  if (!quiz) {
    return (
      <div className="stack center" style={{ marginTop: '60px' }}>
        <div className="doodle-badge floating" style={{ background: 'var(--lemon)' }}>
          <span>⏳</span>
          <span>Loading quiz...</span>
        </div>
      </div>
    );
  }

  // Pre-game Welcome Screen
  if (!started) {
    return (
      <form
        className="stack center"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) setStarted(true);
        }}
        style={{ gap: '20px' }}
      >
        <div className="card" style={{ maxWidth: '460px', width: '100%', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <div className="tape-accent" />
          <div className="doodle-badge" style={{ background: 'var(--lemon)' }}>
            <span>👀</span>
            <span>Friendship Compatibility Test</span>
          </div>

          <h2 className="big sm" style={{ margin: 0 }}>
            How well do you know <span className="scribble">{quiz.ownerName}</span>?
          </h2>

          <p className="lead">
            {quiz.questions.length} questions. See if you are a <strong>True Bestie 👑</strong> or get caught as a <strong>Fake Friend 🚨</strong>!
          </p>

          <label className="field">
            Enter your name / nickname:
            <input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
              autoFocus
            />
          </label>

          <button className="btn pink" style={{ width: '100%', fontSize: '1.15rem' }}>
            🚀 Start Quiz Now
          </button>
        </div>
      </form>
    );
  }

  // Post-game Results Screen
  if (result) {
    const verdict = titleFor(result.score, result.total);
    const resultText = `I scored ${result.score}/${result.total} on ${quiz.ownerName}'s quiz! Verdict: ${verdict.status} ${verdict.emoji}. Can you beat my score? ${location.origin}/q/${id}`;

    async function copyScore() {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    return (
      <section className="stack center" style={{ gap: '22px' }}>
        {/* Verdict Scorecard */}
        <div className="scorecard">
          <div className="tape-accent" />
          <div className="emoji">{verdict.emoji}</div>
          <div className={`verdict-tag ${verdict.color}`}>
            {verdict.status}
          </div>

          <h2 className="big sm" style={{ margin: '4px 0' }}>
            {verdict.text}
          </h2>

          <div className="score-pill">
            {name}: {result.score} / {result.total} ({verdict.pct}%)
          </div>

          <p className="lead" style={{ maxWidth: '420px', color: '#444' }}>
            {verdict.desc}
          </p>

          {/* Social Share Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
            <a
              className="btn mint"
              href={`https://wa.me/?text=${encodeURIComponent(resultText)}`}
              target="_blank"
              rel="noreferrer"
            >
              💬 Share Score on WhatsApp
            </a>
            <button className="btn lemon" onClick={copyScore}>
              {copied ? '✓ Result Copied!' : '📋 Copy Score'}
            </button>
          </div>
        </div>

        {/* Detailed Answer Review */}
        <div className="card" style={{ width: '100%', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>📝 Question Breakdown</h3>
          <p className="hint">See which questions you got right and where you missed:</p>

          <ul className="review">
            {quiz.questions.map((qn, i) => {
              const isCorrect = answers[i] === result.correct[i];
              return (
                <li key={i} className={isCorrect ? 'ok' : 'bad'}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.98rem' }}>
                      {i + 1}. {qn.text}
                    </strong>
                    <span className="status-badge">
                      {isCorrect ? '✓ Correct' : '✕ Wrong'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.88rem', marginTop: '2px' }}>
                    {isCorrect
                      ? `Your answer: "${qn.options[answers[i]]}"`
                      : `You chose: "${qn.options[answers[i]] || 'None'}" • Real answer: "${qn.options[result.correct[i]]}"`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Navigation CTAs */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <Link className="btn lavender" to={`/results/${id}`}>
            🏆 View Full Leaderboard
          </Link>
          <Link className="btn white" to="/create">
            ✨ Make Your Own Quiz
          </Link>
        </div>
      </section>
    );
  }

  // Active Question Card
  const qn = quiz.questions[step];
  const pct = Math.round(((step) / quiz.questions.length) * 100);

  async function pickOption(k) {
    if (submitting) return;
    const nextAnswers = [...answers, k];
    setAnswers(nextAnswers);

    if (step + 1 < quiz.questions.length) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await submitAnswers(id, { playerName: name, answers: nextAnswers });
        setResult(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setSubmitting(false);
      }
    }
  }

  return (
    <section className="stack" style={{ gap: '18px' }}>
      {/* Progress Track */}
      <div className="stack" style={{ gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="doodle-badge" style={{ background: 'var(--lemon)' }}>
            Question {step + 1} of {quiz.questions.length}
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
            {pct}% Completed
          </span>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <i style={{ width: `${((step + 1) / quiz.questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{ transform: 'rotate(-0.3deg)' }}>
        <div className="tape-accent" />
        <span className="hint" style={{ fontWeight: 700 }}>
          Answering for: <strong>{quiz.ownerName}</strong>
        </span>
        <h2 className="big sm" key={step} style={{ margin: '4px 0 10px' }}>
          {qn.text}
        </h2>

        {/* 4 Clickable Options */}
        <div className="stack" style={{ gap: '10px' }}>
          {qn.options.map((optionText, k) => (
            <button
              key={k}
              className="choice"
              onClick={() => pickOption(k)}
              disabled={submitting}
            >
              <span className="opt-letter">{['A', 'B', 'C', 'D'][k]}</span>
              <span>{optionText}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="center">
        <span className="hint">
          {submitting ? 'Scoring your answers...' : 'Tap the answer you think is true!'}
        </span>
      </div>
    </section>
  );
}
