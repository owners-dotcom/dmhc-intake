# DMHC Intake — Contract Keys

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

## Rules
- `services` must always be an array
- `photos` must always be an array
- each photo object must include `base64`
- additive keys are allowed only if frontend and backend both tolerate them safely
- silent renames are prohibited
- legacy aliases must be handled in adapter / backend mapping, not by changing canonical names silently