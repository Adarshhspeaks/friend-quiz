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

// funny titles based on score ratio
export function titleFor(score, total) {
  const r = total ? score / total : 0;
  if (r === 1) return { emoji: '👑', text: 'Certified bestie' };
  if (r >= 0.7) return { emoji: '😎', text: 'Pretty solid friend' };
  if (r >= 0.4) return { emoji: '🤨', text: 'Acquaintance energy' };
  if (r > 0) return { emoji: '😬', text: 'Barely know me' };
  return { emoji: '💀', text: "Can't be trusted" };
}
