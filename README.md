# Satellite Ops Intelligence — v1.4.0

**Built by Laith Mahdawi** · Independent satellite RF engineering prototype

A browser-first, installable Progressive Web App (PWA) for transparent engineering screening and decision support. The interface is English/Arabic, responsive, and built around auditable formulas rather than opaque result claims.

## What's included

- **Decision Center:** live summary of residual link margin, bandwidth utilization, power loading and aggregate scenario net rate.
- **RF Link Budget Lab:** free-space path loss, total entered path loss, C/N₀, C/N, Eb/N₀, raw margin and residual margin after the specified reserves.
- **Transponder Capacity Lab:** approximate occupied bandwidth using `Rs × (1 + roll-off) + guard`; aggregate net rate; bandwidth reserve; and a simplified HPA output budget from saturation output and composite OBO.
- **Rain Fade & Availability:** illustrative fade-margin stress test and annual availability arithmetic from user-entered outage hours. It does not infer availability from fade margin.
- **Measurement Triage (prototype):** local CSV preview and simple deterministic trend heuristics for C/N, BER and receive-power series. Findings are hypotheses, not confirmed root causes and not AI-generated.
- **Decision Reports:** JSON export, CSV summary export, and print-to-PDF through the browser.
- **Methodology:** equations, units, boundaries, references and live sanity checks.
- **PWA:** app manifest, app icons, service worker with versioned app-shell cache, and relative paths suitable for root or sub-path hosting.

## Run locally on Windows

1. Extract the ZIP into a normal writable folder.
2. Double-click `start-website.bat`, or open PowerShell in this folder and run:

   ```powershell
   py -m http.server 8080
   ```

3. Open `http://localhost:8080` in Chrome or Edge.
4. Run tests with Node.js installed:

   ```powershell
   npm run verify
   ```

There are no runtime npm dependencies; the site uses plain HTML/CSS/JavaScript. Node is needed only for automated validation tests.

## Install on Android

A PWA must be served from **HTTPS** (or localhost during development) to use service workers and normal installation flows.

1. Deploy the contents of this folder to Netlify, GitHub Pages or another static HTTPS host.
2. Open the HTTPS address in Chrome on Android and allow the first visit to finish loading.
3. Open Chrome's menu and choose **Install app** or **Add to Home screen**. Wording may differ by browser/version.
4. Launch it from the home-screen icon; the PWA should use standalone display mode.
5. Open the app online once, then test airplane mode. Only the app shell and bundled local assets are cached; The interface uses local system-font fallbacks and does not require external image or font assets.

This folder is an installable PWA, not a signed Android APK/AAB. For Play Store distribution, package the HTTPS PWA as a Trusted Web Activity (TWA) using PWABuilder or Bubblewrap, configure Digital Asset Links (`/.well-known/assetlinks.json`), sign the Android bundle, and test it separately before submitting to Google Play.

## Deploy to GitHub Pages

1. Create a repository and upload the contents of this folder to its root.
2. In repository Settings → Pages, choose the GitHub Actions deployment source.
3. Push to `main`. The included workflow deploys the static app. Relative asset paths and relative manifest/service-worker scope are intentional, allowing deployment below a repository path.
4. After deployment, test the exact Pages URL, service-worker registration, offline reload, language toggle and JSON/CSV downloads.

## Deploy to Netlify

Drag the project folder into Netlify's manual deploy workflow or connect a Git repository. The included `netlify.toml` publishes the project root. A custom domain is optional; HTTPS must be enabled before Android installation.

## Formula definitions

### Link budget

- `FSPL (dB) = 92.45 + 20 log10(f_GHz) + 20 log10(d_km)`
- `L_path = FSPL + additional_losses`
- `C/N0 (dB-Hz) = EIRP (dBW) − L_path (dB) + G/T (dB/K) + 228.6`
- `C/N (dB) = C/N0 − 10 log10(noise_bandwidth_Hz)`
- `Eb/N0 (dB) = C/N0 − 10 log10(information_bit_rate_bps)`
- `Residual margin = Eb/N0 − required Eb/N0 − implementation margin − fade reserve`
- `EIRP (dBW) = transmitter power (dBW) + transmit antenna gain (dBi) − transmit-chain loss (dB)`
- `G/T (dB/K) = receive antenna gain (dBi) − 10 log10(system noise temperature in K)`
- `Combined C/N or C/I = −10 log10(Σ 10^(−ratio_i/10))` for compatible ratios sharing the same reference and bandwidth

EIRP and G/T must refer to the modeled uplink **or** downlink path. Enter each additional loss once. The user provides the required Eb/N0 threshold for the applicable modem/MODCOD and service conditions.

### Transponder screening

- `Occupied span per carrier (MHz) ≈ Rs (Msym/s) × (1 + roll-off) + guard (MHz)`
- `Available bandwidth = usable bandwidth − reserved bandwidth`
- `HPA operating power budget (W) = 10^((Psat_dBW − composite OBO_dB)/10)`
- `Bandwidth utilization = total occupied span / available bandwidth × 100%`
- `Power loading = total allocated carrier power / HPA operating budget × 100%`
- `Net spectral efficiency (bit/s/Hz) ≈ aggregate net rate (Mbps) / total occupied span (MHz)`

The carrier-power reference plane must be consistent. This is not a payload-specific model and does not predict intermodulation, spectral regrowth, per-carrier EIRP, or OBO-dependent C/N degradation. Free bandwidth/power is not automatically sellable capacity.

### Outage arithmetic

- `Availability (%) = 100 × (1 − annual outage hours / 8760)`

This calculates availability only from user-provided outage-hour assumptions. It is not an ITU-R P.618 fade/availability prediction.

## Automated checks

Run `npm run verify` to perform JavaScript syntax checks, unit tests, static asset checks and manifest/service-worker checks. The current test suite covers key formula examples, input validation, CSV parsing and the deterministic triage layer.

## Boundaries and responsible use

- Seeded values and the built-in CSV are synthetic.
- No live satellite, teleport, fleet, payload or operator telemetry connection exists.
- Current data triage is deterministic and rule-based; no AI model diagnosis is claimed.
- ITU-R P.618 propagation/availability prediction, DVB-S2/S2X MODCOD threshold modeling, payload-specific nonlinear effects, spectrum coordination and live operator integrations are not implemented.
- Do not use the outputs as operational authorization, a certified link budget, regulatory coordination result or commercial capacity commitment without expert review and validated inputs.

## Reference links

- ITU-R P.618-14 (in force): https://www.itu.int/rec/R-REC-P.618-14-202308-I
- ETSI DVB-S2X EN 302 307-2: https://www.etsi.org/deliver/etsi_EN/302300_302399/30230702/01.03.01_60/en_30230702v010301p.pdf


## v1.1.1 readability update

- Increased default typography and compact labels across the interface, including Arabic and mobile layouts.
- Made the in-app install button available on narrow screens when the browser exposes `beforeinstallprompt`; it becomes icon-only with an accessible label.
- Bumped the Service Worker cache version to ensure deployed clients pick up the updated styles.
- No satellite calculation formulas were changed in this patch.


## v1.3.0 fade-margin sensitivity chart

- Added an interactive SVG chart to Rain Fade & Availability. It redraws as scenario inputs change and plots the simplified relationship `remaining margin = current link margin + assumed mitigation recovery − illustrative fade depth`.
- The selected fade scenario is marked on the curve; the zero-margin threshold is shown for context. Arabic and English labels are available.
- The chart is a transparent linear what-if visualization only. It does not predict rain attenuation, outage probability, annual availability, or implement ITU-R P.618.
- Added calculation-layer tests for profile points, selected scenario and invalid inputs; bumped the PWA cache to v1.3.0.


## v1.3.0 enhancements

- Direction-aware downlink and uplink illustrative profiles; changing direction loads the matching example and recalculates live. Replace demonstration values with validated real link data.
- Expanded equation/symbol guide for FSPL, path loss, C/N0, C/N, Eb/N0 and margins.
- Explanation of the combined C/N or C/I calculation and reciprocal-linear summation.
- Synchronized editable HPA saturation power in dBW and watts with conversion formulas.
- Plain-language formula guides for spectrum occupancy, bandwidth headroom, HPA power loading, annual availability arithmetic and remaining fade margin.
- Expanded Phase 02/03 roadmap deliverables and validation gates.
- Increased in-page typography for labels, field help, tables, formula cards and roadmap text.


## v1.4.0 visual and learning update

- Made a high-contrast navy navigation rail paired with a clean white/light workspace in the default light theme; dark mode remains available.
- Raised typography across page copy, inputs, formula guides, navigation, tables and mobile layouts.
- Added the bilingual Guided Engineering Walkthrough with a worked synthetic downlink, capacity-screening example, fade-margin stress case, interpretation and links into the corresponding labs.
- Updated application cache and release version to v1.4.0.
- This remains a synthetic training/screening prototype; no live operator telemetry or full ITU-R P.618 prediction is provided.
