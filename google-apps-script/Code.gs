/**
 * 7 Minutes Chrono — leaderboard backend (Google Apps Script).
 *
 * Bind this script to a Google Sheet (Extensions ▸ Apps Script), then deploy it
 * as a Web App (see README.md). The sheet stores one row per finished game.
 *
 * Columns (row 1 is a header, created automatically): Date | Pseudo | TimeMs | Verdict
 */

var SHEET_NAME = 'Scores'
var MAX_RETURNED = 100

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    sheet.appendRow(['Date', 'Pseudo', 'TimeMs', 'Verdict'])
  }
  return sheet
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  )
}

// READ — returns finishers sorted by time (fastest first).
function doGet() {
  var sheet = getSheet()
  var values = sheet.getDataRange().getValues()
  var scores = []
  for (var i = 1; i < values.length; i++) {
    var row = values[i]
    var timeMs = Number(row[2])
    if (!timeMs) continue
    scores.push({ pseudo: String(row[1] || 'Anonyme'), timeMs: timeMs, verdict: String(row[3] || '') })
  }
  scores.sort(function (a, b) {
    return a.timeMs - b.timeMs
  })
  return json(scores.slice(0, MAX_RETURNED))
}

// WRITE — appends one score. Body is text/plain JSON (a "simple" CORS request).
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    var pseudo = String(data.pseudo || 'Anonyme').slice(0, 24)
    var timeMs = Math.round(Number(data.timeMs))
    var verdict = String(data.verdict || '').slice(0, 40)
    if (!timeMs || timeMs <= 0 || timeMs > 24 * 60 * 60 * 1000) {
      return json({ ok: false, error: 'invalid time' })
    }
    getSheet().appendRow([new Date(), pseudo, timeMs, verdict])
    return json({ ok: true })
  } catch (err) {
    return json({ ok: false, error: String(err) })
  }
}
