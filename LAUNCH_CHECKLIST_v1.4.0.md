# Launch checklist — v1.4.0

## Gate 1 — local verification
- [ ] Extract this source package into a new folder.
- [ ] Open the folder root in VS Code (the folder containing `index.html`, `styles.css`, `app.js`, `core.js`, `package.json`).
- [ ] Run `npm run verify`; resolve all failures before continuing.
- [ ] Run `start-website.bat`; verify `http://localhost:8080`.
- [ ] Check the navy sidebar / white content theme, theme toggle, Arabic RTL, mobile layout and Guided Learning page.
- [ ] Confirm worked example: residual margin ~8.70 dB; occupied bandwidth 28.50 MHz; available bandwidth 34 MHz; utilization ~83.82%; HPA budget ~50.12 W; allocated carrier power 9 W; current fade scenario +4.70 dB; at 12 dB illustrative fade depth −1.30 dB.
- [ ] Test report exports and print-to-PDF.

## Gate 2 — GitHub Pages deploy
- [ ] Create an empty repository e.g. `satellite-ops-intelligence` (do not commit secrets or operator data).
- [ ] At the root, place all contents of the extracted project; `.github/workflows/pages.yml` must be in that root.
- [ ] Run `git init`, `git branch -M main`, `git add .`, `git commit -m "Release Satellite Ops Intelligence v1.4.0"`.
- [ ] Add the remote URL for your repository and run `git push -u origin main`.
- [ ] In repository Settings → Pages, set Source to GitHub Actions.
- [ ] Open Actions and wait for the workflow to show success; use the generated Pages URL.
- [ ] Test the public URL in an incognito desktop window and a phone browser.

## Gate 3 — Install PWA on Android
- [ ] Open the public HTTPS URL in Chrome on Android.
- [ ] Wait for the first load to finish; check menu → Install app or Add to Home screen.
- [ ] Launch from the icon. Check labs, Arabic/RTL, charts, CSV/JSON exports and print workflow.
- [ ] Reopen online once before testing any offline behavior.

## Gate 4 — Optional APK/AAB
- [ ] Decide whether a store/distributable Android package is needed. PWA installation does not require APK/AAB.
- [ ] If needed, create a Trusted Web Activity using Bubblewrap/PWABuilder, set package ID, signing and Digital Asset Links for the deployed domain, build and test the APK/AAB. Never share signing keystores or passwords.

## Gate 5 — LinkedIn launch
- [ ] Replace `[Insert deployed HTTPS URL]` in `LINKEDIN_CASE_STUDY_AR_EN.md`.
- [ ] Record a 45–60 second demo after public deployment. Suggested flow: homepage → Link Budget → Guided Learning → Transponder Capacity → Fade margin chart → decision report.
- [ ] Keep a visible note that the sample data are synthetic and the model is an engineering screening aid.
- [ ] Publish the English post to broaden international technical reach; optionally publish the Arabic version separately.
- [ ] Ask one concrete question to invite engineers to provide technical feedback.
