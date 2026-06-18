<script>
  import suzeImg from '../assets/suze.png'

  let { liquid = 100, ivresse = 0, glow = true, height = 260 } = $props()

  // The liquid sits roughly between 16% and 90% of the photo height.
  const TOP = 16
  const BOTTOM = 90
  let emptyPct = $derived(((100 - liquid) / 100) * (BOTTOM - TOP))
</script>

<div class="bottle" style="--h:{height}px">
  {#if glow}
    <div class="halo" style="opacity:{0.45 + ivresse / 250}"></div>
  {/if}
  <img src={suzeImg} alt="Bouteille de Suze" draggable="false" />
  <!-- emptied (air) overlay grows from the top of the liquid zone -->
  <div
    class="empty"
    style="top:{TOP}%; height:{emptyPct}%; opacity:{liquid < 100 ? 1 : 0}"
  ></div>
</div>

<style>
  .bottle {
    position: relative;
    height: var(--h);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .bottle img {
    height: 100%;
    user-select: none;
    -webkit-user-drag: none;
    filter: drop-shadow(0 0 26px rgba(255, 242, 0, 0.55));
    position: relative;
    z-index: 2;
  }
  .halo {
    position: absolute;
    width: 70%;
    height: 90%;
    background: radial-gradient(ellipse, rgba(255, 242, 0, 0.5), transparent 70%);
    z-index: 1;
    transition: opacity 0.2s ease;
  }
  .empty {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 26%;
    z-index: 3;
    background: linear-gradient(
      180deg,
      rgba(8, 5, 20, 0.94),
      rgba(8, 5, 20, 0.8)
    );
    border-bottom: 3px solid var(--suze);
    box-shadow: 0 3px 12px rgba(255, 242, 0, 0.6);
    border-radius: 0 0 4px 4px;
    transition: height 0.05s linear, opacity 0.2s ease;
  }
</style>
