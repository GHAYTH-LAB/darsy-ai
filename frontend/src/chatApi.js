const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

function sessionPath(sessionId, resource = '') {
  return `/sessions/${encodeURIComponent(sessionId)}${resource}`;
}

async function request(path, options = {}) {
  const token = localStorage.getItem('darsy:access_token');
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = payload?.detail || payload?.message || payload?.msg;
    throw new Error(typeof detail === 'string' ? detail : `Request failed (${response.status})`);
  }
  return payload;
}

export async function listSessionDocuments(sessionId) {
  const result = await request(sessionPath(sessionId, '/documents'));
  const documents = Array.isArray(result) ? result : result?.documents;
  if (!Array.isArray(documents)) return [];
  return documents.map(document => ({
    ...document,
    name: document.name || document.filename || 'Document',
  }));
}

export async function saveSessionFile(sessionId, file) {
  const form = new FormData();
  form.append('file', file);
  return request(sessionPath(sessionId, '/documents'), {
    method: 'POST',
    body: form,
  });
}

export async function discardSessionDocuments(sessionId) {
  return request(sessionPath(sessionId, '/documents'), { method: 'DELETE' });
}

export async function askSessionAgent(sessionId, message, history = []) {
  const result = await request(sessionPath(sessionId, '/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  return result?.answer ?? result?.response ?? result?.message ?? result;
}
