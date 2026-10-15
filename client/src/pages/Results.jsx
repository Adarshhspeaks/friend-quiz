import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResults, titleFor } from '../api.js';

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getResults(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="error center">{error}</p>;
  if (!data) return <p className="center">Loading…</p>;

  return (
    <section className="stack">
      <h2 className="big sm">Who knows {data.ownerName} best</h2>
      {data.players.length === 0 && <p className="lead">Nobody has played yet. Share the link.</p>}
      <ol className="board">
        {data.players.map((p, i) => {
          const t = titleFor(p.score, data.total);
          return (
            <li key={i} className="card">
              <span className="rank">{i + 1}</span>
              <span className="who">{p.name}<small>{t.emoji} {t.text}</small></span>
              <span className="pts">{p.score}/{data.total}</span>
            </li>
          );
        })}
      </ol>
      <Link className="btn lemon" to={`/q/${id}`}>Play this quiz</Link>
    </section>
  );
}
