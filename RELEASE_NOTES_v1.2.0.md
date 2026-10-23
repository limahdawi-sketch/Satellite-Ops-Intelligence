# Release notes — Satellite Ops Intelligence v1.2.0

## New

- Interactive SVG fade-margin sensitivity chart in Rain Fade & Availability.
- Shows remaining fade margin (dB) against illustrative fade depth (dB).
- Marks the currently selected scenario and displays a zero-margin reference.
- English and Arabic labels; responsive, horizontally scrollable plot on narrow screens.

## Calculation transparency

Chart relationship: `remaining margin = current link margin + assumed mitigation recovery − illustrative fade depth`. It updates with input changes. This is a simplified linear what-if calculation only. It does not model rain attenuation, fade probability, annual availability, ITU-R P.618, or system-specific mitigation efficacy.

## Verification

- `npm run verify`: passed.
- 12 Node test cases: passed.
- JavaScript syntax checks: passed.
- Static build and PWA checks: passed.
- Browser-on-device / production HTTPS verification: still required after deployment.
