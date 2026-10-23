# Browser Console Notes — Satellite Ops Intelligence v1.1.1

## 1. `chrome-extension://...` blocked resource / `ERR_FAILED`
These URLs belong to Chrome extensions, not to this site's own `http://localhost:8080` origin. The observed `record.css`, `broadcastCS.js`, `record.js`, and `AdobeClean-*.otf` paths indicate extension-injected resources. To confirm, open the app in an Incognito window with extensions disabled, or temporarily disable the relevant extensions at `chrome://extensions` and reload.

## 2. `Banner not shown: beforeinstallpromptevent.preventDefault() called`
The app uses the standard custom-install pattern: it cancels the browser's automatic install UI, retains the event, and calls `prompt()` from the app's Install button after a user click. This browser diagnostic alone does not mean the app crashed. On narrow screens, v1.1.1 now shows the custom install button when the browser makes the install prompt available. If the button does not appear, use Chrome's menu (`Install app` / `Add to Home screen`) and check installability on the deployed HTTPS origin.

## 3. Slow-network font fallback from `chrome-extension://...`
The reported Adobe Clean font URL belongs to a browser extension. It is not evidence that the app itself is failing to load a required font. The app uses system font fallbacks and does not depend on the extension's font.

## 4. What should be checked separately
If Console shows errors with a source such as `app.js`, `core.js`, `styles.css`, `index.html`, or `sw.js` on the site origin, capture those separately. Those may be app errors and should not be grouped with `chrome-extension://` messages.
