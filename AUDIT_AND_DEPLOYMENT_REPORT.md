# Technical Audit & Delivery Notes — Satellite Ops Intelligence v1.4.0

**Audit date:** 23 October 2026  
**Scope:** Static PWA source, RF calculation layer, explanatory formula guides, direction selection, transponder capacity screening, rain-fade sensitivity, product roadmap and deployment assets.

## Executive summary

Version 1.4.0 organizes the prototype as a maintainable static PWA with readable HTML/CSS/JavaScript, automated tests, explicit formulas and units, direction-specific illustrative link profiles, synchronized HPA dBW/W inputs, an interactive remaining-fade-margin chart, and defined deliverables for roadmap phases 02 and 03.

This remains an engineering screening prototype. It is not connected to live satellite/operator telemetry and is not a certified link-budget, payload simulation, regulatory coordination, or ITU-R P.618 rain-fade/availability implementation.

## Key formula behavior

| Area | Model in the current app | Important interpretation / boundary |
|---|---|---|
| FSPL | `92.45 + 20 log10(f_GHz) + 20 log10(range_km)` | Free-space path loss only; other losses must be entered separately where applicable. |
| Total path loss | `L_path = FSPL + entered additional losses` | Include each applicable loss once and avoid double counting. |
| C/N0 | `EIRP − L_path + G/T + 228.6` | EIRP, path losses and G/T must describe the same modeled uplink or downlink path. Result in dB-Hz. |
| C/N | `C/N0 − 10 log10(noise bandwidth in Hz)` | Use equivalent noise bandwidth for the carrier/reference being analyzed. |
| Eb/N0 | `C/N0 − 10 log10(information bit rate in bit/s)` | The required threshold is user-supplied for the relevant modem/MODCOD and service. |
| Residual margin | `Eb/N0 − required Eb/N0 − implementation margin − fade reserve` | A screening result whose meaning depends on validated inputs and a complete path budget. |
| Combined ratios | `−10 log10(Σ 10^(−ratio_i/10))` | For compatible independent impairment ratios sharing a consistent wanted-carrier reference, bandwidth and measurement point. Do not add dB values directly. |
| Occupied span | `Rs × (1 + roll-off) + guard` | Approximate screening width, not a spectral mask, carrier-overlap or payload transfer-function simulation. |
| Available bandwidth | `usable bandwidth − reserved bandwidth` | User-defined planning values; frequency coordination and guard policies are not automatically validated. |
| HPA operating power | `10^((Psat_dBW − composite OBO_dB)/10)` W | Assumes compatible saturation/OBO definitions and power reference planes; does not model multi-carrier nonlinear effects. |
| dBW ↔ watts | `P(W)=10^(P(dBW)/10)` and `P(dBW)=10 log10(P(W)/1 W)` | Watts must be positive to convert back to dBW. |
| Power loading | `sum allocated carrier power / HPA operating budget × 100%` | A simplified screening ratio; not proof of payload operational capability. |
| Net spectral efficiency | `aggregate net rate / total occupied span` | Valid for the rates and occupied spans supplied; not a theoretical MODCOD efficiency promise. |
| Annual availability | `100 × (1 − annual outage hours / 8760)` | Arithmetic from supplied annual outage hours; no outage probability is inferred from fade margin. |
| Scenario outage | `baseline outage hours × (1 − assumed reduction fraction)` | The reduction is a user-defined what-if assumption, not a forecast that a mitigation will achieve that gain. |
| Remaining fade margin | `current link margin + assumed mitigation recovery − illustrative fade depth` | Linear sensitivity chart only. It is not an ITU-R P.618 propagation model or a direct outage-probability curve. |

## Uplink and downlink behavior

The direction selector loads a separate illustrative sample profile for the selected direction and recalculates the model. In the uplink profile, EIRP refers to the transmitting earth station and G/T refers to satellite receive performance; in the downlink profile, EIRP refers to the satellite transmit path and G/T to the earth-station receiver. The same core formulas apply, but inputs must be appropriate to the selected direction. These are demonstration values, not values for any named operator or spacecraft.

## Combined-result explanation

The Combined C/N or C/I tool transforms each dB ratio into a reciprocal linear impairment contribution, sums those contributions and converts back to dB. For example, two compatible independent 20 dB contributions yield about 16.99 dB. Mixing ratios with unrelated carriers, bandwidths, references or measurement points is not valid without normalization.

## HPA display

The Transponder Capacity page exposes saturation output in both dBW and watts, synchronizing the fields in both directions. The displayed operating budget subtracts the entered composite OBO in dB before conversion to watts. That operating budget and the user-entered carrier powers must refer to a consistent power plane for the utilization ratio to be meaningful.

## Roadmap interpretation

- **Phase 01 — Interactive Engineering MVP:** current prototype functions and explanatory calculation guides.
- **Phase 02 — AI Troubleshooting:** planned work including CSV/schema/unit validation, time-aligned RF/weather/equipment logs, threshold profiles, deterministic ranked hypotheses and only then an AI explanation layer. These are roadmap targets, not a claim of a production AI diagnosis feature.
- **Phase 03 — Operator Intelligence:** planned authorized telemetry connectors, validated payload/service models, capacity and resilience scenarios, technical-commercial reports, role-based access, audit controls and governed deployment. No live operator integration is included in this source package.

## Verification performed

`npm run verify` completed successfully in the package-generation environment:

- JavaScript syntax checks for `core.js`, `app.js`, and `sw.js`.
- 14 Node.js tests passed, including reference FSPL/link-budget values, combined impairment ratios, capacity constraints, annual availability arithmetic, CSV parsing/trend hypotheses, fade chart profile and invalid-input checks, dBW/watt reciprocal conversion, and uplink profile calculation.
- Static asset/build and chart/formula wiring checks passed.
- PWA manifest, icon, service worker, relative scope and cache-version checks passed.

The automated PWA checks do not prove actual installation on a physical Android device. A successful HTTPS deployment and real-device test remain required. This is a PWA source release, not a signed Play Store APK/AAB.


## v1.4.0 visual and guided-learning review

- The default theme is a high-contrast light workspace with a deep navy navigation rail; a dark theme remains selectable.
- Typography was enlarged across navigation, form inputs, formula guides, data tables, notes and the Guided Learning page, including narrow mobile layouts.
- Added a bilingual Guided Learning walkthrough using synthetic values: a 30 Mbps downlink, link-budget equation trace, a separate multi-carrier capacity screen, and a fade-margin what-if. Buttons link the lesson directly into the related live labs.
- GitHub Pages workflow updated to deploy only the public web assets to a staged `_site` directory, keeping repository docs and tests out of the published site.
- `npm run verify` rerun for v1.4.0: 14 tests passed; JavaScript, build/static wiring, and PWA manifest/cache checks passed.
- Browser screenshot automation was restricted in this build environment, so the final rendered appearance still needs the owner's local browser check. The successful static/unit checks are not a substitute for that manual look over.
- Public hosting and a real Android install have not yet been performed. They require pushing to an owner-controlled repository, completing HTTPS deployment, and testing on a phone.
