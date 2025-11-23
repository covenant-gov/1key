import { Wallet } from "@aztec/aztec.js/wallet";
import {
  PasswordManagerContract,
  PasswordManagerContractArtifact,
} from "../artifacts/PasswordManager.js";
import { Contract } from "@aztec/aztec.js/contracts";

/**
 * Deploys the PasswordManager contract.
 * @param deployer - The wallet to deploy the contract with.
 * @returns A deployed contract instance.
 */
export async function deployPasswordManager(
  deployer: Wallet,
): Promise<PasswordManagerContract> {
  const deployerAddress = (await deployer.getAccounts())[0]!.item;
  // No intializer
  const deployMethod = await Contract.deploy(
    deployer,
    PasswordManagerContractArtifact,
    [],
  );
  const tx = await deployMethod.send({
    from: deployerAddress,
  });
  const contract = await tx.deployed();
  return contract as PasswordManagerContract;
}
