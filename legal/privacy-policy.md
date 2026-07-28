# Everwise Privacy Policy

**Last updated:** July 27, 2026

This policy describes what information Everwise ("we," "us") collects, why, and how you can control it. Everwise is a digital literacy and scam-awareness app for adults, offered on the Apple App Store.

We've written this to describe exactly what the app does today — not a generic template. If a feature listed here doesn't ship, or a new one is added, this document needs to be updated to match before the app is released or updated.

## Information we collect

**Account information.** When you create an account, we collect your name, email address, and password. Your password is handled by Firebase Authentication (Google) and is never stored by us in plain text or visible to us.

**Onboarding answers.** During setup, we ask a few questions about your goals and comfort with technology so lessons can be tailored to you. These answers are stored with your account.

**Progress data.** We store which lessons, challenges, and exams you've completed, badges you've earned, and your subscription status, so your progress is saved across sessions.

**Scam Checker messages.** When you paste a message into the Scam Checker, the message text is sent to our AI provider (OpenAI) solely to generate an assessment. We do not save the message text in our own database, and we ask OpenAI not to retain it for model training (`store: false` on our API requests). We can't control how long OpenAI's infrastructure briefly retains data for abuse-monitoring purposes under their own policies — avoid pasting passwords, account numbers, or other highly sensitive information into the checker.

**Read-aloud audio.** When you use the "read aloud" feature, the on-screen text is sent to our text-to-speech provider (ElevenLabs) to generate audio, which is returned to your device. We do not store this audio.

**Subscription and billing.** Subscriptions are purchased and managed through Apple's In-App Purchase system. We never see or store your payment card details — Apple handles billing directly, and we only receive confirmation of your subscription status.

## Information we do not collect

We do not use advertising, third-party analytics, or tracking SDKs of any kind. We do not access your contacts, photos, camera, or location. We do not sell your personal information to anyone, for any reason.

## Who we share information with

We share information only with the service providers who help us run the app, and only as needed for them to perform that function:

- **Firebase / Google Cloud** — stores your account and progress data.
- **OpenAI** — processes Scam Checker message text to generate a result.
- **ElevenLabs** — converts text to speech audio for the read-aloud feature.
- **Apple** — processes subscription payments.

We do not share your data with anyone else, including for marketing purposes.

## How long we keep information

We keep your account and progress data as long as your account is active. If you delete your account (available anytime in Settings), your account record and progress data are permanently deleted. Scam Checker messages and read-aloud text are not retained by us in the first place.

## Your choices and rights

You can review and correct your account information from within the app. You can delete your account and all associated data at any time from Settings → Delete account. You can also reach us at everwisedigitalliteracy@gmail.com to request access to, correction of, or deletion of your data.

Depending on where you live, you may have additional rights under laws such as the California Consumer Privacy Act (CCPA) or similar state privacy laws, including the right to know what personal information we hold and to request its deletion. Contact us at the email above to exercise these rights.

## Children's privacy

Everwise is designed for adults and is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, contact us and we will delete it.

## Security

Data is encrypted in transit (HTTPS) and stored using Firebase's standard security infrastructure. No system is 100% secure, but we take reasonable steps to protect your information.

## Changes to this policy

If we make material changes to this policy, we'll update the "Last updated" date above and, where appropriate, notify you in the app.

## Contact us

Questions about this policy or your data: everwisedigitalliteracy@gmail.com

---

*Notes for whoever finalizes this document (delete before publishing): have this reviewed by an attorney before it goes live. Live version: https://aarivarora2-sketch.github.io/EverWise/privacy.html (linked from Settings and the Paywall).*
