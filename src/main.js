import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const app = mount(App, { target: document.getElementById('app') })

// Dev-only: expose state for manual/automated testing in the browser console.
if (import.meta.env.DEV) {
  import('./lib/state.svelte.js').then((S) => {
    window.__S = S
  })
}

export default app
