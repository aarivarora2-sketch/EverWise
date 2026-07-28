# App Store Connect — App Privacy answers

This is what to select in App Store Connect → your app → App Privacy, based on what Everwise's code actually does today. If you add analytics, ads, crash reporting, or anything else later, update this doc and the label together — Apple checks for mismatches between what you declare and what the app actually does, and can reject or pull the app over it.

## Do you collect data?

**Yes.**

## Data types to declare

For each type below, when Apple asks "Is this data linked to the user's identity?" the answer is **Yes** (it's tied to the account), and "Is this data used for tracking?" is **No** (Everwise doesn't track users across other companies' apps or websites).

| Data type | Specific data | Purpose |
|---|---|---|
| **Contact Info** | Name | App Functionality |
| **Contact Info** | Email Address | App Functionality |
| **Identifiers** | User ID (Firebase Auth UID) | App Functionality |
| **User Content** | Other User Content (lesson/onboarding answers, Scam Checker message text) | App Functionality |
| **Usage Data** | Product Interaction (lessons completed, badges, subscription status) | App Functionality |

Set the purpose to **App Functionality** for all of them — none of this is used for advertising, and there's no third-party analytics purpose to select.

## Data types to leave unchecked

Don't declare these — the app doesn't collect them: Location, Health & Fitness, Financial Info, Contacts (address book), Browsing History, Search History, Photos or Videos, Audio Data (the read-aloud audio is generated output, not audio collected from the user), Diagnostics, Purchases.

On Purchases specifically: Apple's StoreKit handles the transaction itself, and Everwise only stores a subscription status/plan flag, not raw purchase or payment data — so this shouldn't need to be declared. If you later add receipt validation or a purchase-history view, revisit this.

## Tracking

When asked "Do you or your third-party partners use data collected from this app to track users?" — answer **No**. There's no advertising SDK, no cross-app/cross-site tracking, and no App Tracking Transparency (ATT) prompt is needed.

## Privacy policy URL field

Use: `https://aarivarora2-sketch.github.io/EverWise/privacy.html`

## One more thing worth double-checking

Third-party SDKs you call — Firebase, OpenAI (via your own server, not an SDK in the app), ElevenLabs (also via your server) — should be listed under "Third-Party Partners" if App Store Connect asks for that; Firebase is the main one bundled in the app itself.
