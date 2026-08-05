import test from "node:test";
import assert from "node:assert/strict";
import { getPathLayoutMetrics } from "../src/utils/pathLayout.js";

test("default text keeps the established compact path geometry", () => {
  assert.deepEqual(getPathLayoutMetrics("size-2"), {
    nodeBoxHeight: 182,
    nodeSlot: 340,
    connectorGap: 158,
    textScale: 1,
    phaseBandHeight: 88,
    phaseBottom: 32,
    pathBottomClearance: 96,
  });
});

test("the trail gap grows with the text instead of being squeezed out", () => {
  // The gap between a node box and the next is the room the trail dots live
  // in. It used to shrink as the text grew (158px down to 96px), which bunched
  // both dots against the following node while the previous one drifted away.
  const base = getPathLayoutMetrics("size-2");
  let previousGap = getPathLayoutMetrics("size-1").connectorGap;

  for (let size = 2; size <= 10; size += 1) {
    const metrics = getPathLayoutMetrics(`size-${size}`);
    const gap = metrics.nodeSlot - metrics.nodeBoxHeight;
    assert.equal(gap, metrics.connectorGap);
    assert.ok(gap >= base.connectorGap, `size-${size} gap shrank below default`);
    assert.ok(gap >= previousGap, `size-${size} gap shrank from the step before`);
    previousGap = gap;
  }

  // At the largest text the trail is meaningfully longer, not merely equal.
  assert.ok(getPathLayoutMetrics("size-10").connectorGap > base.connectorGap);
});

test("largest text reserves room for two-line labels and phase headings", () => {
  const metrics = getPathLayoutMetrics("size-10");

  assert.ok(metrics.nodeBoxHeight >= 288);
  assert.ok(metrics.nodeSlot >= metrics.nodeBoxHeight + 96);
  assert.ok(metrics.phaseBandHeight >= 154);
  assert.ok(metrics.pathBottomClearance >= 149);
});

test("every larger text step produces non-decreasing path geometry", () => {
  let previous = getPathLayoutMetrics("size-1");

  for (let size = 2; size <= 10; size += 1) {
    const current = getPathLayoutMetrics(`size-${size}`);
    assert.ok(current.nodeBoxHeight >= previous.nodeBoxHeight);
    assert.ok(current.nodeSlot >= previous.nodeSlot);
    assert.ok(current.phaseBandHeight >= previous.phaseBandHeight);
    assert.ok(current.pathBottomClearance >= previous.pathBottomClearance);
    previous = current;
  }
});
