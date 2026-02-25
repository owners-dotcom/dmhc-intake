# DMHC Intake — Master Project (Single Source of Truth)

## Overview
Client-forward luxury intake that maximizes completion rate and produces a stylist-ready submission record (Sheet + Drive photos). Not a booking flow.

## System Map
- Frontend: GitHub Pages (index.html + styles.css + app.js)
- Backend: Apps Script (Production endpoint locked)
- Storage: Google Sheet “DMHC Intake Submissions” + Drive photo folders
- Delivery: Front Desk processing via “Front Desk” tab; later AppSheet views for FD + stylists

## Locked Contracts
### Backend Contract (Locked)
Endpoint: POST https://script.google.com/macros/s/1HRHBPLig1hKm2pxsT4gdK4gcLMy0ysYZPDUbfy3LxGM/exec  
Required: fullName, phone, email, services[], photos[{base64,...}]  
Optional: preferredStylist, goals/goal, lastColorDate, boxDye, chemicalServices, hairHistory, sensitivities, submittedFrom, userAgent, schemaVersion, formType  
Photos: max 8; base64 length > 50; payload ~8MB  
Response: ok:true {submissionId, folderId, folderUrl} OR ok:false {message}

### Google Sheet (Locked)
Spreadsheet: “DMHC Intake Submissions”
Tabs: DMHC Intake Submissions, _SCHEMA, Log, Front Desk
Header rows are locked and must not change without explicit approval.

## UX Principles
- Luxury, smart, curated, reassuring
- Apple/Aesop whitespace, minimal text, micro-animations OK
- Completion rate > perfect data
- No “booking” language
- More screens only if it increases motivation to finish

## Current Flow
splash → welcome → basics → services → changeSize → extras → history → photos → review → loading → thankyou

## Data Strategy (Client vs Stylist)
Client sees minimal, intent-based questions.
Stylist receives translated signal summary (intent + change size + history + photos) without adding friction.

## Implementation Rules
- No backend changes unless explicitly approved.
- No sheet header changes unless explicitly approved.
- Prefer full-function replacements over snippet patches.
- One canonical version of render/swap helpers only (no duplicates).

## Workstreams
### Workstream A — UX + Copy
- Remove all booking language
- “That’s it” review framing
- Dynamic header lines (minimal)
- Reduce friction (no date pickers; use ranges)

### Workstream B — Conditional Logic Map
- Intent → follow-up questions (only if it increases completion)
- Keep branch depth shallow; offer “Not sure” exits
- Use visuals to reduce reading

### Workstream C — Asset Folder + Images
- /assets/img/ (or similar)
- Instructional photos: neutral, studio, consistent framing
- Optimize file names for clarity + SEO hygiene

### Workstream D — AppSheet (Front Desk + Stylist)
- Read from “Front Desk” and “DMHC Intake Submissions”
- Role-based views
- One-tap open submission + photos + mark status milestones

## Fix Queue (Running)
- Screen swap animation remains choppy (defer until after core flow locked)
- Keep a single canonical swap function
- Avoid height morph + absolute overlays unless fully tested on mobile Safari

## QA Checklist (Before Rollout)
- Complete intake on mobile Chrome + iOS Safari
- Submit with 1–3 photos and confirm:
  - Sheet row created
  - Drive folder created
  - Folder URL works for FD
  - Photo URLs resolve
- Confirm no console errors
- Confirm no “booking” language anywhere



BACKEND CONTRACT — LOCKED

Endpoint:
POST https://script.google.com/macros/s/XXXXX/exec

Required Fields:
- fullName (string)
- phone (string)
- email (string)
- services (array of strings)
- photos (array of objects with base64)

Optional Fields:
- preferredStylist
- goals
- goal
- lastColorDate
- boxDye
- chemicalServices
- hairHistory
- sensitivities
- submittedFrom
- userAgent
- schemaVersion
- formType

Photos:
- max 8
- each must include base64
- base64 length > 50 required
- payload limit ~8MB

Success Response:
{
  ok: true,
  submissionId,
  folderId,
  folderUrl
}

Error Response:
{
  ok: false,
  message
}


----_------------------------------------

GOOGLE SHEET: “DMHC Intake Submissions” — LOCKED

-----------------------------------------

TAB 1: “DMHC Intake Submissions” (Submissions)
Header row (exact, ordered, locked):

Timestamp
Full Name
Phone
Email
Preferred Stylist
Services
Goals
Last Color Date
Box Dye
Chemical Services
Sensitivities
Photo Count
Drive Folder URL
Photo URLs
Submitted From
User Agent

TAB 2: “_SCHEMA”
- Holds field definitions / schema versioning.
- Treated as canonical mapping for AppSheet + backend logging.

TAB 3: “Log”
Header row (exact, ordered, locked):
Timestamp
Level
Submission ID
Message

TAB 4: “Front Desk”
Header row (exact, ordered, locked):
OPEN
Status
Timestamp
Full Name
Phone
Email
Preferred Stylist
Services
Goal
Hair History
Sensitivities
Intake Summary
Meevo Summary
Done At
Photo Count
Drive Folder URL
Photo URLs
In Progree At
Waiting on Client At
Ready for Meevo At
Preview
Submission ID
Schema Version
