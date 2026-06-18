// Shared leaderboard via a Google Apps Script web app (writes to a Google Sheet).
//
// SETUP: paste the deployed web-app URL below (see google-apps-script/README.md).
// While it is empty, the app runs in local-only mode and never crashes.
export const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxslZGzo5zxo65j99i0SXlq_4SQkiyr38zM9Z7z-3LoCcevbgosEGpT1yDPR6PCeoQ9/exec'

const LOCAL_KEY = 'suze-scores-local'

// GET top finishers, sorted by time asc. Returns [] on any failure.
export async function fetchScores() {
  if (!ENDPOINT) return loadLocal()
  try {
    const res = await fetch(ENDPOINT, { method: 'GET' })
    if (!res.ok) throw new Error('bad status')
    const data = await res.json()
    const scores = Array.isArray(data) ? data : data.scores || []
    return scores
      .filter((s) => typeof s.timeMs === 'number')
      .sort((a, b) => a.timeMs - b.timeMs)
  } catch {
    return loadLocal()
  }
}

// POST a score. Uses text/plain to stay a "simple request" (no CORS preflight).
// Always records locally too, so the board works offline.
export async function submitScore({ pseudo, timeMs, verdict }) {
  const entry = { pseudo: pseudo || 'Anonyme', timeMs, verdict: verdict || '', ts: Date.now() }
  saveLocal(entry)
  if (!ENDPOINT) return { ok: false, offline: true }
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(entry),
    })
    return { ok: true }
  } catch {
    return { ok: false, offline: true }
  }
}

function loadLocal() {
  try {
    const v = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    return v.sort((a, b) => a.timeMs - b.timeMs)
  } catch {
    return []
  }
}
function saveLocal(entry) {
  try {
    const v = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
    v.push(entry)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}
