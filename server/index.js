import express from 'express';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

let DatabaseSync;
try {
  ({ DatabaseSync } = await import('node:sqlite'));
} catch {
  const mod = await import('better-sqlite3');
  DatabaseSync = mod.default;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// ---------- DB ----------
const db = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, 'quiz.db'));
if (typeof db.pragma === 'function') {
  db.pragma('journal_mode = WAL');
} else {
  db.exec('PRAGMA journal_mode = WAL;');
}
db.exec(`
  CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    owner_name TEXT NOT NULL,
    questions TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL REFERENCES quizzes(id),
    player_name TEXT NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_resp_quiz ON responses(quiz_id);
`);

const q = {
  insertQuiz: db.prepare('INSERT INTO quizzes VALUES (?, ?, ?, ?)'),
  getQuiz: db.prepare('SELECT * FROM quizzes WHERE id = ?'),
  insertResp: db.prepare('INSERT INTO responses VALUES (?, ?, ?, ?, ?, ?)'),
  getResps: db.prepare(
    'SELECT id, player_name, score, created_at FROM responses WHERE quiz_id = ? ORDER BY score DESC, created_at ASC'
  ),
  deleteResp: db.prepare('DELETE FROM responses WHERE id = ? AND quiz_id = ?'),
};

// ---------- helpers ----------
const clean = (s, max) => String(s ?? '').trim().slice(0, max);

function validateQuestions(list) {
  if (!Array.isArray(list) || list.length < 1 || list.length > 20) return null;
  const out = [];
  for (const item of list) {
    const text = clean(item.text, 200);
    const options = Array.isArray(item.options)
      ? item.options.map((o) => clean(o, 100)).filter(Boolean)
      : [];
    const correctIndex = Number(item.correctIndex);
    if (!text || options.length < 2 || options.length > 6) return null;
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) return null;
    out.push({ text, options, correctIndex });
  }
  return out;
}

// ---------- app ----------
const app = express();
app.use(express.json({ limit: '100kb' }));

// create a quiz
app.post('/api/quizzes', (req, res) => {
  const ownerName = clean(req.body.ownerName, 40);
  const questions = validateQuestions(req.body.questions);
  if (!ownerName || !questions) return res.status(400).json({ error: 'Add your name and at least 1 valid question.' });
  const id = nanoid(7);
  q.insertQuiz.run(id, ownerName, JSON.stringify(questions), Date.now());
  res.json({ id });
});

// fetch quiz for playing (answers are NOT sent)
app.get('/api/quizzes/:id', (req, res) => {
  const row = q.getQuiz.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Quiz not found.' });
  const questions = JSON.parse(row.questions).map(({ text, options }) => ({ text, options }));
  res.json({ id: row.id, ownerName: row.owner_name, questions });
});

// submit answers -> scored on the server
app.post('/api/quizzes/:id/responses', (req, res) => {
  const row = q.getQuiz.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Quiz not found.' });
  const questions = JSON.parse(row.questions);
  const playerName = clean(req.body.playerName, 40);
  const answers = req.body.answers;
  if (!playerName || !Array.isArray(answers) || answers.length !== questions.length)
    return res.status(400).json({ error: 'Enter your name and answer every question.' });

  const score = questions.reduce((n, qn, i) => n + (Number(answers[i]) === qn.correctIndex ? 1 : 0), 0);
  q.insertResp.run(nanoid(10), row.id, playerName, JSON.stringify(answers), score, Date.now());
  res.json({ score, total: questions.length, correct: questions.map((qn) => qn.correctIndex) });
});

// leaderboard
app.get('/api/quizzes/:id/results', (req, res) => {
  const row = q.getQuiz.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Quiz not found.' });
  const total = JSON.parse(row.questions).length;
  const players = q.getResps.all(row.id).map((r) => ({
    id: r.id,
    name: r.player_name,
    score: r.score,
    at: r.created_at,
  }));
  res.json({ ownerName: row.owner_name, total, players });
});

// delete an individual response (moderation)
app.delete('/api/quizzes/:id/responses/:respId', (req, res) => {
  q.deleteResp.run(req.params.respId, req.params.id);
  res.json({ success: true });
});

// serve built React app in production
const dist = path.join(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
