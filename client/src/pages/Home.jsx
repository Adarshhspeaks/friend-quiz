import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="stack center">
      <h1 className="big">
        Which friends <span className="scribble">actually</span> know you?
      </h1>
      <p className="lead">Write a quiz about yourself. Send the link. See who fails.</p>
      <Link to="/create" className="btn pink">Make my quiz</Link>
    </section>
  );
}
