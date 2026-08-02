import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

const DISMISS_KEY = "everwise-a2hs-dismissed";

function detectPlatform() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  const isIOS = /iphone|ipad|ipod/i.test(ua) && !window.MSStream;
  const isAndroid = /android/i.test(ua);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "desktop";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// Web-only banner that tells people how to install Everwise to their phone's
// home screen. This matters right now specifically because the native iOS
// app isn't through App Store review yet — the web version is the only way
// people can use Everwise, and it should still feel like "an app," not just
// a bookmark.
export default function AddToHomeScreenBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  if (Capacitor.isNativePlatform()) return null;
  if (isStandalone()) return null;
  if (dismissed) return null;

  const platform = detectPlatform();
  // On an actual desktop computer, "add to home screen" isn't a meaningful
  // action — skip the banner there rather than show irrelevant instructions.
  if (platform === "desktop") return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore — storage may be unavailable (private browsing, etc.).
    }
  }

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  return (
    <div className="mb-4 rounded-2xl border-2 border-clay/20 bg-cream-card px-4 py-3.5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-ink">
          Add Everwise to your Home Screen
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink-faint transition-colors hover:bg-cream-deep"
        >
          ×
        </button>
      </div>

      {platform === "android" && deferredPrompt ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className="btn-secondary mt-2.5"
          style={{ minHeight: 48 }}
        >
          Install app
        </button>
      ) : platform === "ios" ? (
        <p className="mt-1 text-sm leading-snug text-ink-soft">
          Tap the <strong>Share</strong> button in Safari, then choose{" "}
          <strong>"Add to Home Screen."</strong>
        </p>
      ) : (
        <p className="mt-1 text-sm leading-snug text-ink-soft">
          Open your browser's menu and choose{" "}
          <strong>"Add to Home screen"</strong> or{" "}
          <strong>"Install app."</strong>
        </p>
      )}
    </div>
  );
}
