# DMHC Intake — Production Baseline Snapshot (LOCKED)
Do not change this file unless explicitly agreed.

Last updated: YYYY-MM-DD

## Runtime URLs (PROD)
- GitHub Pages: https://owners-dotcom.github.io/dmhc-intake/
- Squarespace entry page: https://dmhairco.com/new-guest-form
- Apps Script Web App (/exec): PASTE_FULL_EXEC_URL_HERE
- Google Sheet: https://docs.google.com/spreadsheets/d/PASTE_SHEET_ID/edit

## Apps Script Deployment Label
- Deployment/version label: PASTE_LABEL_HERE

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


