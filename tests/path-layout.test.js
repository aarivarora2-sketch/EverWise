import test from "node:test";
import assert from "node:assert/strict";
import { getPathLayoutMetrics } from "../src/utils/pathLayout.js";

test("default text keeps the established compact path geometry", () => {
  assert.deepEqual(getPathLayoutMetrics("size-2"), {
    nodeBoxHeight: 182,
    nodeSlot: 340,
    phaseBandHeight: 88,
    phaseBottom: 32,
    pathBottomClearance: 96,
  });
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
