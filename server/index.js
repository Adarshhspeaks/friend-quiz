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
    created_at INTEGER NOT NULL,
    admin_key TEXT
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

// Ensure admin_key column exists for existing DBs
try {
  db.exec('ALTER TABLE quizzes ADD COLUMN admin_key TEXT;');
} catch {
  // Column already exists
}

const q = {
  insertQuiz: db.prepare(
    'INSERT INTO quizzes (id, owner_name, questions, created_at, admin_key) VALUES (?, ?, ?, ?, ?)'
  ),
  getQuiz: db.prepare('SELECT * FROM quizzes WHERE id = ?'),
  findRespByName: db.prepare(
    'SELECT id, player_name FROM responses WHERE quiz_id = ? AND LOWER(player_name) = LOWER(?)'
  ),
  updateResp: db.prepare(
    'UPDATE responses SET answers = ?, score = ?, created_at = ? WHERE id = ?'
  ),
  insertResp: db.prepare(
    'INSERT INTO responses (id, quiz_id, player_name, answers, score, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ),
  getResps: db.prepare(
    'SELECT id, player_name, score, created_at FROM responses WHERE quiz_id = ? ORDER BY score DESC, created_at ASC'
  ),
  deleteResp: db.prepare('DELETE FROM responses WHERE id = ? AND quiz_id = ?'),
  clearResps: db.prepare('DELETE FROM responses WHERE quiz_id = ?'),
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
  const adminKey = nanoid(16);
  q.insertQuiz.run(id, ownerName, JSON.stringify(questions), Date.now(), adminKey);
  res.json({ id, adminKey });
});

// fetch quiz for playing (answers are NOT sent)
app.get('/api/quizzes/:id', (req, res) => {
  const row = q.getQuiz.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Quiz not found.' });
  const questions = JSON.parse(row.questions).map(({ text, options }) => ({ text, options }));
  res.json({ id: row.id, ownerName: row.owner_name, questions });
});

// submit answers -> scored on the server (with duplicate update prevention)
app.post('/api/quizzes/:id/responses', (req, res) => {
  const row = q.getQuiz.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Quiz not found.' });
  const questions = JSON.parse(row.questions);
  const playerName = clean(req.body.playerName, 40);
  const answers = req.body.answers;
  if (!playerName || !Array.isArray(answers) || answers.length !== questions.length)
    return res.status(400).json({ error: 'Enter your name and answer every question.' });

  const score = questions.reduce((n, qn, i) => n + (Number(answers[i]) === qn.correctIndex ? 1 : 0), 0);

  // Check if player already submitted to avoid polluting leaderboard
  const existing = q.findRespByName.get(row.id, playerName);
  if (existing) {
    q.updateResp.run(JSON.stringify(answers), score, Date.now(), existing.id);
  } else {
    q.insertResp.run(nanoid(10), row.id, playerName, JSON.stringify(answers), score, Date.now());
  }

  res.json({
    score,
    total: questions.length,
    correct: questions.map((qn) => qn.correctIndex),
    isRetake: !!existing,
  });
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

// delete an individual response (creator moderation only)
app.delete('/api/quizzes/:id/responses/:respId', (req, res) => {
  const row = q.getQuiz.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Quiz not found.' });

  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  if (!row.admin_key || adminKey !== row.admin_key) {
    return res.status(403).json({ error: 'Unauthorized: Only the quiz creator can delete responses.' });
  }

  q.deleteResp.run(req.params.respId, row.id);
  res.json({ success: true });
});

// clear all responses (creator moderation only)
app.delete('/api/quizzes/:id/responses', (req, res) => {
  const row = q.getQuiz.get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Quiz not found.' });

  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  if (!row.admin_key || adminKey !== row.admin_key) {
    return res.status(403).json({ error: 'Unauthorized: Only the quiz creator can clear responses.' });
  }

  q.clearResps.run(row.id);
  res.json({ success: true });
});

// serve built React app with dynamic Open Graph meta tags
const dist = path.join(__dirname, '../client/dist');
const distHtml = path.join(dist, 'index.html');

function getBaseUrl(req) {
  const host = req.get('x-forwarded-host') || req.get('host');
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  return `${proto}://${host}`;
}

function injectMeta(html, { title, description, url, imageUrl }) {
  let out = html;
  if (title) {
    out = out.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    out = out.replace(/(<meta\s+property=["']og:title["']\s+content=["']).*?(["']\s*\/?>)/i, `$1${title}$2`);
    out = out.replace(/(<meta\s+name=["']twitter:title["']\s+content=["']).*?(["']\s*\/?>)/i, `$1${title}$2`);
  }
  if (description) {
    out = out.replace(/(<meta\s+name=["']description["']\s+content=["']).*?(["']\s*\/?>)/i, `$1${description}$2`);
    out = out.replace(/(<meta\s+property=["']og:description["']\s+content=["']).*?(["']\s*\/?>)/i, `$1${description}$2`);
    out = out.replace(/(<meta\s+name=["']twitter:description["']\s+content=["']).*?(["']\s*\/?>)/i, `$1${description}$2`);
  }
  if (imageUrl) {
    out = out.replace(/(<meta\s+property=["']og:image["']\s+content=["']).*?(["']\s*\/?>)/i, `$1${imageUrl}$2`);
    out = out.replace(/(<meta\s+name=["']twitter:image["']\s+content=["']).*?(["']\s*\/?>)/i, `$1${imageUrl}$2`);
  }
  if (url) {
    out = out.replace(/(<meta\s+property=["']og:url["']\s+content=["']).*?(["']\s*\/?>)/i, `$1${url}$2`);
  }
  return out;
}

if (fs.existsSync(dist)) {
  app.use(express.static(dist));

  // Dynamic preview for quiz play page /q/:id
  app.get('/q/:id', (req, res) => {
    try {
      const template = fs.readFileSync(distHtml, 'utf8');
      const row = q.getQuiz.get(req.params.id);
      const baseUrl = getBaseUrl(req);
      const imageUrl = `${baseUrl}/og-image.jpg`;

      if (row) {
        const title = `How well do you know ${row.owner_name}? — Trust Me? Quiz`;
        const description = `${row.owner_name} created a friendship quiz! Answer 10 questions to see if you are a Real Bestie 👑 or a Fake Friend 🚨. No Googling allowed!`;
        const url = `${baseUrl}/q/${row.id}`;
        return res.send(injectMeta(template, { title, description, url, imageUrl }));
      }
      return res.send(injectMeta(template, { imageUrl }));
    } catch {
      return res.sendFile(distHtml);
    }
  });

  // Dynamic preview for leaderboard page /results/:id
  app.get('/results/:id', (req, res) => {
    try {
      const template = fs.readFileSync(distHtml, 'utf8');
      const row = q.getQuiz.get(req.params.id);
      const baseUrl = getBaseUrl(req);
      const imageUrl = `${baseUrl}/og-image.jpg`;

      if (row) {
        const title = `${row.owner_name}'s Friendship Leaderboard 🏆 — Trust Me?`;
        const description = `See who knows ${row.owner_name} best! Check live scores, rankings, and who got exposed on the leaderboard.`;
        const url = `${baseUrl}/results/${row.id}`;
        return res.send(injectMeta(template, { title, description, url, imageUrl }));
      }
      return res.send(injectMeta(template, { imageUrl }));
    } catch {
      return res.sendFile(distHtml);
    }
  });

  app.get('*', (req, res) => {
    try {
      const template = fs.readFileSync(distHtml, 'utf8');
      const baseUrl = getBaseUrl(req);
      const imageUrl = `${baseUrl}/og-image.jpg`;
      res.send(injectMeta(template, { url: `${baseUrl}${req.url}`, imageUrl }));
    } catch {
      res.sendFile(distHtml);
    }
  });
}

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
