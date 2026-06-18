<script>
  import { app } from './lib/state.svelte.js'
  import Legende from './screens/Legende.svelte'
  import Defi from './screens/Defi.svelte'
  import Resultat from './screens/Resultat.svelte'
  import Classement from './screens/Classement.svelte'
</script>

{#if app.view === 'legende'}
  <Legende />
{:else if app.view === 'defi'}
  <Defi />
{:else if app.view === 'resultat'}
  <Resultat />
{:else if app.view === 'classement'}
  <Classement />
{/if}
