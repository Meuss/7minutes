<script>
  import Bottle from '../components/Bottle.svelte'
  import Gauges from '../components/Gauges.svelte'
  import {
    app,
    game,
    goto,
    startChug,
    stopChug,
    hitHoquet,
    abortGame,
    toggleMute,
  } from '../lib/state.svelte.js'
  import { unlockAudio } from '../lib/audio.js'

  $effect(() => {
    if (game.status === 'won' || game.status === 'lost') goto('resultat')
  })

  function down(e) {
    e.preventDefault()
    unlockAudio()
    startChug()
  }
  function up() {
    stopChug()
  }
  function quit() {
    abortGame()
    goto('legende')
  }
  function tapHoquet(e) {
    e.preventDefault()
    hitHoquet()
  }

  let amp = $derived(Math.min(8, game.ivresse * 0.11))
  let blur = $derived(Math.min(1.5, game.ivresse * 0.016))
</script>

<div class="screen">
  <div class="toprow">
    <button class="icon-btn" onclick={quit} aria-label="Quitter">✕</button>
    <button class="icon-btn" onclick={toggleMute} aria-label="Son">{app.muted ? '🔇' : '🔊'}</button>
  </div>

  <!-- THE GOAL: an unmistakable bottle progress bar -->
  <div class="bottle-meter" style="margin-top:46px">
    <div class="bm-top">
      <span>🍾 BOUTEILLE</span>
      <span class="pct">{Math.round(game.liquid)}%</span>
    </div>
    <div class="bm-bar">
      <div class="bm-fill" style="width:{game.liquid}%"></div>
    </div>
    {#if game.liquid > 0 && game.liquid < 15}
      <div class="last">⚡ DERNIÈRE GORGÉE !</div>
    {/if}
  </div>

  <div class="wobble" style="--amp:{amp}deg; filter:blur({blur}px)" class:on={game.ivresse > 4}>
    <div class="fill" style="justify-content:center">
      <Bottle liquid={game.liquid} ivresse={game.ivresse} height={200} />
    </div>
  </div>

  <Gauges gorge={game.gorge} ivresse={game.ivresse} combo={game.combo} />

  <!-- 3 · 2 · 1 · GO countdown -->
  {#if game.status === 'countdown'}
    <div class="countdown-layer">
      {#key game.countdown}
        <div class="cd-num" class:go={game.countdown === 0}>
          {game.countdown > 0 ? game.countdown : 'GO !'}
        </div>
      {/key}
      <div class="cd-tip">Prépare-toi à vider la bouteille…</div>
    </div>
  {/if}

  <button
    class="chug"
    class:active={game.chugging}
    class:locked={!!game.hoquet}
    onpointerdown={down}
    onpointerup={up}
    onpointerleave={up}
    onpointercancel={up}
  >
    {#if game.hoquet}🤭 HOQUET !{:else if game.chugging}GLOU GLOU GLOU{:else}MAINTIENS POUR BOIRE{/if}
  </button>

  <div class="chug-hint">Bois par à-coups… puis <b>respire</b> avant d’étouffer !</div>

  <!-- Drunk vignette: makes ivresse visibly felt -->
  <div
    class="vignette"
    class:throb={game.ivresse > 70}
    style="opacity:{(game.ivresse / 100) * 0.6}"
  ></div>

  <!-- le Hoquet: reflex event -->
  {#if game.hoquet}
    <div class="hoquet-layer">
      <div class="hoquet-banner">🤭 HOQUET ! TAPE VITE</div>
      <button
        class="hoquet-target"
        style="left:{game.hoquet.x}%; top:{game.hoquet.y}%; --dur:{game.hoquet.duration}ms"
        onpointerdown={tapHoquet}
        aria-label="Tape le hoquet"
      >
        <span class="ring"></span>
        <span class="dot">TAP</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .bottle-meter {
    width: 100%;
    max-width: 360px;
  }
  .bm-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-weight: 900;
    letter-spacing: 1px;
    font-size: 13px;
    color: var(--ink);
    margin-bottom: 4px;
  }
  .pct {
    font-size: 26px;
    color: var(--suze);
    text-shadow: var(--glow-suze);
  }
  .bm-bar {
    height: 22px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 242, 0, 0.25);
    border-radius: 11px;
    overflow: hidden;
  }
  .bm-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--suze-deep), var(--suze));
    box-shadow: var(--glow-suze);
    border-radius: 11px;
    transition: width 0.05s linear;
  }
  .last {
    margin-top: 6px;
    text-align: center;
    font-weight: 900;
    color: var(--suze);
    text-shadow: var(--glow-suze);
    animation: blink 0.4s infinite;
  }
  @keyframes blink {
    50% {
      opacity: 0.35;
    }
  }

  .wobble {
    width: 100%;
    display: flex;
    transition: filter 0.2s ease;
  }
  .wobble.on {
    animation: wob 0.8s ease-in-out infinite;
  }
  @keyframes wob {
    0%,
    100% {
      transform: rotate(calc(var(--amp) * -1)) translateX(calc(var(--amp) * -1px));
    }
    50% {
      transform: rotate(var(--amp)) translateX(calc(var(--amp) * 1px));
    }
  }

  .chug {
    margin-top: 14px;
    width: 100%;
    max-width: 360px;
    height: 92px;
    border: none;
    border-radius: 24px;
    font-family: var(--font);
    font-weight: 900;
    font-size: 22px;
    letter-spacing: 1px;
    color: var(--bg-0);
    background: linear-gradient(180deg, var(--suze), var(--suze-deep));
    box-shadow: var(--glow-suze);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }
  .chug.active {
    transform: scale(0.97);
    background: linear-gradient(180deg, var(--magenta), var(--suze));
    box-shadow: 0 0 30px rgba(255, 95, 219, 0.7);
  }
  .chug.locked {
    background: rgba(255, 255, 255, 0.12);
    color: var(--muted);
    box-shadow: none;
  }

  .chug-hint {
    min-height: 52px;
    margin-top: 12px;
    font-size: 12px;
    color: var(--muted);
    max-width: 320px;
  }

  .countdown-layer {
    position: fixed;
    inset: 0;
    z-index: 45;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    background: rgba(10, 6, 24, 0.72);
    backdrop-filter: blur(2px);
  }
  .cd-num {
    font-family: 'Impact', var(--font);
    font-weight: 900;
    font-size: 160px;
    line-height: 1;
    color: var(--suze);
    text-shadow: var(--glow-suze);
    animation: cd-pop 0.6s cubic-bezier(0.2, 1.5, 0.4, 1) both;
  }
  .cd-num.go {
    font-size: 96px;
    color: var(--magenta);
    text-shadow: var(--glow-magenta);
  }
  .cd-tip {
    color: var(--muted);
    font-size: 14px;
    letter-spacing: 0.5px;
  }
  @keyframes cd-pop {
    0% {
      transform: scale(2.2);
      opacity: 0;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0.85);
      opacity: 0.25;
    }
  }

  .vignette {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    background: radial-gradient(
      circle at 50% 50%,
      transparent 42%,
      rgba(255, 95, 219, 0.5) 88%,
      rgba(255, 77, 77, 0.6) 100%
    );
    transition: opacity 0.2s ease;
  }
  .vignette.throb {
    animation: throb 0.7s ease-in-out infinite;
  }
  @keyframes throb {
    50% {
      filter: brightness(1.4);
    }
  }

  .hoquet-layer {
    position: fixed;
    inset: 0;
    z-index: 40;
  }
  .hoquet-banner {
    position: absolute;
    top: calc(env(safe-area-inset-top) + 118px);
    left: 0;
    right: 0;
    text-align: center;
    font-weight: 900;
    font-size: 20px;
    color: var(--magenta);
    text-shadow: var(--glow-magenta);
    animation: blink 0.3s infinite;
  }
  .hoquet-target {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 92px;
    height: 92px;
    border: none;
    background: none;
    cursor: pointer;
    touch-action: none;
    display: grid;
    place-items: center;
  }
  .hoquet-target .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 4px solid var(--magenta);
    box-shadow: var(--glow-magenta), inset 0 0 14px var(--magenta);
    animation: shrink var(--dur) linear forwards;
  }
  .hoquet-target .dot {
    position: relative;
    font-weight: 900;
    font-size: 16px;
    color: var(--ink);
    background: var(--magenta);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    box-shadow: var(--glow-magenta);
  }
  @keyframes shrink {
    from {
      transform: scale(2.4);
      opacity: 0.4;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wobble.on,
    .vignette.throb {
      animation: none;
    }
  }
</style>
