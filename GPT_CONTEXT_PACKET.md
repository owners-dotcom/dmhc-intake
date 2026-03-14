# DMHC Intake — GPT Context Packet

**Generated:** 2026-03-14T21:16:51Z  
**Commit:** ae119cd
**Commit Count:** 183
**Branch:** main
**Last Commit:** Update CONTRACT_KEYS.md

## Canon / Locks

### CANON_DMHCI_INTAKE.md

~~~~md
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
- Confirm packet, canon, and runtime all reference the same endpoint~~~~

### BASELINE_SNAPSHOT.md

~~~~md
# DMHC Intake — Production Baseline Snapshot (LOCKED)

## BASELINE_SNAPSHOT — CHECKPOINT ONLY (DO NOT MAINTAIN DAILY)

This file is NOT a mirror of app.js / styles.css / index.html.
Source of truth is the code files.

Update this snapshot ONLY when a build is intentionally PROMOTED to “stable production truth”for the Intake GPT (checkpoint moment). Otherwise, rely on GitHub commit history.

Last promoted checkpoint: (fill when promoted)
- Date:
- Commit:
- Notes:

Do not change this file unless explicitly agreed. Last updated: 2026-02-25

## Runtime URLs (PROD)
- GitHub Pages: https://owners-dotcom.github.io/dmhc-intake/
- Squarespace entry page: https://dmhairco.com/new-guest-form
- Apps Script Web App (/exec): https://script.google.com/macros/s/AKfycbwQ9jmUDlTS46nRr0aNtC6wFIoSzl-6QnLg-rjwo06nnom_NEcaiTthBQ3zQ9GJ5sAI/exec
- Google Sheet: https://docs.google.com/spreadsheets/d/1HRHBPLig1hKm2pxsT4gdK4gcLMy0ysYZPDUbfy3LxGM/edit

## Apps Script Deployment Label
- Deployment/version label: firstGeminiTry (Version 26 on Feb 19, 2026, 8:51 PM)

## index.html (PROD)
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <title>DMHC Intake</title>

    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="app" role="application" aria-label="Danielle Marie Hair Co. Intake"></div>

    <script src="./app.js" defer></script>
  </body>
</html>


## styles.css (PROD)
/* DMHC Intake — FULL styles.css (paste-replace)
Adds: “liquid glass” animated background + reliable vertical centering + dark mode safety.
No HTML changes required.
*/

/* ==============================
BASE + VARIABLES
============================== */

:root{
--bg-1:#eef1ee;
--bg-2:#e8eeea;
--ink:#121212;
--muted:#6a6a6a;

--card:#ffffffcc;         /* translucent for “glass” /
--card-solid:#ffffff;     / fallback */
--stroke:rgba(18,18,18,.10);

--brand:#1f5f52;
--brand-2:#0f3f37;

--radius:26px;
--shadow:0 18px 55px rgba(0,0,0,.18);

--maxw:520px;
--pad:22px;
}

/* Make sizing predictable */
*{ box-sizing:border-box; }
html,body{ height:100%; }

body{
margin:0;
color:var(--ink);
font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
background: radial-gradient(1200px 700px at 20% 10%, var(--bg-2), var(--bg-1));
overflow-x:hidden;
}

/* ==============================
“C” BACKGROUND (LIQUID GLASS)
============================== */

/* Soft drifting blobs */
body::before{
content:"";
position:fixed;
inset:-20%;
pointer-events:none;
z-index:-2;

background:
radial-gradient(420px 320px at 18% 22%, rgba(31,95,82,.14), transparent 70%),
radial-gradient(520px 380px at 78% 18%, rgba(31,95,82,.10), transparent 72%),
radial-gradient(620px 460px at 60% 78%, rgba(17,17,17,.06), transparent 72%),
radial-gradient(520px 420px at 18% 86%, rgba(31,95,82,.08), transparent 72%);
filter: blur(26px) saturate(105%);
transform: translate3d(0,0,0);
animation: dmLiquidDrift 60s ease-in-out infinite alternate;
}

/* Fine grain overlay */
body::after{
content:"";
position:fixed;
inset:0;
pointer-events:none;
z-index:-1;
opacity:.09;
background-image:
repeating-linear-gradient(0deg, rgba(0,0,0,.03) 0 1px, rgba(255,255,255,.00) 1px 3px),
repeating-linear-gradient(90deg, rgba(0,0,0,.02) 0 1px, rgba(255,255,255,.00) 1px 4px);
mix-blend-mode: multiply;
}

@keyframes dmLiquidDrift{
0%   { transform: translate3d(-2%, -1%, 0) scale(1.02); }
50%  { transform: translate3d( 2%,  2%, 0) scale(1.04); }
100% { transform: translate3d( 1%, -2%, 0) scale(1.03); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce){
body::before{ animation:none; }
}

/* ==============================
APP WRAPPER + CENTERING
============================== */

#app{
min-height: 100svh;
padding: 18px 14px 26px;
display:flex;
flex-direction:column;
align-items:center;
}

/* progress bar */
.progress{
width:min(var(--maxw), 100%);
height:6px;
border-radius:999px;
background: rgba(0,0,0,.07);
overflow:hidden;
margin: 10px auto 18px;
}
.progress-fill{
height:100%;
width:0%;
border-radius:999px;
background: linear-gradient(90deg, rgba(31,95,82,.85), rgba(31,95,82,1));
}

/* screen container */
.screen{
width:min(var(--maxw), 100%);
margin:0 auto;
display:flex;
flex:1;
align-items:flex-start;
justify-content:flex-start;
}

/* ✅ Make key screens auto-center vertically without JS changes */
.screen:has(.center-splash),
.screen:has(.loading-center){
align-items:center;
justify-content:center;
padding-top: 6svh;
padding-bottom: 10svh;
}

/* Optional: if you later add screen.classList.add("centered") */
.screen.centered{
align-items:center;
justify-content:center;
padding-top: 6svh;
padding-bottom: 10svh;
}

/* ==============================
CARD / SURFACE
============================== */

.center-splash,
.loading-center,
.screen > div{
width:100%;
}

/* Primary “glass card” look */
.screen > div{
background: var(--card);
border: 1px solid rgba(255,255,255,.65);
border-radius: var(--radius);
box-shadow: var(--shadow);
backdrop-filter: blur(14px);
-webkit-backdrop-filter: blur(14px);
padding: 22px 22px 20px;
}

/* Keep splash/loading tighter */
.center-splash,
.loading-center{
text-align:center;
padding: 22px 22px 24px;
}

@supports not (backdrop-filter: blur(14px)){
.screen > div{ background: var(--card-solid); }
}

/* ==============================
TYPOGRAPHY
============================== */

h1{
margin: 0 0 10px;
font-size: 40px;
line-height: 1.05;
letter-spacing: -0.02em;
}
p{ margin: 0 0 14px; }
.muted{ color: var(--muted); }

.splash-title{
font-weight: 800;
font-size: 28px;
margin-top: 14px;
}
.splash-sub{
margin-top: 6px;
font-size: 16px;
}

/* ==============================
FORM FIELDS
============================== */

.field{ margin: 14px 0; }

.label-row{
display:flex;
align-items:center;
justify-content:space-between;
margin-bottom: 8px;
}
.label{
font-weight: 650;
font-size: 14px;
letter-spacing: .01em;
}
.req{ color: rgba(0,0,0,.45); font-weight: 700; }
.check{
font-size: 14px;
opacity: .0;
transform: translateY(1px);
transition: opacity .18s ease;
}
.check.on{ opacity: .9; }

.input{
width:100%;
height: 52px;
padding: 0 14px;
font-size: 16px;
border-radius: 14px;
border: 1px solid var(--stroke);
background: rgba(255,255,255,.78);
outline: none;
}
.input:focus{
border-color: rgba(31,95,82,.45);
box-shadow: 0 0 0 3px rgba(31,95,82,.10);
}

/* ==============================
BUTTONS
============================== */

.actions,
.nav{
display:flex;
gap: 14px;
margin-top: 18px;
}

.btn{
height: 54px;
padding: 0 18px;
border-radius: 999px;
border: 1px solid rgba(0,0,0,.08);
background: rgba(255,255,255,.72);
color: var(--ink);
font-size: 16px;
font-weight: 650;
cursor:pointer;
flex:1;
}

.btn.primary{
border: none;
background: linear-gradient(180deg, rgba(31,95,82,1), rgba(15,63,55,1));
color: #fff;
box-shadow: 0 14px 35px rgba(15,63,55,.25);
}

.btn.ghost{ background: rgba(255,255,255,.62); }

.btn.disabled,
.btn:disabled{
opacity:.55;
cursor:not-allowed;
}

/* ==============================
CARDS (services)
============================== */

.card-grid{
display:grid;
grid-template-columns: 1fr;
gap: 12px;
margin-top: 14px;
}

.card{
width:100%;
text-align:left;
border-radius: 18px;
border: 1px solid rgba(0,0,0,.08);
padding: 16px 16px 14px;
background: rgba(255,255,255,.70);
cursor:pointer;
}

.card-title{
font-weight: 800;
margin-bottom: 6px;
font-size: 16px;
}
.card-desc{
color: var(--muted);
font-size: 14px;
line-height: 1.25;
}

/* ==============================
PHOTOS
============================== */

.photo-block{
border-radius: 18px;
border: 1px solid rgba(0,0,0,.08);
padding: 14px;
background: rgba(255,255,255,.64);
margin-top: 14px;
}
.photo-head{
display:flex;
align-items:flex-start;
justify-content:space-between;
gap: 12px;
margin-bottom: 10px;
}
.photo-title{ font-weight: 800; }
.photo-meta{ font-size: 13px; }

.file-hidden{ display:none; }

.thumbs{
display:flex;
gap: 10px;
flex-wrap: wrap;
margin-top: 12px;
}
.thumbs img{
width: 64px;
height: 64px;
border-radius: 14px;
object-fit: cover;
border: 1px solid rgba(0,0,0,.10);
}

/* ==============================
REVIEW
============================== */

.review-card{
border-radius: 18px;
border: 1px solid rgba(0,0,0,.08);
padding: 14px;
background: rgba(255,255,255,.64);
margin-top: 14px;
}
.review-title{
font-weight: 900;
margin-bottom: 10px;
}
.review-row{
display:flex;
align-items:flex-start;
justify-content:space-between;
gap: 14px;
padding: 8px 0;
}
.review-label{
color: var(--muted);
font-size: 13px;
}
.review-value{
font-weight: 650;
text-align:right;
max-width: 58%;
word-break: break-word;
}
.review-divider{
height:1px;
background: rgba(0,0,0,.08);
margin: 10px 0;
}
.pill{
display:inline-block;
padding: 10px 14px;
border-radius: 999px;
background: rgba(31,95,82,.10);
border: 1px solid rgba(31,95,82,.18);
font-weight: 750;
}

.hint{
margin-top: 12px;
color: var(--muted);
opacity: 0;
transform: translateY(4px);
transition: opacity .22s ease, transform .22s ease;
}
.hint.show{
opacity: 1;
transform: translateY(0);
}

.form-error{
margin-top: 12px;
padding: 12px 12px;
border-radius: 14px;
background: rgba(170,0,0,.06);
border: 1px solid rgba(170,0,0,.12);
color: rgba(120,0,0,1);
font-weight: 650;
}
.hidden{ display:none; }

/* ==============================
LOADER
============================== */

.hair-loader{
width: 38px;
height: 38px;
border-radius: 999px;
border: 3px solid rgba(0,0,0,.08);
border-top-color: rgba(31,95,82,.85);
margin: 14px auto 10px;
animation: spin 1.05s linear infinite;
}
.hair-loader.big{
width: 46px;
height: 46px;
border-width: 4px;
}

.loading-stack{ margin-top: 10px; }
.loading-line{ font-size: 15px; }

@keyframes spin{ to{ transform: rotate(360deg); } }

/* ==============================
DARK MODE SAFETY (IMPORTANT)
============================== */

@media (prefers-color-scheme: dark){
:root{
--bg-1:#0f1211;
--bg-2:#101816;
--ink:#f2f2f2;
--muted:#b7b7b7;

--card:rgba(18,22,21,.78);  
--card-solid:#121615;  
--stroke:rgba(255,255,255,.12);  

--shadow:0 22px 65px rgba(0,0,0,.55);

}

body{
background: radial-gradient(1200px 700px at 20% 10%, var(--bg-2), var(--bg-1));
}

body::after{
opacity:.10;
mix-blend-mode: screen;
}

.progress{ background: rgba(255,255,255,.10); }
.btn{ background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.10); color: var(--ink); }
.btn.ghost{ background: rgba(255,255,255,.06); }
.card,
.photo-block,
.review-card{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.10); }
.input{ background: rgba(255,255,255,.08); color: var(--ink); }
.req{ color: rgba(255,255,255,.40); }
.review-divider{ background: rgba(255,255,255,.10); }
.pill{ background: rgba(31,95,82,.22); border-color: rgba(31,95,82,.35); }
.hair-loader{ border-color: rgba(255,255,255,.14); border-top-color: rgba(31,95,82,.95); }
}

/* ==============================
SMALL SCREENS
============================== */

@media (max-width: 420px){
h1{ font-size: 34px; }
.btn{ height: 52px; }
.screen > div{ padding: 20px 18px 18px; }
}

## app.js (PROD)
console.log("DMHC Modular Intake Loaded");

/* ==============================
   CONFIG
============================== */

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwQ9jmUDlTS46nRr0aNtC6wFIoSzl-6QnLg-rjwo06nnom_NEcaiTthBQ3zQ9GJ5sAI/exec";

// Photo compression defaults (safe for Apps Script limits)
const MAX_EDGE_PX = 1400;      // lowered slightly
const JPEG_QUALITY = 0.74;     // lowered slightly

// Photo limits (NEW RULE):
// - Current hair: up to 2 (REQUIRED: at least 1)
// - Inspiration: up to 1 (optional)
// - Total max: 3
const MAX_CURRENT_PHOTOS = 2;
const MAX_INSPO_PHOTOS = 1;
const MAX_TOTAL_PHOTOS = MAX_CURRENT_PHOTOS + MAX_INSPO_PHOTOS;
const MIN_CURRENT_PHOTOS = 1;

/* ==============================
   APP STATE
============================== */

const State = {
  step: 0,
  data: {
    // legacy fields currently used by UI
    name: "",
    email: "",
    phone: "",
    service: "",
    lastColor: "",
    currentPhotos: [], // File[]
    inspoPhoto: null,  // File|null

    // future / optional
    fullName: "",
    preferredStylist: "",
    services: [],
    goals: "",
    lastColorDate: "",
    boxDye: "",
    chemicalServices: "",
    sensitivities: "",
    hairLength: "",
    maintenanceFrequency: "",
    referralSource: "",
    company: ""
  },
  ui: {
    error: "",
    reviewError: "",

    splashTimer: null,

    // loading quotes rotator
    loadingTimer: null,
    loadingQuoteIdx: 0,

    // submit/try-again flow
    submitting: false,
    loadingMode: "quotes",     // "quotes" | "submit"
    _renderQueued: false,
    _navDir: 1,
    showLoadingRetry: false,
    loadingRetryMsg: ""
  }
};

/* ==============================
   FAIL-LOUD DEBUG OVERLAY
   (Shows the real error on-screen)
============================== */
(function () {
  function showErr(msg) {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `
      <div style="padding:16px;font-family:system-ui;color:#fff;">
        <div style="font-size:18px;font-weight:700;margin-bottom:8px;">DMHC Intake crashed</div>
        <pre style="white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,.55);padding:12px;border-radius:10px;">
${String(msg || "Unknown error")}
        </pre>
      </div>
    `;
  }

  window.addEventListener("error", (e) => {
    const loc = e?.filename ? `\n\n${e.filename}:${e.lineno}:${e.colno}` : "";
    showErr((e?.message || e) + loc);
  });

  window.addEventListener("unhandledrejection", (e) => {
    showErr(e?.reason?.stack || e?.reason || "Unhandled promise rejection");
  });
})();

/* ==============================
   STEPS + LOADING COPY
============================== */

const Steps = [
  "splash",
  "welcome",
  "basics",
  "services",
  "changeSize",
  "extras",
  "history",
  "photos",
  "review",
  "loading",
  "thankyou"
];

const LOADING_QUOTES = [
  "Uploading photos…",
  "Optimizing images…",
  "Sending your details…",
  "Finishing up…",
  "Still uploading — hang tight…"
];

/* ==============================
   INIT
============================== */

document.addEventListener("DOMContentLoaded", () => {
  const stepParam = Number(new URL(window.location.href).searchParams.get("step"));
  if (!Number.isNaN(stepParam)) {
    State.step = clamp(stepParam, 0, Steps.length - 1);
  } else {
    State.step = 0;
  }

// Expose functions for inline onclick handlers (required if script is module-scoped)
Object.assign(window, {
  next,
  back,
  goToStep,
  submitForm,

  // NEW service flow
  selectIntent,
  selectChangeSize,
  selectHaircut,

  // Legacy safety bridge (prevents old onclick crash if anything lingers)
  selectService
});

  // Keep browser back/forward inside the flow
  syncHistory(true);

  window.addEventListener("popstate", (e) => {
    const s =
      e.state && typeof e.state.step === "number"
        ? e.state.step
        : Number(new URL(window.location.href).searchParams.get("step") || 0);

    State.step = clamp(s, 0, Steps.length - 1);
    render();
  });

  render();
});

/* ==============================
   HISTORY
============================== */

function syncHistory(replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(State.step));
  const fn = replace ? history.replaceState : history.pushState;
  fn.call(history, { step: State.step }, "", url.toString());
}

/* ==============================
   NAV (HARDENED)
============================== */

function goToStep(stepIndex, opts = {}) {
  const nextStep = clamp(stepIndex, 0, Steps.length - 1);
  if (nextStep === State.step) return; // no-op prevents flicker

  // record direction for swap animation
  State.ui._navDir = (nextStep > State.step) ? 1 : -1;

  State.ui.error = "";
  State.ui.reviewError = "";

  State.step = nextStep;

  // history update (allow disabling if needed later)
  if (opts.skipHistory !== true) syncHistory();

  // batch render to next animation frame to avoid double paint/blank flash
  scheduleRender_();
}

function next() {
  goToStep(State.step + 1);
}

function back() {
  goToStep(State.step - 1);
}

/* ==============================
   RENDER SCHEDULER (ANTI-FLICKER)
============================== */

function scheduleRender_() {
  if (State.ui._renderQueued) return;
  State.ui._renderQueued = true;

  requestAnimationFrame(() => {
    State.ui._renderQueued = false;
    render();
  });
}

/* ==============================
   RENDER
============================== */

// Build the shell ONCE (static header + viewport). Then only swap the screen.
// This prevents flicker, enables smooth transitions, and keeps the header “anchored”.

function render() {
  stopSplashTimer();
  stopLoadingTimer();

  const app = document.getElementById("app");
  if (!app) return;

  // 1) Ensure shell exists (header stays static, content slides)
  ensureAppShell_(app);

  const current = Steps[State.step];

  // 2) Build the next screen node (same as before)
  let node = null;
  switch (current) {
    case "splash": node = Splash(); break;
    case "welcome": node = Welcome(); break;
    case "basics": node = Basics(); break;
    case "services": node = Services(); break;
    case "changeSize": node = ChangeSize(); break;
    case "extras": node = Extras(); break;
    case "history": node = History(); break;
    case "photos": node = Photos(); break;
    case "review": node = Review(); break;
    case "loading": node = Loading(); break;
    case "thankyou": node = ThankYou(); break;
  }

  // 3) Update header + progress (header is static; content changes)
  renderHeader_(app, current);
  renderProgress_(app, current);

  // 4) Swap screen with a quick “Tinder-like” slide (no CSS required)
  swapScreen_(app, node);

  // 5) Post-render hooks (NO re-render while typing)
  if (current === "basics") bindBasicsInteractions();
  if (current === "photos") bindPhotoInteractions();

  if (current === "loading") {
    // wire retry button (if shown)
    bindLoadingInteractions_();

    // only rotate quotes when not actively submitting
    if (State.ui.loadingMode !== "submit") {
      startLoadingQuotes();
    }
  }

  if (current === "splash") {
    startSplashAutoAdvance();
  }

  // mark last rendered step for direction inference next time
  State.ui._lastRenderedStep = State.step;
}

/* ==============================
   PROGRESS
============================== */

function renderProgress_(app, currentStepName) {
  const fill = app.__dmshell?.progressFill;
  if (!fill) return;

  // do not count splash/loading/thankyou as progress
  const progressSteps = ["welcome", "basics", "services", "changeSize", "extras", "history", "photos", "review"];
  const idx = progressSteps.indexOf(currentStepName);
  const denom = Math.max(progressSteps.length - 1, 1);
  const percent = idx < 0 ? 0 : (idx / denom) * 100;

  fill.style.width = Math.min(Math.max(percent, 0), 100) + "%";
}

/* ==============================
   SCREENS
============================== */

function Splash() {
  const div = document.createElement("div");
  div.className = "center-splash";

  div.innerHTML = `
    <div class="hair-loader big" aria-hidden="true"></div>
    <div class="splash-title">Danielle Marie Hair Co.</div>
    <div class="splash-sub muted">Preparing your consultation…</div>
  `;

  return div;
}

function startSplashAutoAdvance() {
  // intentional, not a flash
  State.ui.splashTimer = setTimeout(() => {
    if (Steps[State.step] === "splash") next();
  }, 2200);
}

function stopSplashTimer() {
  if (State.ui.splashTimer) {
    clearTimeout(State.ui.splashTimer);
    State.ui.splashTimer = null;
  }
}

function Welcome() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Let’s begin.</h1>
    <p class="muted">Quick intake so we can plan your appointment the right way.</p>

    <div class="actions" style="margin-top:18px;">
      <button class="btn primary" type="button" onclick="next()">Begin</button>
    </div>
  `;

  return div;
}

function Basics() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Your information</h1>
    <p class="muted">This helps us confirm your appointment details.</p>

    <div class="field">
      <div class="label-row">
        <label class="label">Full name <span class="req">*</span></label>
        <span class="check" id="ckName" aria-hidden="true">✓</span>
      </div>
      <input id="inName" class="input" placeholder="First + Last" autocomplete="name" />
    </div>

    <div class="field">
      <div class="label-row">
        <label class="label">Email <span class="req">*</span></label>
        <span class="check" id="ckEmail" aria-hidden="true">✓</span>
      </div>
      <input id="inEmail" class="input" placeholder="you@email.com" autocomplete="email" inputmode="email" />
    </div>

    <div class="field">
      <div class="label-row">
        <label class="label">Phone <span class="req">*</span></label>
        <span class="check" id="ckPhone" aria-hidden="true">✓</span>
      </div>
      <input id="inPhone" class="input" placeholder="(###) ###-####" autocomplete="tel" inputmode="tel" />
    </div>

    <div class="form-error ${State.ui.error ? "" : "hidden"}" id="formError" role="alert">
      ${escapeHtml(State.ui.error || "")}
    </div>

    <div class="nav">
      <button class="btn primary" id="btnBasicsContinue" type="button">Continue</button>
    </div>
  `;

  return div;
}

function bindBasicsInteractions() {
  const inName = document.getElementById("inName");
  const inEmail = document.getElementById("inEmail");
  const inPhone = document.getElementById("inPhone");

  const ckName = document.getElementById("ckName");
  const ckEmail = document.getElementById("ckEmail");
  const ckPhone = document.getElementById("ckPhone");

  const btn = document.getElementById("btnBasicsContinue");
  const err = document.getElementById("formError");

  if (!inName || !inEmail || !inPhone || !btn) return;

  // initial values (NO re-render)
  inName.value = State.data.name || State.data.fullName || "";
  inEmail.value = State.data.email || "";
  inPhone.value = State.data.phone || "";

  const updateUI = () => {
    const name = (inName.value || "").trim();
    const email = (inEmail.value || "").trim();
    const phone = (inPhone.value || "").trim();

    // store both for compatibility
    State.data.name = name;
    State.data.fullName = name;

    State.data.email = email;
    State.data.phone = phone;

    setCheck(ckName, !!name);
    setCheck(ckEmail, isEmailish(email));
    setCheck(ckPhone, phone.length >= 7);

    const ok = !!name && isEmailish(email) && phone.length >= 7;
    btn.disabled = !ok;
    btn.classList.toggle("disabled", !ok);

    State.ui.error = "";
    if (err) {
      err.textContent = "";
      err.classList.add("hidden");
    }
  };

  inName.addEventListener("input", updateUI);
  inEmail.addEventListener("input", updateUI);
  inPhone.addEventListener("input", updateUI);

  btn.addEventListener("click", () => {
    const name = (State.data.fullName || State.data.name || "").trim();
    const email = (State.data.email || "").trim();
    const phone = (State.data.phone || "").trim();

    if (!name) return softError("Add your name so we know who to look for.");
    if (!email) return softError("Add an email so we can follow up easily.");
    if (!isEmailish(email)) return softError("That email looks a little off — can you double-check it?");
    if (!phone || phone.length < 7) return softError("Add a phone number so we can text if needed.");

    next();
  });

  updateUI();

  function softError(msg) {
    State.ui.error = msg;
    if (err) {
      err.textContent = msg;
      err.classList.remove("hidden");
    }
  }
}

function Services() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>What are we doing today?</h1>
    <p class="muted">Choose what feels closest. We’ll refine later.</p>

    <div class="card-grid" role="list">
      ${IntentCard("Go lighter", "lighter", "Lighter, brighter, dimensional")}
      ${IntentCard("Refresh dimension / tone", "refresh", "Keep depth, improve tone + shine")}
      ${IntentCard("Cover grays / roots", "gray", "Root coverage or all-over color")}
      ${IntentCard("Fix a previous color result", "fix", "Correct banding, brass, uneven tone")}
      ${IntentCard("Not sure", "unsure", "Help me choose the right service")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
    </div>
  `;

  return div;
}

function IntentCard(title, value, description) {
  const safe = escapeAttr(String(value));
  return `
    <button class="card" type="button" role="listitem" onclick="selectIntent('${safe}')">
      <div class="card-title">${escapeHtml(title)}</div>
      <div class="card-desc">${escapeHtml(description)}</div>
    </button>
  `;
}

function selectIntent(intent) {
  // clean fields (stylist-facing)
  State.data.serviceIntent = String(intent);

  // backward compatibility (keep old fields alive)
  const legacyMap = {
    lighter: "Blonding",
    refresh: "Dimensional Color",
    gray: "All-Over / Gray Coverage",
    fix: "Color Correction",
    unsure: "Not Sure"
  };
  const legacy = legacyMap[String(intent)] || "Not Sure";

  State.data.service = legacy;
  if (!Array.isArray(State.data.services)) State.data.services = [];
  State.data.services = [legacy];

  next(); // -> change
}

function selectService(service) {
  const map = {
    "Blonding": "lighter",
    "Dimensional Color": "refresh",
    "All-Over / Gray Coverage": "gray",
    "Color Correction": "fix",
    "Not Sure": "unsure"
  };
  selectIntent(map[String(service)] || "unsure");
}

function ChangeSize() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>How big of a change?</h1>
    <p class="muted">This helps us time + plan your appointment.</p>

    <div class="card-grid" role="list">
      ${ChoiceCard("Subtle", "subtle", "Small shift. Keep it natural.")}
      ${ChoiceCard("Noticeable", "noticeable", "A clear difference, still wearable.")}
      ${ChoiceCard("Big change", "big", "A transformation.")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
    </div>
  `;

  return div;
}

function ChoiceCard(title, value, description) {
  const safe = escapeAttr(String(value));
  return `
    <button class="card" type="button" role="listitem" onclick="selectChangeSize('${safe}')">
      <div class="card-title">${escapeHtml(title)}</div>
      <div class="card-desc">${escapeHtml(description)}</div>
    </button>
  `;
}

function selectChangeSize(size) {
  State.data.changeSize = String(size);
  next(); // -> extras
}

function Extras() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Anything else today?</h1>
    <p class="muted">Optional. This just helps us plan.</p>

    <div class="card-grid" role="list">
      ${ExtrasCard("Shape / trim — Yes", "yes")}
      ${ExtrasCard("No", "no")}
      ${ExtrasCard("Not sure", "unsure")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
    </div>
  `;

  return div;
}

function ExtrasCard(title, value) {
  const safe = escapeAttr(String(value));
  return `
    <button class="card" type="button" role="listitem" onclick="selectHaircut('${safe}')">
      <div class="card-title">${escapeHtml(title)}</div>
    </button>
  `;
}

function selectHaircut(v) {
  if (v === "yes") State.data.wantsHaircut = true;
  else if (v === "no") State.data.wantsHaircut = false;
  else State.data.wantsHaircut = null;

  next(); // -> history
}

function History() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Hair history</h1>
    <p class="muted">Just a quick note so we can plan your service.</p>

    <div class="field">
      <label class="label">Last professional color (approx.)</label>
      <input id="inLastColor" class="input" placeholder="Example: 3 months ago" />
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" id="btnHistoryContinue">Continue</button>
    </div>
  `;

  // bind without re-render while typing
  setTimeout(() => {
    const inLast = document.getElementById("inLastColor");
    const btn = document.getElementById("btnHistoryContinue");
    if (inLast) inLast.value = State.data.lastColor || State.data.lastColorDate || "";
    if (btn) {
      btn.addEventListener("click", () => {
        const v = inLast ? (inLast.value || "").trim() : "";
        State.data.lastColor = v;
        State.data.lastColorDate = v; // keep both keys compatible
        next();
      });
    }
  }, 0);

  return div;
}

function Photos() {
  const div = document.createElement("div");

  const currentCount = normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS).length;
  const inspoCount = State.data.inspoPhoto ? 1 : 0;

  div.innerHTML = `
    <h1>Photos</h1>
    <p class="muted">Add 1–2 photos of your current hair. Add 1 inspiration photo if you have it. Total max: 3.</p>

    <div class="photo-block">
      <div class="photo-head">
        <div class="photo-title">Current hair (1–2) <span class="req">*</span></div>
        <div class="photo-meta muted" id="metaCurrent">${currentCount ? `${currentCount} selected` : "None selected"}</div>
      </div>

      <input id="fileCurrent" class="file-hidden" type="file" accept="image/*" multiple />
      <button class="btn ghost" type="button" id="btnPickCurrent">Choose photos</button>

      <div class="thumbs" id="thumbsCurrent"></div>
    </div>

    <div class="photo-block" style="margin-top:14px;">
      <div class="photo-head">
        <div class="photo-title">Inspiration (optional)</div>
        <div class="photo-meta muted" id="metaInspo">${inspoCount ? `1 selected` : "None selected"}</div>
      </div>

      <input id="fileInspo" class="file-hidden" type="file" accept="image/*" />
      <button class="btn ghost" type="button" id="btnPickInspo">Choose inspiration</button>

      <div class="thumbs" id="thumbsInspo"></div>
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" onclick="next()">Continue</button>
    </div>
  `;

  return div;
}

function bindPhotoInteractions() {
  const fileCurrent = document.getElementById("fileCurrent");
  const fileInspo = document.getElementById("fileInspo");
  const btnPickCurrent = document.getElementById("btnPickCurrent");
  const btnPickInspo = document.getElementById("btnPickInspo");

  const thumbsCurrent = document.getElementById("thumbsCurrent");
  const thumbsInspo = document.getElementById("thumbsInspo");

  const metaCurrent = document.getElementById("metaCurrent");
  const metaInspo = document.getElementById("metaInspo");

  if (!fileCurrent || !fileInspo || !btnPickCurrent || !btnPickInspo) return;

  btnPickCurrent.addEventListener("click", () => fileCurrent.click());
  btnPickInspo.addEventListener("click", () => fileInspo.click());

  // Current hair: append + dedupe + cap(2)
  fileCurrent.addEventListener("change", async () => {
    const newlyPicked = normalizeToFileList_(Array.from(fileCurrent.files || []));
    const existing = normalizeToFileList_(State.data.currentPhotos || []);

    State.data.currentPhotos = mergeFilesDedupCap_(existing, newlyPicked, MAX_CURRENT_PHOTOS);

    // allow re-picking the same file to trigger change again
    fileCurrent.value = "";

    if (metaCurrent) {
      metaCurrent.textContent = State.data.currentPhotos.length
        ? `${State.data.currentPhotos.length} selected`
        : "None selected";
    }

    await renderThumbs(State.data.currentPhotos, thumbsCurrent);
  });

  // Inspiration: single file, replace (optional)
  fileInspo.addEventListener("change", async () => {
    const f = (fileInspo.files && fileInspo.files[0]) ? fileInspo.files[0] : null;
    State.data.inspoPhoto = normalizeOneFile_(f);

    // allow re-picking the same file to trigger change again
    fileInspo.value = "";

    if (metaInspo) metaInspo.textContent = State.data.inspoPhoto ? "1 selected" : "None selected";
    await renderThumbs(State.data.inspoPhoto ? [State.data.inspoPhoto] : [], thumbsInspo);
  });

  // initial thumbs (no re-render)
  if (metaCurrent) {
    const n = normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS).length;
    metaCurrent.textContent = n ? `${n} selected` : "None selected";
  }
  if (metaInspo) metaInspo.textContent = State.data.inspoPhoto ? "1 selected" : "None selected";

  renderThumbs(normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS), thumbsCurrent);
  renderThumbs(State.data.inspoPhoto ? [normalizeOneFile_(State.data.inspoPhoto)] : [], thumbsInspo);
}

function Review() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Review your details</h1>
    <p class="muted">Quick check — you can go back and edit anything.</p>

    <div class="review-card">
      <div class="review-section">
        <div class="review-title">Contact</div>
        ${reviewRow("Name", (State.data.fullName || State.data.name || "—"))}
        ${reviewRow("Email", State.data.email || "—")}
        ${reviewRow("Phone", State.data.phone || "—")}
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Service</div>
        <div class="pill">${escapeHtml(State.data.service || (Array.isArray(State.data.services) ? (State.data.services[0] || "—") : "—") || "—")}</div>
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Hair history</div>
        ${reviewRow("Last professional color", State.data.lastColor || State.data.lastColorDate || "—")}
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Photos</div>
        ${reviewRow("Selected", `${countPickedPhotos_()} selected`)}
      </div>
    </div>

    <div class="hint" id="reviewHint" aria-live="polite">
      If anything looks off, tap <b>Back</b> — your answers stay saved.
    </div>

    <div class="form-error ${State.ui.reviewError ? "" : "hidden"}" id="reviewError" role="alert">
      ${escapeHtml(State.ui.reviewError || "")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" onclick="submitForm()">Submit</button>
    </div>
  `;

  setTimeout(() => {
    const h = document.getElementById("reviewHint");
    if (h) h.classList.add("show");
  }, 350);

  return div;
}

function reviewRow(label, value) {
  return `
    <div class="review-row">
      <div class="review-label">${escapeHtml(label)}</div>
      <div class="review-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function Loading() {
  const div = document.createElement("div");
  div.className = "loading-center";

  const line = State.ui.loadingMode === "submit"
    ? "Getting things ready…"
    : (LOADING_QUOTES[0] || "Getting things ready…");

  div.innerHTML = `
    <h1>Submitting…</h1>

    <div class="loading-stack">
      <div class="hair-loader" aria-hidden="true"></div>
      <div class="loading-line muted" id="loadingLine">${escapeHtml(line)}</div>
    </div>

    <div id="loadingRetryWrap" class="${State.ui.showLoadingRetry ? "" : "hidden"}" style="margin-top:14px; text-align:center;">
      <div class="muted" id="loadingRetryMsg" style="margin-bottom:10px;">
        ${escapeHtml(State.ui.loadingRetryMsg || "")}
      </div>
      <button class="btn primary" type="button" id="btnLoadingRetry">Try Again</button>
    </div>
  `;

  return div;
}

function bindLoadingInteractions_() {
  const btn = document.getElementById("btnLoadingRetry");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // prevent double taps
    if (State.ui.submitting) return;
    submitForm({ fromRetry: true });
  });
}

function startLoadingQuotes() {
  // reset
  State.ui.loadingQuoteIdx = 0;

  const el = document.getElementById("loadingLine");
  if (!el) return;

  // set first line immediately
  el.textContent = LOADING_QUOTES[0] || "Getting things ready…";

  // rotate through each quote ONCE, then stop
  const maxIdx = ((LOADING_QUOTES && LOADING_QUOTES.length) ? LOADING_QUOTES.length : 1) - 1;

  stopLoadingTimer();
  State.ui.loadingTimer = setInterval(() => {
    if (Steps[State.step] !== "loading") {
      stopLoadingTimer();
      return;
    }

    State.ui.loadingQuoteIdx = Math.min(State.ui.loadingQuoteIdx + 1, maxIdx);
    el.textContent = LOADING_QUOTES[State.ui.loadingQuoteIdx] || el.textContent;

    if (State.ui.loadingQuoteIdx >= maxIdx) {
      stopLoadingTimer();
    }
  }, 2600);
}

function stopLoadingTimer() {
  if (State.ui.loadingTimer) {
    clearInterval(State.ui.loadingTimer);
    State.ui.loadingTimer = null;
  }
}

/* ==============================
   RENDER HELPERS (STATIC HEADER + SLIDE SWAP)
============================== */

function ensureAppShell_(app) {
  if (app.__dmshell) return;

  // wipe once
  app.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "app-shell";

  const header = document.createElement("div");
  header.className = "app-header";
  header.innerHTML = `
    <div class="app-brand">Danielle Marie Hair Co.</div>
    <div class="app-dynamic muted" id="appDynamicLine"></div>
  `;

  const progress = document.createElement("div");
  progress.className = "progress";
  const fill = document.createElement("div");
  fill.className = "progress-fill";
  progress.appendChild(fill);

  const viewport = document.createElement("div");
  viewport.className = "app-viewport";

  shell.appendChild(header);
  shell.appendChild(progress);
  shell.appendChild(viewport);
  app.appendChild(shell);

  app.__dmshell = {
    shell,
    header,
    progress,
    progressFill: fill,
    viewport,
    dynamicLine: header.querySelector("#appDynamicLine")
  };
}

function renderHeader_(app, currentStepName) {
  const el = app.__dmshell?.dynamicLine;
  if (!el) return;
  el.textContent = buildDynamicHeaderLine_(currentStepName);
}

function buildDynamicHeaderLine_(currentStepName) {
  const service = (State.data.service || (Array.isArray(State.data.services) ? (State.data.services[0] || "") : "") || "").trim();
  const name = (State.data.fullName || State.data.name || "").trim();

  switch (currentStepName) {
    case "splash":   return "Preparing your consultation…";
    case "welcome":  return "A quick, curated intake.";
    case "basics":   return "Your details — so we can follow up.";
    case "services": return service ? `Focused on: ${service}` : "Choose what feels closest.";
    case "changeSize": return "Dial in the outcome.";
    case "extras":   return "Optional details to plan well.";
    case "history":  return "A little context goes a long way.";
    case "photos":   return "Photos help us plan precisely.";
    case "review":   return name ? `All set, ${name}. One last look.` : "All set. One last look.";
    case "loading":  return "Submitting securely…";
    case "thankyou": return "Received. We’ll review and follow up.";
    default:         return "";
  }
}

function swapScreen_(app, node) {
  const vp = app.__dmshell?.viewport;
  if (!vp) return;

  if (!node) { vp.innerHTML = ""; return; }

  if (!vp.__dmSwapInit) {
    vp.__dmSwapInit = true;
    vp.style.position = "relative";
    vp.style.overflow = "hidden";
    vp.style.width = "100%";
  }

  const prev = vp.firstElementChild;

  const nextWrap = document.createElement("div");
  nextWrap.className = "screen";
  nextWrap.style.width = "100%";
  nextWrap.style.boxSizing = "border-box";
  nextWrap.appendChild(node);
  vp.appendChild(nextWrap);

  if (!prev) return;

  prev.style.position = "absolute";
  prev.style.inset = "0";
  prev.style.width = "100%";

  nextWrap.style.position = "absolute";
  nextWrap.style.inset = "0";
  nextWrap.style.width = "100%";
  nextWrap.style.opacity = "0";
  nextWrap.style.transform = "translateX(10px)";

  const cleanup = () => {
    if (prev && prev.parentNode === vp) vp.removeChild(prev);
    nextWrap.style.position = "";
    nextWrap.style.inset = "";
    nextWrap.style.transform = "";
    nextWrap.style.opacity = "";
  };

  try {
    const inAnim = nextWrap.animate(
      [{ opacity: 0, transform: "translateX(10px)" }, { opacity: 1, transform: "translateX(0px)" }],
      { duration: 200, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" }
    );

    prev.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 160, easing: "ease", fill: "forwards" }
    );

    inAnim.onfinish = cleanup;
    setTimeout(cleanup, 260);

  } catch (e) {
    cleanup();
  }

}

/* ==============================
   ADAPTER + CANON SUBMISSION
============================== */

const DMHCAdapter = (() => {
  const CANON_KEYS = [
    "company",
    "fullName",
    "phone",
    "email",
    "preferredStylist",
    "services",
    "goals",
    "lastColorDate",
    "boxDye",
    "chemicalServices",
    "sensitivities",
    "hairLength",
    "maintenanceFrequency",
    "referralSource",
    "submittedFrom",
    "userAgent",
    "photos"
  ];

  function buildPayload(d) {
    // 1) Required identity fields (with fallback to avoid false missing-name errors)
    const fullName = pickString(d, ["fullName", "name"]) || "";
    const phone = pickString(d, ["phone"]) || "";
    const email = pickString(d, ["email"]) || "";

    // 2) Optional fields (stable keys)
    const company = pickString(d, ["company"]) || ""; // honeypot
    const preferredStylist = pickString(d, ["preferredStylist", "preferred_stylist"]) || "";

    // 3) services MUST be array (support array or string)
    const services = normalizeServices_(d);

    const goals = pickString(d, ["goals", "goal"]) || "";
    const lastColorDate =
      pickString(d, ["lastColorDate"]) ||
      pickString(d, ["lastColor"]) ||
      "";
    const boxDye = pickString(d, ["boxDye", "box_dye"]) || "";
    const chemicalServices = pickString(d, ["chemicalServices", "chemical_services"]) || "";
    const sensitivities = pickString(d, ["sensitivities"]) || "";

    // New optional keys (safe; backend will auto-add columns)
    const hairLength = pickString(d, ["hairLength", "hair_length"]) || "";
    const maintenanceFrequency = pickString(d, ["maintenanceFrequency", "maintenance_frequency", "visitFrequency"]) || "";
    const referralSource = pickString(d, ["referralSource", "referral_source", "referral", "howDidYouHear"]) || "";

    const submittedFrom = String(window.location.href || "");
    const userAgent = String(navigator.userAgent || "");

    // Photos are built separately and assigned by submitForm() after compression
    const payload = {
      company,
      fullName,
      phone,
      email,
      preferredStylist,
      services,
      goals,
      lastColorDate,
      boxDye,
      chemicalServices,
      sensitivities,
      hairLength,
      maintenanceFrequency,
      referralSource,
      submittedFrom,
      userAgent,
      photos: []
    };

    // Ensure only canon keys exist (contract hygiene)
    const clean = {};
    for (const k of CANON_KEYS) clean[k] = payload[k];
    return clean;
  }

  function normalizeServices_(d) {
    const raw = d && typeof d === "object" ? d.services : null;
    if (Array.isArray(raw)) {
      return raw.map(x => String(x || "").trim()).filter(Boolean);
    }
    if (typeof raw === "string" && raw.trim()) {
      return [raw.trim()];
    }
    const single = pickString(d, ["service"]) || "";
    return single ? [String(single).trim()] : [];
  }

  function pickString(obj, keys) {
    if (!obj || typeof obj !== "object") return "";
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        const v = obj[k];
        if (typeof v === "string") return v.trim();
        if (v == null) continue;
        return String(v).trim();
      }
    }
    return "";
  }

  return { buildPayload };
})();

/* ==============================
   RISK + META HELPERS (NON-BREAKING)
============================== */

const SCHEMA_VERSION = "1.2.0";

function computeRiskScore_() {
  let score = 0;

  const intent = String(State.data.serviceIntent || "");
  const size = String(State.data.changeSize || "");
  const lastColorTxt = String(State.data.lastColor || State.data.lastColorDate || "").toLowerCase();
  const photoCount = countPickedPhotos_();
  const services = Array.isArray(State.data.services) ? State.data.services.map(s => String(s || "")) : [];

  // High-risk intent
  if (intent === "fix") score += 4;

  // Transformation size
  if (size === "big") score += 3;
  if (size === "noticeable") score += 1;

  // Very recent chemical/color work (best-effort parse)
  if (lastColorTxt.includes("week")) score += 2;
  if (lastColorTxt.includes("2 week") || lastColorTxt.includes("two week")) score += 2;
  if (lastColorTxt.includes("1 month") || lastColorTxt.includes("one month")) score += 1;

  // Missing photos (planning blind)
  if (photoCount <= 0) score += 2;

  // Blonding + big change combo
  if (services.includes("Blonding") && size === "big") score += 2;

  // Clamp 0–10 (keeps reporting consistent)
  return clamp(score, 0, 10);
}

function getRiskTier_(score) {
  const s = Number(score) || 0;
  if (s >= 7) return "High";
  if (s >= 4) return "Moderate";
  return "Low";
}

/* ==============================
   SUBMISSION (CANONICAL + RISK + META)
============================== */

async function submitForm(opts = {}) {
  const fullName = (State.data.fullName || State.data.name || "").trim();
  const email = (State.data.email || "").trim();
  const phone = (State.data.phone || "").trim();

  if (!fullName) return setReviewError_("Please add your name, then submit again.");
  if (!isEmailish(email)) return setReviewError_("That email looks a little off — please double-check it.");
  if (!phone || phone.length < 7) return setReviewError_("Please add a phone number so we can reach you.");

  const currentCount = normalizeToFileList_(State.data.currentPhotos || [])
    .slice(0, MAX_CURRENT_PHOTOS).length;

  if (currentCount < MIN_CURRENT_PHOTOS) {
    return setReviewError_("Please add at least one photo of your current hair.");
  }

  if (State.ui.submitting) return;
  State.ui.submitting = true;

  State.ui.loadingMode = "submit";
  State.ui.showLoadingRetry = false;
  State.ui.loadingRetryMsg = "";

  goToStep(Steps.indexOf("loading"));

  try {
    const picked = normalizeToFileList_(getSelectedFiles_()).slice(0, MAX_TOTAL_PHOTOS);

    const photos = [];
    for (let i = 0; i < picked.length; i++) {
      setLoadingLine_(`Optimizing photo ${i + 1} of ${picked.length}…`);
      const f = picked[i];
      const base64 = await compressToJpegBase64_(f, MAX_EDGE_PX, JPEG_QUALITY);

      photos.push({
        originalName: f.name || "upload.jpg",
        mime: "image/jpeg",
        base64
      });
    }

    // -------------------------
    // Build payload (LOCKED CONTRACT SAFE)
    // -------------------------
    const payload = DMHCAdapter.buildPayload({
      ...State.data,
      fullName,
      email,
      phone
    });

    payload.photos = photos;

    // -------------------------
    // Risk Inference (non-breaking additions)
    // -------------------------
    const riskScore = computeRiskScore_();
    const riskTier = getRiskTier_(riskScore);

    payload.riskScore = riskScore;                 // OPTIONAL (safe)
    payload.riskTier = riskTier;                   // OPTIONAL (safe)
    payload.schemaVersion = SCHEMA_VERSION;        // OPTIONAL (safe)
    payload.submittedFrom = String(window.location.href || "web-intake");
    payload.userAgent = String(navigator.userAgent || "unknown");

    // -------------------------

    setLoadingLine_("Sending securely…");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let out = null;
    try {
      out = await res.json();
    } catch (e) {
      out = { ok: res.ok };
    }

    State.ui.submitting = false;

    if (out && out.ok) {
      State.ui.loadingMode = "quotes";
      goToStep(Steps.indexOf("thankyou"));
      return;
    }

    const msg = out && out.message
      ? String(out.message)
      : "We didn’t get a clean confirmation. Tap Try Again once.";

    showLoadingRetry_(msg);

  } catch (err) {
    State.ui.submitting = false;

    if (err && err.name === "AbortError") {
      showLoadingRetry_("Still working on it — mobile uploads can be slow. Tap Try Again once.");
      return;
    }

    goToStep(Steps.indexOf("review"));
    setReviewError_("Something hiccuped on our side. Please tap Submit again.");
  }
}

/* ==============================
   PHOTO HELPERS
============================== */

function getSelectedFiles_() {
  const current = normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS);
  const inspo = State.data.inspoPhoto ? [normalizeOneFile_(State.data.inspoPhoto)] : [];
  return [...current, ...inspo].filter(Boolean).slice(0, MAX_TOTAL_PHOTOS);
}

function countPickedPhotos_() {
  return normalizeToFileList_(getSelectedFiles_()).length;
}

function normalizeOneFile_(x) {
  if (!x) return null;
  if (x instanceof File) return x;
  if (typeof x === "object" && x.file instanceof File) return x.file;
  return null;
}

function normalizeToFileList_(arr) {
  const out = [];
  for (const x of Array.isArray(arr) ? arr : []) {
    const f = normalizeOneFile_(x);
    if (f) out.push(f);
  }
  return out;
}

async function renderThumbs(files, targetEl) {
  if (!targetEl) return;
  targetEl.innerHTML = "";

  const list = normalizeToFileList_(files).slice(0, 6);
  if (!list.length) return;

  for (const f of list) {
    const url = URL.createObjectURL(f);
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = url;
    img.alt = "Photo preview";
    img.onload = () => URL.revokeObjectURL(url);
    targetEl.appendChild(img);
  }
}

/* ==============================
   JPEG COMPRESSION → BASE64 (NO PREFIX)
============================== */

async function compressToJpegBase64_(file, maxEdgePx, quality) {
  if (!(file instanceof File)) throw new Error("compressToJpegBase64_: expected File");

  let bitmap = null;
  try {
    if ("createImageBitmap" in window) bitmap = await createImageBitmap(file);
  } catch (e) {
    bitmap = null;
  }

  const img = bitmap ? null : await fileToImage_(file);

  const srcW = bitmap ? bitmap.width : (img.naturalWidth || img.width);
  const srcH = bitmap ? bitmap.height : (img.naturalHeight || img.height);
  if (!srcW || !srcH) throw new Error("Could not read image dimensions.");

  const scale = Math.min(1, maxEdgePx / Math.max(srcW, srcH));
  const dstW = Math.max(1, Math.round(srcW * scale));
  const dstH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas unsupported.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (bitmap) {
    ctx.drawImage(bitmap, 0, 0, dstW, dstH);
    try { bitmap.close && bitmap.close(); } catch (e) {}
  } else {
    ctx.drawImage(img, 0, 0, dstW, dstH);
  }

  const dataUrl = canvas.toDataURL("image/jpeg", clampNumber_(quality, 0.5, 0.92));
  const commaIdx = dataUrl.indexOf(",");
  return commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
}

function fileToImage_(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image decode failed.")); };
    img.src = url;
  });
}

/* ==============================
   HELPERS
============================== */

function setCheck(el, ok) {
  if (!el) return;
  el.classList.toggle("on", !!ok);
}

function setLoadingLine_(msg) {
  const el = document.getElementById("loadingLine");
  if (el) el.textContent = String(msg || "");
}

function showLoadingRetry_(msg) {
  State.ui.showLoadingRetry = true;
  State.ui.loadingRetryMsg = String(msg || "");

  const wrap = document.getElementById("loadingRetryWrap");
  const text = document.getElementById("loadingRetryMsg");

  if (text) text.textContent = State.ui.loadingRetryMsg;
  if (wrap) wrap.classList.remove("hidden");

  setLoadingLine_("Almost there…");
}

function isEmailish(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function clampNumber_(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function mergeFilesDedupCap_(a, b, cap) {
  const out = [];
  const seen = new Set();

  const push = (f) => {
    if (!(f instanceof File)) return;
    const key = `${f.name}::${f.size}::${f.lastModified}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(f);
  };

  for (const f of (Array.isArray(a) ? a : [])) push(f);
  for (const f of (Array.isArray(b) ? b : [])) push(f);

  return out.slice(0, Math.max(0, Number(cap) || 0));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/`/g, "&#096;");
}

~~~~

### PACKET_USAGE_RULES.md

~~~~md
# Packet Usage Rules

This packet is the live source of truth for the DMHC Intake system only when its metadata is current.

## Required startup behavior
Before any analysis or patching, always print:

- Generated
- Commit
- Commit Count
- Branch
- Last Commit

## Staleness rule
Treat the current chat context as stale and require re-sync if any of the following is true:

- The user says they made a new commit or changed the repo
- The user references a newer commit hash
- The user references a newer Generated timestamp
- The packet metadata in the current chat differs from the latest packet metadata
- The user reports behavior that conflicts with the current packet

## Patch safety rule
Do not provide a patch until the packet has been re-read if staleness is suspected.

## Fix workflow rule
Use one fix item at a time.
If a new higher-priority issue is discovered during a fix, move the current item to BLOCKED or back to OPEN in FIX_QUEUE.md before starting the new item.

## Commit discipline rule
Prefer one commit per fix.~~~~

### FIX_QUEUE.md

~~~~md
# DMHC Intake — Fix Queue

This file is the repo-level source of truth for active fixes.

Status types:
- OPEN
- IN_PROGRESS
- BLOCKED
- DONE

Rules:
- One fix item at a time
- If a new higher-priority issue appears, move the current item to BLOCKED or back to OPEN before switching
- Prefer one commit per fix
- Keep descriptions short and concrete
- Reference exact files / sections when possible

---

## OPEN

1. Packet / tooling cleanup
   where: repo / workflow
   notes: confirm packet includes all required control files and no stale references remain

---

## IN_PROGRESS

(none)

---

## BLOCKED

(none)

---

## DONE

1. Remove missing canon reference from packet
   where: .github/workflows/gpt-context-packet.yml
   notes: removed INTAKE_SYSTEM_CONTEXT_and_CONTRACT_LOCK_CANON.md from packet source list

2. Align canon endpoint to real Apps Script endpoint
   where: CANON_DMHCI_INTAKE.md
   notes: removed placeholder / incorrect endpoint references

3. Add packet metadata for sync safety
   where: .github/workflows/gpt-context-packet.yml
   notes: packet now prints Generated, Commit, Commit Count, Branch, Last Commit

4. Add Apps Script backend to repo 
   where: Code.gs, appsscript.json 
   notes: backend is now versioned in GitHub and can be bundled into GPT_CONTEXT_PACKET.md
~~~~

### CONTRACT_KEYS.md

~~~~md
# DMHC Intake — Contract Keys

## Required Keys
- fullName
- phone
- email
- services
- photos

## Optional Keys
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

## Rules
- `services` must always be an array
- `photos` must always be an array
- each photo object must include `base64`
- additive keys are allowed only if frontend and backend both tolerate them safely
- silent renames are prohibited
- legacy aliases must be handled in adapter / backend mapping, not by changing canonical names silently~~~~

## Runtime Files

### index.html

~~~~html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <title>DMHC Intake</title>

    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="app" role="application" aria-label="Danielle Marie Hair Co. Intake"></div>

    <script src="./app.js" defer></script>
  </body>
</html>~~~~

### styles.css

~~~~css
/* DMHC Intake — FULL styles.css (paste-replace)
   Adds: “liquid glass” animated background + reliable vertical centering + dark mode safety.
   No HTML changes required.
*/

/* ==============================
   BASE + VARIABLES
============================== */

:root{
  --bg-1:#eef1ee;
  --bg-2:#e8eeea;
  --ink:#121212;
  --muted:#6a6a6a;

  --card:#ffffffcc;         /* translucent for “glass” */
  --card-solid:#ffffff;     /* fallback */
  --stroke:rgba(18,18,18,.10);

  --brand:#1f5f52;
  --brand-2:#0f3f37;

  --radius:26px;
  --shadow:0 18px 55px rgba(0,0,0,.18);

  --maxw:520px;
  --pad:22px;
}

/* Make sizing predictable */
*{ box-sizing:border-box; }
html,body{ height:100%; }

body{
  margin:0;
  color:var(--ink);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  background: radial-gradient(1200px 700px at 20% 10%, var(--bg-2), var(--bg-1));
  overflow-x:hidden;
}

/* ==============================
   “C” BACKGROUND (LIQUID GLASS)
============================== */

/* Soft drifting blobs */
body::before{
  content:"";
  position:fixed;
  inset:-20%;
  pointer-events:none;
  z-index:-2;

  background:
    radial-gradient(420px 320px at 18% 22%, rgba(31,95,82,.14), transparent 70%),
    radial-gradient(520px 380px at 78% 18%, rgba(31,95,82,.10), transparent 72%),
    radial-gradient(620px 460px at 60% 78%, rgba(17,17,17,.06), transparent 72%),
    radial-gradient(520px 420px at 18% 86%, rgba(31,95,82,.08), transparent 72%);
  filter: blur(26px) saturate(105%);
  transform: translate3d(0,0,0);
  animation: dmLiquidDrift 60s ease-in-out infinite alternate;
}

/* Fine grain overlay */
body::after{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:-1;
  opacity:.09;
  background-image:
    repeating-linear-gradient(0deg, rgba(0,0,0,.03) 0 1px, rgba(255,255,255,.00) 1px 3px),
    repeating-linear-gradient(90deg, rgba(0,0,0,.02) 0 1px, rgba(255,255,255,.00) 1px 4px);
  mix-blend-mode: multiply;
}

@keyframes dmLiquidDrift{
  0%   { transform: translate3d(-2%, -1%, 0) scale(1.02); }
  50%  { transform: translate3d( 2%,  2%, 0) scale(1.04); }
  100% { transform: translate3d( 1%, -2%, 0) scale(1.03); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce){
  body::before{ animation:none; }
}

/* ==============================
   APP WRAPPER + CENTERING
============================== */

#app{
  min-height: 100svh;
  padding: 18px 14px 26px;
  display:flex;
  flex-direction:column;
  align-items:center;
}

/* progress bar */
.progress{
  width:min(var(--maxw), 100%);
  height:6px;
  border-radius:999px;
  background: rgba(0,0,0,.07);
  overflow:hidden;
  margin: 10px auto 18px;
}
.progress-fill{
  height:100%;
  width:0%;
  border-radius:999px;
  background: linear-gradient(90deg, rgba(31,95,82,.85), rgba(31,95,82,1));
}

/* screen container */
.screen{
  width:min(var(--maxw), 100%);
  margin:0 auto;
  display:flex;
  flex:1;
  align-items:flex-start;
  justify-content:flex-start;
}

/* ✅ Make key screens auto-center vertically without JS changes */
.screen:has(.center-splash),
.screen:has(.loading-center){
  align-items:center;
  justify-content:center;
  padding-top: 6svh;
  padding-bottom: 10svh;
}

/* Optional: if you later add screen.classList.add("centered") */
.screen.centered{
  align-items:center;
  justify-content:center;
  padding-top: 6svh;
  padding-bottom: 10svh;
}

/* ==============================
   CARD / SURFACE
============================== */

.center-splash,
.loading-center,
.screen > div{
  width:100%;
}

/* Primary “glass card” look */
.screen > div{
  background: var(--card);
  border: 1px solid rgba(255,255,255,.65);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  padding: 22px 22px 20px;
}

/* Keep splash/loading tighter */
.center-splash,
.loading-center{
  text-align:center;
  padding: 22px 22px 24px;
}

@supports not (backdrop-filter: blur(14px)){
  .screen > div{ background: var(--card-solid); }
}

/* ==============================
   TYPOGRAPHY
============================== */

h1{
  margin: 0 0 10px;
  font-size: 40px;
  line-height: 1.05;
  letter-spacing: -0.02em;
}
p{ margin: 0 0 14px; }
.muted{ color: var(--muted); }

.splash-title{
  font-weight: 800;
  font-size: 28px;
  margin-top: 14px;
}
.splash-sub{
  margin-top: 6px;
  font-size: 16px;
}

/* ==============================
   FORM FIELDS
============================== */

.field{ margin: 14px 0; }

.label-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 8px;
}
.label{
  font-weight: 650;
  font-size: 14px;
  letter-spacing: .01em;
}
.req{ color: rgba(0,0,0,.45); font-weight: 700; }
.check{
  font-size: 14px;
  opacity: .0;
  transform: translateY(1px);
  transition: opacity .18s ease;
}
.check.on{ opacity: .9; }

.input{
  width:100%;
  height: 52px;
  padding: 0 14px;
  font-size: 16px;
  border-radius: 14px;
  border: 1px solid var(--stroke);
  background: rgba(255,255,255,.78);
  outline: none;
}
.input:focus{
  border-color: rgba(31,95,82,.45);
  box-shadow: 0 0 0 3px rgba(31,95,82,.10);
}

/* ==============================
   BUTTONS
============================== */

.actions,
.nav{
  display:flex;
  gap: 14px;
  margin-top: 18px;
}

.btn{
  height: 54px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.08);
  background: rgba(255,255,255,.72);
  color: var(--ink);
  font-size: 16px;
  font-weight: 650;
  cursor:pointer;
  flex:1;
}

.btn.primary{
  border: none;
  background: linear-gradient(180deg, rgba(31,95,82,1), rgba(15,63,55,1));
  color: #fff;
  box-shadow: 0 14px 35px rgba(15,63,55,.25);
}

.btn.ghost{ background: rgba(255,255,255,.62); }

.btn.disabled,
.btn:disabled{
  opacity:.55;
  cursor:not-allowed;
}

/* ==============================
   CARDS (services)
============================== */

.card-grid{
  display:grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 14px;
}

.card{
  width:100%;
  text-align:left;
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,.08);
  padding: 16px 16px 14px;
  background: rgba(255,255,255,.70);
  cursor:pointer;
}

.card-title{
  font-weight: 800;
  margin-bottom: 6px;
  font-size: 16px;
}
.card-desc{
  color: var(--muted);
  font-size: 14px;
  line-height: 1.25;
}

/* ==============================
   PHOTOS
============================== */

.photo-block{
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,.08);
  padding: 14px;
  background: rgba(255,255,255,.64);
  margin-top: 14px;
}
.photo-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.photo-title{ font-weight: 800; }
.photo-meta{ font-size: 13px; }

.file-hidden{ display:none; }

.thumbs{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.thumbs img{
  width: 64px;
  height: 64px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid rgba(0,0,0,.10);
}

/* ==============================
   REVIEW
============================== */

.review-card{
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,.08);
  padding: 14px;
  background: rgba(255,255,255,.64);
  margin-top: 14px;
}
.review-title{
  font-weight: 900;
  margin-bottom: 10px;
}
.review-row{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 14px;
  padding: 8px 0;
}
.review-label{
  color: var(--muted);
  font-size: 13px;
}
.review-value{
  font-weight: 650;
  text-align:right;
  max-width: 58%;
  word-break: break-word;
}
.review-divider{
  height:1px;
  background: rgba(0,0,0,.08);
  margin: 10px 0;
}
.pill{
  display:inline-block;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(31,95,82,.10);
  border: 1px solid rgba(31,95,82,.18);
  font-weight: 750;
}

.hint{
  margin-top: 12px;
  color: var(--muted);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity .22s ease, transform .22s ease;
}
.hint.show{
  opacity: 1;
  transform: translateY(0);
}

.form-error{
  margin-top: 12px;
  padding: 12px 12px;
  border-radius: 14px;
  background: rgba(170,0,0,.06);
  border: 1px solid rgba(170,0,0,.12);
  color: rgba(120,0,0,1);
  font-weight: 650;
}
.hidden{ display:none; }

/* ==============================
   LOADER
============================== */

.hair-loader{
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 3px solid rgba(0,0,0,.08);
  border-top-color: rgba(31,95,82,.85);
  margin: 14px auto 10px;
  animation: spin 1.05s linear infinite;
}
.hair-loader.big{
  width: 46px;
  height: 46px;
  border-width: 4px;
}

.loading-stack{ margin-top: 10px; }
.loading-line{ font-size: 15px; }

@keyframes spin{ to{ transform: rotate(360deg); } }

/* ==============================
   DARK MODE SAFETY (IMPORTANT)
============================== */

@media (prefers-color-scheme: dark){
  :root{
    --bg-1:#0f1211;
    --bg-2:#101816;
    --ink:#f2f2f2;
    --muted:#b7b7b7;

    --card:rgba(18,22,21,.78);
    --card-solid:#121615;
    --stroke:rgba(255,255,255,.12);

    --shadow:0 22px 65px rgba(0,0,0,.55);
  }

  body{
    background: radial-gradient(1200px 700px at 20% 10%, var(--bg-2), var(--bg-1));
  }

  body::after{
    opacity:.10;
    mix-blend-mode: screen;
  }

  .progress{ background: rgba(255,255,255,.10); }
  .btn{ background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.10); color: var(--ink); }
  .btn.ghost{ background: rgba(255,255,255,.06); }
  .card,
  .photo-block,
  .review-card{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.10); }
  .input{ background: rgba(255,255,255,.08); color: var(--ink); }
  .req{ color: rgba(255,255,255,.40); }
  .review-divider{ background: rgba(255,255,255,.10); }
  .pill{ background: rgba(31,95,82,.22); border-color: rgba(31,95,82,.35); }
  .hair-loader{ border-color: rgba(255,255,255,.14); border-top-color: rgba(31,95,82,.95); }
}

/* ==============================
   SMALL SCREENS
============================== */

@media (max-width: 420px){
  h1{ font-size: 34px; }
  .btn{ height: 52px; }
  .screen > div{ padding: 20px 18px 18px; }
}~~~~

### app.js

~~~~js
console.log("DMHC Modular Intake Loaded");

/* ==============================
   CONFIG
============================== */

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwQ9jmUDlTS46nRr0aNtC6wFIoSzl-6QnLg-rjwo06nnom_NEcaiTthBQ3zQ9GJ5sAI/exec";

// Photo compression defaults (safe for Apps Script limits)
const MAX_EDGE_PX = 1400;      // lowered slightly
const JPEG_QUALITY = 0.74;     // lowered slightly

// Photo limits (NEW RULE):
// - Current hair: up to 2 (REQUIRED: at least 1)
// - Inspiration: up to 1 (optional)
// - Total max: 3
const MAX_CURRENT_PHOTOS = 2;
const MAX_INSPO_PHOTOS = 1;
const MAX_TOTAL_PHOTOS = MAX_CURRENT_PHOTOS + MAX_INSPO_PHOTOS;
const MIN_CURRENT_PHOTOS = 1;

/* ==============================
   APP STATE
============================== */

const State = {
  step: 0,
  data: {
    // legacy fields currently used by UI
    name: "",
    email: "",
    phone: "",
    service: "",
    lastColor: "",
    currentPhotos: [], // File[]
    inspoPhoto: null,  // File|null

    // future / optional
    fullName: "",
    preferredStylist: "",
    services: [],
    goals: "",
    lastColorDate: "",
    boxDye: "",
    chemicalServices: "",
    sensitivities: "",
    hairLength: "",
    maintenanceFrequency: "",
    referralSource: "",
    company: ""
  },
  ui: {
    error: "",
    reviewError: "",

    splashTimer: null,

    // loading quotes rotator
    loadingTimer: null,
    loadingQuoteIdx: 0,

    // submit/try-again flow
    submitting: false,
    loadingMode: "quotes",     // "quotes" | "submit"
    _renderQueued: false,
    _navDir: 1,
    showLoadingRetry: false,
    loadingRetryMsg: ""
  }
};

/* ==============================
   FAIL-LOUD DEBUG OVERLAY
   (Shows the real error on-screen)
============================== */
(function () {
  function showErr(msg) {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `
      <div style="padding:16px;font-family:system-ui;color:#fff;">
        <div style="font-size:18px;font-weight:700;margin-bottom:8px;">DMHC Intake crashed</div>
        <pre style="white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,.55);padding:12px;border-radius:10px;">
${String(msg || "Unknown error")}
        </pre>
      </div>
    `;
  }

  window.addEventListener("error", (e) => {
    const loc = e?.filename ? `\n\n${e.filename}:${e.lineno}:${e.colno}` : "";
    showErr((e?.message || e) + loc);
  });

  window.addEventListener("unhandledrejection", (e) => {
    showErr(e?.reason?.stack || e?.reason || "Unhandled promise rejection");
  });
})();

/* ==============================
   STEPS + LOADING COPY
============================== */

const Steps = [
  "splash",
  "welcome",
  "basics",
  "services",
  "changeSize",
  "extras",
  "history",
  "photos",
  "review",
  "loading",
  "thankyou"
];

const LOADING_QUOTES = [
  "Uploading photos…",
  "Optimizing images…",
  "Sending your details…",
  "Finishing up…",
  "Still uploading — hang tight…"
];

/* ==============================
   INIT
============================== */

document.addEventListener("DOMContentLoaded", () => {
  const stepParam = Number(new URL(window.location.href).searchParams.get("step"));
  if (!Number.isNaN(stepParam)) {
    State.step = clamp(stepParam, 0, Steps.length - 1);
  } else {
    State.step = 0;
  }

// Expose functions for inline onclick handlers (required if script is module-scoped)
Object.assign(window, {
  next,
  back,
  goToStep,
  submitForm,

  // NEW service flow
  selectIntent,
  selectChangeSize,
  selectHaircut,

  // Legacy safety bridge (prevents old onclick crash if anything lingers)
  selectService
});

  // Keep browser back/forward inside the flow
  syncHistory(true);

  window.addEventListener("popstate", (e) => {
    const s =
      e.state && typeof e.state.step === "number"
        ? e.state.step
        : Number(new URL(window.location.href).searchParams.get("step") || 0);

    State.step = clamp(s, 0, Steps.length - 1);
    render();
  });

  render();
});

/* ==============================
   HISTORY
============================== */

function syncHistory(replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(State.step));
  const fn = replace ? history.replaceState : history.pushState;
  fn.call(history, { step: State.step }, "", url.toString());
}

/* ==============================
   NAV (HARDENED)
============================== */

function goToStep(stepIndex, opts = {}) {
  const nextStep = clamp(stepIndex, 0, Steps.length - 1);
  if (nextStep === State.step) return; // no-op prevents flicker

  // record direction for swap animation
  State.ui._navDir = (nextStep > State.step) ? 1 : -1;

  State.ui.error = "";
  State.ui.reviewError = "";

  State.step = nextStep;

  // history update (allow disabling if needed later)
  if (opts.skipHistory !== true) syncHistory();

  // batch render to next animation frame to avoid double paint/blank flash
  scheduleRender_();
}

function next() {
  goToStep(State.step + 1);
}

function back() {
  goToStep(State.step - 1);
}

/* ==============================
   RENDER SCHEDULER (ANTI-FLICKER)
============================== */

function scheduleRender_() {
  if (State.ui._renderQueued) return;
  State.ui._renderQueued = true;

  requestAnimationFrame(() => {
    State.ui._renderQueued = false;
    render();
  });
}

/* ==============================
   RENDER
============================== */

// Build the shell ONCE (static header + viewport). Then only swap the screen.
// This prevents flicker, enables smooth transitions, and keeps the header “anchored”.

function render() {
  stopSplashTimer();
  stopLoadingTimer();

  const app = document.getElementById("app");
  if (!app) return;

  // 1) Ensure shell exists (header stays static, content slides)
  ensureAppShell_(app);

  const current = Steps[State.step];

  // 2) Build the next screen node (same as before)
  let node = null;
  switch (current) {
    case "splash": node = Splash(); break;
    case "welcome": node = Welcome(); break;
    case "basics": node = Basics(); break;
    case "services": node = Services(); break;
    case "changeSize": node = ChangeSize(); break;
    case "extras": node = Extras(); break;
    case "history": node = History(); break;
    case "photos": node = Photos(); break;
    case "review": node = Review(); break;
    case "loading": node = Loading(); break;
    case "thankyou": node = ThankYou(); break;
  }

  // 3) Update header + progress (header is static; content changes)
  renderHeader_(app, current);
  renderProgress_(app, current);

  // 4) Swap screen with a quick “Tinder-like” slide (no CSS required)
  swapScreen_(app, node);

  // 5) Post-render hooks (NO re-render while typing)
  if (current === "basics") bindBasicsInteractions();
  if (current === "photos") bindPhotoInteractions();

  if (current === "loading") {
    // wire retry button (if shown)
    bindLoadingInteractions_();

    // only rotate quotes when not actively submitting
    if (State.ui.loadingMode !== "submit") {
      startLoadingQuotes();
    }
  }

  if (current === "splash") {
    startSplashAutoAdvance();
  }

  // mark last rendered step for direction inference next time
  State.ui._lastRenderedStep = State.step;
}

/* ==============================
   PROGRESS
============================== */

function renderProgress_(app, currentStepName) {
  const fill = app.__dmshell?.progressFill;
  if (!fill) return;

  // do not count splash/loading/thankyou as progress
  const progressSteps = ["welcome", "basics", "services", "changeSize", "extras", "history", "photos", "review"];
  const idx = progressSteps.indexOf(currentStepName);
  const denom = Math.max(progressSteps.length - 1, 1);
  const percent = idx < 0 ? 0 : (idx / denom) * 100;

  fill.style.width = Math.min(Math.max(percent, 0), 100) + "%";
}

/* ==============================
   SCREENS
============================== */

function Splash() {
  const div = document.createElement("div");
  div.className = "center-splash";

  div.innerHTML = `
    <div class="hair-loader big" aria-hidden="true"></div>
    <div class="splash-title">Danielle Marie Hair Co.</div>
    <div class="splash-sub muted">Preparing your consultation…</div>
  `;

  return div;
}

function startSplashAutoAdvance() {
  // intentional, not a flash
  State.ui.splashTimer = setTimeout(() => {
    if (Steps[State.step] === "splash") next();
  }, 2200);
}

function stopSplashTimer() {
  if (State.ui.splashTimer) {
    clearTimeout(State.ui.splashTimer);
    State.ui.splashTimer = null;
  }
}

function Welcome() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Let’s begin.</h1>
    <p class="muted">Quick intake so we can plan your appointment the right way.</p>

    <div class="actions" style="margin-top:18px;">
      <button class="btn primary" type="button" onclick="next()">Begin</button>
    </div>
  `;

  return div;
}

function Basics() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Your information</h1>
    <p class="muted">This helps us confirm your appointment details.</p>

    <div class="field">
      <div class="label-row">
        <label class="label">Full name <span class="req">*</span></label>
        <span class="check" id="ckName" aria-hidden="true">✓</span>
      </div>
      <input id="inName" class="input" placeholder="First + Last" autocomplete="name" />
    </div>

    <div class="field">
      <div class="label-row">
        <label class="label">Email <span class="req">*</span></label>
        <span class="check" id="ckEmail" aria-hidden="true">✓</span>
      </div>
      <input id="inEmail" class="input" placeholder="you@email.com" autocomplete="email" inputmode="email" />
    </div>

    <div class="field">
      <div class="label-row">
        <label class="label">Phone <span class="req">*</span></label>
        <span class="check" id="ckPhone" aria-hidden="true">✓</span>
      </div>
      <input id="inPhone" class="input" placeholder="(###) ###-####" autocomplete="tel" inputmode="tel" />
    </div>

    <div class="form-error ${State.ui.error ? "" : "hidden"}" id="formError" role="alert">
      ${escapeHtml(State.ui.error || "")}
    </div>

    <div class="nav">
      <button class="btn primary" id="btnBasicsContinue" type="button">Continue</button>
    </div>
  `;

  return div;
}

function bindBasicsInteractions() {
  const inName = document.getElementById("inName");
  const inEmail = document.getElementById("inEmail");
  const inPhone = document.getElementById("inPhone");

  const ckName = document.getElementById("ckName");
  const ckEmail = document.getElementById("ckEmail");
  const ckPhone = document.getElementById("ckPhone");

  const btn = document.getElementById("btnBasicsContinue");
  const err = document.getElementById("formError");

  if (!inName || !inEmail || !inPhone || !btn) return;

  // initial values (NO re-render)
  inName.value = State.data.name || State.data.fullName || "";
  inEmail.value = State.data.email || "";
  inPhone.value = State.data.phone || "";

  const updateUI = () => {
    const name = (inName.value || "").trim();
    const email = (inEmail.value || "").trim();
    const phone = (inPhone.value || "").trim();

    // store both for compatibility
    State.data.name = name;
    State.data.fullName = name;

    State.data.email = email;
    State.data.phone = phone;

    setCheck(ckName, !!name);
    setCheck(ckEmail, isEmailish(email));
    setCheck(ckPhone, phone.length >= 7);

    const ok = !!name && isEmailish(email) && phone.length >= 7;
    btn.disabled = !ok;
    btn.classList.toggle("disabled", !ok);

    State.ui.error = "";
    if (err) {
      err.textContent = "";
      err.classList.add("hidden");
    }
  };

  inName.addEventListener("input", updateUI);
  inEmail.addEventListener("input", updateUI);
  inPhone.addEventListener("input", updateUI);

  btn.addEventListener("click", () => {
    const name = (State.data.fullName || State.data.name || "").trim();
    const email = (State.data.email || "").trim();
    const phone = (State.data.phone || "").trim();

    if (!name) return softError("Add your name so we know who to look for.");
    if (!email) return softError("Add an email so we can follow up easily.");
    if (!isEmailish(email)) return softError("That email looks a little off — can you double-check it?");
    if (!phone || phone.length < 7) return softError("Add a phone number so we can text if needed.");

    next();
  });

  updateUI();

  function softError(msg) {
    State.ui.error = msg;
    if (err) {
      err.textContent = msg;
      err.classList.remove("hidden");
    }
  }
}

function Services() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>What are we doing today?</h1>
    <p class="muted">Choose what feels closest. We’ll refine later.</p>

    <div class="card-grid" role="list">
      ${IntentCard("Go lighter", "lighter", "Lighter, brighter, dimensional")}
      ${IntentCard("Refresh dimension / tone", "refresh", "Keep depth, improve tone + shine")}
      ${IntentCard("Cover grays / roots", "gray", "Root coverage or all-over color")}
      ${IntentCard("Fix a previous color result", "fix", "Correct banding, brass, uneven tone")}
      ${IntentCard("Not sure", "unsure", "Help me choose the right service")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
    </div>
  `;

  return div;
}

function IntentCard(title, value, description) {
  const safe = escapeAttr(String(value));
  return `
    <button class="card" type="button" role="listitem" onclick="selectIntent('${safe}')">
      <div class="card-title">${escapeHtml(title)}</div>
      <div class="card-desc">${escapeHtml(description)}</div>
    </button>
  `;
}

function selectIntent(intent) {
  // clean fields (stylist-facing)
  State.data.serviceIntent = String(intent);

  // backward compatibility (keep old fields alive)
  const legacyMap = {
    lighter: "Blonding",
    refresh: "Dimensional Color",
    gray: "All-Over / Gray Coverage",
    fix: "Color Correction",
    unsure: "Not Sure"
  };
  const legacy = legacyMap[String(intent)] || "Not Sure";

  State.data.service = legacy;
  if (!Array.isArray(State.data.services)) State.data.services = [];
  State.data.services = [legacy];

  next(); // -> change
}

function selectService(service) {
  const map = {
    "Blonding": "lighter",
    "Dimensional Color": "refresh",
    "All-Over / Gray Coverage": "gray",
    "Color Correction": "fix",
    "Not Sure": "unsure"
  };
  selectIntent(map[String(service)] || "unsure");
}

function ChangeSize() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>How big of a change?</h1>
    <p class="muted">This helps us time + plan your appointment.</p>

    <div class="card-grid" role="list">
      ${ChoiceCard("Subtle", "subtle", "Small shift. Keep it natural.")}
      ${ChoiceCard("Noticeable", "noticeable", "A clear difference, still wearable.")}
      ${ChoiceCard("Big change", "big", "A transformation.")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
    </div>
  `;

  return div;
}

function ChoiceCard(title, value, description) {
  const safe = escapeAttr(String(value));
  return `
    <button class="card" type="button" role="listitem" onclick="selectChangeSize('${safe}')">
      <div class="card-title">${escapeHtml(title)}</div>
      <div class="card-desc">${escapeHtml(description)}</div>
    </button>
  `;
}

function selectChangeSize(size) {
  State.data.changeSize = String(size);
  next(); // -> extras
}

function Extras() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Anything else today?</h1>
    <p class="muted">Optional. This just helps us plan.</p>

    <div class="card-grid" role="list">
      ${ExtrasCard("Shape / trim — Yes", "yes")}
      ${ExtrasCard("No", "no")}
      ${ExtrasCard("Not sure", "unsure")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
    </div>
  `;

  return div;
}

function ExtrasCard(title, value) {
  const safe = escapeAttr(String(value));
  return `
    <button class="card" type="button" role="listitem" onclick="selectHaircut('${safe}')">
      <div class="card-title">${escapeHtml(title)}</div>
    </button>
  `;
}

function selectHaircut(v) {
  if (v === "yes") State.data.wantsHaircut = true;
  else if (v === "no") State.data.wantsHaircut = false;
  else State.data.wantsHaircut = null;

  next(); // -> history
}

function History() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Hair history</h1>
    <p class="muted">Just a quick note so we can plan your service.</p>

    <div class="field">
      <label class="label">Last professional color (approx.)</label>
      <input id="inLastColor" class="input" placeholder="Example: 3 months ago" />
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" id="btnHistoryContinue">Continue</button>
    </div>
  `;

  // bind without re-render while typing
  setTimeout(() => {
    const inLast = document.getElementById("inLastColor");
    const btn = document.getElementById("btnHistoryContinue");
    if (inLast) inLast.value = State.data.lastColor || State.data.lastColorDate || "";
    if (btn) {
      btn.addEventListener("click", () => {
        const v = inLast ? (inLast.value || "").trim() : "";
        State.data.lastColor = v;
        State.data.lastColorDate = v; // keep both keys compatible
        next();
      });
    }
  }, 0);

  return div;
}

function Photos() {
  const div = document.createElement("div");

  const currentCount = normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS).length;
  const inspoCount = State.data.inspoPhoto ? 1 : 0;

  div.innerHTML = `
    <h1>Photos</h1>
    <p class="muted">Add 1–2 photos of your current hair. Add 1 inspiration photo if you have it. Total max: 3.</p>

    <div class="photo-block">
      <div class="photo-head">
        <div class="photo-title">Current hair (1–2) <span class="req">*</span></div>
        <div class="photo-meta muted" id="metaCurrent">${currentCount ? `${currentCount} selected` : "None selected"}</div>
      </div>

      <input id="fileCurrent" class="file-hidden" type="file" accept="image/*" multiple />
      <button class="btn ghost" type="button" id="btnPickCurrent">Choose photos</button>

      <div class="thumbs" id="thumbsCurrent"></div>
    </div>

    <div class="photo-block" style="margin-top:14px;">
      <div class="photo-head">
        <div class="photo-title">Inspiration (optional)</div>
        <div class="photo-meta muted" id="metaInspo">${inspoCount ? `1 selected` : "None selected"}</div>
      </div>

      <input id="fileInspo" class="file-hidden" type="file" accept="image/*" />
      <button class="btn ghost" type="button" id="btnPickInspo">Choose inspiration</button>

      <div class="thumbs" id="thumbsInspo"></div>
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" onclick="next()">Continue</button>
    </div>
  `;

  return div;
}

function bindPhotoInteractions() {
  const fileCurrent = document.getElementById("fileCurrent");
  const fileInspo = document.getElementById("fileInspo");
  const btnPickCurrent = document.getElementById("btnPickCurrent");
  const btnPickInspo = document.getElementById("btnPickInspo");

  const thumbsCurrent = document.getElementById("thumbsCurrent");
  const thumbsInspo = document.getElementById("thumbsInspo");

  const metaCurrent = document.getElementById("metaCurrent");
  const metaInspo = document.getElementById("metaInspo");

  if (!fileCurrent || !fileInspo || !btnPickCurrent || !btnPickInspo) return;

  btnPickCurrent.addEventListener("click", () => fileCurrent.click());
  btnPickInspo.addEventListener("click", () => fileInspo.click());

  // Current hair: append + dedupe + cap(2)
  fileCurrent.addEventListener("change", async () => {
    const newlyPicked = normalizeToFileList_(Array.from(fileCurrent.files || []));
    const existing = normalizeToFileList_(State.data.currentPhotos || []);

    State.data.currentPhotos = mergeFilesDedupCap_(existing, newlyPicked, MAX_CURRENT_PHOTOS);

    // allow re-picking the same file to trigger change again
    fileCurrent.value = "";

    if (metaCurrent) {
      metaCurrent.textContent = State.data.currentPhotos.length
        ? `${State.data.currentPhotos.length} selected`
        : "None selected";
    }

    await renderThumbs(State.data.currentPhotos, thumbsCurrent);
  });

  // Inspiration: single file, replace (optional)
  fileInspo.addEventListener("change", async () => {
    const f = (fileInspo.files && fileInspo.files[0]) ? fileInspo.files[0] : null;
    State.data.inspoPhoto = normalizeOneFile_(f);

    // allow re-picking the same file to trigger change again
    fileInspo.value = "";

    if (metaInspo) metaInspo.textContent = State.data.inspoPhoto ? "1 selected" : "None selected";
    await renderThumbs(State.data.inspoPhoto ? [State.data.inspoPhoto] : [], thumbsInspo);
  });

  // initial thumbs (no re-render)
  if (metaCurrent) {
    const n = normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS).length;
    metaCurrent.textContent = n ? `${n} selected` : "None selected";
  }
  if (metaInspo) metaInspo.textContent = State.data.inspoPhoto ? "1 selected" : "None selected";

  renderThumbs(normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS), thumbsCurrent);
  renderThumbs(State.data.inspoPhoto ? [normalizeOneFile_(State.data.inspoPhoto)] : [], thumbsInspo);
}

function Review() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Review your details</h1>
    <p class="muted">Quick check — you can go back and edit anything.</p>

    <div class="review-card">
      <div class="review-section">
        <div class="review-title">Contact</div>
        ${reviewRow("Name", (State.data.fullName || State.data.name || "—"))}
        ${reviewRow("Email", State.data.email || "—")}
        ${reviewRow("Phone", State.data.phone || "—")}
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Service</div>
        <div class="pill">${escapeHtml(State.data.service || (Array.isArray(State.data.services) ? (State.data.services[0] || "—") : "—") || "—")}</div>
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Hair history</div>
        ${reviewRow("Last professional color", State.data.lastColor || State.data.lastColorDate || "—")}
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Photos</div>
        ${reviewRow("Selected", `${countPickedPhotos_()} selected`)}
      </div>
    </div>

    <div class="hint" id="reviewHint" aria-live="polite">
      If anything looks off, tap <b>Back</b> — your answers stay saved.
    </div>

    <div class="form-error ${State.ui.reviewError ? "" : "hidden"}" id="reviewError" role="alert">
      ${escapeHtml(State.ui.reviewError || "")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" onclick="submitForm()">Submit</button>
    </div>
  `;

  setTimeout(() => {
    const h = document.getElementById("reviewHint");
    if (h) h.classList.add("show");
  }, 350);

  return div;
}

function reviewRow(label, value) {
  return `
    <div class="review-row">
      <div class="review-label">${escapeHtml(label)}</div>
      <div class="review-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function Loading() {
  const div = document.createElement("div");
  div.className = "loading-center";

  const line = State.ui.loadingMode === "submit"
    ? "Getting things ready…"
    : (LOADING_QUOTES[0] || "Getting things ready…");

  div.innerHTML = `
    <h1>Submitting…</h1>

    <div class="loading-stack">
      <div class="hair-loader" aria-hidden="true"></div>
      <div class="loading-line muted" id="loadingLine">${escapeHtml(line)}</div>
    </div>

    <div id="loadingRetryWrap" class="${State.ui.showLoadingRetry ? "" : "hidden"}" style="margin-top:14px; text-align:center;">
      <div class="muted" id="loadingRetryMsg" style="margin-bottom:10px;">
        ${escapeHtml(State.ui.loadingRetryMsg || "")}
      </div>
      <button class="btn primary" type="button" id="btnLoadingRetry">Try Again</button>
    </div>
  `;

  return div;
}

function bindLoadingInteractions_() {
  const btn = document.getElementById("btnLoadingRetry");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // prevent double taps
    if (State.ui.submitting) return;
    submitForm({ fromRetry: true });
  });
}

function startLoadingQuotes() {
  // reset
  State.ui.loadingQuoteIdx = 0;

  const el = document.getElementById("loadingLine");
  if (!el) return;

  // set first line immediately
  el.textContent = LOADING_QUOTES[0] || "Getting things ready…";

  // rotate through each quote ONCE, then stop
  const maxIdx = ((LOADING_QUOTES && LOADING_QUOTES.length) ? LOADING_QUOTES.length : 1) - 1;

  stopLoadingTimer();
  State.ui.loadingTimer = setInterval(() => {
    if (Steps[State.step] !== "loading") {
      stopLoadingTimer();
      return;
    }

    State.ui.loadingQuoteIdx = Math.min(State.ui.loadingQuoteIdx + 1, maxIdx);
    el.textContent = LOADING_QUOTES[State.ui.loadingQuoteIdx] || el.textContent;

    if (State.ui.loadingQuoteIdx >= maxIdx) {
      stopLoadingTimer();
    }
  }, 2600);
}

function stopLoadingTimer() {
  if (State.ui.loadingTimer) {
    clearInterval(State.ui.loadingTimer);
    State.ui.loadingTimer = null;
  }
}

/* ==============================
   RENDER HELPERS (STATIC HEADER + SLIDE SWAP)
============================== */

function ensureAppShell_(app) {
  if (app.__dmshell) return;

  // wipe once
  app.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "app-shell";

  const header = document.createElement("div");
  header.className = "app-header";
  header.innerHTML = `
    <div class="app-brand">Danielle Marie Hair Co.</div>
    <div class="app-dynamic muted" id="appDynamicLine"></div>
  `;

  const progress = document.createElement("div");
  progress.className = "progress";
  const fill = document.createElement("div");
  fill.className = "progress-fill";
  progress.appendChild(fill);

  const viewport = document.createElement("div");
  viewport.className = "app-viewport";

  shell.appendChild(header);
  shell.appendChild(progress);
  shell.appendChild(viewport);
  app.appendChild(shell);

  app.__dmshell = {
    shell,
    header,
    progress,
    progressFill: fill,
    viewport,
    dynamicLine: header.querySelector("#appDynamicLine")
  };
}

function renderHeader_(app, currentStepName) {
  const el = app.__dmshell?.dynamicLine;
  if (!el) return;
  el.textContent = buildDynamicHeaderLine_(currentStepName);
}

function buildDynamicHeaderLine_(currentStepName) {
  const service = (State.data.service || (Array.isArray(State.data.services) ? (State.data.services[0] || "") : "") || "").trim();
  const name = (State.data.fullName || State.data.name || "").trim();

  switch (currentStepName) {
    case "splash":   return "Preparing your consultation…";
    case "welcome":  return "A quick, curated intake.";
    case "basics":   return "Your details — so we can follow up.";
    case "services": return service ? `Focused on: ${service}` : "Choose what feels closest.";
    case "changeSize": return "Dial in the outcome.";
    case "extras":   return "Optional details to plan well.";
    case "history":  return "A little context goes a long way.";
    case "photos":   return "Photos help us plan precisely.";
    case "review":   return name ? `All set, ${name}. One last look.` : "All set. One last look.";
    case "loading":  return "Submitting securely…";
    case "thankyou": return "Received. We’ll review and follow up.";
    default:         return "";
  }
}

function swapScreen_(app, node) {
  const vp = app.__dmshell?.viewport;
  if (!vp) return;

  if (!node) { vp.innerHTML = ""; return; }

  if (!vp.__dmSwapInit) {
    vp.__dmSwapInit = true;
    vp.style.position = "relative";
    vp.style.overflow = "hidden";
    vp.style.width = "100%";
  }

  const prev = vp.firstElementChild;

  const nextWrap = document.createElement("div");
  nextWrap.className = "screen";
  nextWrap.style.width = "100%";
  nextWrap.style.boxSizing = "border-box";
  nextWrap.appendChild(node);
  vp.appendChild(nextWrap);

  if (!prev) return;

  prev.style.position = "absolute";
  prev.style.inset = "0";
  prev.style.width = "100%";

  nextWrap.style.position = "absolute";
  nextWrap.style.inset = "0";
  nextWrap.style.width = "100%";
  nextWrap.style.opacity = "0";
  nextWrap.style.transform = "translateX(10px)";

  const cleanup = () => {
    if (prev && prev.parentNode === vp) vp.removeChild(prev);
    nextWrap.style.position = "";
    nextWrap.style.inset = "";
    nextWrap.style.transform = "";
    nextWrap.style.opacity = "";
  };

  try {
    const inAnim = nextWrap.animate(
      [{ opacity: 0, transform: "translateX(10px)" }, { opacity: 1, transform: "translateX(0px)" }],
      { duration: 200, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" }
    );

    prev.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 160, easing: "ease", fill: "forwards" }
    );

    inAnim.onfinish = cleanup;
    setTimeout(cleanup, 260);

  } catch (e) {
    cleanup();
  }

}

/* ==============================
   ADAPTER + CANON SUBMISSION
============================== */

const DMHCAdapter = (() => {
  const CANON_KEYS = [
    "company",
    "fullName",
    "phone",
    "email",
    "preferredStylist",
    "services",
    "goals",
    "lastColorDate",
    "boxDye",
    "chemicalServices",
    "sensitivities",
    "hairLength",
    "maintenanceFrequency",
    "referralSource",
    "submittedFrom",
    "userAgent",
    "photos"
  ];

  function buildPayload(d) {
    // 1) Required identity fields (with fallback to avoid false missing-name errors)
    const fullName = pickString(d, ["fullName", "name"]) || "";
    const phone = pickString(d, ["phone"]) || "";
    const email = pickString(d, ["email"]) || "";

    // 2) Optional fields (stable keys)
    const company = pickString(d, ["company"]) || ""; // honeypot
    const preferredStylist = pickString(d, ["preferredStylist", "preferred_stylist"]) || "";

    // 3) services MUST be array (support array or string)
    const services = normalizeServices_(d);

    const goals = pickString(d, ["goals", "goal"]) || "";
    const lastColorDate =
      pickString(d, ["lastColorDate"]) ||
      pickString(d, ["lastColor"]) ||
      "";
    const boxDye = pickString(d, ["boxDye", "box_dye"]) || "";
    const chemicalServices = pickString(d, ["chemicalServices", "chemical_services"]) || "";
    const sensitivities = pickString(d, ["sensitivities"]) || "";

    // New optional keys (safe; backend will auto-add columns)
    const hairLength = pickString(d, ["hairLength", "hair_length"]) || "";
    const maintenanceFrequency = pickString(d, ["maintenanceFrequency", "maintenance_frequency", "visitFrequency"]) || "";
    const referralSource = pickString(d, ["referralSource", "referral_source", "referral", "howDidYouHear"]) || "";

    const submittedFrom = String(window.location.href || "");
    const userAgent = String(navigator.userAgent || "");

    // Photos are built separately and assigned by submitForm() after compression
    const payload = {
      company,
      fullName,
      phone,
      email,
      preferredStylist,
      services,
      goals,
      lastColorDate,
      boxDye,
      chemicalServices,
      sensitivities,
      hairLength,
      maintenanceFrequency,
      referralSource,
      submittedFrom,
      userAgent,
      photos: []
    };
    
    // Ensure only canon keys exist (contract hygiene)
    const clean = {};
    for (const k of CANON_KEYS) clean[k] = payload[k];
    return clean;
  }

  function normalizeServices_(d) {
    const raw = d && typeof d === "object" ? d.services : null;
    if (Array.isArray(raw)) {
      return raw.map(x => String(x || "").trim()).filter(Boolean);
    }
    if (typeof raw === "string" && raw.trim()) {
      return [raw.trim()];
    }
    const single = pickString(d, ["service"]) || "";
    return single ? [String(single).trim()] : [];
  }

  function pickString(obj, keys) {
    if (!obj || typeof obj !== "object") return "";
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        const v = obj[k];
        if (typeof v === "string") return v.trim();
        if (v == null) continue;
        return String(v).trim();
      }
    }
    return "";
  }

  return { buildPayload };
})();

/* ==============================
   RISK + META HELPERS (NON-BREAKING)
============================== */

const SCHEMA_VERSION = "1.2.0";

function computeRiskScore_() {
  let score = 0;

  const intent = String(State.data.serviceIntent || "");
  const size = String(State.data.changeSize || "");
  const lastColorTxt = String(State.data.lastColor || State.data.lastColorDate || "").toLowerCase();
  const photoCount = countPickedPhotos_();
  const services = Array.isArray(State.data.services) ? State.data.services.map(s => String(s || "")) : [];

  // High-risk intent
  if (intent === "fix") score += 4;

  // Transformation size
  if (size === "big") score += 3;
  if (size === "noticeable") score += 1;

  // Very recent chemical/color work (best-effort parse)
  if (lastColorTxt.includes("week")) score += 2;
  if (lastColorTxt.includes("2 week") || lastColorTxt.includes("two week")) score += 2;
  if (lastColorTxt.includes("1 month") || lastColorTxt.includes("one month")) score += 1;

  // Missing photos (planning blind)
  if (photoCount <= 0) score += 2;

  // Blonding + big change combo
  if (services.includes("Blonding") && size === "big") score += 2;

  // Clamp 0–10 (keeps reporting consistent)
  return clamp(score, 0, 10);
}

function getRiskTier_(score) {
  const s = Number(score) || 0;
  if (s >= 7) return "High";
  if (s >= 4) return "Moderate";
  return "Low";
}

/* ==============================
   SUBMISSION (CANONICAL + RISK + META)
============================== */

async function submitForm(opts = {}) {
  const fullName = (State.data.fullName || State.data.name || "").trim();
  const email = (State.data.email || "").trim();
  const phone = (State.data.phone || "").trim();

  if (!fullName) return setReviewError_("Please add your name, then submit again.");
  if (!isEmailish(email)) return setReviewError_("That email looks a little off — please double-check it.");
  if (!phone || phone.length < 7) return setReviewError_("Please add a phone number so we can reach you.");

  const currentCount = normalizeToFileList_(State.data.currentPhotos || [])
    .slice(0, MAX_CURRENT_PHOTOS).length;

  if (currentCount < MIN_CURRENT_PHOTOS) {
    return setReviewError_("Please add at least one photo of your current hair.");
  }

  if (State.ui.submitting) return;
  State.ui.submitting = true;

  State.ui.loadingMode = "submit";
  State.ui.showLoadingRetry = false;
  State.ui.loadingRetryMsg = "";

  goToStep(Steps.indexOf("loading"));

  try {
    const picked = normalizeToFileList_(getSelectedFiles_()).slice(0, MAX_TOTAL_PHOTOS);

    const photos = [];
    for (let i = 0; i < picked.length; i++) {
      setLoadingLine_(`Optimizing photo ${i + 1} of ${picked.length}…`);
      const f = picked[i];
      const base64 = await compressToJpegBase64_(f, MAX_EDGE_PX, JPEG_QUALITY);

      photos.push({
        originalName: f.name || "upload.jpg",
        mime: "image/jpeg",
        base64
      });
    }

    // -------------------------
    // Build payload (LOCKED CONTRACT SAFE)
    // -------------------------
    const payload = DMHCAdapter.buildPayload({
      ...State.data,
      fullName,
      email,
      phone
    });

    payload.photos = photos;

    // -------------------------
    // Risk Inference (non-breaking additions)
    // -------------------------
    const riskScore = computeRiskScore_();
    const riskTier = getRiskTier_(riskScore);

    payload.riskScore = riskScore;                 // OPTIONAL (safe)
    payload.riskTier = riskTier;                   // OPTIONAL (safe)
    payload.schemaVersion = SCHEMA_VERSION;        // OPTIONAL (safe)
    payload.submittedFrom = String(window.location.href || "web-intake");
    payload.userAgent = String(navigator.userAgent || "unknown");

    // -------------------------

    setLoadingLine_("Sending securely…");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let out = null;
    try {
      out = await res.json();
    } catch (e) {
      out = { ok: res.ok };
    }

    State.ui.submitting = false;

    if (out && out.ok) {
      State.ui.loadingMode = "quotes";
      goToStep(Steps.indexOf("thankyou"));
      return;
    }

    const msg = out && out.message
      ? String(out.message)
      : "We didn’t get a clean confirmation. Tap Try Again once.";

    showLoadingRetry_(msg);

  } catch (err) {
    State.ui.submitting = false;

    if (err && err.name === "AbortError") {
      showLoadingRetry_("Still working on it — mobile uploads can be slow. Tap Try Again once.");
      return;
    }

    goToStep(Steps.indexOf("review"));
    setReviewError_("Something hiccuped on our side. Please tap Submit again.");
  }
}

/* ==============================
   PHOTO HELPERS
============================== */

function getSelectedFiles_() {
  const current = normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS);
  const inspo = State.data.inspoPhoto ? [normalizeOneFile_(State.data.inspoPhoto)] : [];
  return [...current, ...inspo].filter(Boolean).slice(0, MAX_TOTAL_PHOTOS);
}

function countPickedPhotos_() {
  return normalizeToFileList_(getSelectedFiles_()).length;
}

function normalizeOneFile_(x) {
  if (!x) return null;
  if (x instanceof File) return x;
  if (typeof x === "object" && x.file instanceof File) return x.file;
  return null;
}

function normalizeToFileList_(arr) {
  const out = [];
  for (const x of Array.isArray(arr) ? arr : []) {
    const f = normalizeOneFile_(x);
    if (f) out.push(f);
  }
  return out;
}

async function renderThumbs(files, targetEl) {
  if (!targetEl) return;
  targetEl.innerHTML = "";

  const list = normalizeToFileList_(files).slice(0, 6);
  if (!list.length) return;

  for (const f of list) {
    const url = URL.createObjectURL(f);
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = url;
    img.alt = "Photo preview";
    img.onload = () => URL.revokeObjectURL(url);
    targetEl.appendChild(img);
  }
}

/* ==============================
   JPEG COMPRESSION → BASE64 (NO PREFIX)
============================== */

async function compressToJpegBase64_(file, maxEdgePx, quality) {
  if (!(file instanceof File)) throw new Error("compressToJpegBase64_: expected File");

  let bitmap = null;
  try {
    if ("createImageBitmap" in window) bitmap = await createImageBitmap(file);
  } catch (e) {
    bitmap = null;
  }

  const img = bitmap ? null : await fileToImage_(file);

  const srcW = bitmap ? bitmap.width : (img.naturalWidth || img.width);
  const srcH = bitmap ? bitmap.height : (img.naturalHeight || img.height);
  if (!srcW || !srcH) throw new Error("Could not read image dimensions.");

  const scale = Math.min(1, maxEdgePx / Math.max(srcW, srcH));
  const dstW = Math.max(1, Math.round(srcW * scale));
  const dstH = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = dstW;
  canvas.height = dstH;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas unsupported.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (bitmap) {
    ctx.drawImage(bitmap, 0, 0, dstW, dstH);
    try { bitmap.close && bitmap.close(); } catch (e) {}
  } else {
    ctx.drawImage(img, 0, 0, dstW, dstH);
  }

  const dataUrl = canvas.toDataURL("image/jpeg", clampNumber_(quality, 0.5, 0.92));
  const commaIdx = dataUrl.indexOf(",");
  return commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
}

function fileToImage_(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image decode failed.")); };
    img.src = url;
  });
}

/* ==============================
   HELPERS
============================== */

function setCheck(el, ok) {
  if (!el) return;
  el.classList.toggle("on", !!ok);
}

function setLoadingLine_(msg) {
  const el = document.getElementById("loadingLine");
  if (el) el.textContent = String(msg || "");
}

function showLoadingRetry_(msg) {
  State.ui.showLoadingRetry = true;
  State.ui.loadingRetryMsg = String(msg || "");

  const wrap = document.getElementById("loadingRetryWrap");
  const text = document.getElementById("loadingRetryMsg");

  if (text) text.textContent = State.ui.loadingRetryMsg;
  if (wrap) wrap.classList.remove("hidden");

  setLoadingLine_("Almost there…");
}

function isEmailish(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function clampNumber_(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function mergeFilesDedupCap_(a, b, cap) {
  const out = [];
  const seen = new Set();

  const push = (f) => {
    if (!(f instanceof File)) return;
    const key = `${f.name}::${f.size}::${f.lastModified}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(f);
  };

  for (const f of (Array.isArray(a) ? a : [])) push(f);
  for (const f of (Array.isArray(b) ? b : [])) push(f);

  return out.slice(0, Math.max(0, Number(cap) || 0));
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/`/g, "&#096;");
}
~~~~

### Code.gs

~~~~js
/**********************************************************************
 * DMHC Intake – Backend (Apps Script) – HARDENED PROD
 * - Strict validation BEFORE side effects
 * - Payload size guard
 * - Photo count guard (max 8)
 * - Honeypot ignore
 * - Drive isolation safety
 * - Locking
 * - doGet healthcheck
 * - Script Properties config
 * - Schema-safe migration (NO trigger APIs in runtime)
 * - Phase 1: Safety Baseline
 * - Phase 2: Metrics Snapshot
 * - Phase 3: Controlled Pruning
 **********************************************************************/

/* ============================== CONFIG ============================== */

function getCfg_() {
  const p = PropertiesService.getScriptProperties();

  const cfg = {
    SPREADSHEET_ID: String(p.getProperty("SPREADSHEET_ID") || "").trim(),
    PARENT_FOLDER_ID: String(p.getProperty("PARENT_FOLDER_ID") || "").trim(),
    LOG_SHEET_NAME: String(p.getProperty("LOG_SHEET_NAME") || "Log").trim()
  };

  const missing = [];
  if (!cfg.SPREADSHEET_ID) missing.push("SPREADSHEET_ID");
  if (!cfg.PARENT_FOLDER_ID) missing.push("PARENT_FOLDER_ID");

  if (missing.length) {
    throw new Error("Missing Script Properties: " + missing.join(", "));
  }

  return cfg;
}

function runSelfTest() {
    const res = selfTest_();
      Logger.log(JSON.stringify(res, null, 2));
        return res;
        }

/* ============================ HEALTHCHECK =========================== */

function doGet(e) {
  return ContentService
    .createTextOutput(
      "DMHC Intake Web App is LIVE ✅\nTime: " + new Date().toISOString()
    )
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ================================ MAIN =============================== */

function doPost(e) {
  const CFG = getCfg_();

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25 * 1000)) {
    return json_({ ok: false, message: "Server busy. Try again." }, 429);
  }

  let submissionId = "";

  try {

    /* ---------- Payload Size Guard ---------- */
    const rawBody = e?.postData?.contents || "";
    if (rawBody.length > 8000000) {
      return json_({ ok: false, message: "Payload too large." }, 413);
    }

    let data = {};
    try {
      data = JSON.parse(rawBody || "{}");
    } catch (_) {
      return json_({ ok: false, message: "Invalid JSON payload." }, 400);
    }

    /* ---------- Honeypot ---------- */
    if (data.company && String(data.company).trim() !== "") {
      return json_({ ok: true, message: "ignored" }, 200);
    }

    /* ---------- Defaults: formType + schemaVersion ---------- */
    data.formType = isNonEmptyString_(data.formType)
      ? String(data.formType).trim()
      : "consult_intake";

    data.schemaVersion = isNonEmptyString_(data.schemaVersion)
      ? String(data.schemaVersion).trim()
      : "1.0";

    /* ---------- Capture Extras (Schema Evolution Safe) ---------- */
    const KNOWN_KEYS = [
      "company",
      "fullName",
      "phone",
      "email",
      "preferredStylist",
      "services",
      "goals",
      "goal",
      "lastColorDate",
      "boxDye",
      "chemicalServices",
      "hairHistory",
      "sensitivities",
      "photos",
      "photoCount",
      "submittedFrom",
      "userAgent",
      "schemaVersion",
      "formType"
    ];

    const extras = {};
    Object.keys(data || {}).forEach(key => {
      if (!KNOWN_KEYS.includes(key)) {
        extras[key] = data[key];
      }
    });

    data.extras = extras;
    data.extrasJson = JSON.stringify(extras || {});

    /* ---------- Strict Validation ---------- */
    const missing = [];

    if (!isNonEmptyString_(data.fullName)) missing.push("fullName");
    if (!isNonEmptyString_(data.phone)) missing.push("phone");
    if (!isValidEmail_(data.email)) missing.push("email");

    if (!Array.isArray(data.services) || data.services.length < 1)
      missing.push("services");

    if (!Array.isArray(data.photos) || data.photos.length < 1)
      missing.push("photos");

    if (Array.isArray(data.photos)) {

      if (data.photos.length > 8)
        return json_({ ok: false, message: "Too many photos." }, 400);

      const hasBase64 = data.photos.some(p =>
        p && typeof p.base64 === "string" && p.base64.length > 50
      );

      if (!hasBase64)
        missing.push("photos.base64");
    }

    if (missing.length) {
      return json_({
        ok: false,
        message: "Missing required fields: " + missing.join(", ")
      }, 400);
    }

    /* ---------- Create Submission ID EARLY ---------- */
    submissionId = Utilities.getUuid().replace(/-/g, "").slice(0, 8);

    /* ---------- Safe Schema Migration (never blocks intake) ---------- */
    if (typeof migrateSchema_ === "function") {
      try {
        migrateSchema_();
      } catch (mErr) {
        log_(CFG, "MIGRATE_SKIPPED", submissionId, mErr);
      }
    }

    /* ---------- Single Timestamp ---------- */
    const ts = new Date();

    /* ---------- Drive Folder (Isolated) ---------- */
    let folder;
    try {
      folder = DriveApp.getFolderById(CFG.PARENT_FOLDER_ID)
        .createFolder(
          formatStamp_(ts) + "__" +
          submissionId + "__" +
          safe_(data.fullName)
        );
    } catch (driveErr) {
      log_(CFG, "DRIVE_ERROR", submissionId, driveErr);
      return json_({ ok: false, message: "Drive unavailable." }, 500);
    }

    /* ---------- Upload Photos (Partial failure safe) ---------- */
    let uploadOut = { photoUrls: [], photoIds: [] };
    if (typeof uploadPhotos_ === "function") {
      try {
        uploadOut = uploadPhotos_(folder, data.photos, submissionId);
      } catch (uploadErr) {
        log_(CFG, "WARN", submissionId, "Photo upload error: " + uploadErr);
      }
    }

    /* ---------- Sheet Writes (Submissions defines success) ---------- */
    if (typeof writeRowRaw_ === "function") {
      writeRowRaw_(data, submissionId, ts, folder, uploadOut, CFG);
    }

    /* ---------- Non-Blocking FD Write ---------- */
    if (typeof writeRowFD_ === "function") {
      try {
        writeRowFD_(data, submissionId, ts, folder, uploadOut, CFG);
      } catch (fdErr) {
        log_(CFG, "WARN", submissionId, "writeRowFD_ error: " + fdErr);
      }
    }

    /* ---------- Non-Blocking Email ---------- */
    if (typeof sendFrontDeskEmail_ === "function") {
      try {
        sendFrontDeskEmail_(data, submissionId, ts, folder, uploadOut, CFG);
      } catch (emailErr) {
        log_(CFG, "WARN", submissionId, "sendFrontDeskEmail_ error: " + emailErr);
      }
    }

    return json_({
      ok: true,
      submissionId,
      folderId: folder.getId(),
      folderUrl: folder.getUrl()
    }, 200);

  } catch (err) {
    log_(CFG, "ERROR", submissionId, err);
    return json_({ ok: false, message: "Server error." }, 500);
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ============================= MIGRATION ============================ */

function migrateSchema_() {
  const CFG = getCfg_();

  try {
    const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
    const sh = ss.getSheetByName("_SCHEMA");
    if (!sh) return;

    const values = sh.getDataRange().getValues();
    const map = {};
    for (let i = 0; i < values.length; i++) {
      const k = String(values[i][0] || "").trim();
      if (!k) continue;
      map[k] = i + 1;
    }

    upsertSchemaKV_(sh, map, "SCHEMA_VERSION", "v2.0.0");
    upsertSchemaKV_(sh, map, "PROOF", "FD_CANON_V2");
    upsertSchemaKV_(sh, map, "LAST_MIGRATED", new Date().toISOString());

  } catch (err) {
    throw err;
  }
}

function upsertSchemaKV_(sh, map, key, value) {
  if (map[key]) {
    sh.getRange(map[key], 2).setValue(value);
  } else {
    sh.appendRow([key, value]);
  }
}

/* ============================== HELPERS ============================== */

function json_(obj, statusCode) {
  const out = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);

  try {
    if (statusCode && typeof out.setStatusCode === "function")
      out.setStatusCode(statusCode);
  } catch (_) {}

  return out;
}

function isNonEmptyString_(v) {
  return typeof v === "string" && v.trim() !== "";
}

function isValidEmail_(v) {
  if (!isNonEmptyString_(v)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function safe_(s) {
  return String(s || "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60) || "Unknown";
}

function formatStamp_(d) {
  return Utilities.formatDate(
    d,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd_HHmmss"
  );
}

function log_(CFG, level, submissionId, err) {
  try {
    if (!CFG.LOG_SHEET_NAME) return;

    const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
    const sh = ss.getSheetByName(CFG.LOG_SHEET_NAME) ||
               ss.insertSheet(CFG.LOG_SHEET_NAME);

    sh.appendRow([
      new Date(),
      level,
      submissionId || "",
      String(err?.stack || err?.message || err)
    ]);

  } catch (_) {}
}

/* ========================== PHASE 1: SAFETY ========================== */

function getHeaderMap_(sheet) {
  const map = {};
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return map;
  
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  headers.forEach((h, i) => {
    if (h) map[String(h).trim()] = i + 1;
  });
  return map;
}

function writeRowRaw_(data, submissionId, ts, folder, uploadOut, CFG) {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName("Submissions");
  if (!sh) throw new Error("Submissions sheet missing");

  const map = getHeaderMap_(sh);
  const row = [];
  const lastCol = sh.getLastColumn() || 1;
  for (let i = 0; i < lastCol; i++) row.push("");

  const m = (k, v) => { if (map[k]) row[map[k] - 1] = v; };

  m("Timestamp", ts);
  m("Full Name", data.fullName);
  m("Phone", data.phone);
  m("Email", data.email);
  m("Preferred Stylist", data.preferredStylist);
  m("Services", Array.isArray(data.services) ? data.services.join(", ") : data.services);
  m("Goals", data.goals || data.goal);
  m("Last Color Date", data.lastColorDate);
  m("Box Dye", data.boxDye);
  m("Chemical Services", data.chemicalServices);
  m("Sensitivities", data.sensitivities);
  m("Photo Count", data.photoCount || (data.photos ? data.photos.length : 0));
  m("Drive Folder URL", folder ? folder.getUrl() : "");
  m("Photo URLs", uploadOut && uploadOut.photoUrls ? uploadOut.photoUrls.join("\n") : "");
  m("Submitted From", data.submittedFrom);
  m("User Agent", data.userAgent);

  sh.appendRow(row);
}

function writeRowFD_(data, submissionId, ts, folder, uploadOut, CFG) {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName("Front Desk");
  
  if (!sh) {
    log_(CFG, "WARN_HEADER_MISMATCH", submissionId, "Front Desk sheet missing");
    return;
  }

  const map = getHeaderMap_(sh);
  const requiredHeaders = ["Timestamp", "Full Name", "Phone", "Services"];
  const missing = requiredHeaders.filter(h => !map[h]);

  if (missing.length > 0) {
    log_(CFG, "WARN_HEADER_MISMATCH", submissionId, "Missing FD headers: " + missing.join(", "));
    return;
  }

  const row = [];
  const lastCol = sh.getLastColumn() || 1;
  for (let i = 0; i < lastCol; i++) row.push("");

  const m = (k, v) => { if (map[k]) row[map[k] - 1] = v; };

  m("Timestamp", ts);
  m("Full Name", data.fullName);
  m("Phone", data.phone);
  m("Email", data.email);
  m("Preferred Stylist", data.preferredStylist);
  m("Services", Array.isArray(data.services) ? data.services.join(", ") : data.services);
  m("Drive Folder URL", folder ? folder.getUrl() : "");

  sh.appendRow(row);
}

function selfTest_() {
  const results = { ok: true, logs: [] };
  const logTest = (msg, pass) => {
    results.logs.push({ msg, pass });
    if (!pass) results.ok = false;
  };

  try {
    const p = PropertiesService.getScriptProperties();
    const sid = p.getProperty("SPREADSHEET_ID");
    const fid = p.getProperty("PARENT_FOLDER_ID");
    logTest("Script Properties exist", !!(sid && fid));

    if (!sid) return results;

    const ss = SpreadsheetApp.openById(sid);
    const reqSheets = ["Submissions", "_SCHEMA", "Log", "Front Desk"];
    reqSheets.forEach(name => {
      logTest(`Sheet '${name}' exists`, !!ss.getSheetByName(name));
    });

    const subSheet = ss.getSheetByName("Submissions");
    if (subSheet) {
      const reqHeaders = [
        "Timestamp", "Full Name", "Phone", "Email", "Preferred Stylist",
        "Services", "Goals", "Last Color Date", "Box Dye", "Chemical Services",
        "Sensitivities", "Photo Count", "Drive Folder URL", "Photo URLs",
        "Submitted From", "User Agent"
      ];
      const map = getHeaderMap_(subSheet);
      const missingH = reqHeaders.filter(h => !map[h]);
      logTest("Submissions header EXACT match", missingH.length === 0);
    }

    if (fid) {
      try {
        DriveApp.getFolderById(fid);
        logTest("Drive parent folder accessible", true);
      } catch (e) {
        logTest("Drive parent folder accessible", false);
      }
    }

    const CFG = { SPREADSHEET_ID: sid, LOG_SHEET_NAME: "Log" };
    log_(CFG, results.ok ? "PASS" : "FAIL", "SELF_TEST", JSON.stringify(results.logs));

  } catch (e) {
    logTest("Self test error: " + e.message, false);
  }
  return results;
}

/* ========================= PHASE 2: METRICS ========================== */

function ensureMetricsSheet_(ss) {
  let sh = ss.getSheetByName("_METRICS");
  if (!sh) {
    sh = ss.insertSheet("_METRICS");
    sh.appendRow(["Month", "Metric Key", "Metric Value", "Updated At"]);
  }
  return sh;
}

function snapshotMetrics_() {
  const CFG = getCfg_();
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const mSh = ensureMetricsSheet_(ss);
  const subSh = ss.getSheetByName("Submissions");
  if (!subSh) return;

  const map = getHeaderMap_(subSh);
  const data = subSh.getDataRange().getValues();
  data.shift();

  const monthStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM");

  const totalSub = data.length;
  let sumPhotos = 0;
  const pcIdx = map["Photo Count"] ? map["Photo Count"] - 1 : -1;

  if (pcIdx >= 0) {
    data.forEach(row => {
      const c = parseInt(row[pcIdx], 10);
      if (!isNaN(c)) sumPhotos += c;
    });
  }

  updateMetric_(mSh, monthStr, "Total Submissions", totalSub);
  updateMetric_(mSh, monthStr, "Sum Photo Count", sumPhotos);
}

function updateMetric_(mSh, month, key, val) {
  const data = mSh.getDataRange().getValues();
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === month && data[i][1] === key) {
      mSh.getRange(i + 1, 3).setValue(val);
      mSh.getRange(i + 1, 4).setValue(now);
      return;
    }
  }
  mSh.appendRow([month, key, val, now]);
}

/* ========================= PHASE 3: PRUNING ========================== */

function pruneLog_(maxRows) {
  maxRows = maxRows || 5000;
  const CFG = getCfg_();
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(CFG.LOG_SHEET_NAME);
  if (!sh) return;
  
  const lr = sh.getLastRow();
  if (lr > maxRows + 1) {
    sh.deleteRows(2, lr - maxRows - 1);
  }
}

function pruneSheetByDays_(sheetName, days, tsHeaderName) {
  const CFG = getCfg_();
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return;

  const map = getHeaderMap_(sh);
  const tsIdx = map[tsHeaderName];
  if (!tsIdx) return;

  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  for (let i = data.length - 1; i >= 1; i--) {
    const rowTs = new Date(data[i][tsIdx - 1]);
    if (rowTs instanceof Date && !isNaN(rowTs) && rowTs < cutoff) {
      sh.deleteRow(i + 1);
    }
  }
}

function pruneSubmissions_(days) {
  pruneSheetByDays_("Submissions", days || 90, "Timestamp");
}

function pruneFrontDesk_(days) {
  pruneSheetByDays_("Front Desk", days || 120, "Timestamp");
}

function masterPrune_() {
  snapshotMetrics_();
  pruneSubmissions_(90);
  pruneFrontDesk_(120);
  pruneLog_(5000);
}~~~~

### appsscript.json

~~~~js
{
  "timeZone": "America/New_York",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  }
}~~~~

