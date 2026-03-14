# DMHC Intake — Edit Map

## 1. Frontend UI / flow / copy / validation
Edit:
- `app.js`
- `styles.css`
- `index.html` only if structure changes

Then update only if needed:
- `PROJECT_STATUS.md`
- `CURRENT_FOCUS.md`
- `FIX_QUEUE.md`

Do not edit:
- `GPT_CONTEXT_PACKET.md`

---

## 2. Backend logic / validation / row writing / Drive behavior
Edit:
- `Code.gs`
- `appsscript.json` only if manifest settings change

Then update only if needed:
- `CONTRACT_KEYS.md`
- `PROJECT_STATUS.md`
- `CURRENT_FOCUS.md`
- `FIX_QUEUE.md`

Do not edit:
- `GPT_CONTEXT_PACKET.md`

---

## 3. Contract / payload / adapter field rules
Edit:
- `CONTRACT_KEYS.md`

Then update:
- `app.js`
- `Code.gs`
- `CANON_DMHCI_INTAKE.md`
- `FIX_QUEUE.md`

Do not edit:
- `GPT_CONTEXT_PACKET.md`

---

## 4. Workflow / packet / automation
Edit:
- `.github/workflows/gpt-context-packet.yml`
- `PACKET_USAGE_RULES.md`

Then update only if needed:
- `PROJECT_STATUS.md`
- `FIX_QUEUE.md`

Do not edit:
- `GPT_CONTEXT_PACKET.md`

---

## 5. Queue / state / what we are doing now
Edit:
- `CURRENT_FOCUS.md`
- `FIX_QUEUE.md`
- `PROJECT_STATUS.md`

Do not edit:
- runtime files unless actual code is changing