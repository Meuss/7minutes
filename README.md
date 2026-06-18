# 🍾 7 Minutes

![7 minutes](screenshot.png)

## Stack

- [Svelte 5](https://svelte.dev) + [Vite](https://vite.dev) — static build.
- Leaderboard: Google Sheets via Apps Script.
- Hosting: GitHub Pages

## Development

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

The game runs without a backend: until the leaderboard is configured, scores are stored locally (per device).

## Deployment

Every push to `master` builds and publishes the site via GitHub Actions.
