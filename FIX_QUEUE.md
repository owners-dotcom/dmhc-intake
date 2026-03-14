# DMHC Intake — Fix Queue

This file is the repo-level source of truth for active fixes.

Status types:
- OPEN
- IN_PROGRESS
- BLOCKED
- DONE

Rules:
- One fix item at a time
- If a new higher-priority issue appears, move the current item to BLOCKED or back to OPEN before switching
- Prefer one commit per fix
- Keep descriptions short and concrete
- Reference exact files / sections when possible

---

## OPEN

1. Packet / tooling cleanup
   where: repo / workflow
   notes: confirm packet includes all required control files and no stale references remain

---

## IN_PROGRESS

(none)

---

## BLOCKED

(none)

---

## DONE

1. Remove missing canon reference from packet
   where: .github/workflows/gpt-context-packet.yml
   notes: removed INTAKE_SYSTEM_CONTEXT_and_CONTRACT_LOCK_CANON.md from packet source list

2. Align canon endpoint to real Apps Script endpoint
   where: CANON_DMHCI_INTAKE.md
   notes: removed placeholder / incorrect endpoint references

3. Add packet metadata for sync safety
   where: .github/workflows/gpt-context-packet.yml
   notes: packet now prints Generated, Commit, Commit Count, Branch, Last Commit