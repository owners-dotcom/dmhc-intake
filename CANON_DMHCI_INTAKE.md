# DMHC Intake — Master Project (Single Source of Truth)

## Overview
Client-forward luxury intake that maximizes completion rate and produces a stylist-ready submission record (Google Sheet + Drive photos). This is not a booking flow.

## System Map
- Frontend: GitHub Pages static single-page application (`index.html` + `styles.css` + `app.js`)
- Entry point: Squarespace 7.1 Fluid Engine page (`/new-guest-form`)
- Backend: Google Apps Script Web App (production endpoint locked)
- Storage: Google Sheet “DMHC Intake Submissions” + Drive photo folders
- Delivery: Front Desk processing via the “Front Desk” tab; later AppSheet views for front desk + stylists

## Locked Contracts

### Backend Contract (Locked)
**Endpoint:**  
POST `https://script.google.com/macros/s/AKfycbwQ9jmUDlTS46nRr0aNtC6wFIoSzl-6QnLg-rjwo06nnom_NEcaiTthBQ3zQ9GJ5sAI/exec`

**Required**
- `fullName` (string)
- `phone` (string)
- `email` (string)
- `services` (array of strings)
- `photos` (array of objects including base64)

**Optional**
- `preferredStylist`
- `goals`
- `goal`
- `lastColorDate`
- `boxDye`
- `chemicalServices`
- `hairHistory`
- `sensitivities`
- `submittedFrom`
- `userAgent`
- `schemaVersion`
- `formType`

**Photos**
- max 8
- each must include base64
- base64 length > 50
- payload target ~8MB

**Response**
- success: `ok:true {submissionId, folderId, folderUrl}`
- error: `ok:false {message}`

### Google Sheet (Locked)
**Spreadsheet:** `DMHC Intake Submissions`

**Tabs**
- `DMHC Intake Submissions`
- `_SCHEMA`
- `Log`
- `Front Desk`

Header rows are locked and must not change without explicit approval.

## Frontend UX Policy
- Luxury, smart, curated, reassuring
- Apple/Aesop whitespace, minimal text
- Completion rate over perfect data capture
- No booking language
- More screens only if they meaningfully increase completion or confidence

## Current Flow
`splash → welcome → basics → services → changeSize → extras → history → photos → review → loading → thankyou`

## Photo Rules
### Backend capacity
- Backend supports up to 8 photos

### Frontend UX policy
- Current hair: 1–2 required
- Inspiration: 0–1 optional
- Total max: 3

Frontend intentionally enforces a stricter cap than backend for speed, reliability, and reduced upload friction.

## Data Strategy (Client vs Stylist)
### Client-facing
- Minimal, intent-based questions
- Tap-first interactions where possible
- Guided flow that feels customized without overwhelming the user

### Stylist-facing
- Intent + change size + history + photos translate into planning context
- Adapter preserves compatibility while allowing cleaner frontend phrasing

## Adapter Rules
- `DMHCAdapter` is the compatibility bridge from `State.data` to canonical payload
- Preserve legacy keys until downstream migration is complete
- `services` must always be sent as an array
- Additive changes only unless explicit migration is approved
- No silent field renames or payload cleanup

## Implementation Rules
- No backend contract changes unless explicitly approved
- No Google Sheet header changes unless explicitly approved
- Prefer full-section or full-function replacements over fragment patches
- Maintain exactly one canonical version of render/swap helpers
- Avoid duplicate helper functions
- Risk scoring must be optional and non-blocking

## Workstreams

### Workstream A — UX + Copy
- Remove all booking language
- Strengthen “That’s it” review framing
- Use dynamic header lines as subtle progress/reassurance
- Reduce friction (prefer ranges over date pickers)

### Workstream B — Conditional Logic Map
- Intent → follow-up questions only when it improves completion
- Keep branch depth shallow
- “Not sure” must always remain a safe path forward
- Prefer taps over typing

### Workstream C — Asset Folder + Images
- `/assets/img/` or similar
- Instructional photos should be neutral, studio-clean, and consistent
- Optimize names for clarity and maintainability

### Workstream D — AppSheet (Front Desk + Stylist)
- Read from `Front Desk` and `DMHC Intake Submissions`
- Role-based views
- One-tap access to submission, photos, and status actions
- AppSheet is an ops layer, not a new contract

## Fix Queue (Running)
- Screen swap animation remains choppy; defer until core flow is stable
- Keep a single canonical swap function
- Avoid height morph + absolute overlays unless proven stable on mobile Safari
- Keep packet / canon / runtime endpoint truth aligned

## QA Checklist (Before Rollout)
- Complete intake on mobile Chrome
- Complete intake on iOS Safari
- Submit with 1–3 photos and confirm:
  - Sheet row created
  - Drive folder created
  - Folder URL works for front desk
  - Photo URLs resolve
- Confirm no console errors
- Confirm no booking language anywhere
- Confirm packet, canon, and runtime all reference the same endpoint