import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { EventEmitter } from "node:events";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { constants } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMMON_BROWSER_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

async function isExecutable(candidate) {
  if (!candidate) return false;
  try {
    await access(candidate, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function findBrowser() {
  const configured = process.env.EVERWISE_CHROME_BIN;
  if (configured) return (await isExecutable(configured)) ? configured : null;

  for (const candidate of COMMON_BROWSER_PATHS) {
    if (await isExecutable(candidate)) return candidate;
  }

  for (const directory of (process.env.PATH || "").split(path.delimiter)) {
    for (const name of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"] ) {
      const candidate = path.join(directory, name);
      if (await isExecutable(candidate)) return candidate;
    }
  }
  return null;
}

function extractGeometry(dom) {
  const match = dom.match(/data-geometry="([^"]+)"/);
  assert.ok(match, "Headless browser did not publish Paywall geometry");
  return JSON.parse(Buffer.from(match[1], "base64").toString("utf8"));
}

function assertFitsViewport(geometry, label) {
  const tolerance = 0.5;
  assert.ok(
    geometry.scrollWidth <= geometry.clientWidth + tolerance,
    `${label}: document scrollWidth ${geometry.scrollWidth} exceeds clientWidth ${geometry.clientWidth}`,
  );

  const tracked = [
    ["Paywall root", geometry.root],
    ...geometry.cards.map((rect, index) => [`plan card ${index + 1}`, rect]),
    ["checkout action", geometry.action],
  ];
  for (const [name, rect] of tracked) {
    assert.ok(rect.left >= -tolerance, `${label}: ${name} starts outside the viewport`);
    assert.ok(
      rect.right <= geometry.clientWidth + tolerance,
      `${label}: ${name} ends at ${rect.right}, beyond viewport ${geometry.clientWidth}`,
    );
    assert.ok(
      rect.width <= geometry.clientWidth + tolerance,
      `${label}: ${name} width ${rect.width} exceeds viewport ${geometry.clientWidth}`,
    );
  }
}

const browserPath = await findBrowser();
const browserRequired = Boolean(process.env.EVERWISE_CHROME_BIN)
  || ciRequiresGeometry(process.env.CI)
  || process.env.EVERWISE_REQUIRE_BROWSER_GEOMETRY === "1";

function ciRequiresGeometry(value) {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== "" && !["0", "false", "no", "off"].includes(normalized);
}

if (!browserPath && browserRequired) {
  throw new Error(
    "Paywall geometry requires Chrome/Chromium in CI. Install it or set EVERWISE_CHROME_BIN.",
  );
}

const browserTestOptions = browserPath
  ? {}
  : { skip: "Chrome/Chromium unavailable; set EVERWISE_CHROME_BIN to run Paywall geometry checks" };

async function withLayoutServer(run) {
  const server = await createServer({
    root: REPO_ROOT,
    configFile: false,
    logLevel: "silent",
    plugins: [react()],
    server: { host: "127.0.0.1", port: 0 },
  });
  await server.listen();
  const address = server.httpServer.address();
  assert.ok(address && typeof address !== "string", "Vite did not expose a local test port");
  try {
    await run(`http://127.0.0.1:${address.port}/tests/fixtures/paywall-layout.html`);
  } finally {
    await server.close();
  }
}

async function measure(url, width, mutation = "") {
  const profile = await mkdtemp(path.join(os.tmpdir(), "everwise-paywall-chrome-"));
  const query = mutation ? `?mutation=${encodeURIComponent(mutation)}` : "";
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-sync",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    "--remote-debugging-port=0",
    "about:blank",
  ];
  if (typeof process.getuid === "function" && process.getuid() === 0) args.unshift("--no-sandbox");

  const chrome = spawn(browserPath, args, { detached: true, stdio: "ignore" });
  const measurement = boundedAbort(10_000, "Paywall browser measurement timed out");

  try {
    const port = await waitForDebugPort(profile, chrome, { signal: measurement.signal });
    const targets = await fetchDevtoolsTargets(port, {
      signal: measurement.signal,
      timeoutMs: 3000,
    });
    const target = targets.find((candidate) => candidate.type === "page");
    assert.ok(target?.webSocketDebuggerUrl, "Chrome did not expose a debuggable page");

    const cdp = await connectCdp(target.webSocketDebuggerUrl, {
      signal: measurement.signal,
      timeoutMs: 3000,
    });
    try {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await cdp.send("Page.navigate", { url: `${url}${query}` });
      const encoded = await waitForGeometry(cdp, {
        signal: measurement.signal,
        timeoutMs: 5000,
      });
      return extractGeometry(`<body data-geometry="${encoded}">`);
    } finally {
      cdp.close();
    }
  } finally {
    measurement.cleanup();
    let stopped = false;
    try {
      stopped = await stopChromeProcess(chrome);
    } finally {
      if (stopped || chrome.exitCode !== null) await removeProfile(profile);
    }
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function boundedAbort(timeoutMs, message, parentSignal) {
  const controller = new AbortController();
  const abortFromParent = () => {
    controller.abort(parentSignal.reason || new Error(message));
  };
  if (parentSignal?.aborted) abortFromParent();
  else parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  const timer = setTimeout(() => controller.abort(new Error(message)), timeoutMs);
  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timer);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}

async function waitForExit(processHandle, timeoutMs = 1000) {
  if (processHandle.exitCode !== null) return true;
  const result = await Promise.race([
    new Promise((resolve) => processHandle.once("exit", () => resolve(true))),
    delay(timeoutMs).then(() => false),
  ]);
  return result;
}

async function stopChromeProcess(processHandle, {
  killGroup = (pid, signal) => process.kill(-pid, signal),
  killWaitMs = 1000,
  termWaitMs = 1000,
} = {}) {
  if (processHandle.exitCode !== null) return true;
  if (processHandle.pid) {
    try {
      killGroup(processHandle.pid, "SIGTERM");
    } catch {
      // Chrome may have already exited after a failed startup.
    }
  }
  if (await waitForExit(processHandle, termWaitMs)) return true;
  if (processHandle.pid) {
    try {
      killGroup(processHandle.pid, "SIGKILL");
    } catch {
      // The exit event may be arriving after the TERM wait expired.
    }
  }
  if (await waitForExit(processHandle, killWaitMs)) return true;
  throw new Error("Chrome did not exit after TERM and KILL");
}

async function fetchDevtoolsTargets(port, {
  fetchImpl = fetch,
  signal,
  timeoutMs = 5000,
} = {}) {
  const bound = boundedAbort(timeoutMs, "DevTools discovery timed out", signal);
  try {
    const response = await fetchImpl(`http://127.0.0.1:${port}/json/list`, {
      signal: bound.signal,
    });
    return response.json();
  } finally {
    bound.cleanup();
  }
}

async function removeProfile(profile) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      await rm(profile, { recursive: true, force: true });
      return;
    } catch (error) {
      if (error.code !== "ENOTEMPTY" || attempt === 19) throw error;
      await delay(50);
    }
  }
}

async function waitForDebugPort(profile, chrome, { signal } = {}) {
  const activePortFile = path.join(profile, "DevToolsActivePort");
  for (let attempt = 0; attempt < 300; attempt += 1) {
    if (signal?.aborted) throw signal.reason;
    if (chrome.exitCode !== null) throw new Error(`Chrome exited during startup (${chrome.exitCode})`);
    try {
      const [port] = (await readFile(activePortFile, "utf8")).trim().split("\n");
      if (/^\d+$/.test(port)) return Number(port);
    } catch {
      // Chrome creates the file after its debugging server is ready.
    }
    await delay(50);
  }
  throw new Error("Chrome did not start its debugging server within 15 seconds");
}

async function connectCdp(webSocketUrl, {
  WebSocketImpl = WebSocket,
  signal,
  timeoutMs = 5000,
} = {}) {
  const socket = new WebSocketImpl(webSocketUrl);
  const pending = new Map();
  let nextId = 0;
  const bound = boundedAbort(timeoutMs, "Chrome debugging socket timed out", signal);

  try {
    await new Promise((resolve, reject) => {
    const abort = () => {
      socket.close();
      reject(bound.signal.reason);
    };
    bound.signal.addEventListener("abort", abort, { once: true });
    socket.addEventListener("open", () => {
      bound.signal.removeEventListener("abort", abort);
      resolve();
    }, { once: true });
    socket.addEventListener("error", () => {
      bound.signal.removeEventListener("abort", abort);
      reject(new Error("Chrome debugging socket failed"));
    }, { once: true });
    });
  } finally {
    bound.cleanup();
  }

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    close() {
      for (const operation of pending.values()) {
        operation.reject(new Error("Chrome debugging socket closed"));
      }
      pending.clear();
      socket.close();
    },
    send(method, params = {}, { signal: operationSignal } = {}) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        if (operationSignal?.aborted) {
          reject(operationSignal.reason);
          return;
        }
        const abort = () => {
          pending.delete(id);
          clearTimeout(timer);
          operationSignal?.removeEventListener("abort", abort);
          reject(operationSignal.reason);
        };
        const timer = setTimeout(() => {
          pending.delete(id);
          operationSignal?.removeEventListener("abort", abort);
          reject(new Error(`Chrome did not answer ${method}`));
        }, 5000);
        operationSignal?.addEventListener("abort", abort, { once: true });
        pending.set(id, {
          resolve: (value) => {
            clearTimeout(timer);
            operationSignal?.removeEventListener("abort", abort);
            resolve(value);
          },
          reject: (error) => {
            clearTimeout(timer);
            operationSignal?.removeEventListener("abort", abort);
            reject(error);
          },
        });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

async function waitForGeometry(cdp, { signal, timeoutMs = 5000 } = {}) {
  const bound = boundedAbort(timeoutMs, "Paywall geometry timed out", signal);
  try {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const result = await cdp.send("Runtime.evaluate", {
        expression: "document.body?.dataset.geometry || null",
        returnByValue: true,
      }, { signal: bound.signal });
      if (result.result?.value) return result.result.value;
      await delay(50);
    }
    throw new Error("Paywall did not publish browser geometry within 5 seconds");
  } finally {
    bound.cleanup();
  }
}

test("conventional truthy CI values require the browser geometry gate", () => {
  for (const value of ["1", "true", "TRUE", "yes", "on"]) {
    assert.equal(ciRequiresGeometry(value), true, `CI=${value} should require Chrome`);
  }
  for (const value of [undefined, "", "0", "false", "FALSE", "no", "off"]) {
    assert.equal(ciRequiresGeometry(value), false, `CI=${String(value)} should not require Chrome`);
  }
});

test("hung DevTools discovery is aborted within its bound", { timeout: 1000 }, async () => {
  let receivedSignal = false;
  const fetchImpl = (_url, options = {}) => {
    if (!options.signal) return Promise.reject(new Error("missing AbortSignal"));
    receivedSignal = true;
    return new Promise((_resolve, reject) => {
      options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
    });
  };

  await assert.rejects(
    fetchDevtoolsTargets(1, { fetchImpl, timeoutMs: 20 }),
    /DevTools discovery timed out/,
  );
  assert.equal(receivedSignal, true);
});

test("a stalled debugging socket is aborted and closed", { timeout: 1000 }, async () => {
  let socket;
  class StalledSocket {
    constructor() {
      socket = this;
      this.closed = false;
      this.listeners = new Map();
      setTimeout(() => this.listeners.get("error")?.(), 75);
    }

    addEventListener(name, listener) {
      this.listeners.set(name, listener);
    }

    close() {
      this.closed = true;
    }
  }

  await assert.rejects(
    connectCdp("ws://controlled.invalid", { WebSocketImpl: StalledSocket, timeoutMs: 20 }),
    /Chrome debugging socket timed out/,
  );
  assert.equal(socket.closed, true);
});

test("hung geometry evaluation is aborted within its bound", { timeout: 1000 }, async () => {
  const cdp = {
    send(_method, _params, options = {}) {
      if (!options.signal) return Promise.reject(new Error("missing AbortSignal"));
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
      });
    },
  };

  await assert.rejects(
    waitForGeometry(cdp, { timeoutMs: 20 }),
    /Paywall geometry timed out/,
  );
});

test("TERM-resistant browser cleanup escalates to KILL and confirms exit", { timeout: 1000 }, async () => {
  const processHandle = new EventEmitter();
  processHandle.exitCode = null;
  processHandle.pid = 42;
  const signals = [];
  const killGroup = (_pid, signal) => {
    signals.push(signal);
    if (signal === "SIGKILL") {
      processHandle.exitCode = 0;
      queueMicrotask(() => processHandle.emit("exit", 0));
    }
  };

  const stopped = await stopChromeProcess(processHandle, {
    killGroup,
    termWaitMs: 10,
    killWaitMs: 50,
  });

  assert.deepEqual(signals, ["SIGTERM", "SIGKILL"]);
  assert.equal(stopped, true);
});

test("real Paywall stays inside desktop and 768px browser viewports", { ...browserTestOptions, timeout: 45_000 }, async () => {
  await withLayoutServer(async (url) => {
    for (const width of [1280, 768]) {
      const geometry = await measure(url, width);
      assertFitsViewport(geometry, `${width}px browser`);
    }
  });
});

test("geometry proof detects a clipped wide-card regression", { ...browserTestOptions, timeout: 45_000 }, async () => {
  await withLayoutServer(async (url) => {
    const geometry = await measure(url, 768, "wide-card");
    assert.ok(
      geometry.scrollWidth <= geometry.clientWidth + 0.5,
      "mutation should demonstrate why document overflow alone is insufficient",
    );
    assert.throws(
      () => assertFitsViewport(geometry, "wide-card mutation"),
      /plan card .*beyond viewport|plan card .*width .* exceeds viewport/,
    );
  });
});
