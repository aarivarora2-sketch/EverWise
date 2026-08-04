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
        replace: (path) => {
          replacements.push(path);
          return true;
        },
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
        replace: (path) => {
          replacements.push(path);
          return true;
        },
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
          replace: (path) => {
            replacements.push(path);
            return true;
          },
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

test("fails closed when partner fragment history replacement cannot be confirmed", (t) => {
  withLocation(t, { pathname: "/join", search: "" }, () => {
    for (const replace of [
      () => {
        throw new Error(TOKEN);
      },
      null,
      () => undefined,
      () => false,
    ]) {
      assert.doesNotThrow(() => {
        assert.equal(
          consumePartnerFragment({
            hash: `#partner=${TOKEN}`,
            replace,
          }),
          null,
        );
      });
    }
  });
});

test("fails closed without surfacing errors from hostile fragment argument getters", () => {
  const hostileHash = {
    get hash() {
      throw new Error(TOKEN);
    },
    replace: () => true,
  };
  const hostileReplace = {
    hash: `#partner=${TOKEN}`,
    get replace() {
      throw new Error(TOKEN);
    },
  };

  for (const options of [hostileHash, hostileReplace]) {
    assert.doesNotThrow(() => {
      assert.equal(consumePartnerFragment(options), null);
    });
  }
});
