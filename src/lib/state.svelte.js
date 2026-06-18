// Central reactive state (Svelte 5 runes) + game loop for "Respire ou étouffe".
// Three distinct axes:
//   liquid  — the GOAL: empty the bottle to win.
//   gorge   — short-term RHYTHM: rises while chugging, falls while breathing; max = choke.
//   ivresse — long-term DOOM CLOCK: only ever rises; max = pass out. Drives wobble + hiccups.
// Plus le Hoquet: random reflex events that fail you if you don't tap in time.
// Tuning constants live at the top so difficulty is easy to balance.

import { play, stopGlou, setMuted } from './audio.js'

// ---- Tuning ----
const CHUG_DRAIN = 7.2          // % of bottle emptied per second while chugging
const GORGE_RISE = 44           // choke gauge rise /s while chugging
const GORGE_FALL = 70           // choke gauge fall /s while breathing
const IVRESSE_CHUG = 5.4        // drunkenness rise /s while chugging
const IVRESSE_TIME = 0.6        // drunkenness rise /s ALWAYS while playing (the doom clock)
const SWEET_MIN = 68            // release inside [SWEET_MIN, SWEET_MAX] to build combo
const SWEET_MAX = 97
const TIMID = 40                // releasing below this resets your combo
const COMBO_MAX = 5
const COMBO_DRAIN_STEP = 0.16   // each combo level speeds emptying by 16%

// le Hoquet (reflex events)
const HOQUET_FIRST = 4500       // ms before the first possible hiccup
const HOQUET_GAP_MIN = 4200     // ms base gap between hiccups (sober)
const HOQUET_GAP_MAX = 7200
const HOQUET_GAP_FLOOR = 2400   // never closer than this
const HOQUET_WINDOW_SOBER = 1500 // ms to react when sober
const HOQUET_WINDOW_DRUNK = 820  // ms to react when wasted

export const RESERVED_LEGEND = { pseudo: 'Const & Meuss', timeMs: 420000 } // 7:00

const FAILS = {
  choke: { emoji: '🤢', title: 'Étouffé', blurb: 'La gorge a dit stop. Bois par petites gorgées !' },
  passout: { emoji: '😵', title: 'K.-O.', blurb: 'Trop ivre, tu t’es écroulé. Faut finir plus vite !' },
  hoquet: { emoji: '🤭', title: 'Hoquet fatal', blurb: 'Un hoquet t’a eu. Reste sur tes gardes !' },
}

// ---- App-level UI state ----
export const app = $state({
  view: 'legende', // legende | defi | resultat | classement
  muted: false,
  bestMs: loadBest(),
})

// ---- Per-round game state ----
export const game = $state({
  status: 'idle', // idle | countdown | playing | won | lost
  countdown: 0, // 3 → 2 → 1 → 0 (GO!) during the countdown phase
  liquid: 100,
  gorge: 0,
  ivresse: 0,
  combo: 1,
  chugging: false,
  elapsedMs: 0,
  hoquet: null, // null | { x, y, deadline, duration }
  nextHoquetAt: HOQUET_FIRST,
  fail: null, // { emoji, title, blurb } when lost
})

let rafId = null
let lastTs = 0
let countdownTimer = null

export function goto(view) {
  app.view = view
}

export function toggleMute() {
  app.muted = !app.muted
  setMuted(app.muted)
}

export function resetRound() {
  game.status = 'idle'
  game.countdown = 0
  game.liquid = 100
  game.gorge = 0
  game.ivresse = 0
  game.combo = 1
  game.chugging = false
  game.elapsedMs = 0
  game.hoquet = null
  game.nextHoquetAt = HOQUET_FIRST
  game.fail = null
}

// Starts with a 3 · 2 · 1 · GO countdown, then runs the round.
// Pass { instant: true } to skip the countdown (used by tests).
export function startGame(opts) {
  resetRound()
  app.view = 'defi'
  clearInterval(countdownTimer)

  if (opts && opts.instant) {
    beginPlaying()
    return
  }

  game.status = 'countdown'
  game.countdown = 3
  play('tap')
  countdownTimer = setInterval(() => {
    game.countdown -= 1
    if (game.countdown > 0) {
      play('tap')
    } else {
      play('combo') // GO!
      clearInterval(countdownTimer)
      countdownTimer = null
      setTimeout(beginPlaying, 450) // brief "GO !" flash
    }
  }, 1000)
}

function beginPlaying() {
  if (game.status === 'playing') return
  game.status = 'playing'
  game.countdown = 0
  lastTs = performance.now()
  rafId = requestAnimationFrame(loop)
}

export function startChug() {
  if (game.status !== 'playing' || game.hoquet) return
  game.chugging = true
  play('glou')
}

export function stopChug() {
  if (game.status !== 'playing' || !game.chugging) return
  game.chugging = false
  stopGlou()
  // Reward nerve: releasing late (in the sweet spot) builds a combo.
  if (game.gorge >= SWEET_MIN && game.gorge <= SWEET_MAX) {
    game.combo = Math.min(COMBO_MAX, game.combo + 1)
    play('combo')
  } else if (game.gorge < TIMID) {
    game.combo = 1
  }
}

// Player tapped the hiccup target in time.
export function hitHoquet() {
  if (!game.hoquet) return
  game.hoquet = null
  game.gorge = Math.max(0, game.gorge - 12)
  game.combo = Math.min(COMBO_MAX, game.combo + 1)
  play('combo')
  scheduleNextHoquet()
}

function scheduleNextHoquet() {
  const span = HOQUET_GAP_MIN + Math.random() * (HOQUET_GAP_MAX - HOQUET_GAP_MIN)
  const drunkFactor = 1 - (game.ivresse / 100) * 0.5 // up to 50% more frequent
  game.nextHoquetAt = game.elapsedMs + Math.max(HOQUET_GAP_FLOOR, span * drunkFactor)
}

function triggerHoquet() {
  game.chugging = false
  stopGlou()
  const window =
    HOQUET_WINDOW_SOBER - (HOQUET_WINDOW_SOBER - HOQUET_WINDOW_DRUNK) * (game.ivresse / 100)
  game.hoquet = {
    x: 15 + Math.random() * 70, // % of play area
    y: 20 + Math.random() * 38,
    deadline: game.elapsedMs + window, // game-clock based (testable, no drift)
    duration: window,
  }
  play('hiccup')
}

// One simulation step. dt in seconds. Mutates game; may end the round.
function step(dt) {
  if (game.status !== 'playing') return

  if (game.chugging && !game.hoquet) {
    const drainMult = 1 + (game.combo - 1) * COMBO_DRAIN_STEP
    game.liquid = Math.max(0, game.liquid - CHUG_DRAIN * drainMult * dt)
    game.gorge = Math.min(100, game.gorge + GORGE_RISE * dt)
    game.ivresse = Math.min(100, game.ivresse + IVRESSE_CHUG * dt)
  } else {
    game.gorge = Math.max(0, game.gorge - GORGE_FALL * dt)
  }

  // Doom clock ticks the whole time you're playing.
  game.ivresse = Math.min(100, game.ivresse + IVRESSE_TIME * dt)
  game.elapsedMs += dt * 1000

  // Schedule / resolve hiccups.
  if (!game.hoquet && game.liquid > 4 && game.elapsedMs >= game.nextHoquetAt) {
    triggerHoquet()
  }
  if (game.hoquet && game.elapsedMs > game.hoquet.deadline) return lose('hoquet')

  // Win / lose checks.
  if (game.liquid <= 0) return win()
  if (game.gorge >= 100) return lose('choke')
  if (game.ivresse >= 100) return lose('passout')
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - lastTs) / 1000)
  lastTs = ts
  step(dt)
  if (game.status === 'playing') rafId = requestAnimationFrame(loop)
}

// Dev/test only: advance the simulation deterministically without rAF.
export function stepForTest(ms) {
  step(ms / 1000)
}

function win() {
  cancelAnimationFrame(rafId)
  game.status = 'won'
  game.chugging = false
  game.hoquet = null
  stopGlou()
  play('win')
  const timeMs = Math.round(game.elapsedMs)
  if (app.bestMs == null || timeMs < app.bestMs) {
    app.bestMs = timeMs
    saveBest(timeMs)
  }
}

function lose(reason) {
  cancelAnimationFrame(rafId)
  game.status = 'lost'
  game.chugging = false
  game.hoquet = null
  stopGlou()
  play(reason === 'hoquet' ? 'choke' : 'choke')
  game.fail = FAILS[reason] || FAILS.choke
}

export function abortGame() {
  cancelAnimationFrame(rafId)
  clearInterval(countdownTimer)
  countdownTimer = null
  stopGlou()
  resetRound()
}

// ---- localStorage best time ----
function loadBest() {
  try {
    const v = localStorage.getItem('suze-best-ms')
    return v ? Number(v) : null
  } catch {
    return null
  }
}
function saveBest(ms) {
  try {
    localStorage.setItem('suze-best-ms', String(ms))
  } catch {
    /* ignore */
  }
}
