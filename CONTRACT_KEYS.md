# DMHC Intake — Contract Keys

This file defines the expected submission contract between:
- frontend (app.js / DMHCAdapter)
- backend (Code.gs)
- sheet / downstream ops

## Required Keys
- fullName
- phone
- email
- services
- photos

## Optional Keys
- preferredStylist
- goals
- goal
- lastColorDate
- boxDye
- chemicalServices
- hairHistory
- sensitivities
- submittedFrom
- userAgent
- schemaVersion
- formType
- riskScore
- riskTier

## Rules
- `services` must be an array
- `photos` must be an array of objects containing base64
- additive fields are allowed only if backend accepts them safely
- silent renames are prohibited
- legacy aliases must be handled in adapter, not by changing canonical contract keys