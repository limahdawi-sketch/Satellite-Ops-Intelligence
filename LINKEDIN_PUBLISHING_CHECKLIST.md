# LinkedIn publishing checklist — Satellite Ops Intelligence v1.4.0

## Before posting
- [ ] Run `npm run verify` and confirm 14 tests plus build/PWA checks pass.
- [ ] Deploy the site over HTTPS with the included GitHub Pages workflow or a static host.
- [ ] Open the exact public URL in a private desktop window and Chrome on Android.
- [ ] Check the navy navigation rail, white workspace, enlarged typography, light/dark toggle, and Arabic RTL.
- [ ] Test Guided Learning values and links into RF Link Budget, Transponder Capacity and Rain Fade & Availability.
- [ ] Confirm the fade-margin graph changes with the selected illustrative fade depth.
- [ ] Test JSON/CSV export and Print / Save PDF.
- [ ] Use only synthetic or appropriately anonymized/authorized data in screenshots and recordings.
- [ ] Replace `[Insert deployed HTTPS URL]` in the LinkedIn drafts with the real public URL.

## Suggested 45–60 second screen recording
1. **0–8 s:** Decision Center and product identity.
2. **8–18 s:** Guided Learning: explain the 30 Mbps synthetic downlink and the input units.
3. **18–29 s:** RF Link Budget: show FSPL, C/N₀, Eb/N₀ and residual margin update.
4. **29–39 s:** Transponder Capacity: show 28.5 MHz occupied from 34 MHz available and the simplified HPA budget.
5. **39–49 s:** Rain Fade & Availability: change illustrative fade depth so the remaining margin moves from +4.7 dB to −1.3 dB.
6. **49–57 s:** Export a decision report and show the model-limitation note.
7. **Last frame:** `Satellite Ops Intelligence | Built by Laith Mahdawi` plus the public demo URL.

## Publish sequence
1. Public HTTPS demo first. Confirm it works outside the development machine.
2. Update URL placeholders in `LINKEDIN_LAUNCH_POST.md` and `LINKEDIN_CASE_STUDY_AR_EN.md`.
3. Publish the English post for international technical/recruiting reach; optionally publish the Arabic version separately.
4. Attach the short recording or 3–4 genuine screenshots from the public site.
5. Invite domain-specific feedback and pilot-use-case discussion without implying existing partnerships or operator endorsements.
6. Monitor comments and answer questions with the demo link and clear model boundaries.

## Claim boundary
Describe the current release as a bilingual engineering-learning and screening prototype. Do not present planned AI Troubleshooting or Operator Intelligence as already delivered. It is not a live operator integration, certified link budget or full ITU-R P.618 implementation.
