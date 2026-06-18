import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Relative base so the build works on GitHub Pages under /<repo-name>/
// regardless of the repository name (the app is a single-page, no routing).
export default defineConfig({
  base: './',
  plugins: [svelte()],
})
