# Leaderboard backend — Google Sheets via Apps Script

The shared leaderboard is a free Google Apps Script web app that reads from and
writes to a Google Sheet you own. No account beyond your Google account, no cost.

## Setup (≈ 5 minutes)

1. Create a new **Google Sheet** (sheets.new). Name it whatever you like.
2. In the sheet: **Extensions ▸ Apps Script**. This opens the script editor bound
   to that sheet.
3. Delete the placeholder code, then **paste the entire contents of [`Code.gs`](./Code.gs)**.
   Save (💾).
4. **Deploy ▸ New deployment**.
   - Click the gear ⚙ and choose **Web app**.
   - **Description:** `7 minutes chrono`
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
   - Click **Deploy**, then **Authorize access** and allow the permissions
     (it's your own script writing to your own sheet).
5. Copy the **Web app URL** — it looks like
   `https://script.google.com/macros/s/AKfy.................../exec`.
6. Open [`src/lib/leaderboard.js`](../src/lib/leaderboard.js) and paste that URL
   into the `ENDPOINT` constant:
   ```js
   export const ENDPOINT = 'https://script.google.com/macros/s/AKfy..../exec'
   ```
7. Rebuild / redeploy the site. Done — scores now land in your Sheet (a `Scores`
   tab is created automatically) and the Classement screen reads from it.

## Notes

- **No setup needed to develop:** while `ENDPOINT` is empty, the app runs in
  local-only mode (scores saved on each device) and never errors.
- **Updating `Code.gs` later:** after editing, do **Deploy ▸ Manage deployments ▸
  ✏️ Edit ▸ Version: New version ▸ Deploy** to publish changes. The URL stays the
  same.
- **Why `text/plain`?** The site POSTs scores as `text/plain` JSON so the browser
  treats it as a "simple" request and skips the CORS preflight that Apps Script
  can't answer. `Code.gs` parses `e.postData.contents`.
- **Moderation:** the endpoint is open (fine for a private friends' joke site).
  If anyone spams it, just delete rows in the Sheet — you own the data.
