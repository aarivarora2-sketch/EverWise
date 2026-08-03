const API_BASE_URL = "https://identitytoolkit.googleapis.com/v1";
const MAX_RESPONSE_BYTES = 25_000;
const EXPECTED_PROJECT_ID = "games-caf0e";
const DEFAULT_TIMEOUT_MS = 60_000;

const ERROR_MESSAGES = {
  EMAIL_EXISTS: "An account already exists for this email address.",
  INVALID_LOGIN_CREDENTIALS: "The email address or password is incorrect.",
  OPERATION_NOT_ALLOWED: "Password sign-in is not available.",
  RATE_LIMITED: "Too many attempts. Please try again later.",
  INVALID_RESPONSE: "Firebase returned an invalid response.",
  UNAVAILABLE: "Firebase Identity is unavailable.",
};

export class FirebaseIdentityError extends Error {
  constructor(code) {
    super(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNAVAILABLE);
    this.name = "FirebaseIdentityError";
    this.code = ERROR_MESSAGES[code] ? code : "UNAVAILABLE";
  }
}

function identityError(code) {
  return new FirebaseIdentityError(code);
}

function isBoundedString(value, maxLength) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function validCredentials({ email, password }) {
  return isBoundedString(email, 320) && isBoundedString(password, 1_024);
}

function validIdToken(idToken) {
  return isBoundedString(idToken, 16_384);
}

async function readResponseJson(response) {
  let reader;
  try {
    reader = response.body.getReader({ mode: "byob" });
  } catch {
    throw identityError("INVALID_RESPONSE");
  }

  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(
        new Uint8Array(MAX_RESPONSE_BYTES - size + 1),
      );
      if (done) break;
      if (!(value instanceof Uint8Array) || value.byteLength === 0) {
        throw identityError("INVALID_RESPONSE");
      }
      if (value.byteLength > MAX_RESPONSE_BYTES - size) {
        await reader.cancel();
        throw identityError("INVALID_RESPONSE");
      }
      chunks.push(value.slice());
      size += value.byteLength;
    }
  } catch (error) {
    if (error instanceof FirebaseIdentityError) throw error;
    throw identityError("INVALID_RESPONSE");
  } finally {
    reader.releaseLock();
  }

  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("invalid JSON shape");
    }
    return parsed;
  } catch {
    throw identityError("INVALID_RESPONSE");
  }
}

function responseState(response) {
  try {
    if (
      !response ||
      typeof response !== "object" ||
      typeof response.ok !== "boolean" ||
      !Number.isSafeInteger(response.status) ||
      response.status < 100 ||
      response.status > 599 ||
      !response.body ||
      typeof response.body.getReader !== "function"
    ) {
      return null;
    }
    return response.ok;
  } catch {
    return null;
  }
}

function credentialsFrom(input) {
  if (!input || typeof input !== "object") return null;
  try {
    return { email: input.email, password: input.password };
  } catch {
    return null;
  }
}

function idTokenFrom(input) {
  if (!input || typeof input !== "object") return null;
  try {
    return input.idToken;
  } catch {
    return null;
  }
}

function firebaseFailureCode(body, status) {
  const message = body?.error?.message;
  if (typeof message === "string") {
    if (message.startsWith("EMAIL_EXISTS")) return "EMAIL_EXISTS";
    if (
      message.startsWith("INVALID_LOGIN_CREDENTIALS") ||
      message.startsWith("EMAIL_NOT_FOUND") ||
      message.startsWith("INVALID_PASSWORD")
    ) return "INVALID_LOGIN_CREDENTIALS";
    if (message.startsWith("OPERATION_NOT_ALLOWED")) return "OPERATION_NOT_ALLOWED";
    if (message.startsWith("TOO_MANY_ATTEMPTS_TRY_LATER")) return "RATE_LIMITED";
  }
  return status === 429 ? "RATE_LIMITED" : "UNAVAILABLE";
}

function accountResult(body) {
  if (!isBoundedString(body?.localId, 128) || !isBoundedString(body?.idToken, 16_384)) {
    throw identityError("INVALID_RESPONSE");
  }
  return { uid: body.localId, idToken: body.idToken };
}

export function createFirebaseIdentityClient({
  apiKey,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
} = {}) {
  if (!isBoundedString(apiKey, 500) || typeof fetchImpl !== "function") {
    throw identityError("INVALID_RESPONSE");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0 || typeof setTimeoutImpl !== "function" || typeof clearTimeoutImpl !== "function") {
    throw identityError("INVALID_RESPONSE");
  }

  async function identityRequest(path, body) {
    const controller = new AbortController();
    const timer = setTimeoutImpl(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(
        `${API_BASE_URL}/${path}?key=${encodeURIComponent(apiKey)}`,
        {
          method: body === undefined ? "GET" : "POST",
          headers: body === undefined ? {} : { "Content-Type": "application/json" },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          signal: controller.signal,
        },
      );
      const ok = responseState(response);
      if (ok === null) throw identityError("INVALID_RESPONSE");

      let parsed;
      try {
        parsed = await readResponseJson(response);
      } catch (error) {
        if (ok) throw error;
        if (response.status === 429) throw identityError("RATE_LIMITED");
        throw identityError("UNAVAILABLE");
      }
      if (!ok) throw identityError(firebaseFailureCode(parsed, response.status));
      return parsed;
    } catch (error) {
      if (error instanceof FirebaseIdentityError) throw error;
      throw identityError("UNAVAILABLE");
    } finally {
      clearTimeoutImpl(timer);
    }
  }

  return Object.freeze({
    async getProject() {
      const body = await identityRequest("projects");
      if (body.projectId !== EXPECTED_PROJECT_ID) throw identityError("INVALID_RESPONSE");
      return { projectId: EXPECTED_PROJECT_ID };
    },
    async createAccount(input = {}) {
      const credentials = credentialsFrom(input);
      if (!credentials || !validCredentials(credentials)) throw identityError("INVALID_RESPONSE");
      const { email, password } = credentials;
      return accountResult(await identityRequest("accounts:signUp", {
        email,
        password,
        returnSecureToken: true,
      }));
    },
    async signIn(input = {}) {
      const credentials = credentialsFrom(input);
      if (!credentials || !validCredentials(credentials)) throw identityError("INVALID_RESPONSE");
      const { email, password } = credentials;
      return accountResult(await identityRequest("accounts:signInWithPassword", {
        email,
        password,
        returnSecureToken: true,
      }));
    },
    async deleteAccount(input = {}) {
      const idToken = idTokenFrom(input);
      if (!validIdToken(idToken)) throw identityError("INVALID_RESPONSE");
      await identityRequest("accounts:delete", { idToken });
    },
  });
}
