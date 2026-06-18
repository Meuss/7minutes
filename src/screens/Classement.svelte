<script>
  import { onMount } from 'svelte'
  import { goto, startGame, RESERVED_LEGEND } from '../lib/state.svelte.js'
  import { fetchScores } from '../lib/leaderboard.js'
  import { formatTime } from '../lib/verdicts.js'

  let loading = $state(true)
  let scores = $state([])
  const myPseudo = (() => {
    try { return localStorage.getItem('suze-pseudo') || '' } catch { return '' }
  })()

  onMount(async () => {
    scores = await fetchScores()
    loading = false
  })
</script>

<div class="screen" style="justify-content:flex-start">
  <div class="toprow">
    <button class="icon-btn" onclick={() => goto('legende')} aria-label="Retour">←</button>
    <span></span>
  </div>

  <div class="kicker" style="margin-top:40px">— Hall of Fame —</div>
  <h1 class="title-neon" style="font-size:30px;margin:4px 0 14px">CLASSEMENT</h1>

  <div class="board">
    <!-- The untouchable legend, pinned at #1 -->
    <div class="entry legend">
      <span class="pos">①</span>
      <span class="name">{RESERVED_LEGEND.pseudo}</span>
      <span class="t">7:00</span>
      <span class="tag">INTOUCHABLES</span>
    </div>

    {#if loading}
      <div class="info">Chargement…</div>
    {:else if scores.length === 0}
      <div class="info">Personne n’a encore osé. Sois le premier ! 🍶</div>
    {:else}
      {#each scores.slice(0, 30) as s, i}
        <div class="entry" class:me={s.pseudo === myPseudo && myPseudo}>
          <span class="pos">{i + 2}</span>
          <span class="name">{s.pseudo || 'Anonyme'}</span>
          <span class="t">{formatTime(s.timeMs)}</span>
          {#if s.verdict}<span class="tag soft">{s.verdict}</span>{/if}
        </div>
      {/each}
    {/if}
  </div>

  <button class="btn" style="max-width:320px;margin-top:16px" onclick={() => startGame()}>
    RELEVER LE DÉFI ▸
  </button>
</div>

<style>
  .board {
    width: 100%;
    max-width: 380px;
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 2px;
  }
  .entry {
    display: grid;
    grid-template-columns: 34px 1fr auto;
    grid-template-areas: 'pos name t' 'pos tag tag';
    align-items: center;
    gap: 2px 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 10px 14px;
    text-align: left;
  }
  .pos { grid-area: pos; font-weight: 900; color: var(--muted); font-size: 18px; }
  .name { grid-area: name; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .t { grid-area: t; font-weight: 900; color: var(--cyan); }
  .tag {
    grid-area: tag;
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--bg-0);
    background: var(--suze);
    border-radius: 6px;
    padding: 1px 6px;
    justify-self: start;
    font-weight: 800;
  }
  .tag.soft { background: rgba(255, 95, 219, 0.25); color: var(--magenta); }
  .legend {
    border: 1.5px solid var(--suze);
    box-shadow: var(--glow-suze);
    background: rgba(255, 242, 0, 0.08);
  }
  .legend .name { color: var(--suze); }
  .legend .t { color: var(--suze); }
  .me { border-color: var(--cyan); box-shadow: var(--glow-cyan); }
  .info { color: var(--muted); padding: 24px 8px; font-size: 14px; }
</style>
