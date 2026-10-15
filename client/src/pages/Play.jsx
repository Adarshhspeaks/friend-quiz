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

  useEffect(() => {
    getQuiz(id).then(setQuiz).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="error center">{error}</p>;
  if (!quiz) return <p className="center">Loading…</p>;

  if (!started)
    return (
      <form className="stack center" onSubmit={(e) => { e.preventDefault(); setStarted(true); }}>
        <h2 className="big sm">How well do you know {quiz.ownerName}?</h2>
        <p className="lead">{quiz.questions.length} questions. No Googling.</p>
        <label className="field">
          Your name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required />
        </label>
        <button className="btn pink">Start</button>
      </form>
    );

  if (result) {
    const t = titleFor(result.score, result.total);
    return (
      <section className="stack center">
        <div className="emoji">{t.emoji}</div>
        <h2 className="big sm">{t.text}</h2>
        <p className="lead">{name}, you got {result.score} of {result.total} right.</p>
        <ul className="review">
          {quiz.questions.map((qn, i) => {
            const ok = answers[i] === result.correct[i];
            return (
              <li key={i} className={ok ? 'ok' : 'bad'}>
                <strong>{qn.text}</strong>
                <span>{ok ? 'Right' : `You said "${qn.options[answers[i]]}". Answer: "${qn.options[result.correct[i]]}"`}</span>
              </li>
            );
          })}
        </ul>
        <Link className="btn lemon" to={`/results/${id}`}>See the leaderboard</Link>
        <Link className="btn mint" to="/create">Make your own quiz</Link>
      </section>
    );
  }

  const qn = quiz.questions[step];
  const pct = (step / quiz.questions.length) * 100;

  async function pick(k) {
    const next = [...answers, k];
    setAnswers(next);
    if (step + 1 < quiz.questions.length) return setStep(step + 1);
    try {
      setResult(await submitAnswers(id, { playerName: name, answers: next }));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="stack">
      <div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="hint">Question {step + 1} of {quiz.questions.length}</p>
      <h2 className="big sm" key={step}>{qn.text}</h2>
      <div className="stack">
        {qn.options.map((o, k) => (
          <button key={k} className="choice" onClick={() => pick(k)}>{o}</button>
        ))}
      </div>
    </section>
  );
}
