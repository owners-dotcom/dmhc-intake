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
   SUBMISSION (CANONICAL)
============================== */

async function submitForm() {
  const fullName = (State.data.fullName || State.data.name || "").trim();
  const email = (State.data.email || "").trim();
  const phone = (State.data.phone || "").trim();

  if (!fullName) return setReviewError_("Please add your name, then submit again.");
  if (!isEmailish(email)) return setReviewError_("That email looks a little off — please double-check it.");
  if (!phone) return setReviewError_("Please add a phone number so we can reach you.");

  // Must have at least 1 CURRENT photo (inspo optional)
  const currentCount = normalizeToFileList_(State.data.currentPhotos || []).slice(0, MAX_CURRENT_PHOTOS).length;
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

    const payload = DMHCAdapter.buildPayload({
      ...State.data,
      fullName,
      email,
      phone
    });
    payload.photos = photos;

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

// supports File OR {file: File} OR junk
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
  if (!(file instanceof File)) {
    throw new Error("compressToJpegBase64_: expected File");
  }

  const blob = file;

  // Prefer createImageBitmap when available (faster, memory-friendly)
  let bitmap = null;
  try {
    if ("createImageBitmap" in window) {
      bitmap = await createImageBitmap(blob);
    }
  } catch (e) {
    bitmap = null;
  }

  const img = bitmap ? null : await fileToImage_(blob);

  const srcW = bitmap ? bitmap.width : img.naturalWidth || img.width;
  const srcH = bitmap ? bitmap.height : img.naturalHeight || img.height;

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
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image decode failed."));
    };
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

  // keep the main line calm and stable
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