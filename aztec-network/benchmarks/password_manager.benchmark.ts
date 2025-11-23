import { type Wallet } from "@aztec/aztec.js/wallet";
import { AztecAddress } from "@aztec/aztec.js/addresses";
import { createAztecNodeClient, waitForNode } from "@aztec/aztec.js/node";
import { type ContractFunctionInteractionCallIntent } from "@aztec/aztec.js/authorization";
import {
  registerInitialSandboxAccountsInWallet,
  TestWallet,
} from "@aztec/test-wallet/server";
import {
  Benchmark,
  type BenchmarkContext,
} from "@defi-wonderland/aztec-benchmark";

import { PasswordManagerContract } from "../src/artifacts/PasswordManager.js";

// Extend the BenchmarkContext from the new package
interface PasswordManagerBenchmarkContext extends BenchmarkContext {
  wallet: Wallet;
  deployer: AztecAddress;
  accounts: AztecAddress[];
  passwordManagerContract: PasswordManagerContract;
}

// Use export default class extending Benchmark
export default class PasswordManagerBenchmark extends Benchmark {
  /**
   * Sets up the benchmark environment for the PasswordManager contract.
   * Creates PXE client, gets accounts, and deploys the contract.
   */
  async setup(): Promise<PasswordManagerBenchmarkContext> {
    const { NODE_URL = "http://localhost:8080" } = process.env;
    const aztecNode = createAztecNodeClient(NODE_URL);
    await waitForNode(aztecNode);

    const wallet: TestWallet = await TestWallet.create(aztecNode);
    const accounts: AztecAddress[] =
      await registerInitialSandboxAccountsInWallet(wallet);

    const [deployer] = accounts;

    // PasswordManager contract deployed without initializer (there is none)
    const passwordManagerContract = await PasswordManagerContract.deploy(wallet)
      .send({ from: deployer })
      .deployed();

    return { wallet, deployer, accounts, passwordManagerContract };
  }

  /**
   * Returns the list of PasswordManager methods to be benchmarked.
   */
  getMethods(
    context: PasswordManagerBenchmarkContext,
  ): ContractFunctionInteractionCallIntent[] {
    const { passwordManagerContract, wallet, deployer } = context;

    // Helper to create a compressed string (31 characters, padded with spaces)
    const createCompressedString = (s: string) => {
      const padded = s.padEnd(31, " ").slice(0, 31);
      const hash = BigInt(
        padded
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0),
      );
      return { value: hash };
    };

    const methods: ContractFunctionInteractionCallIntent[] = [
      {
        caller: deployer,
        action: passwordManagerContract
          .withWallet(wallet)
          .methods.create_password_entry(
            createCompressedString("Bank Account"),
            createCompressedString("secret123"),
            deployer,
            1n,
            12345n,
          ),
      },
      {
        caller: deployer,
        action: passwordManagerContract
          .withWallet(wallet)
          .methods.update_password_entry(
            createCompressedString("Updated Account"),
            createCompressedString("newpassword"),
            deployer,
            1n,
            67890n,
          ),
      },
      {
        caller: deployer,
        action: passwordManagerContract
          .withWallet(wallet)
          .methods.delete_password_entry(deployer, 1n),
      },
    ];

    return methods;
  }
}
