/*
 * Morning Report Attendance · front-end configuration
 * ---------------------------------------------------
 * The only file you need to edit after deploying the Apps Script back-end.
 * Everything else (times, radius, recipients, levels, branding text) is edited
 * in the Google Sheet → Settings tab.
 */
window.MR_CONFIG = {
  // Apps Script web app URL: Deploy → Manage deployments → Web app URL (ends with /exec)
  API_URL: 'https://script.google.com/macros/s/AKfycbzJqEhJfvAPwgbHAinPF3fYRVD1hPLX0t21ZXEKhtYwjrSnyqLO_E9ButqnYQpLyPHIig/exec',

  // Public URL of the attendee page (the QR code target).
  // Leave blank to use this site's own address automatically.
  ATTENDEE_URL: ''
};
