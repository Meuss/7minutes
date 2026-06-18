// Audio engine.
// Real mp3 samples (added by Thomas) for: glou, choke, win, hiccup.
// Synthesised blips for the rest: combo, tap.
// AudioContext + <audio> elements are unlocked on the first user gesture
// (mobile autoplay rules).

import glouUrl from '../assets/glou.mp3'
import chokeUrl from '../assets/choke.mp3'
import winUrl from '../assets/win.mp3'
import hiccupUrl from '../assets/hiccup.mp3'

let ctx = null
let muted = false
let unlocked = false

// ---- mp3 samples ----
function makeAudio(url, { loop = false, volume = 0.85 } = {}) {
  const a = new Audio(url)
  a.preload = 'auto'
  a.loop = loop
  a.volume = volume
  return a
}
const samples = {
  glou: makeAudio(glouUrl, { loop: true, volume: 0.7 }),
  choke: makeAudio(chokeUrl, { volume: 0.9 }),
  win: makeAudio(winUrl, { volume: 0.9 }),
  hiccup: makeAudio(hiccupUrl, { volume: 0.95 }),
}

export function setMuted(v) {
  muted = v
  for (const a of Object.values(samples)) a.muted = v
  if (muted) stopGlou()
}

function ensureCtx() {
  if (muted) return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Synthesised blip (used for combo / tap only).
function blip({ freq = 220, dur = 0.12, type = 'sine', when = 0, gain = 0.18, slideTo = null }) {
  const c = ensureCtx()
  if (!c) return
  const t = c.currentTime + when
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function playSample(a, { start = 0, randomStart = false } = {}) {
  if (muted) return
  try {
    let t = start
    if (randomStart) {
      const dur = a.duration
      // Start somewhere in the file (not the very end) for variety each chug.
      const max = Number.isFinite(dur) && dur > 0.6 ? dur - 0.4 : 1.0
      t = Math.random() * max
    }
    a.currentTime = t
    const p = a.play()
    if (p) p.catch(() => {})
  } catch {
    /* ignore */
  }
}

export function play(name) {
  if (muted) return
  switch (name) {
    case 'glou':
      playSample(samples.glou, { randomStart: true }) // start at a random glug
      break
    case 'choke':
      playSample(samples.choke, { start: 0.5 }) // skip the first half-second
      break
    case 'win':
      playSample(samples.win)
      break
    case 'hiccup':
      playSample(samples.hiccup)
      break
    case 'combo':
      blip({ freq: 520, slideTo: 880, dur: 0.12, type: 'square', gain: 0.12 })
      break
    case 'tap':
      blip({ freq: 660, dur: 0.05, type: 'square', gain: 0.08 })
      break
  }
}

export function stopGlou() {
  try {
    samples.glou.pause()
    samples.glou.currentTime = 0
  } catch {
    /* ignore */
  }
}

// Call from a user gesture to unlock audio on iOS (AudioContext + <audio>).
// Runs once. NB: we deliberately skip `glou` — it is always started by a direct
// gesture (chug press), so it unlocks itself. Pre-playing+pausing it here would
// race with that press and silence it.
export function unlockAudio() {
  if (muted) return
  ensureCtx()
  if (unlocked) return
  unlocked = true
  for (const [name, a] of Object.entries(samples)) {
    if (name === 'glou') continue
    try {
      const v = a.volume
      a.volume = 0
      const restore = () => {
        a.pause()
        a.currentTime = 0
        a.volume = v
      }
      const p = a.play()
      if (p) p.then(restore).catch(() => (a.volume = v))
      else restore()
    } catch {
      /* ignore */
    }
  }
}
