import test from "node:test";
import assert from "node:assert/strict";
import { consumePartnerFragment } from "../src/utils/partnerLinks.js";

const TOKEN = "a".repeat(43);

function withLocation(t, location, callback) {
  const originalWindow = globalThis.window;
  globalThis.window = { location };
  t.after(() => {
    globalThis.window = originalWindow;
  });
  return callback();
}

test("consumes a learner partner fragment and immediately removes it from history", (t) => {
  withLocation(t, { pathname: "/welcome", search: "?source=partner" }, () => {
    const replacements = [];

    assert.deepEqual(
      consumePartnerFragment({
        hash: `#partner=${TOKEN}`,
        replace: (path) => replacements.push(path),
      }),
      { kind: "learner", token: TOKEN },
    );
    assert.deepEqual(replacements, ["/welcome?source=partner"]);
  });
});

test("consumes an admin partner fragment and immediately removes it from history", (t) => {
  withLocation(t, { pathname: "/", search: "" }, () => {
    const replacements = [];

    assert.deepEqual(
      consumePartnerFragment({
        hash: `#partner-admin=${TOKEN}`,
        replace: (path) => replacements.push(path),
      }),
      { kind: "admin", token: TOKEN },
    );
    assert.deepEqual(replacements, ["/"]);
  });
});

test("rejects invalid or ambiguous fragments while scrubbing every recognized partner fragment", (t) => {
  withLocation(t, { pathname: "/join", search: "?keep=this" }, () => {
    for (const hash of [
      "#partner=short",
      `#partner=${TOKEN}&next=ignored`,
      `#partner=${TOKEN}&partner-admin=${TOKEN}`,
      "#not-a-partner=value",
    ]) {
      const replacements = [];
      assert.equal(
        consumePartnerFragment({
          hash,
          replace: (path) => replacements.push(path),
        }),
        null,
      );
      assert.deepEqual(
        replacements,
        hash.startsWith("#partner") ? ["/join?keep=this"] : [],
      );
    }
  });
});

test("never throws a partner token when fragment history replacement fails", (t) => {
  withLocation(t, { pathname: "/join", search: "" }, () => {
    assert.doesNotThrow(() => {
      consumePartnerFragment({
        hash: `#partner=${TOKEN}`,
        replace: () => {
          throw new Error(TOKEN);
        },
      });
    });
  });
});
