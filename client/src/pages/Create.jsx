import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createQuiz } from '../api.js';

const blank = () => ({ text: '', options: ['', '', '', ''], correctIndex: 0 });

export default function Create() {
  const [ownerName, setOwnerName] = useState('');
  const [questions, setQuestions] = useState([blank(), blank(), blank()]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [quizId, setQuizId] = useState(null);

  const update = (i, patch) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const setOption = (i, k, val) => update(i, { options: questions[i].options.map((o, n) => (n === k ? val : o)) });

  async function submit(e) {
    e.preventDefault();
    setError('');
    // drop empty options but keep the correct index pointing at the right answer
    const cleaned = questions.map((q) => {
      const kept = q.options.map((o, idx) => ({ o: o.trim(), idx })).filter((x) => x.o);
      return { text: q.text, options: kept.map((x) => x.o), correctIndex: kept.findIndex((x) => x.idx === q.correctIndex) };
    });
    if (cleaned.some((q) => q.correctIndex === -1)) return setError('Each question needs its correct answer filled in.');
    setBusy(true);
    try {
      const { id } = await createQuiz({ ownerName, questions: cleaned });
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
      <h2 className="big sm">Build your quiz</h2>
      <label className="field">
        Your name
        <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} maxLength={40} required />
      </label>

      {questions.map((q, i) => (
        <fieldset key={i} className="card" style={{ '--tilt': i % 2 ? '0.4deg' : '-0.4deg' }}>
          <legend>Question {i + 1}</legend>
          <input
            placeholder="e.g. What's my most-used emoji?"
            value={q.text}
            onChange={(e) => update(i, { text: e.target.value })}
            maxLength={200}
            required
          />
          {q.options.map((o, k) => (
            <div className="opt-row" key={k}>
              <input
                type="radio"
                name={`correct-${i}`}
                checked={q.correctIndex === k}
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
            </div>
          ))}
          <p className="hint">Select the circle next to the right answer.</p>
          {questions.length > 1 && (
            <button type="button" className="link" onClick={() => setQuestions(questions.filter((_, j) => j !== i))}>
              Remove question
            </button>
          )}
        </fieldset>
      ))}

      {questions.length < 20 && (
        <button type="button" className="btn lemon" onClick={() => setQuestions([...questions, blank()])}>
          Add a question
        </button>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn pink" disabled={busy}>{busy ? 'Creating…' : 'Create quiz'}</button>
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
      <h2 className="big sm">Your quiz is live</h2>
      <p className="lead">Send this link to your friends.</p>
      <code className="linkbox">{link}</code>
      <button className="btn lemon" onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button>
      <a className="btn mint" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">
        Share on WhatsApp
      </a>
      <Link className="link" to={`/results/${id}`}>See the leaderboard</Link>
    </section>
  );
}
