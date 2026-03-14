/**********************************************************************
 * DMHC Intake – Backend (Apps Script) – HARDENED PROD
 * - Strict validation BEFORE side effects
 * - Payload size guard
 * - Photo count guard (max 8)
 * - Honeypot ignore
 * - Drive isolation safety
 * - Locking
 * - doGet healthcheck
 * - Script Properties config
 * - Schema-safe migration (NO trigger APIs in runtime)
 * - Phase 1: Safety Baseline
 * - Phase 2: Metrics Snapshot
 * - Phase 3: Controlled Pruning
 **********************************************************************/

/* ============================== CONFIG ============================== */

function getCfg_() {
  const p = PropertiesService.getScriptProperties();

  const cfg = {
    SPREADSHEET_ID: String(p.getProperty("SPREADSHEET_ID") || "").trim(),
    PARENT_FOLDER_ID: String(p.getProperty("PARENT_FOLDER_ID") || "").trim(),
    LOG_SHEET_NAME: String(p.getProperty("LOG_SHEET_NAME") || "Log").trim()
  };

  const missing = [];
  if (!cfg.SPREADSHEET_ID) missing.push("SPREADSHEET_ID");
  if (!cfg.PARENT_FOLDER_ID) missing.push("PARENT_FOLDER_ID");

  if (missing.length) {
    throw new Error("Missing Script Properties: " + missing.join(", "));
  }

  return cfg;
}

function runSelfTest() {
    const res = selfTest_();
      Logger.log(JSON.stringify(res, null, 2));
        return res;
        }

/* ============================ HEALTHCHECK =========================== */

function doGet(e) {
  return ContentService
    .createTextOutput(
      "DMHC Intake Web App is LIVE ✅\nTime: " + new Date().toISOString()
    )
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ================================ MAIN =============================== */

function doPost(e) {
  const CFG = getCfg_();

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25 * 1000)) {
    return json_({ ok: false, message: "Server busy. Try again." }, 429);
  }

  let submissionId = "";

  try {

    /* ---------- Payload Size Guard ---------- */
    const rawBody = e?.postData?.contents || "";
    if (rawBody.length > 8000000) {
      return json_({ ok: false, message: "Payload too large." }, 413);
    }

    let data = {};
    try {
      data = JSON.parse(rawBody || "{}");
    } catch (_) {
      return json_({ ok: false, message: "Invalid JSON payload." }, 400);
    }

    /* ---------- Honeypot ---------- */
    if (data.company && String(data.company).trim() !== "") {
      return json_({ ok: true, message: "ignored" }, 200);
    }

    /* ---------- Defaults: formType + schemaVersion ---------- */
    data.formType = isNonEmptyString_(data.formType)
      ? String(data.formType).trim()
      : "consult_intake";

    data.schemaVersion = isNonEmptyString_(data.schemaVersion)
      ? String(data.schemaVersion).trim()
      : "1.0";

    /* ---------- Capture Extras (Schema Evolution Safe) ---------- */
    const KNOWN_KEYS = [
      "company",
      "fullName",
      "phone",
      "email",
      "preferredStylist",
      "services",
      "goals",
      "goal",
      "lastColorDate",
      "boxDye",
      "chemicalServices",
      "hairHistory",
      "sensitivities",
      "photos",
      "photoCount",
      "submittedFrom",
      "userAgent",
      "schemaVersion",
      "formType"
    ];

    const extras = {};
    Object.keys(data || {}).forEach(key => {
      if (!KNOWN_KEYS.includes(key)) {
        extras[key] = data[key];
      }
    });

    data.extras = extras;
    data.extrasJson = JSON.stringify(extras || {});

    /* ---------- Strict Validation ---------- */
    const missing = [];

    if (!isNonEmptyString_(data.fullName)) missing.push("fullName");
    if (!isNonEmptyString_(data.phone)) missing.push("phone");
    if (!isValidEmail_(data.email)) missing.push("email");

    if (!Array.isArray(data.services) || data.services.length < 1)
      missing.push("services");

    if (!Array.isArray(data.photos) || data.photos.length < 1)
      missing.push("photos");

    if (Array.isArray(data.photos)) {

      if (data.photos.length > 8)
        return json_({ ok: false, message: "Too many photos." }, 400);

      const hasBase64 = data.photos.some(p =>
        p && typeof p.base64 === "string" && p.base64.length > 50
      );

      if (!hasBase64)
        missing.push("photos.base64");
    }

    if (missing.length) {
      return json_({
        ok: false,
        message: "Missing required fields: " + missing.join(", ")
      }, 400);
    }

    /* ---------- Create Submission ID EARLY ---------- */
    submissionId = Utilities.getUuid().replace(/-/g, "").slice(0, 8);

    /* ---------- Safe Schema Migration (never blocks intake) ---------- */
    if (typeof migrateSchema_ === "function") {
      try {
        migrateSchema_();
      } catch (mErr) {
        log_(CFG, "MIGRATE_SKIPPED", submissionId, mErr);
      }
    }

    /* ---------- Single Timestamp ---------- */
    const ts = new Date();

    /* ---------- Drive Folder (Isolated) ---------- */
    let folder;
    try {
      folder = DriveApp.getFolderById(CFG.PARENT_FOLDER_ID)
        .createFolder(
          formatStamp_(ts) + "__" +
          submissionId + "__" +
          safe_(data.fullName)
        );
    } catch (driveErr) {
      log_(CFG, "DRIVE_ERROR", submissionId, driveErr);
      return json_({ ok: false, message: "Drive unavailable." }, 500);
    }

    /* ---------- Upload Photos (Partial failure safe) ---------- */
    let uploadOut = { photoUrls: [], photoIds: [] };
    if (typeof uploadPhotos_ === "function") {
      try {
        uploadOut = uploadPhotos_(folder, data.photos, submissionId);
      } catch (uploadErr) {
        log_(CFG, "WARN", submissionId, "Photo upload error: " + uploadErr);
      }
    }

    /* ---------- Sheet Writes (Submissions defines success) ---------- */
    if (typeof writeRowRaw_ === "function") {
      writeRowRaw_(data, submissionId, ts, folder, uploadOut, CFG);
    }

    /* ---------- Non-Blocking FD Write ---------- */
    if (typeof writeRowFD_ === "function") {
      try {
        writeRowFD_(data, submissionId, ts, folder, uploadOut, CFG);
      } catch (fdErr) {
        log_(CFG, "WARN", submissionId, "writeRowFD_ error: " + fdErr);
      }
    }

    /* ---------- Non-Blocking Email ---------- */
    if (typeof sendFrontDeskEmail_ === "function") {
      try {
        sendFrontDeskEmail_(data, submissionId, ts, folder, uploadOut, CFG);
      } catch (emailErr) {
        log_(CFG, "WARN", submissionId, "sendFrontDeskEmail_ error: " + emailErr);
      }
    }

    return json_({
      ok: true,
      submissionId,
      folderId: folder.getId(),
      folderUrl: folder.getUrl()
    }, 200);

  } catch (err) {
    log_(CFG, "ERROR", submissionId, err);
    return json_({ ok: false, message: "Server error." }, 500);
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ============================= MIGRATION ============================ */

function migrateSchema_() {
  const CFG = getCfg_();

  try {
    const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
    const sh = ss.getSheetByName("_SCHEMA");
    if (!sh) return;

    const values = sh.getDataRange().getValues();
    const map = {};
    for (let i = 0; i < values.length; i++) {
      const k = String(values[i][0] || "").trim();
      if (!k) continue;
      map[k] = i + 1;
    }

    upsertSchemaKV_(sh, map, "SCHEMA_VERSION", "v2.0.0");
    upsertSchemaKV_(sh, map, "PROOF", "FD_CANON_V2");
    upsertSchemaKV_(sh, map, "LAST_MIGRATED", new Date().toISOString());

  } catch (err) {
    throw err;
  }
}

function upsertSchemaKV_(sh, map, key, value) {
  if (map[key]) {
    sh.getRange(map[key], 2).setValue(value);
  } else {
    sh.appendRow([key, value]);
  }
}

/* ============================== HELPERS ============================== */

function json_(obj, statusCode) {
  const out = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);

  try {
    if (statusCode && typeof out.setStatusCode === "function")
      out.setStatusCode(statusCode);
  } catch (_) {}

  return out;
}

function isNonEmptyString_(v) {
  return typeof v === "string" && v.trim() !== "";
}

function isValidEmail_(v) {
  if (!isNonEmptyString_(v)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function safe_(s) {
  return String(s || "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60) || "Unknown";
}

function formatStamp_(d) {
  return Utilities.formatDate(
    d,
    Session.getScriptTimeZone(),
    "yyyy-MM-dd_HHmmss"
  );
}

function log_(CFG, level, submissionId, err) {
  try {
    if (!CFG.LOG_SHEET_NAME) return;

    const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
    const sh = ss.getSheetByName(CFG.LOG_SHEET_NAME) ||
               ss.insertSheet(CFG.LOG_SHEET_NAME);

    sh.appendRow([
      new Date(),
      level,
      submissionId || "",
      String(err?.stack || err?.message || err)
    ]);

  } catch (_) {}
}

/* ========================== PHASE 1: SAFETY ========================== */

function getHeaderMap_(sheet) {
  const map = {};
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return map;
  
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  headers.forEach((h, i) => {
    if (h) map[String(h).trim()] = i + 1;
  });
  return map;
}

function writeRowRaw_(data, submissionId, ts, folder, uploadOut, CFG) {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName("Submissions");
  if (!sh) throw new Error("Submissions sheet missing");

  const map = getHeaderMap_(sh);
  const row = [];
  const lastCol = sh.getLastColumn() || 1;
  for (let i = 0; i < lastCol; i++) row.push("");

  const m = (k, v) => { if (map[k]) row[map[k] - 1] = v; };

  m("Timestamp", ts);
  m("Full Name", data.fullName);
  m("Phone", data.phone);
  m("Email", data.email);
  m("Preferred Stylist", data.preferredStylist);
  m("Services", Array.isArray(data.services) ? data.services.join(", ") : data.services);
  m("Goals", data.goals || data.goal);
  m("Last Color Date", data.lastColorDate);
  m("Box Dye", data.boxDye);
  m("Chemical Services", data.chemicalServices);
  m("Sensitivities", data.sensitivities);
  m("Photo Count", data.photoCount || (data.photos ? data.photos.length : 0));
  m("Drive Folder URL", folder ? folder.getUrl() : "");
  m("Photo URLs", uploadOut && uploadOut.photoUrls ? uploadOut.photoUrls.join("\n") : "");
  m("Submitted From", data.submittedFrom);
  m("User Agent", data.userAgent);

  sh.appendRow(row);
}

function writeRowFD_(data, submissionId, ts, folder, uploadOut, CFG) {
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName("Front Desk");
  
  if (!sh) {
    log_(CFG, "WARN_HEADER_MISMATCH", submissionId, "Front Desk sheet missing");
    return;
  }

  const map = getHeaderMap_(sh);
  const requiredHeaders = ["Timestamp", "Full Name", "Phone", "Services"];
  const missing = requiredHeaders.filter(h => !map[h]);

  if (missing.length > 0) {
    log_(CFG, "WARN_HEADER_MISMATCH", submissionId, "Missing FD headers: " + missing.join(", "));
    return;
  }

  const row = [];
  const lastCol = sh.getLastColumn() || 1;
  for (let i = 0; i < lastCol; i++) row.push("");

  const m = (k, v) => { if (map[k]) row[map[k] - 1] = v; };

  m("Timestamp", ts);
  m("Full Name", data.fullName);
  m("Phone", data.phone);
  m("Email", data.email);
  m("Preferred Stylist", data.preferredStylist);
  m("Services", Array.isArray(data.services) ? data.services.join(", ") : data.services);
  m("Drive Folder URL", folder ? folder.getUrl() : "");

  sh.appendRow(row);
}

function selfTest_() {
  const results = { ok: true, logs: [] };
  const logTest = (msg, pass) => {
    results.logs.push({ msg, pass });
    if (!pass) results.ok = false;
  };

  try {
    const p = PropertiesService.getScriptProperties();
    const sid = p.getProperty("SPREADSHEET_ID");
    const fid = p.getProperty("PARENT_FOLDER_ID");
    logTest("Script Properties exist", !!(sid && fid));

    if (!sid) return results;

    const ss = SpreadsheetApp.openById(sid);
    const reqSheets = ["Submissions", "_SCHEMA", "Log", "Front Desk"];
    reqSheets.forEach(name => {
      logTest(`Sheet '${name}' exists`, !!ss.getSheetByName(name));
    });

    const subSheet = ss.getSheetByName("Submissions");
    if (subSheet) {
      const reqHeaders = [
        "Timestamp", "Full Name", "Phone", "Email", "Preferred Stylist",
        "Services", "Goals", "Last Color Date", "Box Dye", "Chemical Services",
        "Sensitivities", "Photo Count", "Drive Folder URL", "Photo URLs",
        "Submitted From", "User Agent"
      ];
      const map = getHeaderMap_(subSheet);
      const missingH = reqHeaders.filter(h => !map[h]);
      logTest("Submissions header EXACT match", missingH.length === 0);
    }

    if (fid) {
      try {
        DriveApp.getFolderById(fid);
        logTest("Drive parent folder accessible", true);
      } catch (e) {
        logTest("Drive parent folder accessible", false);
      }
    }

    const CFG = { SPREADSHEET_ID: sid, LOG_SHEET_NAME: "Log" };
    log_(CFG, results.ok ? "PASS" : "FAIL", "SELF_TEST", JSON.stringify(results.logs));

  } catch (e) {
    logTest("Self test error: " + e.message, false);
  }
  return results;
}

/* ========================= PHASE 2: METRICS ========================== */

function ensureMetricsSheet_(ss) {
  let sh = ss.getSheetByName("_METRICS");
  if (!sh) {
    sh = ss.insertSheet("_METRICS");
    sh.appendRow(["Month", "Metric Key", "Metric Value", "Updated At"]);
  }
  return sh;
}

function snapshotMetrics_() {
  const CFG = getCfg_();
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const mSh = ensureMetricsSheet_(ss);
  const subSh = ss.getSheetByName("Submissions");
  if (!subSh) return;

  const map = getHeaderMap_(subSh);
  const data = subSh.getDataRange().getValues();
  data.shift();

  const monthStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM");

  const totalSub = data.length;
  let sumPhotos = 0;
  const pcIdx = map["Photo Count"] ? map["Photo Count"] - 1 : -1;

  if (pcIdx >= 0) {
    data.forEach(row => {
      const c = parseInt(row[pcIdx], 10);
      if (!isNaN(c)) sumPhotos += c;
    });
  }

  updateMetric_(mSh, monthStr, "Total Submissions", totalSub);
  updateMetric_(mSh, monthStr, "Sum Photo Count", sumPhotos);
}

function updateMetric_(mSh, month, key, val) {
  const data = mSh.getDataRange().getValues();
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === month && data[i][1] === key) {
      mSh.getRange(i + 1, 3).setValue(val);
      mSh.getRange(i + 1, 4).setValue(now);
      return;
    }
  }
  mSh.appendRow([month, key, val, now]);
}

/* ========================= PHASE 3: PRUNING ========================== */

function pruneLog_(maxRows) {
  maxRows = maxRows || 5000;
  const CFG = getCfg_();
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(CFG.LOG_SHEET_NAME);
  if (!sh) return;
  
  const lr = sh.getLastRow();
  if (lr > maxRows + 1) {
    sh.deleteRows(2, lr - maxRows - 1);
  }
}

function pruneSheetByDays_(sheetName, days, tsHeaderName) {
  const CFG = getCfg_();
  const ss = SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return;

  const map = getHeaderMap_(sh);
  const tsIdx = map[tsHeaderName];
  if (!tsIdx) return;

  const data = sh.getDataRange().getValues();
  if (data.length <= 1) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  for (let i = data.length - 1; i >= 1; i--) {
    const rowTs = new Date(data[i][tsIdx - 1]);
    if (rowTs instanceof Date && !isNaN(rowTs) && rowTs < cutoff) {
      sh.deleteRow(i + 1);
    }
  }
}

function pruneSubmissions_(days) {
  pruneSheetByDays_("Submissions", days || 90, "Timestamp");
}

function pruneFrontDesk_(days) {
  pruneSheetByDays_("Front Desk", days || 120, "Timestamp");
}

function masterPrune_() {
  snapshotMetrics_();
  pruneSubmissions_(90);
  pruneFrontDesk_(120);
  pruneLog_(5000);
}