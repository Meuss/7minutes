// Force already-open clients onto the latest deploy — no service worker.
//
// GitHub Pages fingerprints every asset except index.html, which its CDN caches
// (~10 min). So open tabs / home-screen launches can run a stale build. We compare
// a build id baked into this bundle against an always-fresh version.json and, when
// they differ, hard-reload with a cache-busting query that forces the CDN to serve
// the new index.html.

/* global __BUILD_ID__ */
const CURRENT = __BUILD_ID__
const VERSION_URL = `${import.meta.env.BASE_URL}version.json`
const TRIED_KEY = 'suze-reloaded-for'

async function latestBuild() {
  const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  return data.build || null
}

async function checkAndUpdate() {
  try {
    const latest = await latestBuild()
    if (!latest || latest === CURRENT) return
    // Guard against a reload loop if a stale CDN keeps serving the old HTML.
    if (sessionStorage.getItem(TRIED_KEY) === latest) return
    sessionStorage.setItem(TRIED_KEY, latest)
    const url = new URL(location.href)
    url.searchParams.set('v', latest) // unique URL busts the CDN's index.html cache
    location.replace(url.toString())
  } catch {
    /* offline or version.json missing — ignore */
  }
}

// Check on load, whenever the tab regains focus, and every 5 minutes.
export function startVersionWatch() {
  checkAndUpdate()
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkAndUpdate()
  })
  setInterval(checkAndUpdate, 5 * 60 * 1000)
}
