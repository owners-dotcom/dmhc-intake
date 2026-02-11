console.log("DMHC Intake v2 Loaded");

/* ==============================
   CONFIG
============================== */

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwQ9jmUDlTS46nRr0aNtC6wFIoSzl-6QnLg-rjwo06nnom_NEcaiTthBQ3zQ9GJ5sAI/exec";

/* ==============================
   STATE
============================== */

const State = {
  step: 0,
  data: {},
  ui: {
    currentThumbs: [],
    inspoThumb: "",
    loadingTimer: null
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

const LOADING_LINES = [
  "Saving your details…",
  "Preparing your consultation…",
  "Organizing your photos…",
  "Almost there…"
];

/* ==============================
   INIT
============================== */

document.addEventListener("DOMContentLoaded", () => {
  render();
});

/* ==============================
   NAVIGATION
============================== */

function next() {
  State.step = Math.min(State.step + 1, Steps.length - 1);
  render();
}

function back() {
  State.step = Math.max(State.step - 1, 0);
  render();
}

/* ==============================
   RENDER
============================== */

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const screen = document.createElement("div");
  screen.className = "screen";

  const current = Steps[State.step];

  switch (current) {
    case "splash": screen.appendChild(Splash()); break;
    case "welcome": screen.appendChild(Welcome()); break;
    case "basics": screen.appendChild(Basics()); break;
    case "services": screen.appendChild(Services()); break;
    case "history": screen.appendChild(History()); break;
    case "photos": screen.appendChild(Photos()); break;
    case "review": screen.appendChild(Review()); break;
    case "loading": screen.appendChild(Loading()); break;
    case "thankyou": screen.appendChild(ThankYou()); break;
  }

  app.appendChild(screen);
}

/* ==============================
   SCREENS
============================== */

function Splash() {
  const div = document.createElement("div");

  div.innerHTML = `
    <div class="splash">
      <h1>Client Intake</h1>
      <p class="muted">A quick 2-minute consult so we can match you with the right service and timing.</p>
    </div>
  `;

  setTimeout(() => next(), 1100);
  return div;
}

function Welcome() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Let’s begin.</h1>
    <p class="muted">We’ll walk through this together.</p>
    <button class="btn primary" onclick="next()">Start</button>
  `;
  return div;
}

/* ========= BASICS ========= */

function Basics() {
  const div = document.createElement("div");

  const valid = isBasicsValid();

  div.innerHTML = `
    <h1>Your information</h1>

    <div class="field">
      <label class="label">Full name</label>
      <input class="input"
        value="${State.data.name || ""}"
        oninput="State.data.name=this.value; render();" />
    </div>

    <div class="field">
      <label class="label">Email</label>
      <input class="input"
        value="${State.data.email || ""}"
        oninput="State.data.email=this.value; render();" />
    </div>

    <div class="field">
      <label class="label">Phone</label>
      <input class="input"
        value="${State.data.phone || ""}"
        oninput="State.data.phone=this.value; render();" />
    </div>

    <div class="nav">
      <button class="btn primary" ${valid ? "" : "disabled"} onclick="next()">Continue</button>
    </div>
  `;

  return div;
}

function isBasicsValid() {
  const { name, email, phone } = State.data;
  if (!name || !email || !phone) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  return true;
}

/* ========= SERVICES ========= */

function Services() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>What brings you in?</h1>
    <div class="card-grid">
      ${ServiceCard("Blonding")}
      ${ServiceCard("Dimensional Color")}
      ${ServiceCard("All-Over / Gray Coverage")}
      ${ServiceCard("Haircut Only")}
      ${ServiceCard("Not Sure")}
    </div>
    <div class="nav">
      <button class="btn ghost" onclick="back()">Back</button>
    </div>
  `;
  return div;
}

function ServiceCard(label) {
  return `
    <button class="card" onclick="State.data.service='${label}'; next();">
      <div class="card-title">${label}</div>
    </button>
  `;
}

/* ========= HISTORY ========= */

function History() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Hair history</h1>
    <div class="field">
      <label class="label">Last professional color</label>
      <input class="input"
        value="${State.data.lastColor || ""}"
        oninput="State.data.lastColor=this.value" />
    </div>
    <div class="nav">
      <button class="btn ghost" onclick="back()">Back</button>
      <button class="btn primary" onclick="next()">Continue</button>
    </div>
  `;
  return div;
}

/* ========= PHOTOS ========= */

function Photos() {
  const div = document.createElement("div");

  const currentThumbs = State.ui.currentThumbs
    .map(src => `<img class="thumb" src="${src}" />`).join("");

  const inspoThumb = State.ui.inspoThumb
    ? `<img class="thumb" src="${State.ui.inspoThumb}" />`
    : "";

  div.innerHTML = `
    <h1>Photos</h1>

    <div class="field">
      <label class="label">Current hair (1-3)</label>
      <input class="input" type="file" multiple accept="image/*"
        onchange="handleCurrentPhotos(this.files)" />
      <div class="thumb-row">${currentThumbs}</div>
    </div>

    <div class="field">
      <label class="label">Inspiration</label>
      <input class="input" type="file" accept="image/*"
        onchange="handleInspoPhoto(this.files)" />
      <div class="thumb-row">${inspoThumb}</div>
    </div>

    <div class="nav">
      <button class="btn ghost" onclick="back()">Back</button>
      <button class="btn primary" onclick="next()">Continue</button>
    </div>
  `;
  return div;
}

function handleCurrentPhotos(files) {
  revokeThumbs();
  State.data.currentPhotos = Array.from(files).slice(0,3);
  State.ui.currentThumbs = State.data.currentPhotos.map(f => URL.createObjectURL(f));
  render();
}

function handleInspoPhoto(files) {
  if (State.ui.inspoThumb) URL.revokeObjectURL(State.ui.inspoThumb);
  const f = files[0];
  State.data.inspoPhoto = f;
  State.ui.inspoThumb = URL.createObjectURL(f);
  render();
}

function revokeThumbs() {
  State.ui.currentThumbs.forEach(u => URL.revokeObjectURL(u));
  State.ui.currentThumbs = [];
}

/* ========= REVIEW ========= */

function Review() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Review your details</h1>

    <div class="review-card">
      <div class="review-row"><span>Name</span><span>${State.data.name || "-"}</span></div>
      <div class="review-row"><span>Email</span><span>${State.data.email || "-"}</span></div>
      <div class="review-row"><span>Phone</span><span>${State.data.phone || "-"}</span></div>
      <div class="review-row"><span>Service</span><span>${State.data.service || "-"}</span></div>
      <div class="review-row"><span>History</span><span>${State.data.lastColor || "-"}</span></div>
    </div>

    <p class="muted fade-in">
      Everything here is editable. You can go back at any time — nothing will be lost.
    </p>

    <div class="nav">
      <button class="btn ghost" onclick="back()">Back</button>
      <button class="btn primary" onclick="submitForm()">Submit</button>
    </div>
  `;
  return div;
}

/* ========= LOADING ========= */

function Loading() {
  const div = document.createElement("div");

  div.innerHTML = `
    <div class="loading-center">
      <div class="hair-loader">
        <span class="strand s1"></span>
        <span class="strand s2"></span>
        <span class="strand s3"></span>
      </div>
      <p class="loading-line" id="loadingLine">${LOADING_LINES[0]}</p>
    </div>
  `;

  let i = 0;
  State.ui.loadingTimer = setInterval(() => {
    i = (i + 1) % LOADING_LINES.length;
    document.getElementById("loadingLine").textContent = LOADING_LINES[i];
  }, 2000);

  return div;
}

/* ========= SUBMIT ========= */

function submitForm() {
  State.step = Steps.indexOf("loading");
  render();

  setTimeout(() => {
    clearInterval(State.ui.loadingTimer);
    State.step = Steps.indexOf("thankyou");
    render();
  }, 3500);
}

/* ========= THANK YOU ========= */

function ThankYou() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h1>Thank you.</h1>
    <p class="muted">We’ll review everything and reach out shortly.</p>
  `;
  return div;
}