import { PasswordManagerContract } from "../artifacts/PasswordManager.js";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { TestWallet } from "@aztec/test-wallet/server";
import { createAztecNodeClient } from "@aztec/aztec.js/node";
import { deployPasswordManager } from "./utils.js";
import { AztecAddress } from "@aztec/stdlib/aztec-address";

import {
  INITIAL_TEST_SECRET_KEYS,
  INITIAL_TEST_ACCOUNT_SALTS,
  INITIAL_TEST_ENCRYPTION_KEYS,
} from "@aztec/accounts/testing";

describe("PasswordManager Contract", () => {
  let wallet: TestWallet;
  let alice: AztecAddress;
  let bob: AztecAddress;
  let passwordManager: PasswordManagerContract;

  // Helper to create a FieldCompressedString from a string
  // FieldCompressedString expects { value: FieldLike } where FieldLike is a bigint
  // This is a simplified encoding - in production you'd use proper string compression
  const createCompressedString = (s: string) => {
    const padded = s.padEnd(31, " ").slice(0, 31);
    // Convert string to a Field by hashing the character codes
    const hash = BigInt(
      padded
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0),
    );
    return { value: hash };
  };

  beforeAll(async () => {
    const aztecNode = await createAztecNodeClient("http://localhost:8080", {});
    wallet = await TestWallet.create(
      aztecNode,
      {
        dataDirectory: "pxe-test",
        proverEnabled: false,
      },
      {},
    );

    // Register initial test accounts manually because of this:
    // https://github.com/AztecProtocol/aztec-packages/blame/next/yarn-project/accounts/src/schnorr/lazy.ts#L21-L25
    [alice, bob] = await Promise.all(
      INITIAL_TEST_SECRET_KEYS.slice(0, 2).map(async (secret, i) => {
        const accountManager = await wallet.createSchnorrAccount(
          secret,
          INITIAL_TEST_ACCOUNT_SALTS[i],
          INITIAL_TEST_ENCRYPTION_KEYS[i],
        );
        return accountManager.address;
      }),
    );
  });

  beforeEach(async () => {
    passwordManager = await deployPasswordManager(wallet);
  });

  it("should create a password entry", async () => {
    const label = createCompressedString("Bank Account");
    const password = createCompressedString("secret123");
    const id = 1n;
    const randomness = 12345n;

    // Create password entry
    await passwordManager.methods
      .create_password_entry(label, password, alice, id, randomness)
      .send({ from: alice })
      .wait();

    // Verify the entry exists by checking if we can retrieve it
    const [entryIds, hasMore] = await passwordManager.methods
      .get_password_entry_ids(alice, 0)
      .simulate({ from: alice });

    expect(entryIds).toContain(id);
  });

  it("should retrieve password entry details", async () => {
    const label = createCompressedString("Email Account");
    const password = createCompressedString("mypassword");
    const id = 2n;
    const randomness = 67890n;

    // Create password entry
    await passwordManager.methods
      .create_password_entry(label, password, alice, id, randomness)
      .send({ from: alice })
      .wait();

    // Retrieve entry details
    const [retrievedLabel, retrievedPassword] =
      await passwordManager.methods
        .get_password_entry_by_id(alice, id, 0)
        .simulate({ from: alice });

    expect(retrievedLabel).toStrictEqual(label);
    expect(retrievedPassword).toStrictEqual(password);
  });

  it("should update a password entry", async () => {
    const label1 = createCompressedString("Original Label");
    const password1 = createCompressedString("oldpassword");
    const label2 = createCompressedString("Updated Label");
    const password2 = createCompressedString("newpassword");
    const id = 3n;
    const randomness1 = 11111n;
    const randomness2 = 22222n;

    // Create password entry
    await passwordManager.methods
      .create_password_entry(label1, password1, alice, id, randomness1)
      .send({ from: alice })
      .wait();

    // Update password entry
    await passwordManager.methods
      .update_password_entry(label2, password2, alice, id, randomness2)
      .send({ from: alice })
      .wait();

    // Verify the entry was updated
    const [retrievedLabel, retrievedPassword] =
      await passwordManager.methods
        .get_password_entry_by_id(alice, id, 0)
        .simulate({ from: alice });

    expect(retrievedLabel).toStrictEqual(label2);
    expect(retrievedPassword).toStrictEqual(password2);
  });

  it("should delete a password entry", async () => {
    const label = createCompressedString("To Delete");
    const password = createCompressedString("delete me");
    const id = 4n;
    const randomness = 33333n;

    // Create password entry
    await passwordManager.methods
      .create_password_entry(label, password, alice, id, randomness)
      .send({ from: alice })
      .wait();

    // Verify it exists
    const [entryIdsBefore, _] = await passwordManager.methods
      .get_password_entry_ids(alice, 0)
      .simulate({ from: alice });
    expect(entryIdsBefore).toContain(id);

    // Delete password entry
    await passwordManager.methods
      .delete_password_entry(alice, id)
      .send({ from: alice })
      .wait();

    // Verify it no longer exists
    const [entryIdsAfter, __] = await passwordManager.methods
      .get_password_entry_ids(alice, 0)
      .simulate({ from: alice });
    expect(entryIdsAfter).not.toContain(id);
  });

  it("should share a password entry with another user", async () => {
    const label = createCompressedString("Shared Entry");
    const password = createCompressedString("sharedpass");
    const id = 5n;
    const randomness = 44444n;

    // Create password entry
    await passwordManager.methods
      .create_password_entry(label, password, alice, id, randomness)
      .send({ from: alice })
      .wait();

    // Share with bob
    await passwordManager.methods
      .share_password_entry(alice, id, bob)
      .send({ from: alice })
      .wait();

    // Verify bob can see the shared entry
    const [sharedIds, hasMore] = await passwordManager.methods
      .get_sharedpassword_entry_ids(bob, 0)
      .simulate({ from: bob });

    expect(sharedIds).toContain(id);
  });

  it("should unshare a password entry", async () => {
    const label = createCompressedString("To Unshare");
    const password = createCompressedString("unshare me");
    const id = 6n;
    const randomness = 55555n;

    // Create and share password entry
    await passwordManager.methods
      .create_password_entry(label, password, alice, id, randomness)
      .send({ from: alice })
      .wait();

    await passwordManager.methods
      .share_password_entry(alice, id, bob)
      .send({ from: alice })
      .wait();

    // Verify bob has access
    const [sharedIdsBefore, _] = await passwordManager.methods
      .get_sharedpassword_entry_ids(bob, 0)
      .simulate({ from: bob });
    expect(sharedIdsBefore).toContain(id);

    // Unshare
    await passwordManager.methods
      .unshare_password_entry(alice, id, bob)
      .send({ from: alice })
      .wait();

    // Verify bob no longer has access
    const [sharedIdsAfter, __] = await passwordManager.methods
      .get_sharedpassword_entry_ids(bob, 0)
      .simulate({ from: bob });
    expect(sharedIdsAfter).not.toContain(id);
  });

  it("should retrieve shared password entries by owner", async () => {
    const label = createCompressedString("Filtered Share");
    const password = createCompressedString("filtered");
    const id = 7n;
    const randomness = 66666n;

    // Create and share password entry
    await passwordManager.methods
      .create_password_entry(label, password, alice, id, randomness)
      .send({ from: alice })
      .wait();

    await passwordManager.methods
      .share_password_entry(alice, id, bob)
      .send({ from: alice })
      .wait();

    // Retrieve shared entries filtered by owner
    const [sharedIds, hasMore] = await passwordManager.methods
      .get_sharedpassword_entry_ids_by_owner(bob, alice, 0)
      .simulate({ from: bob });

    expect(sharedIds).toContain(id);
  });
});

