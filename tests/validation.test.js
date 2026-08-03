import test from "node:test";
import assert from "node:assert/strict";

import {
  authEmailToUsername,
  isValidUsername,
  loginIdentifierToAuthEmail,
  normalizeUsername,
  usernameToAuthEmail,
} from "../src/utils/validation.js";

test("preserves the username credential contract from main", () => {
  assert.equal(normalizeUsername(" Jane.Miller "), "jane.miller");
  assert.equal(isValidUsername("jane_miller-72"), true);
  assert.equal(isValidUsername("no spaces"), false);
  assert.equal(
    usernameToAuthEmail(" Jane.Miller "),
    "jane.miller@accounts.everwise.app",
  );
  assert.equal(
    authEmailToUsername("jane.miller@accounts.everwise.app"),
    "jane.miller",
  );
});

test("login accepts both existing usernames and sponsored email accounts", () => {
  assert.equal(
    loginIdentifierToAuthEmail(" Jane.Miller "),
    "jane.miller@accounts.everwise.app",
  );
  assert.equal(
    loginIdentifierToAuthEmail(" Jane@Example.com "),
    "jane@example.com",
  );
});
