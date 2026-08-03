const PARTNER_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const PARTNER_FRAGMENT_NAMES = new Map([
  ["partner", "learner"],
  ["partner-admin", "admin"],
]);

function cleanLocation() {
  const location = globalThis.window?.location || globalThis.location;
  const pathname = typeof location?.pathname === "string" ? location.pathname : "/";
  const search = typeof location?.search === "string" ? location.search : "";
  return `${pathname || "/"}${search}`;
}

function defaultReplace(path) {
  globalThis.window?.history?.replaceState?.(null, "", path);
}

function parseFragmentEntry(entry) {
  const separator = entry.indexOf("=");
  if (separator < 0) return { name: entry, token: "" };
  return {
    name: entry.slice(0, separator),
    token: entry.slice(separator + 1),
  };
}

export function consumePartnerFragment({ hash, replace = defaultReplace } = {}) {
  if (typeof hash !== "string" || !hash.startsWith("#")) return null;

  const entries = hash.slice(1).split("&").map(parseFragmentEntry);
  const recognized = entries.some(({ name }) => PARTNER_FRAGMENT_NAMES.has(name));
  if (!recognized) return null;

  try {
    if (typeof replace === "function") replace(cleanLocation());
  } catch {
    // Never surface a URL fragment, which can contain a one-time secret.
  }

  if (entries.length !== 1) return null;
  const [{ name, token }] = entries;
  const kind = PARTNER_FRAGMENT_NAMES.get(name);
  if (!kind || !PARTNER_TOKEN.test(token)) return null;

  return { kind, token };
}
