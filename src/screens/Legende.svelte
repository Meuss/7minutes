<script>
  import Bottle from '../components/Bottle.svelte'
  import { app, goto, startGame, toggleMute } from '../lib/state.svelte.js'
  import { unlockAudio, play } from '../lib/audio.js'
  import { formatTime } from '../lib/verdicts.js'

  let taps = $state(0)
  let secret = $state(false)

  function tapBottle() {
    if (secret) return
    taps += 1
    play('tap')
    if (taps >= 15) {
      secret = true
      play('win')
    }
  }

  function defi() {
    unlockAudio()
    startGame()
  }
</script>

<div class="screen">
  <div class="toprow">
    <span></span>
    <button class="icon-btn" onclick={toggleMute} aria-label="Son">
      {app.muted ? '🔇' : '🔊'}
    </button>
  </div>

  <div class="kicker">— GBM  —</div>
  <h1 class="title-neon" style="font-size:46px;margin-top:6px">7 MIN<br />CHRONO</h1>

  <div class="fill">
    <button class="bottle-tap" onclick={tapBottle} aria-label="La bouteille de Suze">
      <Bottle liquid={100} ivresse={taps * 6} height={250} />
    </button>
  </div>

  <div class="stack">
    <button class="btn" onclick={defi}>RELEVER LE DÉFI ▸</button>
    <button class="btn btn-ghost" onclick={() => goto('classement')}>🏆 Classement</button>
  </div>

  <div class="legend-foot">
    HIGH SCORE — CONST &amp; MEUSS
    {#if app.bestMs != null}
      <br /><span style="color:var(--cyan)">Ton record : {formatTime(app.bestMs)}</span>
    {/if}
  </div>

  {#if secret}
    <button class="secret" onclick={() => (secret = false)}>
      <div class="pop">
        <div style="font-size:54px">🤫🍋</div>
        <h3 class="title-neon" style="font-size:22px">Secret débloqué !</h3>
        <p class="muted" style="max-width:280px">
          Rumeur : après la bouteille, Thomas aurait juré « plus jamais »… puis
          a remis ça la semaine suivante. La légende ne meurt jamais.
        </p>
        <div class="subtitle">(touche pour fermer)</div>
      </div>
    </button>
  {/if}
</div>

<style>
  .bottle-tap {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  .story {
    font-size: 13px;
    line-height: 1.5;
    max-width: 330px;
    margin: 4px 0 14px;
  }
  .legend-foot {
    margin-top: 12px;
    font-size: 10px;
    letter-spacing: 1px;
    color: var(--muted);
  }
  .secret {
    position: fixed;
    inset: 0;
    border: none;
    background: rgba(10, 6, 24, 0.92);
    color: var(--ink);
    display: grid;
    place-items: center;
    z-index: 50;
    padding: 24px;
  }
</style>
