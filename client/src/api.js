async function call(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
}

export const createQuiz = (body) => call('/api/quizzes', { method: 'POST', body: JSON.stringify(body) });
export const getQuiz = (id) => call(`/api/quizzes/${id}`);
export const submitAnswers = (id, body) =>
  call(`/api/quizzes/${id}/responses`, { method: 'POST', body: JSON.stringify(body) });
export const getResults = (id) => call(`/api/quizzes/${id}/results`);
export const deleteResponse = (id, respId) =>
  call(`/api/quizzes/${id}/responses/${respId}`, { method: 'DELETE' });

// Playful verdicts based on score ratio (reference-inspired)
export function titleFor(score, total) {
  const r = total ? score / total : 0;
  const pct = Math.round(r * 100);

  if (r === 1) {
    return {
      emoji: '👑',
      text: 'Certified Soulmate',
      status: '100% Real Bestie',
      badge: 'Safe 🛡️',
      color: 'mint',
      desc: 'You passed with flying colors! Absolutely unshakeable friendship.',
      pct,
    };
  }
  if (r >= 0.7) {
    return {
      emoji: '😎',
      text: 'Pretty Solid Friend',
      status: 'Safe for now 👀',
      badge: 'Safe 🛡️',
      color: 'lemon',
      desc: 'You know your stuff! Only a couple of minor slip-ups.',
      pct,
    };
  }
  if (r >= 0.4) {
    return {
      emoji: '🤨',
      text: 'Acquaintance Energy',
      status: 'Danger Zone ⚠️',
      badge: 'Sus ⚠️',
      color: 'orange',
      desc: 'Have we actually hung out or do you just watch my stories?',
      pct,
    };
  }
  if (r > 0) {
    return {
      emoji: '😬',
      text: 'Barely Know Me',
      status: 'Fake Friend Alert 🚨',
      badge: 'Fake Friend 🚨',
      color: 'pink',
      desc: 'Were you guessing with your eyes closed?! High risk friend.',
      pct,
    };
  }
  return {
    emoji: '💀',
    text: 'Total Stranger',
    status: 'Block List Speedrun 🚫',
    badge: 'Blocked 🚫',
    color: 'pink',
    desc: '0 points?! Who even gave you this link? Time to rethink everything.',
    pct,
  };
}
