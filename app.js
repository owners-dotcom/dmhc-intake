console.log("DMHC Modular Intake Loaded");

/* ==============================
   CONFIG
============================== */

const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";

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
  State.step++;
  render();
}

function back() {
  State.step--;
  render();
}

/* ==============================
   PROGRESS
============================== */

function renderProgress() {
  const app = document.getElementById("app");

  const wrapper = document.createElement("div");
  wrapper.className = "progress";

  const fill = document.createElement("div");
  fill.className = "progress-fill";

  const percent = (State.step / (Steps.length - 2)) * 100;
  fill.style.width = percent + "%";

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
    <button class="button" onclick="next()">Begin</button>
  `;

  return div;
}

function Basics() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Your information</h1>

    <input class="input" placeholder="Full name"
      oninput="State.data.name=this.value" />

    <input class="input" placeholder="Email"
      oninput="State.data.email=this.value" />

    <input class="input" placeholder="Phone"
      oninput="State.data.phone=this.value" />

    <button class="button" onclick="next()">Continue</button>
  `;

  return div;
}

function Services() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>What are we doing today?</h1>
    <button class="button" onclick="selectService('Blonding')">Blonding</button>
    <button class="button" onclick="selectService('All-Over Color')">All Over Color</button>
    <button class="button" onclick="selectService('Haircut')">Haircut</button>
  `;

  return div;
}

function selectService(service) {
  State.data.service = service;
  next();
}

function History() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Hair history</h1>

    <input class="input" placeholder="Last professional color date"
      oninput="State.data.lastColor=this.value" />

    <button class="button" onclick="next()">Continue</button>
  `;

  return div;
}

function Review() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Review your details</h1>
    <p>${JSON.stringify(State.data, null, 2)}</p>
    <button class="button" onclick="submitForm()">Submit</button>
  `;

  return div;
}

function Loading() {
  const div = document.createElement("div");

  div.innerHTML = `
    <h1>Submitting...</h1>
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
    body: JSON.stringify(State.data)
  })
  .then(() => {
    State.step = Steps.indexOf("thankyou");
    render();
  })
  .catch(() => {
    alert("Submission failed.");
  });
}
