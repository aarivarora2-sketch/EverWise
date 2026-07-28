import { Capacitor } from "@capacitor/core";

const configuredOrigin = (import.meta.env.VITE_EVERWISE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

export function apiEndpoint(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return configuredOrigin ? `${configuredOrigin}${normalizedPath}` : normalizedPath;
}

export function warnIfNativeApiIsMissing() {
  if (Capacitor.isNativePlatform() && !configuredOrigin) {
    console.error(
      "[Everwise] Native API URL is missing. Build with VITE_EVERWISE_API_URL set to the secure HTTPS API origin.",
    );
  }
}
