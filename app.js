// app.js
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
  data: {},
  ui: {
    error: "",
    loadingTimer: null,
    loadingQuoteIdx: 0
  }
};

const Steps = [
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
  "Saving your details…",
  "Uploading photos…",
  "Getting your consultation ready…",
  "Almost there…"
];

/* ==============================
   INIT
============================== */

document.addEventListener("DOMContentLoaded", () => {
  const stepParam = Number(new URL(window.location.href).searchParams.get("step") || 0);
  if (!Number.isNaN(stepParam)) State.step = clamp(stepParam, 0, Steps.length - 1);

  syncHistory(true); // replaceState
  render();
});

/* ==============================
   HISTORY (browser back/forward)
============================== */

function syncHistory(replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(State.step));
  const fn = replace ? history.replaceState : history.pushState;
  fn.call(history, { step: State.step }, "", url.toString());
}

window.addEventListener("popstate", (e) => {
  const step =
    (e.state && typeof e.state.step === "number")
      ? e.state.step
      : Number(new URL(window.location.href).searchParams.get("step") || 0);

  State.step = clamp(step, 0, Steps.length - 1);
  render();
});

/* ==============================
   NAV
============================== */

function next() {
  State.ui.error = "";
  State.step = Math.min(State.step + 1, Steps.length - 1);
  syncHistory();
  render();
}

function back() {
  State.ui.error = "";
  State.step = Math.max(State.step - 1, 0);
  syncHistory();
  render();
}

/* ==============================
   RENDER ENGINE
============================== */

function render() {
  // stop loading quote timer if we left loading
  if (Steps[State.step] !== "loading" && State.ui.loadingTimer) {
    clearInterval(State.ui.loadingTimer);
    State.ui.loadingTimer = null;
  }

  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = "";
  app.appendChild(renderProgress());

  const screen = document.createElement("div");
  screen.className = "screen";

  const current = Steps[State.step];

  let node = null;
  switch (current) {
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
}

/* ==============================
   PROGRESS
============================== */

function renderProgress() {
  const wrapper = document.createElement("div");
  wrapper.className = "progress";

  const fill = document.createElement("div");
  fill.className = "progress-fill";

  // Stop progress growth at "loading"
  const progressDenom = Math.max(Steps.length - 2, 1);
  const percent = (State.step / progressDenom) * 100;
  fill.style.width = Math.min(percent, 100) + "%";

  wrapper.appendChild(fill);
  return wrapper;
}

/* ==============================
   SCREENS
============================== */

function Welcome() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h1>Let’s start with the basics.</h1>
    <p class="muted">This takes about 2 minutes.</p>
    <button class="btn primary" type="button" onclick="next()">Begin</button>
  `;
  return div;
}

function Basics() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h1>Your information</h1>

    <div class="field">
      <label class="label">Full name <span class="req">*</span></label>
      <input class="input" placeholder="First + Last"
        value="${escapeAttr(State.data.name || "")}"
        oninput="State.data.name=this.value; State.ui.error='';" />
    </div>

    <div class="field">
      <label class="label">Email <span class="req">*</span></label>
      <input class="input" placeholder="you@email.com"
        value="${escapeAttr(State.data.email || "")}"
        oninput="State.data.email=this.value; State.ui.error='';" />
    </div>

    <div class="field">
      <label class="label">Phone <span class="req">*</span></label>
      <input class="input" placeholder="(###) ###-####"
        value="${escapeAttr(State.data.phone || "")}"
        oninput="State.data.phone=this.value; State.ui.error='';" />
    </div>

    ${State.ui.error ? `<div class="form-error" role="alert">${escapeHtml(State.ui.error)}</div>` : ""}

    <div class="nav" style="margin-top:18px; display:flex; gap:12px; align-items:center;">
      <button class="btn primary" type="button" onclick="onBasicsContinue()">Continue</button>
    </div>
  `;
  return div;
}

function onBasicsContinue() {
  const name = (State.data.name || "").trim();
  const email = (State.data.email || "").trim();
  const phone = (State.data.phone || "").trim();

  if (!name) return setError("Please enter your full name to continue.");
  if (!email) return setError("Please enter your email to continue.");
  if (!phone) return setError("Please enter your phone number to continue.");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return setError("That email doesn’t look quite right — please check it.");
  }

  next();
}

function Services() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h1>What brings you in?</h1>
    <p class="muted">Select what feels closest. We’ll refine later.</p>

    <div class="card-grid" role="list">
      ${ServiceCard("Blonding", "Lighter, brighter, dimensional color")}
      ${ServiceCard("Dimensional Color", "Lived-in depth or refresh")}
      ${ServiceCard("All-Over / Gray Coverage", "Solid color or root coverage")}
      ${ServiceCard("Haircut Only", "No color — shape & styling")}
      ${ServiceCard("Not Sure", "Help me figure it out")}
    </div>

    <div class="nav" style="margin-top:18px;">
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
    <p class="muted">Quick info so we can plan correctly.</p>

    <div class="field">
      <label class="label">Last professional color (approx.)</label>
      <input class="input" placeholder="Example: 3 months ago"
        value="${escapeAttr(State.data.lastColor || "")}"
        oninput="State.data.lastColor=this.value" />
    </div>

    <div class="nav" style="margin-top:18px; display:flex; gap:12px;">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" onclick="next()">Continue</button>
    </div>
  `;
  return div;
}

function Photos() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h1>Photos</h1>
    <p class="muted">Add 1–3 photos of your current hair, plus 1 inspiration photo if you have it.</p>

    <div class="field">
      <label class="label">Current hair (1–3)</label>
      <input class="input" type="file" accept="image/*" multiple onchange="handleCurrentPhotos(this.files)" />
      <div class="help">${photoSummary("current")}</div>
    </div>

    <div class="field" style="margin-top:12px;">
      <label class="label">Inspiration (optional)</label>
      <input class="input" type="file" accept="image/*" onchange="handleInspoPhoto(this.files)" />
      <div class="help">${photoSummary("inspo")}</div>
    </div>

    <div class="nav" style="margin-top:18px; display:flex; gap:12px;">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" onclick="next()">Continue</button>
    </div>
  `;
  return div;
}

function handleCurrentPhotos(fileList) {
  const files = Array.from(fileList || []);
  // Store metadata only for now (safe + lightweight)
  State.data.currentPhotos = files.map(f => ({ name: f.name, type: f.type, size: f.size }));
  render();
}

function handleInspoPhoto(fileList) {
  const f = (fileList && fileList[0]) ? fileList[0] : null;
  State.data.inspoPhoto = f ? { name: f.name, type: f.type, size: f.size } : null;
  render();
}

function Review() {
  const div = document.createElement("div");

  const name = (State.data.name || "—");
  const email = (State.data.email || "—");
  const phone = (State.data.phone || "—");
  const service = (State.data.service || "—");
  const lastColor = (State.data.lastColor || "—");

  const currentCount = Array.isArray(State.data.currentPhotos) ? State.data.currentPhotos.length : 0;
  const inspoCount = State.data.inspoPhoto ? 1 : 0;

  div.innerHTML = `
    <h1>Review your details</h1>
    <p class="muted">Quick check — you can go back and edit anything.</p>

    <div class="review-card">
      <div class="review-section">
        <div class="review-title">Contact</div>
        <div class="review-row"><span>Name</span><strong>${escapeHtml(name)}</strong></div>
        <div class="review-row"><span>Email</span><strong>${escapeHtml(email)}</strong></div>
        <div class="review-row"><span>Phone</span><strong>${escapeHtml(phone)}</strong></div>
      </div>

      <div class="review-section">
        <div class="review-title">Service</div>
        <div class="review-row"><span></span><strong>${escapeHtml(service)}</strong></div>
      </div>

      <div class="review-section">
        <div class="review-title">Hair history</div>
        <div class="review-row"><span>Last professional color</span><strong>${escapeHtml(lastColor)}</strong></div>
      </div>

      <div class="review-section">
        <div class="review-title">Photos</div>
        <div class="review-row"><span>Current hair</span><strong>${currentCount ? `${currentCount} file(s)` : "—"}</strong></div>
        <div class="review-row"><span>Inspiration</span><strong>${inspoCount ? "1 file" : "—"}</strong></div>
      </div>
    </div>

    <div class="nav" style="margin-top:18px; display:flex; gap:12px;">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="btn primary" type="button" onclick="submitForm()">Submit</button>
    </div>
  `;

  return div;
}

function Loading() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Submitting…</h1>
    <div class="loader-row" aria-live="polite">
      <div class="dmhc-loader" aria-hidden="true"></div>
      <p class="muted" id="loadingLine">${escapeHtml(LOADING_QUOTES[State.ui.loadingQuoteIdx] || LOADING_QUOTES[0])}</p>
    </div>
    <p class="micro-quote" id="microQuote">“Small details make the biggest difference.”</p>
  `;

  const lineEl = div.querySelector("#loadingLine");
  State.ui.loadingQuoteIdx = 0;

  if (!State.ui.loadingTimer) {
    State.ui.loadingTimer = setInterval(() => {
      State.ui.loadingQuoteIdx = (State.ui.loadingQuoteIdx + 1) % LOADING_QUOTES.length;
      if (lineEl) lineEl.textContent = LOADING_QUOTES[State.ui.loadingQuoteIdx];
    }, 1800);
  }

  return div;
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
   SUBMISSION
============================== */

function submitForm() {
  State.step = Steps.indexOf("loading");
  syncHistory();
  render();

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(State.data)
  })
    .then(() => {
      State.step = Steps.indexOf("thankyou");
      syncHistory();
      render();
    })
    .catch(() => {
      alert("Submission failed. Please try again.");
      State.step = Steps.indexOf("review");
      syncHistory();
      render();
    });
}

/* ==============================
   HELPERS
============================== */

function setError(msg) {
  State.ui.error = msg;
  render();
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

function photoSummary(which) {
  if (which === "current") {
    const n = Array.isArray(State.data.currentPhotos) ? State.data.currentPhotos.length : 0;
    return n ? `${n} selected` : "None selected";
  }
  if (which === "inspo") {
    return State.data.inspoPhoto ? "1 selected" : "None selected";
  }
  return "";
}