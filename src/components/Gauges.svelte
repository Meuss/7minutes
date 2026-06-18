<script>
  let { gorge = 0, ivresse = 0, combo = 1 } = $props()

  // gorge: cyan → magenta → red as you approach choking
  let gorgeColor = $derived(
    gorge < 60 ? 'var(--cyan)' : gorge < 85 ? 'var(--magenta)' : 'var(--danger)'
  )
  let gorgeDanger = $derived(gorge >= 85)
  // ivresse: the doom clock — magenta → red, pulses when near pass-out
  let ivresseColor = $derived(ivresse < 70 ? 'var(--magenta)' : 'var(--danger)')
  let ivresseDanger = $derived(ivresse >= 75)
</script>

<div class="gauges">
  <div class="row">
    <span class="lbl">🤢 GORGE</span>
    <div class="bar" class:pulse={gorgeDanger}>
      <div class="fill" style="width:{gorge}%; background:{gorgeColor}; box-shadow:0 0 10px {gorgeColor}"></div>
    </div>
    {#if combo > 1}<span class="combo">×{combo}</span>{:else}<span class="combo"></span>{/if}
  </div>
  <div class="row">
    <span class="lbl">{ivresseDanger ? '💀' : '😵'} IVRESSE</span>
    <div class="bar" class:pulse={ivresseDanger}>
      <div class="fill" style="width:{ivresse}%; background:{ivresseColor}; box-shadow:0 0 12px {ivresseColor}"></div>
    </div>
    <span class="combo small">{Math.round(ivresse)}</span>
  </div>
</div>

<style>
  .gauges {
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .lbl {
    font-size: 10px;
    letter-spacing: 0.5px;
    color: var(--muted);
    width: 74px;
    text-align: right;
    font-weight: bold;
  }
  .bar {
    flex: 1;
    height: 15px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    border-radius: 8px;
    transition: width 0.05s linear;
  }
  .combo {
    font-weight: 900;
    color: var(--suze);
    text-shadow: var(--glow-suze);
    font-size: 15px;
    min-width: 30px;
    text-align: left;
  }
  .combo.small {
    color: var(--muted);
    text-shadow: none;
    font-size: 12px;
  }
  .pulse {
    animation: pulse 0.4s infinite;
  }
  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 0 rgba(255, 77, 77, 0);
    }
    50% {
      box-shadow: 0 0 14px rgba(255, 77, 77, 0.9);
    }
  }
</style>
