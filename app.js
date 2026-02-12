console.log("DMHC Modular Intake Loaded");

/* ==============================
   CONFIG (LOCKED)
============================== */

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwQ9jmUDlTS46nRr0aNtC6wFIoSzl-6QnLg-rjwo06nnom_NEcaiTthBQ3zQ9GJ5sAI/exec";

// Backend photo contract (canonical)
const MIN_PHOTOS = 1;
const MAX_PHOTOS = 3;

// Client-side compression (safe for Apps Script payload limits)
const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.78;

// UX timing
const SPLASH_MS = 2200;
const LOADING_QUOTE_MS = 2300;

/* ==============================
   APP STATE
============================== */

const Steps = [
  "splash",
  "welcome",
  "basics",
  "services",
  "history",
  "photos",
  "review",
  "loading",
  "thankyou"
];

const LOADING_QUOTES = [
  "Getting your consultation ready…",
  "Organizing the details…",
  "Almost there…",
  "One last step…"
];

const State = {
  step: 0,
  data: {
    // UI keys (keep UI decoupled from backend keys)
    name: "",
    email: "",
    phone: "",
    service: "",
    lastColor: "",
    currentPhotos: [],
    inspoPhoto: null
  },
  ui: {
    // in-page errors (NO browser alert modals)
    pageError: "",
    reviewError: "",

    // timers
    splashTimer: null,
    loadingTimer: null,
    loadingQuoteIdx: 0
  }
};

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

  // Ensure back/forward stays inside flow
  syncHistory(true);

  window.addEventListener("popstate", (e) => {
    const s =
      (e.state && typeof e.state.step === "number")
        ? e.state.step
        : Number(new URL(window.location.href).searchParams.get("step") || 0);

    State.step = clamp(s, 0, Steps.length - 1);
    render(false); // no pushState on pop
  });

  render(true);
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
   NAV
============================== */

function goToStep(stepIndex, push = true) {
  State.ui.pageError = "";
  State.ui.reviewError = "";

  State.step = clamp(stepIndex, 0, Steps.length - 1);

  if (push) syncHistory(false);
  render(false);
}

function next() { goToStep(State.step + 1, true); }
function back() { goToStep(State.step - 1, true); }

/* ==============================
   RENDER
============================== */

function render(initialPush = false) {
  stopSplashTimer();
  stopLoadingTimer();

  const app = document.getElementById("app");
  if (!app) return;

  // Keep URL in sync on first paint (replace)
  if (initialPush) syncHistory(true);

  app.innerHTML = "";
  renderProgress(app);

  const screen = document.createElement("div");
  screen.className = "screen";

  const current = Steps[State.step];

if (["splash","loading","thankyou"].includes(current)) screen.classList.add("centered");

  let node = null;
  switch (current) {
    case "splash": node = Splash(); break;
    case "welcome": node = Welcome(); break;
    case "basics": node = Basics(); break;
    case "services": node = Services(); break;
    case "history": node = History(); break;
    case "photos": node = Photos(); break;
    case "review": node = Review(); break;
    case "loading": node = Loading(); break;
    case "thankyou": node = ThankYou(); break;
  }

  if (node) screen.appendChild(node);
  app.appendChild(screen);

  // Post-render bindings (NO re-render while typing)
  if (current === "splash") startSplashAutoAdvance();
  if (current === "basics") bindBasics();
  if (current === "history") bindHistory();
  if (current === "photos") bindPhotos();
  if (current === "review") bindReviewHint();
  if (current === "loading") startLoadingQuotes();
}

/* ==============================
   PROGRESS
============================== */

function renderProgress(app) {
  const wrapper = document.createElement("div");
  wrapper.className = "progress";

  const fill = document.createElement("div");
  fill.className = "progress-fill";

  const progressSteps = ["welcome", "basics", "services", "history", "photos", "review"];
  const current = Steps[State.step];
  const idx = progressSteps.indexOf(current);
  const denom = Math.max(progressSteps.length - 1, 1);
  const percent = idx < 0 ? 0 : (idx / denom) * 100;

  fill.style.width = Math.min(Math.max(percent, 0), 100) + "%";

  wrapper.appendChild(fill);
  app.appendChild(wrapper);
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
  State.ui.splashTimer = setTimeout(() => {
    if (Steps[State.step] === "splash") next();
  }, SPLASH_MS);
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

    <div class="actions">
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

    <div class="form-error hidden" id="pageError" role="alert"></div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary disabled" id="btnBasicsContinue" type="button" disabled>Continue</button>
    </div>
  `;

  return div;
}

function bindBasics() {
  const inName = document.getElementById("inName");
  const inEmail = document.getElementById("inEmail");
  const inPhone = document.getElementById("inPhone");

  const ckName = document.getElementById("ckName");
  const ckEmail = document.getElementById("ckEmail");
  const ckPhone = document.getElementById("ckPhone");

  const btn = document.getElementById("btnBasicsContinue");

  if (!inName || !inEmail || !inPhone || !btn) return;

  // hydrate fields once (no re-render)
  inName.value = State.data.name || "";
  inEmail.value = State.data.email || "";
  inPhone.value = State.data.phone || "";

  const update = () => {
    const name = (inName.value || "").trim();
    const email = (inEmail.value || "").trim();
    const phone = (inPhone.value || "").trim();

    State.data.name = name;
    State.data.email = email;
    State.data.phone = phone;

    setCheck(ckName, !!name);
    setCheck(ckEmail, isEmailish(email));
    setCheck(ckPhone, phone.length >= 7);

    const ok = !!name && isEmailish(email) && phone.length >= 7;
    btn.disabled = !ok;
    btn.classList.toggle("disabled", !ok);

    setPageError("");
  };

  inName.addEventListener("input", update);
  inEmail.addEventListener("input", update);
  inPhone.addEventListener("input", update);

  btn.addEventListener("click", () => {
    const name = (State.data.name || "").trim();
    const email = (State.data.email || "").trim();
    const phone = (State.data.phone || "").trim();

    if (!name) return setPageError("Add your name so we know who to look for.");
    if (!email) return setPageError("Add an email so we can follow up easily.");
    if (!isEmailish(email)) return setPageError("That email looks a little off — can you double-check it?");
    if (!phone || phone.length < 7) return setPageError("Add a phone number so we can text if needed.");

    next();
  });

  update();
}

function Services() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>What brings you in?</h1>
    <p class="muted">Choose what feels closest. We’ll refine later.</p>

    <div class="card-grid" role="list">
      ${ServiceCard("Blonding", "Lighter, brighter, dimensional color")}
      ${ServiceCard("Dimensional Color", "Lived-in depth or refresh")}
      ${ServiceCard("All-Over / Gray Coverage", "Solid color or root coverage")}
      ${ServiceCard("Haircut Only", "No color — shape & styling")}
      ${ServiceCard("Not Sure", "Help me figure it out")}
    </div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
    </div>
  `;

  return div;
}

function ServiceCard(title, description) {
  const safe = escapeAttr(String(title));
  return `
    <button class="card" type="button" role="listitem" onclick="selectService('${safe}')">
      <div class="card-title">${escapeHtml(title)}</div>
      <div class="card-desc">${escapeHtml(description)}</div>
    </button>
  `;
}

function selectService(service) {
  State.data.service = service;
  next();
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
      <button class="btn primary" id="btnHistoryContinue" type="button">Continue</button>
    </div>
  `;

  return div;
}

function bindHistory() {
  const inLast = document.getElementById("inLastColor");
  const btn = document.getElementById("btnHistoryContinue");
  if (!inLast || !btn) return;

  inLast.value = State.data.lastColor || "";

  inLast.addEventListener("input", () => {
    State.data.lastColor = (inLast.value || "").trim();
  });

  btn.addEventListener("click", () => {
    State.data.lastColor = (inLast.value || "").trim();
    next();
  });
}

function Photos() {
  const div = document.createElement("div");

  const currentCount = Array.isArray(State.data.currentPhotos) ? State.data.currentPhotos.length : 0;
  const inspoCount = State.data.inspoPhoto ? 1 : 0;

  div.innerHTML = `
    <h1>Photos</h1>
    <p class="muted">Add 1–3 photos of your current hair, plus 1 inspiration photo if you have it.</p>

    <div class="photo-block">
      <div class="photo-head">
        <div class="photo-title">Current hair (1–3)</div>
        <div class="photo-meta muted" id="metaCurrent">${currentCount ? `${currentCount} selected` : "None selected"}</div>
      </div>

      <input id="fileCurrent" class="file-hidden" type="file" accept="image/*" multiple />
      <button class="btn ghost" type="button" id="btnPickCurrent">Choose photos</button>

      <div class="thumbs" id="thumbsCurrent"></div>
    </div>

    <div class="photo-block">
      <div class="photo-head">
        <div class="photo-title">Inspiration (optional)</div>
        <div class="photo-meta muted" id="metaInspo">${inspoCount ? "1 selected" : "None selected"}</div>
      </div>

      <input id="fileInspo" class="file-hidden" type="file" accept="image/*" />
      <button class="btn ghost" type="button" id="btnPickInspo">Choose inspiration</button>

      <div class="thumbs" id="thumbsInspo"></div>
    </div>

    <div class="form-error hidden" id="pageError" role="alert"></div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" id="btnPhotosContinue" type="button">Continue</button>
    </div>
  `;

  return div;
}

function bindPhotos() {
  const fileCurrent = document.getElementById("fileCurrent");
  const fileInspo = document.getElementById("fileInspo");
  const btnPickCurrent = document.getElementById("btnPickCurrent");
  const btnPickInspo = document.getElementById("btnPickInspo");
  const btnContinue = document.getElementById("btnPhotosContinue");

  const metaCurrent = document.getElementById("metaCurrent");
  const metaInspo = document.getElementById("metaInspo");

  const thumbsCurrent = document.getElementById("thumbsCurrent");
  const thumbsInspo = document.getElementById("thumbsInspo");

  if (!fileCurrent || !fileInspo || !btnPickCurrent || !btnPickInspo || !btnContinue) return;

  btnPickCurrent.addEventListener("click", () => fileCurrent.click());
  btnPickInspo.addEventListener("click", () => fileInspo.click());

  fileCurrent.addEventListener("change", async () => {
    State.data.currentPhotos = Array.from(fileCurrent.files || []);
    if (metaCurrent) {
      const n = State.data.currentPhotos.length;
      metaCurrent.textContent = n ? `${n} selected` : "None selected";
    }
    await renderThumbs(State.data.currentPhotos, thumbsCurrent);
    setPageError("");
  });

  fileInspo.addEventListener("change", async () => {
    const f = (fileInspo.files && fileInspo.files[0]) ? fileInspo.files[0] : null;
    State.data.inspoPhoto = f || null;

    if (metaInspo) {
      metaInspo.textContent = State.data.inspoPhoto ? "1 selected" : "None selected";
    }
    await renderThumbs(State.data.inspoPhoto ? [State.data.inspoPhoto] : [], thumbsInspo);
    setPageError("");
  });

  // initial thumbs
  renderThumbs(State.data.currentPhotos || [], thumbsCurrent);
  renderThumbs(State.data.inspoPhoto ? [State.data.inspoPhoto] : [], thumbsInspo);

  btnContinue.addEventListener("click", () => {
    // Don’t enforce photo min here if you want Review reachable with missing photos.
    // But backend requires MIN_PHOTOS at submit — so we keep a gentle nudge.
    const total = countPickedPhotos_();
    if (total < 1) {
      setPageError("Add at least one photo of your current hair so we can plan accurately.");
      return;
    }
    next();
  });
}

function Review() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Review your details</h1>
    <p class="muted">Quick check — you can go back and edit anything.</p>

    <div class="review-card">
      <div class="review-section">
        <div class="review-title">Contact</div>
        ${reviewRow("Name", State.data.name || "—")}
        ${reviewRow("Email", State.data.email || "—")}
        ${reviewRow("Phone", State.data.phone || "—")}
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Service</div>
        <div class="pill">${escapeHtml(State.data.service || "—")}</div>
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Hair history</div>
        ${reviewRow("Last professional color", State.data.lastColor || "—")}
      </div>

      <div class="review-divider"></div>

      <div class="review-section">
        <div class="review-title">Photos</div>
        ${reviewRow("Current hair", photoCountText(State.data.currentPhotos))}
        ${reviewRow("Inspiration", State.data.inspoPhoto ? "1 selected" : "0 selected")}
      </div>
    </div>

    <div class="hint" id="reviewHint" aria-live="polite">
      If anything looks off, tap <b>Back</b> — your answers stay saved.
    </div>

    <div class="form-error hidden" id="reviewError" role="alert"></div>

    <div class="nav">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" id="btnSubmit">Submit</button>
    </div>
  `;

  return div;
}

function bindReviewHint() {
  setTimeout(() => {
    const h = document.getElementById("reviewHint");
    if (h) h.classList.add("show");
  }, 350);

  const btn = document.getElementById("btnSubmit");
  if (!btn) return;

  btn.addEventListener("click", () => submitForm());
}

function Loading() {
  const div = document.createElement("div");
  div.className = "loading-center";

  div.innerHTML = `
    <h1>Submitting…</h1>
    <div class="loading-stack">
      <div class="hair-loader" aria-hidden="true"></div>
      <div class="loading-line muted" id="loadingLine">${escapeHtml(LOADING_QUOTES[0])}</div>
    </div>
  `;

  return div;
}

function startLoadingQuotes() {
  State.ui.loadingQuoteIdx = 0;

  const tick = () => {
    const el = document.getElementById("loadingLine");
    if (!el) return;
    State.ui.loadingQuoteIdx = (State.ui.loadingQuoteIdx + 1) % LOADING_QUOTES.length;
    el.textContent = LOADING_QUOTES[State.ui.loadingQuoteIdx];
  };

  State.ui.loadingTimer = setInterval(tick, LOADING_QUOTE_MS);
}

function stopLoadingTimer() {
  if (State.ui.loadingTimer) {
    clearInterval(State.ui.loadingTimer);
    State.ui.loadingTimer = null;
  }
}

function ThankYou() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Thank you.</h1>
    <p class="muted">We’ll review everything and reach out soon.</p>
  `;

  return div;
}

/* ==============================
   SUBMISSION (CANONICAL PAYLOAD)
============================== */

async function submitForm() {
  setReviewError("");

  // Soft validation (in-page, not browser alerts)
  const fullName = (State.data.name || "").trim();
  const email = (State.data.email || "").trim();
  const phone = (State.data.phone || "").trim();
  const service = (State.data.service || "").trim();

  if (!fullName) return setReviewError("Please add your name.");
  if (!email) return setReviewError("Please add your email.");
  if (!isEmailish(email)) return setReviewError("That email looks a little off — can you double-check it?");
  if (!phone || phone.length < 7) return setReviewError("Please add your phone number.");
  if (!service) return setReviewError("Please choose a service.");

  const pickedFiles = buildPickedPhotoList_(); // 1–3 enforced here
  if (pickedFiles.length < MIN_PHOTOS) {
    return setReviewError("Please add at least one photo of your current hair.");
  }

  // Go to loading screen immediately (keep flow)
  goToStep(Steps.indexOf("loading"), true);

  try {
    const photos = [];
    for (const f of pickedFiles) {
      const base64 = await compressToJpegBase64_(f, MAX_EDGE_PX, JPEG_QUALITY);
      photos.push({
        originalName: f.name || "upload.jpg",
        mime: "image/jpeg",
        base64 // base64 ONLY, no prefix
      });
    }

    const payload = {
      company: "",

      fullName,
      phone,
      email,

      preferredStylist: "",
      services: service ? [String(service)] : [],
      goals: "",
      lastColorDate: (State.data.lastColor || "").trim(),
      boxDye: "",
      chemicalServices: "",
      sensitivities: "",

      submittedFrom: String(window.location.href || ""),
      userAgent: String(navigator.userAgent || ""),

      photos // required by backend (1–3)
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
    } catch (_) {
      out = { ok: res.ok };
    }

    if (out && out.ok) {
      goToStep(Steps.indexOf("thankyou"), true);
      return;
    }

    const msg = (out && out.message) ? String(out.message) : "That didn’t go through. Please tap Submit again.";
    goToStep(Steps.indexOf("review"), true);
    setTimeout(() => setReviewError(msg), 0);
  } catch (_) {
    goToStep(Steps.indexOf("review"), true);
    setTimeout(() => setReviewError("That took longer than expected. Please tap Submit again."), 0);
  }
}

/* =========================================================
   DMHC Payload Adapter + Photo Canon (DROP-IN)
   - Builds backend-canonical payload
   - Converts selected photos -> JPEG base64 (no prefix)
   - Enforces MIN 1, MAX 3
   - Fixes:
     1) fullName validation via (fullName || name)
     2) normalize photo picks to File (supports {file: File})
     3) services supports array (d.services) or single string
   ========================================================= */

const DMHC_PHOTO_MAX = 3;
const DMHC_PHOTO_MIN = 1;
const DMHC_MAX_EDGE_PX = 1600;
const DMHC_JPEG_QUALITY = 0.78;

const DMHCAdapter = {
  buildPayloadFromState(state) {
    const d = (state && state.data) ? state.data : {};

    // --- Map current UI keys -> canonical backend keys
    const fullName = pickString(d, ["fullName", "full_name", "name"]).trim();
    const email = pickString(d, ["email", "Email"]).trim();
    const phone = pickString(d, ["phone", "Phone", "tel"]).trim();

    // services: prefer array if provided; else wrap single string
    const services = normalizeServices_(d);

    // "lastColor" UI -> backend "lastColorDate"
    const lastColorDate = pickString(d, ["lastColorDate", "lastColor", "last_color_date"]).trim();

    // Optional fields (safe defaults)
    const preferredStylist = pickString(d, ["preferredStylist", "preferred_stylist", "stylist"]).trim();
    const goals = pickString(d, ["goals", "goal", "notes"]).trim();
    const boxDye = pickString(d, ["boxDye", "box_dye"]).trim();
    const chemicalServices = pickString(d, ["chemicalServices", "chemical_services"]).trim();
    const sensitivities = pickString(d, ["sensitivities", "allergies"]).trim();

    // Honeypot (keep key present)
    const company = pickString(d, ["company"]).trim();

    // Context
    const submittedFrom = String(window.location.href || "");
    const userAgent = String((navigator && navigator.userAgent) || "");

    return {
      company: company || "",
      fullName,
      phone,
      email,
      preferredStylist: preferredStylist || "",
      services,
      goals: goals || "",
      lastColorDate: lastColorDate || "",
      boxDye: boxDye || "",
      chemicalServices: chemicalServices || "",
      sensitivities: sensitivities || "",
      submittedFrom,
      userAgent,
      photos: [] // filled in submit
    };
  },

  getPickedFilesFromState(state) {
    const d = (state && state.data) ? state.data : {};
    const current = Array.isArray(d.currentPhotos) ? d.currentPhotos : [];
    const inspo = d.inspoPhoto ? [d.inspoPhoto] : [];
    // Normalize picks into File objects (supports File or {file: File})
    return normalizePhotoPicks_([...current, ...inspo]);
  }
};

/* =========================================================
   SUBMISSION (REPLACE YOUR EXISTING submitForm WITH THIS)
   ========================================================= */

async function submitForm() {
  // Validate fullName using (State.data.fullName || State.data.name)
  const name = String((State.data.fullName || State.data.name || "")).trim();
  const email = String((State.data.email || "")).trim();
  const phone = String((State.data.phone || "")).trim();

  if (!name) return alert("Please add your name so we know who this consultation is for.");
  if (!phone) return alert("Please add a phone number so we can reach you if needed.");
  if (!email) return alert("Please add an email so we can follow up.");
  if (!isEmailish(email)) return alert("That email looks a little off — can you double-check it?");

  // Photos: enforce 1–3
  const allPicked = DMHCAdapter.getPickedFilesFromState(State);
  const picked = allPicked.slice(0, DMHC_PHOTO_MAX);

  if (picked.length < DMHC_PHOTO_MIN) {
    return alert("Please add at least one photo of your current hair.");
  }

  // Go to loading screen immediately (keep your flow)
  goToStep(Steps.indexOf("loading"));

  try {
    // 1) Build canonical payload (no photos yet)
    const payload = DMHCAdapter.buildPayloadFromState(State);

    // Ensure payload.fullName matches our validated name even if UI uses name
    payload.fullName = name;

    // 2) Convert files -> JPEG base64 (no prefix)
    const photos = [];
    for (const file of picked) {
      const base64 = await compressToJpegBase64_(file, DMHC_MAX_EDGE_PX, DMHC_JPEG_QUALITY);
      photos.push({
        originalName: (file && file.name) ? file.name : "upload.jpg",
        mime: "image/jpeg",
        base64 // IMPORTANT: base64 only, no "data:image/jpeg;base64,"
      });
    }

    payload.photos = photos.slice(0, DMHC_PHOTO_MAX);

    // Final safety: enforce min/max again
    if (!Array.isArray(payload.photos) || payload.photos.length < DMHC_PHOTO_MIN) {
      throw new Error("No photos were prepared for upload.");
    }

    // 3) Submit to Apps Script
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Apps Script may return JSON or plain text
    let out = null;
    try {
      out = await res.json();
    } catch (_) {
      out = { ok: res.ok };
    }

    // Treat ok:true as success, including dedupe success
    if (out && out.ok) {
      goToStep(Steps.indexOf("thankyou"));
      return;
    }

    const msg = (out && out.message) ? String(out.message) : "Something didn’t go through. Please tap Submit again.";
    alert(msg);
    goToStep(Steps.indexOf("review"));
  } catch (err) {
    const msg =
      (err && err.name === "AbortError")
        ? "That took longer than expected. Please tap Submit again."
        : "We couldn’t send that just yet. Please tap Submit again.";

    alert(msg);
    goToStep(Steps.indexOf("review"));
  }
}

/* =========================================================
   PHOTO CANON: File -> JPEG base64 (no prefix)
   ========================================================= */

async function compressToJpegBase64_(file, maxEdgePx, quality) {
  const f = normalizeToFile_(file);
  if (!f) throw new Error("Missing file.");

  const img = await loadImageFromFile_(f);
  const { w, h } = fitWithin_(img.naturalWidth || img.width, img.naturalHeight || img.height, maxEdgePx);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas unsupported.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  const q = clampNumber_(Number(quality), 0.5, 0.9);
  const dataUrl = canvas.toDataURL("image/jpeg", q);

  return stripDataUrlPrefix_(dataUrl);
}

function loadImageFromFile_(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image."));
    };
    img.src = url;
  });
}

function stripDataUrlPrefix_(dataUrl) {
  const idx = String(dataUrl).indexOf("base64,");
  if (idx === -1) return String(dataUrl);
  return String(dataUrl).slice(idx + "base64,".length);
}

function fitWithin_(w, h, maxEdge) {
  const W = Math.max(1, Number(w) || 1);
  const H = Math.max(1, Number(h) || 1);
  const M = Math.max(1, Number(maxEdge) || 1600);

  const scale = Math.min(1, M / Math.max(W, H));
  return {
    w: Math.max(1, Math.round(W * scale)),
    h: Math.max(1, Math.round(H * scale))
  };
}

function clampNumber_(n, min, max) {
  const x = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, x));
}

/* =========================================================
   NORMALIZERS
   ========================================================= */

function normalizeToFile_(x) {
  if (!x) return null;
  // Support { file: File }
  if (x && typeof x === "object" && x.file instanceof File) return x.file;
  if (x instanceof File) return x;
  return null;
}

function normalizePhotoPicks_(arr) {
  const out = [];
  const list = Array.isArray(arr) ? arr : [];
  for (const item of list) {
    const f = normalizeToFile_(item);
    if (f) out.push(f);
  }
  return out;
}

function normalizeServices_(d) {
  // If d.services is an array, use it (strings only, trimmed)
  const sArr = d && d.services;
  if (Array.isArray(sArr)) {
    return sArr
      .map(v => String(v || "").trim())
      .filter(Boolean);
  }
  // Otherwise, derive from singular fields
  const single =
    pickString(d, ["service", "primaryService", "services"]).trim(); // allow legacy single string
  return single ? [single] : [];
}

/* =========================================================
   SMALL HELPERS (non-invasive)
   ========================================================= */

function pickString(obj, keys) {
  if (!obj || !keys) return "";
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) {
      const v = obj[k];
      if (typeof v === "string") return v;
      if (typeof v === "number" || typeof v === "boolean") return String(v);
    }
  }
  return "";
}

/* ==============================
   HELPERS (UI)
============================== */

function setCheck(el, ok) {
  if (!el) return;
  el.classList.toggle("on", !!ok);
}

function setPageError(msg) {
  State.ui.pageError = String(msg || "");
  const el = document.getElementById("pageError");
  if (!el) return;

  if (!State.ui.pageError) {
    el.textContent = "";
    el.classList.add("hidden");
    return;
  }

  el.textContent = State.ui.pageError;
  el.classList.remove("hidden");
}

function setReviewError(msg) {
  State.ui.reviewError = String(msg || "");
  const el = document.getElementById("reviewError");
  if (!el) return;

  if (!State.ui.reviewError) {
    el.textContent = "";
    el.classList.add("hidden");
    return;
  }

  el.textContent = State.ui.reviewError;
  el.classList.remove("hidden");
}

function reviewRow(label, value) {
  return `
    <div class="review-row">
      <div class="review-label">${escapeHtml(label)}</div>
      <div class="review-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function photoCountText(arr) {
  const n = Array.isArray(arr) ? arr.length : 0;
  return `${n} selected`;
}

function isEmailish(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
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

/* ==============================
   HELPERS (PHOTOS)
============================== */

function countPickedPhotos_() {
  const current = Array.isArray(State.data.currentPhotos) ? State.data.currentPhotos : [];
  const inspo = State.data.inspoPhoto ? [State.data.inspoPhoto] : [];
  return [...current, ...inspo].filter(Boolean).length;
}

function buildPickedPhotoList_() {
  const current = Array.isArray(State.data.currentPhotos) ? State.data.currentPhotos : [];
  const inspo = State.data.inspoPhoto ? [State.data.inspoPhoto] : [];
  // Backend stores only 1–3 total; this keeps UX simple + compatible
  return [...current, ...inspo].filter(Boolean).slice(0, MAX_PHOTOS);
}

async function renderThumbs(files, targetEl) {
  if (!targetEl) return;
  targetEl.innerHTML = "";

  const list = Array.isArray(files) ? files : [];
  if (!list.length) return;

  for (const f of list.slice(0, 6)) {
    const url = URL.createObjectURL(f);
    const img = document.createElement("img");
    img.className = "thumb";
    img.src = url;
    img.alt = "Photo preview";
    img.onload = () => URL.revokeObjectURL(url);
    targetEl.appendChild(img);
  }
}

/*
  compressToJpegBase64_(file, maxEdgePx, quality)
  - returns base64 ONLY (no "data:image/jpeg;base64," prefix)
  - always outputs JPEG (safe for GAS + predictable payload)
*/
async function compressToJpegBase64_(file, maxEdgePx, quality) {
  const img = await fileToImage_(file);

  let { width, height } = img;
  const maxEdge = Math.max(width, height);

  if (maxEdge > maxEdgePx) {
    const scale = maxEdgePx / maxEdge;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  // strip prefix => base64 only
  return dataUrl.replace(/^data:image\/jpeg;base64,/, "");
}

function fileToImage_(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}