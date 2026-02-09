// ===== CONFIG =====
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwHh3CBkL--JI6Z9smBa8rfuk3GVZeUygQWRwhV-1ieM4U8VfhGGJmu5vZzeoF0Q6mX/exec";
// Limit images to keep Apps Script happy:
const MAX_PHOTOS = 8;
const MAX_EDGE_PX = 1600;      // compress dimension
const JPEG_QUALITY = 0.78;     // compress quality
// ==================

const form = document.getElementById("intakeForm");
const steps = Array.from(document.querySelectorAll(".step"));
const progressFill = document.getElementById("progressFill");
const stepLabel = document.getElementById("stepLabel");
const saveLabel = document.getElementById("saveLabel");
const statusEl = document.getElementById("status");
const reviewEl = document.getElementById("review");

const photosInput = document.getElementById("photos");
const thumbsEl = document.getElementById("thumbs");
const photoCountEl = document.getElementById("photoCount");

let currentStep = 1;
let photoFiles = []; // original File objects

// --- Autosave ---
const STORAGE_KEY = "dmhc_intake_v1";
function saveDraft() {
  const data = collectFormFields(false);
  // don't store blobs; store only metadata for photos
  data._photoNames = photoFiles.map(f => f.name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  saveLabel.textContent = "Autosaved";
}
function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    for (const [k,v] of Object.entries(data)) {
      if (k === "services" && Array.isArray(v)) {
        document.querySelectorAll('input[name="services"]').forEach(cb => cb.checked = v.includes(cb.value));
      } else if (k.startsWith("_")) {
        // ignore
      } else {
        const el = form.elements[k];
        if (el) el.value = v;
      }
    }
    saveLabel.textContent = "Draft loaded";
  } catch {}
}

// --- Navigation ---
function showStep(n) {
  currentStep = n;
  steps.forEach(s => s.classList.toggle("isActive", Number(s.dataset.step) === n));
  const total = steps.length;
  stepLabel.textContent = `Step ${n} of ${total}`;
  const pct = (n-1) / (total-1) * 100;
  progressFill.style.width = `${pct}%`;
  document.querySelector(".progressBar").setAttribute("aria-valuenow", String(n));
  statusEl.textContent = "";
  statusEl.className = "status";
  // Focus first input for "silky" flow
  const active = steps.find(s => Number(s.dataset.step) === n);
  const first = active.querySelector("input,select,textarea,button");
  if (first) setTimeout(() => first.focus({preventScroll:true}), 40);
  saveDraft();
  if (n === 5) renderReview();
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  showStep(Math.min(currentStep + 1, steps.length));
}
function prevStep() {
  showStep(Math.max(currentStep - 1, 1));
}

// Buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "next") nextStep();
  if (action === "back") prevStep();
});

// Keyboard: Enter advances, Shift+Enter in textarea
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const active = steps.find(s => s.classList.contains("isActive"));
  if (!active) return;
  const inTextarea = document.activeElement && document.activeElement.tagName === "TEXTAREA";
  if (inTextarea && e.shiftKey) return;
  if (inTextarea) { e.preventDefault(); nextStep(); return; }
  // If on last step, let submit button work naturally
  if (currentStep < steps.length) { e.preventDefault(); nextStep(); }
});

// --- Photo handling ---
photosInput.addEventListener("change", () => {
  const incoming = Array.from(photosInput.files || []);
  // Merge, clamp, de-dupe by name+size
  const map = new Map(photoFiles.map(f => [`${f.name}|${f.size}`, f]));
  for (const f of incoming) map.set(`${f.name}|${f.size}`, f);
  photoFiles = Array.from(map.values()).slice(0, MAX_PHOTOS);
  photosInput.value = ""; // allow re-selecting same file
  renderThumbs();
  saveDraft();
});

function renderThumbs() {
  thumbsEl.innerHTML = "";
  photoCountEl.textContent = `${photoFiles.length} selected`;
  photoFiles.forEach((file, idx) => {
    const url = URL.createObjectURL(file);
    const div = document.createElement("div");
    div.className = "thumb";
    div.innerHTML = `<img alt="Selected photo" src="${url}"><button class="x" type="button" aria-label="Remove photo">×</button>`;
    div.querySelector(".x").addEventListener("click", () => {
      photoFiles.splice(idx, 1);
      renderThumbs();
      saveDraft();
    });
    thumbsEl.appendChild(div);
  });
}

// Convert to compressed JPEG data URL (base64)
async function fileToCompressedData(file) {
  // Some HEIC won't decode in-browser; if it fails, user will need to upload JPG/PNG.
  const img = await loadImageFromFile(file);
  const { w, h } = fitWithin(img.naturalWidth, img.naturalHeight, MAX_EDGE_PX);

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  return {
    originalName: file.name,
    mime: "image/jpeg",
    dataUrl
  };
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image decode failed"));
    img.src = URL.createObjectURL(file);
  });
}

function fitWithin(w, h, maxEdge) {
  const max = Math.max(w, h);
  if (max <= maxEdge) return { w, h };
  const scale = maxEdge / max;
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

// --- Validation (friendly, not naggy) ---
function setHint(name, msg, isError=false) {
  const el = document.querySelector(`[data-hint="${name}"]`);
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("isError", !!isError);
}
function clearStepHints(stepNum){
  const step = steps.find(s => Number(s.dataset.step) === stepNum);
  step.querySelectorAll(".hint").forEach(h => { h.textContent=""; h.classList.remove("isError"); });
}

function validateStep(stepNum) {
  clearStepHints(stepNum);

  // Gentle rule: only validate what's on this step
  if (stepNum === 1) {
    const fullName = form.fullName.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();

    if (fullName.length < 2) { setHint("fullName","What name should we put this under?",true); return false; }
    if (!looksLikePhone(phone)) { setHint("phone","What’s the best number for scheduling updates?",true); return false; }
    if (!looksLikeEmail(email)) { setHint("email","We’ll need a real email to send confirmation/details.",true); return false; }
    return true;
  }

  if (stepNum === 2) {
    const services = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(x=>x.value);
    const goals = form.goals.value.trim();
    if (services.length === 0) { setHint("services","Pick at least one so we route you correctly.",true); return false; }
    if (goals.length < 10) { setHint("goals","Give us a little more so we can prep properly (1–2 sentences).",true); return false; }
    return true;
  }

  if (stepNum === 3) {
    const boxDye = form.boxDye.value;
    const chemical = form.chemicalServices.value;
    if (!boxDye) { setHint("boxDye","Quick check — any at-home color recently?",true); return false; }
    if (!chemical) { setHint("chemicalServices","Select the closest match (or none).",true); return false; }
    return true;
  }

  if (stepNum === 4) {
    if (photoFiles.length < 2) { setHint("photos","Please add at least 2 photos: current hair + inspiration.",true); return false; }
    return true;
  }

  return true;
}

function looksLikeEmail(s){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function looksLikePhone(s){
  const digits = (s||"").replace(/\D/g,"");
  return digits.length >= 10;
}

// --- Collect fields ---
function collectFormFields(includePhotosMeta=true){
  const services = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(x=>x.value);
  const data = {
    company: form.company.value || "", // honeypot
    fullName: form.fullName.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    preferredStylist: form.preferredStylist.value.trim(),
    services,
    goals: form.goals.value.trim(),
    lastColorDate: form.lastColorDate.value.trim(),
    boxDye: form.boxDye.value,
    chemicalServices: form.chemicalServices.value,
    sensitivities: form.sensitivities.value.trim(),
    submittedFrom: window.location.href,
    userAgent: navigator.userAgent
  };
  if (includePhotosMeta) data.photoCount = photoFiles.length;
  return data;
}

function renderReview(){
  const d = collectFormFields(true);
  const s = (d.services || []).join(", ");
  reviewEl.innerHTML = `
    <div><b>Name</b><div>${escapeHtml(d.fullName || "")}</div></div>
    <div><b>Phone</b><div>${escapeHtml(d.phone || "")}</div></div>
    <div><b>Email</b><div>${escapeHtml(d.email || "")}</div></div>
    <div><b>Preferred stylist</b><div>${escapeHtml(d.preferredStylist || "No preference")}</div></div>
    <div><b>Services</b><div>${escapeHtml(s)}</div></div>
    <div><b>Goal</b><div>${escapeHtml(d.goals || "")}</div></div>
    <div><b>Hair history</b><div>Box dye: ${escapeHtml(d.boxDye || "")} • Chemicals: ${escapeHtml(d.chemicalServices || "")}</div></div>
    <div><b>Photos</b><div>${photoFiles.length} selected</div></div>
  `;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// --- Submit ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateStep(5)) return;

  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    statusEl.textContent = "Missing configuration: Apps Script URL not set.";
    statusEl.className = "status bad";
    return;
  }

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  statusEl.textContent = "Uploading… (this can take a moment with photos)";
  statusEl.className = "status";

  try {
    // Convert photos (compressed) to keep payload small
    const compressed = [];
    for (const file of photoFiles) {
      const item = await fileToCompressedData(file);
      compressed.push({
        originalName: item.originalName,
        mime: item.mime,
        // strip "data:image/jpeg;base64,"
        base64: item.dataUrl.split(",")[1]
      });
    }

    const payload = collectFormFields(true);
    payload.photos = compressed;

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // Apps Script friendly
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    let out = null;
    try { out = JSON.parse(text); } catch { out = { ok:false, message:text }; }

    if (!out.ok) throw new Error(out.message || "Submit failed");

    statusEl.textContent = "Submitted. You’re all set — we’ll review and follow up.";
    statusEl.className = "status ok";
    localStorage.removeItem(STORAGE_KEY);
    // Optional: redirect to thank-you page
    // window.location.href = "thankyou.html";
  } catch (err) {
    statusEl.textContent = `Something didn’t go through: ${err.message}. Please try again (or screenshot this and text us).`;
    statusEl.className = "status bad";
    submitBtn.disabled = false;
  }
});

// Init
loadDraft();
showStep(1);
form.addEventListener("input", () => { saveLabel.textContent = "Saving…"; setTimeout(saveDraft, 250); });
