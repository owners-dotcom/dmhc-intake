# Packet Usage Rules

This packet is the live source of truth for the DMHC Intake system only when its metadata is current.

## Required startup behavior
Before any analysis or patching, always print:

- Generated
- Commit
- Commit Count
- Branch
- Last Commit

## Staleness rule
Treat the current chat context as stale and require re-sync if any of the following is true:

- The user says they made a new commit or changed the repo
- The user references a newer commit hash
- The user references a newer Generated timestamp
- The packet metadata in the current chat differs from the latest packet metadata
- The user reports behavior that conflicts with the current packet

## Patch safety rule
Do not provide a patch until the packet has been re-read if staleness is suspected.

## Fix workflow rule
Use one fix item at a time.
If a new higher-priority issue is discovered during a fix, move the current item to BLOCKED or back to OPEN in FIX_QUEUE.md before starting the new item.

## Commit discipline rule
Prefer one commit per fix.