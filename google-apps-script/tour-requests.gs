// Google Apps Script receiving the site's forms.
// Setup: open the Google Sheet > Extensions > Apps Script, paste this file, then
// Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
// Put the Web app URL in the GOOGLE_SHEETS_WEBHOOK_URL environment variable of the site.
// After editing, redeploy with Deploy > Manage deployments > Edit > Version: New version (keeps the URL).
//
// "Bientôt dans votre ville" requests go to the first tab; newsletter sign-ups to a "Newsletter" tab.

const TOUR_HEADERS = ["Date", "E-mail", "Pays", "Ville"];
const NEWSLETTER_HEADERS = ["Date", "E-mail"];
const NEWSLETTER_SHEET = "Newsletter";

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Empty POST request");
    }

    const data = JSON.parse(e.postData.contents);
    if (!data.email) {
      throw new Error("Email is required");
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const submittedAt = data.submittedAt ? new Date(data.submittedAt) : new Date();
    const email = String(data.email);

    if (data.type === "newsletter") {
      const sheet = spreadsheet.getSheetByName(NEWSLETTER_SHEET) || spreadsheet.insertSheet(NEWSLETTER_SHEET);
      if (sheet.getLastRow() === 0) sheet.appendRow(NEWSLETTER_HEADERS);
      sheet.appendRow([submittedAt, email]);
    } else {
      const sheet = spreadsheet.getSheets()[0];
      if (sheet.getLastRow() === 0) sheet.appendRow(TOUR_HEADERS);
      sheet.appendRow([submittedAt, email, String(data.country || ""), String(data.city || "")]);
    }

    return json({ ok: true, message: "Submission saved successfully" });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
