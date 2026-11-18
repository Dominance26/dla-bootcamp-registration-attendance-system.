DLA BOOTCAMP Registration & QR Code Attendance System

An automated participant registration and attendance management system built with Google Forms, Google Sheets and Google Apps Script.

The system simplifies event registration, generates unique participant registration numbers, sends QR codes to participants by email, and enables organizers to verify attendance through QR code scanning.

Project Overview

The DLA BOOTCAMP Registration and QR Code Attendance System was developed to improve the registration and attendance management process for the DE-LIGHT AMBASSADORS YOUTH IMPACT FOUNDATION (DLA).

It reduces manual registration work, improves record management, and provides a faster and more reliable way to verify participants at events.

Key Features

- Automated Registration: Collects participant information through Google Forms.
- Unique Registration Numbers: Automatically assigns registration IDs such as DLA BC001, DLA BC002, and so on.
- QR Code Generation: Generates a unique QR code for each registered participant.
- Email Notifications: Automatically sends registration details and QR codes to participants.
- QR Code Attendance: Allows organizers to scan participant QR codes to access attendance verification.
- Organizer PIN Verification: Requires an authorized PIN before marking a participant present.
- Attendance Tracking: Records attendance status and check-in timestamps in Google Sheets.
- Duplicate Check-in Prevention: Prevents participants from being marked present multiple times.
- Attendance Summary: Provides an overview of participant attendance.
- QR Recovery: Includes a recovery process for participants whose QR code emails were unsuccessful.

Technologies Used

- Google Apps Script
- JavaScript
- Google Forms
- Google Sheets
- HTML
- QR Code API
- Gmail

How the System Works

1. A participant completes the DLA BOOTCAMP registration form.
2. Their information is automatically recorded in Google Sheets.
3. The system generates a unique registration number.
4. A unique QR code is generated for the participant.
5. The participant receives their QR code by email.
6. At the event venue, an organizer scans the participant's QR code.
7. The attendance verification page displays the participant's details.
8. The organizer enters the authorized PIN and confirms attendance.
9. The attendance record and timestamp are saved in Google Sheets.

Project Structure

dla-bootcamp-registration-attendance-system/
│
├── Code.gs
├── CheckIn.html
├── appsscript.json
└── README.md

Requirements

- A Google account
- Google Apps Script
- Google Forms
- Google Sheets
- Internet connectivity
- A smartphone or device capable of scanning QR codes

Setup and Configuration

1. Create a Google Form for participant registration.
2. Link the form to a Google Spreadsheet.
3. Create a Google Apps Script project connected to the spreadsheet.
4. Add the "Code.gs" and "CheckIn.html" files.
5. Configure the project settings and organizer PIN securely.
6. Set up the form submission trigger.
7. Deploy the application as a web app with the appropriate access permissions.
8. Test registration, QR code generation, email delivery and attendance verification.

Security and Privacy

- Organizer PINs and private credentials should never be published in this repository.
- Participant information should remain in the authorized Google Sheets account.
- Access to registration records should be restricted to authorized organizers.
- QR codes should be treated as private participant access tokens.

Project Purpose

This project demonstrates the practical application of automation, cloud-based tools, web technologies and database management in solving real-world event registration and attendance challenges.

Developer

Timothy Dominance Job Agwujah

GitHub: "Dominance26" (https://github.com/Dominance26)

License

This project is available for educational and portfolio demonstration purposes. Contact the developer for permission before redistributing or deploying a modified version for another organization.