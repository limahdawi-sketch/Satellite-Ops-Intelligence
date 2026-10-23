# Android distribution notes

The v1.1 deliverable is an installable Progressive Web App. For the first release, deploy it over HTTPS and install it from Chrome on Android. This avoids maintaining separate Android UI code while the calculation layer is still evolving.

For a Play Store release later:

1. Deploy the final PWA to a stable HTTPS domain.
2. Validate its manifest, icons, service-worker behavior, deep links and mobile performance.
3. Create a Trusted Web Activity with Bubblewrap or PWABuilder.
4. Configure `/.well-known/assetlinks.json` for the app's package ID and signing certificate fingerprint.
5. Build and sign an Android App Bundle (`.aab`), then test on physical devices and through the relevant Play Console release track.

No APK/AAB or signing key is included in this project. These require a chosen package ID, signing identity, hosted domain and separate Android build/release verification.
