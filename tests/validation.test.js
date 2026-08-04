import test from "node:test";
import assert from "node:assert/strict";

import {
  authEmailToUsername,
  isReservedSponsoredUsername,
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

test("the fixed sponsored username range is never valid for public signup", () => {
  for (let accountNumber = 1; accountNumber <= 500; accountNumber += 1) {
    const username = `EverWise${String(accountNumber).padStart(3, "0")}`;
    assert.equal(isReservedSponsoredUsername(username), true, username);
    assert.equal(isValidUsername(username), false, username);
  }
  assert.equal(isReservedSponsoredUsername("EverWise000"), false);
  assert.equal(isReservedSponsoredUsername("EverWise501"), false);
  assert.equal(isValidUsername("EverWise501"), true);
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
