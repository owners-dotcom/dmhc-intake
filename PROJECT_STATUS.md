# DMHC Intake — Project Status

## Current State
- Active system: Squarespace entry → GitHub Pages SPA → Apps Script → Google Sheet + Drive
- Source of truth for runtime: `index.html`, `styles.css`, `app.js`, `Code.gs`, `appsscript.json`
- Source of truth for project rules: `CANON_DMHCI_INTAKE.md`, `PACKET_USAGE_RULES.md`, `FIX_QUEUE.md`, `CONTRACT_KEYS.md`
- Generated file: `GPT_CONTEXT_PACKET.md` (do not edit directly)

## Current Focus
- See `CURRENT_FOCUS.md`

## Last Known Priorities
1. Fix contract / runtime drift before adding new features
2. Keep packet, canon, frontend, and backend aligned
3. Preserve locked sheet / endpoint assumptions unless explicitly changed

## Working Rule
- Only one item should be ACTIVE at a time
- If a new issue interrupts work, move the old one in `FIX_QUEUE.md` before switching

## Next Step
- Re-read packet in dev chat
- Pick one fix item by number
- Patch only that item