# Everwise iOS Release Checklist

## Verified locally

- Release builds pass in Xcode with zero build warnings on iPhone 17e, iPhone 17 Pro, and iPhone 17 Pro Max simulators.
- An unsigned generic-device archive passes Xcode's local store validation.
- Bundle identifier: `com.everwise.app`.
- Version: `1.0` (`1`).
- Minimum iOS version: iOS 15.
- The app is iPhone-only and portrait-only.
- The supplied Everwise artwork is installed as the 1024×1024 App Store icon.
- The native launch screen uses Everwise artwork instead of Capacitor branding.
- The app launches from packaged local assets and no longer waits indefinitely for Firebase auth.
- The iOS keyboard accessory bar is hidden.
- Safe areas, status-bar backgrounds, and full-height layouts are handled edge to edge.
- StoreKit 2 purchase, restore, localized product metadata, and current-entitlement checks are implemented.
- Account password reset and in-app account deletion are implemented.
- Developer subscription controls have been removed.
- The app privacy manifest is included in the archived app.
- Export compliance is declared as no non-exempt encryption.
- JavaScript lint, production web build, dependency audit, iOS sync, simulator Release builds, and generic-device archive all pass.

## Required before App Store upload

- Select the correct paid Apple Developer Team in Xcode Signing & Capabilities. A signed archive currently stops with: `Signing for "App" requires a development team.`
- Create the App Store Connect auto-renewable subscription group and products:
  - `com.everwise.app.annual` — $89.99/year with a 7-day introductory free trial.
  - `com.everwise.app.monthly` — $14.99/month.
- Add subscription localization, review screenshots, and review notes in App Store Connect.
- Provide a secure HTTPS API origin at build time using `VITE_EVERWISE_API_URL`. The native scam checker and ElevenLabs read-aloud intentionally do not fall back to an insecure HTTP server.
- Configure the API server's `OPENAI_API_KEY` and `ELEVENLABS_API_KEY` as server-side secrets.
- Host final Privacy Policy, Terms, and Support pages on public HTTPS URLs and add them in App Store Connect.
- Complete App Privacy answers so they match `PrivacyInfo.xcprivacy` and the production backend's actual retention policy.
- Add App Store metadata, age rating, category, screenshots for required iPhone display sizes, and a review account if reviewers need authenticated access.
- Archive with signing, run Validate App, upload to App Store Connect, and complete a TestFlight pass on a physical iPhone.

## Product identifiers

- Annual: `com.everwise.app.annual`
- Monthly: `com.everwise.app.monthly`

The paywall's displayed fallback prices must remain identical to the App Store Connect prices. StoreKit replaces supported price labels with Apple's localized product metadata when the products are available.
