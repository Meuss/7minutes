import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Unique id per build. Baked into the bundle (__BUILD_ID__) and published as
// version.json so already-open clients can detect a new deploy and self-update.
const BUILD_ID = Date.now().toString(36)

// Relative base so the build works on GitHub Pages under /<repo-name>/
// regardless of the repository name (the app is a single-page, no routing).
export default defineConfig({
  base: './',
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  plugins: [
    svelte(),
    {
      name: 'emit-version-json',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify({ build: BUILD_ID }),
        })
      },
    },
  ],
})
