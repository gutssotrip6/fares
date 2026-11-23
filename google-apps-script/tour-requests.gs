// Google Apps Script behind the site's forms and show dates.
// Setup: open the Google Sheet > Extensions > Apps Script, paste this file, then
// Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
// Put the Web app URL in the GOOGLE_SHEETS_WEBHOOK_URL environment variable of the site.
// After editing, redeploy with Deploy > Manage deployments > Edit > Version: New version (keeps the URL).
//
// "Bientôt dans votre ville" requests go to the first tab; newsletter sign-ups to a "Newsletter" tab.
// The shows listed on the site are read from a "Dates" tab.

const TOUR_HEADERS = ["Date", "E-mail", "Pays", "Ville"];
const NEWSLETTER_HEADERS = ["Date", "E-mail"];
const NEWSLETTER_SHEET = "Newsletter";
const DATES_SHEET = "Dates";
const DATES_HEADERS = ["Date", "Heure", "Ville", "Salle", "Spectacle", "Lien billetterie"];

// The site reads the shows from the "Dates" tab: one row per show.
// Date as 25/12/2026 (or 2026-12-25), Heure as 20h30, Lien billetterie as a full https:// link.
function doGet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(DATES_SHEET);

    if (!sheet) {
      // Added last: tour requests are written to the first tab.
      sheet = spreadsheet.insertSheet(DATES_SHEET, spreadsheet.getNumSheets());
      sheet.appendRow(DATES_HEADERS);
      sheet.getRange(1, 1, 1, DATES_HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
      // Plain text so Sheets keeps "20h30" and links exactly as typed.
      sheet.getRange("B:F").setNumberFormat("@");
    }

    const range = sheet.getDataRange();
    const values = range.getValues();
    const display = range.getDisplayValues();
    const timeZone = spreadsheet.getSpreadsheetTimeZone();
    const shows = [];

    for (let i = 1; i < values.length; i++) {
      const date = toIsoDate(values[i][0], display[i][0], timeZone);
      if (!date) continue;

      shows.push({
        date: date,
        time: String(display[i][1] || "").trim(),
        city: String(display[i][2] || "").trim(),
        venue: String(display[i][3] || "").trim(),
        show: String(display[i][4] || "").trim(),
        ticketUrl: String(display[i][5] || "").trim(),
      });
    }

    return json({ ok: true, shows: shows });
  } catch (error) {
    return json({ ok: false, error: String(error) });
  }
}

// Returns YYYY-MM-DD, or "" when the cell is not a date.
function toIsoDate(value, displayValue, timeZone) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, timeZone, "yyyy-MM-dd");
  }

  const text = String(displayValue || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const french = text.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (french) {
    return french[3] + "-" + ("0" + french[2]).slice(-2) + "-" + ("0" + french[1]).slice(-2);
  }

  return "";
}

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
      const sheet =
        spreadsheet.getSheetByName(NEWSLETTER_SHEET) ||
        spreadsheet.insertSheet(NEWSLETTER_SHEET);

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(NEWSLETTER_HEADERS);
      }

      sheet.appendRow([submittedAt, email]);
    } else {
      const sheet = spreadsheet.getSheets()[0];

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(TOUR_HEADERS);
      }

      sheet.appendRow([
        submittedAt,
        email,
        String(data.country || ""),
        String(data.city || ""),
      ]);
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
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
