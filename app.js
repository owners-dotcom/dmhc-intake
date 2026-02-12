console.log("DMHC Modular Intake Loaded");

/* ==============================
   CONFIG
============================== */

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwQ9jmUDlTS46nRr0aNtC6wFIoSzl-6QnLg-rjwo06nnom_NEcaiTthBQ3zQ9GJ5sAI/exec";

/* ==============================
   APP STATE
============================== */

const State = {
  step: 0,
  data: {
    name: "",
    email: "",
    phone: "",
    service: "",
    lastColor: "",
    currentPhotos: [],
    inspoPhoto: null
  },
  ui: {
    error: "",
    splashTimer: null,
    loadingTimer: null,
    loadingQuoteIdx: 0,
    reviewError: ""
  }
};

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

  syncHistory(true);

  window.addEventListener("popstate", (e) => {
    const s =
      (e.state && typeof e.state.step === "number")
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
   NAV
============================== */

function goToStep(stepIndex) {
  State.ui.error = "";
  State.ui.reviewError = "";
  State.step = clamp(stepIndex, 0, Steps.length - 1);
  syncHistory();
  render();
}

function next() { goToStep(State.step + 1); }
function back() { goToStep(State.step - 1); }

/* ==============================
   RENDER
============================== */

function render() {
  stopSplashTimer();
  stopLoadingTimer();

  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = "";
  renderProgress(app);

  const screen = document.createElement("div");
  screen.className = "screen";

  const current = Steps[State.step];

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

  if (current === "basics") bindBasicsInteractions();
  if (current === "photos") bindPhotoInteractions();
  if (current === "loading") startLoadingQuotes();
  if (current === "splash") startSplashAutoAdvance();
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
  // longer so it feels intentional
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

  inName.value = State.data.name || "";
  inEmail.value = State.data.email || "";
  inPhone.value = State.data.phone || "";

  const updateUI = () => {
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
    const name = (State.data.name || "").trim();
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
      <button class="btn primary" type="button" onclick="saveHistoryAndContinue()">Continue</button>
    </div>
  `;

  setTimeout(() => {
    const inLast = document.getElementById("inLastColor");
    if (inLast) inLast.value = State.data.lastColor || "";
  }, 0);

  return div;
}

function saveHistoryAndContinue() {
  const inLast = document.getElementById("inLastColor");
  State.data.lastColor = inLast ? (inLast.value || "").trim() : (State.data.lastColor || "");
  next();
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
        <div class="photo-meta muted">${currentCount ? `${currentCount} selected` : "None selected"}</div>
      </div>

      <input id="fileCurrent" class="file-hidden" type="file" accept="image/*" multiple />
      <button class="btn ghost" type="button" id="btnPickCurrent">Choose photos</button>

      <div class="thumbs" id="thumbsCurrent"></div>
    </div>

    <div class="photo-block">
      <div class="photo-head">
        <div class="photo-title">Inspiration (optional)</div>
        <div class="photo-meta muted">${inspoCount ? `1 selected` : "None selected"}</div>
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

  if (!fileCurrent || !fileInspo || !btnPickCurrent || !btnPickInspo) return;

  btnPickCurrent.addEventListener("click", () => fileCurrent.click());
  btnPickInspo.addEventListener("click", () => fileInspo.click());

  fileCurrent.addEventListener("change", async () => {
    State.data.currentPhotos = Array.from(fileCurrent.files || []);
    await renderThumbs(State.data.currentPhotos, thumbsCurrent);
    render();
  });

  fileInspo.addEventListener("change", async () => {
    const f = (fileInspo.files && fileInspo.files[0]) ? fileInspo.files[0] : null;
    State.data.inspoPhoto = f || null;
    await renderThumbs(State.data.inspoPhoto ? [State.data.inspoPhoto] : [], thumbsInspo);
    render();
  });

  renderThumbs(State.data.currentPhotos || [], thumbsCurrent);
  renderThumbs(State.data.inspoPhoto ? [State.data.inspoPhoto] : [], thumbsInspo);
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

function photoCountText(arr) {
  const n = Array.isArray(arr) ? arr.length : 0;
  return `${n} selected`;
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

  // slower so people can read
  State.ui.loadingTimer = setInterval(tick, 2300);
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
   SUBMISSION (DROP-IN REPLACEMENT)
   Replace your existing submitForm() with this entire block.
============================== */

async function submitForm() {
  // Keep existing soft validation (minimal change)
  if (!(State.data.name || "").trim()) return alert("Please add your name.");
  if (!isEmailish((State.data.email || "").trim())) return alert("Please add a valid email.");
  if (!(State.data.phone || "").trim()) return alert("Please add your phone number.");
  if (!(State.data.service || "").trim()) return alert("Please choose a service.");

  // Build the canonical photo list (current photos + optional inspo), then enforce backend rules (1–3)
  const current = Array.isArray(State.data.currentPhotos) ? State.data.currentPhotos : [];
  const inspo = State.data.inspoPhoto ? [State.data.inspoPhoto] : [];
  const pickedFiles = [...current, ...inspo].filter(Boolean).slice(0, 3);

  if (pickedFiles.length < 1) {
    return alert("Please add at least one photo of your current hair.");
  }

  // Go to loading screen immediately (keep flow)
  goToStep(Steps.indexOf("loading"));

  try {
    // Convert selected photos -> backend-canonical photos[] with base64 (JPEG, no prefix)
    const photos = [];
    for (const f of pickedFiles) {
      const base64 = await compressToJpegBase64_(f, 1600, 0.78);
      photos.push({
        originalName: f.name || "upload.jpg",
        mime: "image/jpeg",
        base64
      });
    }

    // Canonical payload (backend contract)
    const payload = {
      company: "", // honeypot must exist
      fullName: (State.data.name || "").trim(),
      phone: (State.data.phone || "").trim(),
      email: (State.data.email || "").trim(),

      preferredStylist: "", // keep stable even if blank
      services: State.data.service ? [String(State.data.service)] : [],
      goals: "",
      lastColorDate: (State.data.lastColor || "").trim(),
      boxDye: "",
      chemicalServices: "",
      sensitivities: "",

      submittedFrom: String(window.location.href || ""),
      userAgent: String(navigator.userAgent || ""),

      photos // <- required by backend (1–3)
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

    // Backend may return JSON; treat ok:true as success (including dedupe ok:true)
    let out = null;
    try {
      out = await res.json();
    } catch (e) {
      // Some GAS responses are plain text; treat as success if HTTP ok
      out = { ok: res.ok };
    }

    if (out && out.ok) {
      goToStep(Steps.indexOf("thankyou"));
      return;
    }

    // If backend returns ok:false with message, show a simple alert and return to Review
    const msg = (out && out.message) ? String(out.message) : "That didn’t go through. Please tap Submit again.";
    alert(msg);
    goToStep(Steps.indexOf("review"));
  } catch (err) {
    alert("That took longer than expected. Please tap Submit again.");
    goToStep(Steps.indexOf("review"));
  }
}

/* ==============================
   PHOTO HELPERS (required by submitForm)
============================== */

async function compressToJpegBase64_(file, maxEdgePx = 1600, quality = 0.78) {
  const img = await fileToImage_(file);

  const w0 = img.naturalWidth || img.width;
  const h0 = img.naturalHeight || img.height;

  let w = w0;
  let h = h0;

  const scale = Math.min(1, maxEdgePx / Math.max(w0, h0));
  w = Math.max(1, Math.round(w0 * scale));
  h = Math.max(1, Math.round(h0 * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const parts = dataUrl.split(",");
  return parts[1] || ""; // base64 only, no prefix
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

/* ==============================
   HELPERS
============================== */

function setCheck(el, ok) {
  if (!el) return;
  el.classList.toggle("on", !!ok);
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