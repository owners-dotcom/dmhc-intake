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
  data: {}
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

/* ==============================
   INIT
============================== */

document.addEventListener("DOMContentLoaded", () => {
  render();
});

/* ==============================
   RENDER ENGINE
============================== */

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  renderProgress();

  const screen = document.createElement("div");
  screen.className = "screen";

  const current = Steps[State.step];

  switch (current) {
    case "welcome":
      screen.appendChild(Welcome());
      break;
    case "basics":
      screen.appendChild(Basics());
      break;
    case "services":
      screen.appendChild(Services());
      break;
    case "history":
      screen.appendChild(History());
      break;
    case "photos":
      screen.appendChild(Photos());
      break;
    case "review":
      screen.appendChild(Review());
      break;
    case "loading":
      screen.appendChild(Loading());
      break;
    case "thankyou":
      screen.appendChild(ThankYou());
      break;
  }

  app.appendChild(screen);
}

function next() {
  State.step = Math.min(State.step + 1, Steps.length - 1);
  render();
}

function back() {
  State.step = Math.max(State.step - 1, 0);
  render();
}

/* ==============================
   HISTORY (browser back/forward)
   - makes browser back go to prior step instead of leaving page
============================== */

function syncHistory(replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(State.step));
  const fn = replace ? history.replaceState : history.pushState;
  fn.call(history, { step: State.step }, "", url.toString());
}

window.addEventListener("popstate", (e) => {
  const step = (e.state && typeof e.state.step === "number")
    ? e.state.step
    : Number(new URL(window.location.href).searchParams.get("step") || 0);

  State.step = Math.max(0, Math.min(step, Steps.length - 1));
  render();
});


/* ==============================
   PROGRESS
============================== */

function renderProgress() {
  const app = document.getElementById("app");

  const wrapper = document.createElement("div");
  wrapper.className = "progress";

  const fill = document.createElement("div");
  fill.className = "progress-fill";

  // Stops progress at "loading" (thankyou shouldn't increase %)
  const progressDenom = Math.max(Steps.length - 2, 1);
  const percent = (State.step / progressDenom) * 100;
  fill.style.width = Math.min(percent, 100) + "%";

  wrapper.appendChild(fill);
  app.appendChild(wrapper);
}

/* ==============================
   SCREENS
============================== */

function Welcome() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Let’s start with the basics.</h1>
    <p>This will take about 2 minutes.</p>
    <button class="button" type="button" onclick="next()">Begin</button>
  `;

  return div;
}

function Basics() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Your information</h1>

    <input class="input" placeholder="Full name"
      value="${escapeAttr(State.data.name || "")}"
      oninput="State.data.name=this.value" />

    <input class="input" placeholder="Email"
      value="${escapeAttr(State.data.email || "")}"
      oninput="State.data.email=this.value" />

    <input class="input" placeholder="Phone"
      value="${escapeAttr(State.data.phone || "")}"
      oninput="State.data.phone=this.value" />

    <button class="button" type="button" onclick="next()">Continue</button>
  `;

  return div;
}

function Services() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>What brings you in?</h1>
    <p>Select the option that feels closest. We’ll refine later.</p>

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

    <input class="input" placeholder="Last professional color date (approx.)"
      value="${escapeAttr(State.data.lastColor || "")}"
      oninput="State.data.lastColor=this.value" />

    <button class="button" type="button" onclick="next()">Continue</button>
  `;

  return div;
}

/* ====== NEW: Photos screen (Step exists in Steps array) ====== */
function Photos() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Photos</h1>
    <p>Add 1–3 photos of your current hair, plus 1 inspiration photo if you have it.</p>

    <label class="label">Current hair (1–3)</label>
    <input class="input" type="file" accept="image/*" multiple
      onchange="handleCurrentPhotos(this.files)" />

    <label class="label" style="margin-top:14px;">Inspiration (optional)</label>
    <input class="input" type="file" accept="image/*"
      onchange="handleInspoPhoto(this.files)" />

    <div class="nav" style="margin-top:18px; display:flex; gap:12px; align-items:center;">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="button" type="button" onclick="next()">Continue</button>
    </div>
  `;

  return div;
}

function handleCurrentPhotos(fileList) {
  State.data.currentPhotos = Array.from(fileList || []).map(f => ({
    name: f.name,
    type: f.type,
    size: f.size
  }));
}

function handleInspoPhoto(fileList) {
  const f = (fileList && fileList[0]) ? fileList[0] : null;
  State.data.inspoPhoto = f ? { name: f.name, type: f.type, size: f.size } : null;
}
/* ====== END Photos screen ====== */

function Review() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Review your details</h1>
    <pre style="white-space:pre-wrap; background:rgba(0,0,0,0.03); padding:12px; border-radius:10px;">${escapeHtml(
      JSON.stringify(State.data, null, 2)
    )}</pre>

    <div class="nav" style="margin-top:18px; display:flex; gap:12px; align-items:center;">
      <button class="btn ghost" type="button" onclick="back()">Back</button>
      <button class="button" type="button" onclick="submitForm()">Submit</button>
    </div>
  `;

  return div;
}

function Loading() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Submitting…</h1>
    <p>Please wait.</p>
  `;

  return div;
}

function ThankYou() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Thank you.</h1>
    <p>We’ll review everything and reach out soon.</p>
  `;

  return div;
}

/* ==============================
   SUBMISSION
============================== */

function submitForm() {
  State.step = Steps.indexOf("loading");
  render();

  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(State.data)
  })
    .then(() => {
      State.step = Steps.indexOf("thankyou");
      render();
    })
    .catch(() => {
      alert("Submission failed.");
      State.step = Steps.indexOf("review");
      render();
    });
}

/* ==============================
   HELPERS
============================== */

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  // safe for attribute or single-quoted inline onclick
  return escapeHtml(str).replace(/`/g, "&#096;");
}
