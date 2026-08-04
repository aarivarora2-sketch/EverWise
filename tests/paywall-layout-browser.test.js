import assert from "node:assert/strict";
import { spawn } from "node:child_process";
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
  || process.env.CI === "true"
  || process.env.EVERWISE_REQUIRE_BROWSER_GEOMETRY === "1";

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

  try {
    const port = await waitForDebugPort(profile, chrome);
    const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
    const target = targets.find((candidate) => candidate.type === "page");
    assert.ok(target?.webSocketDebuggerUrl, "Chrome did not expose a debuggable page");

    const cdp = await connectCdp(target.webSocketDebuggerUrl);
    try {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await cdp.send("Page.navigate", { url: `${url}${query}` });
      const encoded = await waitForGeometry(cdp);
      return extractGeometry(`<body data-geometry="${encoded}">`);
    } finally {
      cdp.close();
    }
  } finally {
    if (chrome.pid) {
      try {
        process.kill(-chrome.pid, "SIGTERM");
      } catch {
        // Chrome may have already exited after a failed startup.
      }
    }
    await waitForExit(chrome);
    await removeProfile(profile);
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForExit(processHandle) {
  if (processHandle.exitCode !== null) return;
  await Promise.race([
    new Promise((resolve) => processHandle.once("exit", resolve)),
    delay(1000),
  ]);
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

async function waitForDebugPort(profile, chrome) {
  const activePortFile = path.join(profile, "DevToolsActivePort");
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (chrome.exitCode !== null) throw new Error(`Chrome exited during startup (${chrome.exitCode})`);
    try {
      const [port] = (await readFile(activePortFile, "utf8")).trim().split("\n");
      if (/^\d+$/.test(port)) return Number(port);
    } catch {
      // Chrome creates the file after its debugging server is ready.
    }
    await delay(50);
  }
  throw new Error("Chrome did not start its debugging server within 5 seconds");
}

async function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  let nextId = 0;

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Chrome debugging socket did not open")), 5000);
    socket.addEventListener("open", () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
    socket.addEventListener("error", () => {
      clearTimeout(timer);
      reject(new Error("Chrome debugging socket failed"));
    }, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  return {
    close: () => socket.close(),
    send(method, params = {}) {
      const id = ++nextId;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Chrome did not answer ${method}`));
        }, 5000);
        pending.set(id, {
          resolve: (value) => {
            clearTimeout(timer);
            resolve(value);
          },
          reject: (error) => {
            clearTimeout(timer);
            reject(error);
          },
        });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

async function waitForGeometry(cdp) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const result = await cdp.send("Runtime.evaluate", {
      expression: "document.body?.dataset.geometry || null",
      returnByValue: true,
    });
    if (result.result?.value) return result.result.value;
    await delay(50);
  }
  throw new Error("Paywall did not publish browser geometry within 5 seconds");
}

test("real Paywall stays inside desktop and 768px browser viewports", browserTestOptions, async () => {
  await withLayoutServer(async (url) => {
    for (const width of [1280, 768]) {
      const geometry = await measure(url, width);
      assertFitsViewport(geometry, `${width}px browser`);
    }
  });
});

test("geometry proof detects a clipped wide-card regression", browserTestOptions, async () => {
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
