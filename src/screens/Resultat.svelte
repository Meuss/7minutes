<script>
  import Bottle from '../components/Bottle.svelte'
  import { app, game, goto, startGame } from '../lib/state.svelte.js'
  import { verdictFor, formatTime } from '../lib/verdicts.js'
  import { submitScore } from '../lib/leaderboard.js'

  let won = $derived(game.status === 'won')
  let timeMs = $derived(Math.round(game.elapsedMs))
  let verdict = $derived(
    won
      ? verdictFor(timeMs)
      : {
          rank: game.fail?.title || 'Raté',
          emoji: game.fail?.emoji || '🥴',
          blurb: game.fail?.blurb || 'Réessaie, la légende t’attend.',
        }
  )

  let pseudo = $state(loadPseudo())
  let sending = $state(false)
  let sent = $state(false)

  function loadPseudo() {
    try { return localStorage.getItem('suze-pseudo') || '' } catch { return '' }
  }

  async function envoyer() {
    if (sending || sent) return
    sending = true
    try { localStorage.setItem('suze-pseudo', pseudo) } catch {}
    await submitScore({ pseudo, timeMs, verdict: verdict.rank })
    sending = false
    sent = true
  }

  async function partager() {
    const txt = won
      ? `J'ai vidé la bouteille de Suze en ${formatTime(timeMs)} ! Verdict : ${verdict.rank} ${verdict.emoji}. Bats-moi 👉`
      : `Je me suis étouffé sur la Suze 🥴 (${verdict.rank}). À toi de tenter la légende des 7 minutes 👉`
    const data = { title: '7 Minutes Chrono', text: txt, url: location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else {
        await navigator.clipboard.writeText(txt + ' ' + location.href)
        alert('Copié ! Colle-le à tes amis 😈')
      }
    } catch { /* user cancelled */ }
  }
</script>

<div class="screen">
  <div class="fill" style="gap:6px">
    <div class="pop" style="font-size:64px">{verdict.emoji}</div>
    <h1 class="title-neon pop" style="font-size:30px">{verdict.rank}</h1>
    {#if won}
      <div class="time pop">{formatTime(timeMs)}</div>
    {/if}
    <p class="muted" style="max-width:300px">{verdict.blurb}</p>

    <div style="margin:6px 0">
      <Bottle liquid={won ? 0 : game.liquid} ivresse={game.ivresse} height={150} glow={won} />
    </div>

    {#if won}
      {#if !sent}
        <div class="submit">
          <input
            class="pseudo"
            maxlength="18"
            placeholder="Ton pseudo"
            bind:value={pseudo}
          />
          <button class="btn" onclick={envoyer} disabled={sending || !pseudo.trim()}>
            {sending ? '…' : 'AU CLASSEMENT 🏆'}
          </button>
        </div>
      {:else}
        <div class="sent">✓ Score envoyé !</div>
      {/if}
    {/if}
  </div>

  <div class="stack">
    <button class="btn" onclick={() => startGame()}>↻ REJOUER</button>
    <button class="btn btn-ghost" onclick={partager}>📲 Partager</button>
    <div class="row2">
      <button class="btn btn-ghost half" onclick={() => goto('classement')}>🏆 Classement</button>
      <button class="btn btn-ghost half" onclick={() => goto('legende')}>🏠 Accueil</button>
    </div>
  </div>
</div>

<style>
  .time {
    font-size: 40px;
    font-weight: 900;
    color: var(--cyan);
    text-shadow: var(--glow-cyan);
  }
  .submit {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 320px;
  }
  .pseudo {
    text-align: center;
    padding: 13px;
    border-radius: 14px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
    color: var(--ink);
    font: 700 16px var(--font);
  }
  .pseudo:focus {
    outline: none;
    border-color: var(--cyan);
  }
  .sent {
    color: var(--ok);
    font-weight: 800;
  }
  .row2 {
    display: flex;
    gap: 10px;
  }
  .half {
    flex: 1;
    font-size: 13px;
    padding: 14px 8px;
  }
</style>
