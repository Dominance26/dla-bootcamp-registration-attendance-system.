/****************************************************
 * DLA BOOTCAMP 2026
 * REGISTRATION + EMAIL + QR ATTENDANCE SYSTEM
 ****************************************************/

const CONFIG = {
  PREFIX: "DLA BC",
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbyvUcINYmCldhgrRjidPR1Jb0gsxNOwCrPp8uiSuuFxSqU_zLId3PtPPm8z3HtrfkFl/exec",
  QR_SIZE: "300x300",
  ORGANIZER_PIN: "REPLACE_WITH_YOUR_NEW_PRIVATE_PIN"
};


/****************************************************
 * 1. REGISTRATION AUTOMATION
 ****************************************************/

function onFormSubmit(e) {
  if (!e || !e.range) {
    throw new Error("This function must run through the form submission trigger.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  let email;
  let registrationCode;
  let token;
  let participantName;

  try {
    const sheet = e.range.getSheet();
    const row = e.range.getRow();

    let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

    function getColumn(headerName) {
      let index = headers.indexOf(headerName);

      if (index === -1) {
        index = headers.length;
        sheet.getRange(1, index + 1).setValue(headerName);
        headers.push(headerName);
      }

      return index + 1;
    }

    // Find participant email
    const emailIndex = headers.findIndex(h =>
      String(h).toLowerCase().includes("email")
    );

    if (emailIndex === -1) {
      throw new Error("Email column not found.");
    }

    email = sheet.getRange(row, emailIndex + 1).getValue();

    if (!email) {
      throw new Error("Participant email is missing.");
    }

    // Find participant name, if available
    const nameIndex = headers.findIndex(h =>
      String(h).toLowerCase().includes("full name") ||
      String(h).toLowerCase() === "name"
    );

    participantName = nameIndex >= 0
      ? sheet.getRange(row, nameIndex + 1).getValue()
      : "Participant";

    // Create required columns
    const codeCol = getColumn("Registration Code");
    const tokenCol = getColumn("QR Token");
    const statusCol = getColumn("Attendance Status");
    const timeCol = getColumn("Check-in Time");

    // Generate unique registration number
    const properties = PropertiesService.getScriptProperties();
    const number = Number(properties.getProperty("lastNumber") || 0) + 1;

    registrationCode =
      CONFIG.PREFIX + String(number).padStart(3, "0");

    // Generate unique QR token
    token = Utilities.getUuid();

    // Save registration details
    sheet.getRange(row, codeCol).setValue(registrationCode);
    sheet.getRange(row, tokenCol).setValue(token);
    sheet.getRange(row, statusCol).setValue("Not Present");
    sheet.getRange(row, timeCol).clearContent();

    // Preserve registration counter
    properties.setProperty("lastNumber", String(number));

  } finally {
    lock.releaseLock();
  }

  // IMPORTANT: Build the attendance URL only once.
  const attendanceUrl =
    CONFIG.WEB_APP_URL + "?token=" + encodeURIComponent(token);

  // Encode the complete attendance URL as QR data.
  const qrImageUrl =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=" + CONFIG.QR_SIZE +
    "&data=" + encodeURIComponent(attendanceUrl);

  const safeName = escapeHtml(participantName);
  const safeCode = escapeHtml(registrationCode);

  const emailBody = `
    <div style="font-family:Arial,sans-serif;padding:20px;color:#222;">
      <h2 style="color:#155e63;">DLA BOOTCAMP</h2>

      <p>Dear ${safeName},</p>

      <p>
        Congratulations! Your registration has been received successfully.
      </p>

      <h3>Your Registration Number</h3>

      <h1 style="color:#168477;">${safeCode}</h1>

      <p>Your unique attendance QR code:</p>

      <img src="${qrImageUrl}"
           alt="Attendance QR Code"
           width="300"
           height="300">

      <p>
        Please keep this code safe and present it at the Bootcamp entrance.
      </p>

      <p>We look forward to welcoming you!</p>

      <strong>DLA BOOTCAMP Organising Team</strong>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: "DLA BOOTCAMP - Registration Confirmation",
    htmlBody: emailBody
  });
}


/****************************************************
 * 2. WEB APP
 ****************************************************/

function doGet(e) {
  const template = HtmlService.createTemplateFromFile("CheckIn");

  template.token = e && e.parameter && e.parameter.token
    ? e.parameter.token
    : "";

  return template.evaluate()
    .setTitle("DLA BOOTCAMP Attendance")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}


/****************************************************
 * 3. FIND REGISTRATION SHEET
 ****************************************************/

function getRegistrationSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();

  for (const sheet of sheets) {
    const lastColumn = sheet.getLastColumn();

    if (lastColumn < 1) continue;

    const headers = sheet.getRange(1, 1, 1, lastColumn)
      .getValues()[0];

    if (
      headers.includes("Registration Code") &&
      headers.includes("QR Token") &&
      headers.includes("Attendance Status")
    ) {
      return sheet;
    }
  }

  throw new Error("Registration sheet or required columns not found.");
}


/****************************************************
 * 4. GET PARTICIPANT DETAILS
 ****************************************************/

function getParticipant(token) {
  if (!token) {
    return {
      success: false,
      message: "No QR token was provided."
    };
  }

  const sheet = getRegistrationSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const tokenCol = headers.indexOf("QR Token");
  const codeCol = headers.indexOf("Registration Code");
  const statusCol = headers.indexOf("Attendance Status");

  const nameCol = headers.findIndex(h =>
    String(h).toLowerCase().includes("full name") ||
    String(h).toLowerCase() === "name"
  );

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][tokenCol]) === String(token)) {
      return {
        success: true,
        name: nameCol >= 0 ? data[i][nameCol] : "Participant",
        code: data[i][codeCol],
        status: data[i][statusCol] || "Not Present"
      };
    }
  }

  return {
    success: false,
    message: "Invalid or unregistered QR code."
  };
}


/****************************************************
 * 5. VERIFY ORGANIZER PIN
 ****************************************************/

function verifyOrganizerPin(pin) {
  if (!pin || String(pin) !== CONFIG.ORGANIZER_PIN) {
    return {
      success: false,
      message: "Incorrect organizer PIN."
    };
  }

  return { success: true };
}


/****************************************************
 * 6. MARK PARTICIPANT PRESENT
 ****************************************************/

function markPresent(token, pin) {
  const authorization = verifyOrganizerPin(pin);

  if (!authorization.success) {
    return authorization;
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getRegistrationSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const tokenCol = headers.indexOf("QR Token");
    const codeCol = headers.indexOf("Registration Code");
    const statusCol = headers.indexOf("Attendance Status");
    const timeCol = headers.indexOf("Check-in Time");

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][tokenCol]) === String(token)) {

        if (String(data[i][statusCol]) === "Present") {
          return {
            success: false,
            message: "This participant has already checked in."
          };
        }

        const arrivalTime = new Date();

        sheet.getRange(i + 1, statusCol + 1)
          .setValue("Present");

        sheet.getRange(i + 1, timeCol + 1)
          .setValue(arrivalTime);

        return {
          success: true,
          message: "Attendance recorded successfully!",
          code: data[i][codeCol],
          time: arrivalTime.toLocaleString()
        };
      }
    }

    return {
      success: false,
      message: "Invalid or unregistered QR code."
    };

  } finally {
    lock.releaseLock();
  }
}


/****************************************************
 * 7. ATTENDANCE SUMMARY
 ****************************************************/

function getAttendanceSummary() {
  const sheet = getRegistrationSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const statusCol = headers.indexOf("Attendance Status");

  let total = 0;
  let present = 0;

  for (let i = 1; i < data.length; i++) {
    if (data[i][headers.indexOf("Registration Code")]) {
      total++;

      if (String(data[i][statusCol]) === "Present") {
        present++;
      }
    }
  }

  return {
    total: total,
    present: present,
    absent: total - present
  };
}


/****************************************************
 * 8. HTML ESCAPING
 ****************************************************/

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
