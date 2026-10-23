# Deployment & Android installation

## Static hosting checklist

- Publish the **contents** of this folder (the folder containing `index.html`), not an extra nested `website/` folder.
- Verify that `index.html`, `core.js`, `app.js`, `styles.css`, `manifest.webmanifest`, `sw.js` and icons return HTTP 200.
- Use HTTPS for a deployed PWA. Local testing can use `http://localhost:8080`.
- The app uses `./`-relative paths so the same build can be hosted at a domain root or a repository sub-path.
- When changing cached files, bump `CACHE_NAME` in `sw.js` to a new version.

## Windows local test

Double-click `start-website.bat`, then visit http://localhost:8080.

## GitHub Pages

The included `.github/workflows/pages.yml` workflow builds no framework bundle; it uploads this folder as a static artifact and deploys it. Set Settings → Pages → Source to **GitHub Actions** and push to `main`.

## Netlify

`netlify.toml` sets the publish directory to the project root. Connect the repository or deploy the folder manually, then validate the HTTPS deployment URL.

## Android PWA checklist

1. Open the HTTPS URL in Chrome for Android.
2. Wait for all local app assets to load on the first visit.
3. Chrome menu → Install app / Add to Home screen.
4. Launch from the icon and verify standalone display.
5. Test landscape/portrait layout, Arabic RTL, CSV import, JSON/CSV export, print-to-PDF and offline shell reload.

The PWA is not a Play Store package. A signed `.aab` distribution requires an additional Trusted Web Activity packaging and verification step (PWABuilder/Bubblewrap), including Digital Asset Links at `/.well-known/assetlinks.json` and separate Google Play release checks.
