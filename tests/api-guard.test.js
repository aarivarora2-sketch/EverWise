import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import {
  ApiRequestError,
  createRouteRateLimiter,
  readJsonBody,
} from "../server/apiGuard.mjs";

function request(body, headers = {}) {
  const stream = Readable.from([Buffer.from(body)]);
  stream.headers = headers;
  return stream;
}

test("JSON body errors have stable client-facing statuses", async () => {
  await assert.rejects(
    readJsonBody(request("{not json")),
    (error) =>
      error instanceof ApiRequestError &&
      error.status === 400 &&
      error.code === "INVALID_JSON",
  );

  await assert.rejects(
    readJsonBody(request("{}", { "content-length": "25001" })),
    (error) =>
      error instanceof ApiRequestError &&
      error.status === 413 &&
      error.code === "PAYLOAD_TOO_LARGE",
  );
});

test("route limiter blocks excess requests without trusting spoofed forwarding", () => {
  let now = 1_000;
  const limiter = createRouteRateLimiter({
    limit: 2,
    windowMs: 60_000,
    now: () => now,
  });
  const requestFrom = (remoteAddress, forwarded) => ({
    socket: { remoteAddress },
    headers: forwarded ? { "x-forwarded-for": forwarded } : {},
  });

  assert.equal(limiter.allow(requestFrom("203.0.113.10", "198.51.100.1")), true);
  assert.equal(limiter.allow(requestFrom("203.0.113.10", "198.51.100.2")), true);
  assert.equal(limiter.allow(requestFrom("203.0.113.10", "198.51.100.3")), false);

  assert.equal(limiter.allow(requestFrom("127.0.0.1", "198.51.100.20")), true);
  assert.equal(limiter.allow(requestFrom("127.0.0.1", "198.51.100.20")), true);
  assert.equal(limiter.allow(requestFrom("127.0.0.1", "198.51.100.20")), false);

  now += 60_001;
  assert.equal(limiter.allow(requestFrom("203.0.113.10")), true);
});
