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
