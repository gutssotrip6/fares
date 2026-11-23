// Google Apps Script for the "Bientôt dans votre ville" form.
// Setup: open the Google Sheet > Extensions > Apps Script, paste this file, then
// Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
// Put the Web app URL in the GOOGLE_SHEETS_WEBHOOK_URL environment variable of the site.

const HEADERS = ["Date", "E-mail", "Pays", "Ville"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([
      data.submittedAt ? new Date(data.submittedAt) : new Date(),
      String(data.email || ""),
      String(data.country || ""),
      String(data.city || ""),
    ]);
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
