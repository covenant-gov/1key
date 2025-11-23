#!/usr/bin/env node
/**
 * Aztec Sidecar - Node.js process for Aztec operations
 * Communicates with Tauri frontend via stdin/stdout JSON-RPC-like protocol
 */

import {
  Fr,
  createLogger,
  createAztecNodeClient,
  AccountWallet,
  AccountManager,
  AztecAddress,
  AccountWalletWithSecretKey,
  AztecNode,
} from '@aztec/aztec.js';
import { SponsoredFPCContractArtifact } from '@aztec/noir-contracts.js/SponsoredFPC';
import { SPONSORED_FPC_SALT } from '@aztec/constants';
import { poseidon2Hash } from '@aztec/foundation/crypto';
import { getEcdsaRAccount } from '@aztec/accounts/ecdsa/lazy';
import { getSchnorrAccount } from '@aztec/accounts/schnorr/lazy';
import { getPXEServiceConfig } from '@aztec/pxe/config';
import { createPXEService } from '@aztec/pxe/client/lazy';
import { getInitialTestAccounts } from '@aztec/accounts/testing';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js';
import { siloNullifier } from '@aztec/stdlib/hash';

const PROVER_ENABLED = true;
const logger = createLogger('aztec-sidecar');

// Global state
let pxe = null;
let aztecNode = null;
let accountManager = null;
let connectedWallet = null;

// Read from stdin and write to stdout
process.stdin.setEncoding('utf8');
process.stdout.setEncoding('utf8');

// Buffer for incomplete JSON messages
let buffer = '';

process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  
  // Try to parse complete JSON messages
  const lines = buffer.split('\n');
  buffer = lines.pop() || ''; // Keep incomplete line in buffer
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const request = JSON.parse(line);
        const response = await handleRequest(request);
        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (error) {
        process.stdout.write(JSON.stringify({
          id: null,
          error: {
            code: -32700,
            message: 'Parse error',
            data: error.message,
          },
        }) + '\n');
      }
    }
  }
});

async function handleRequest(request) {
  const { id, method, params } = request;
  
  try {
    let result;
    
    switch (method) {
      case 'initialize':
        result = await initialize(params.nodeUrl);
        break;
      
      case 'createAccount':
        result = await createAccount();
        break;
      
      case 'connectExistingAccount':
        result = await connectExistingAccount(params.credentials);
        break;
      
      case 'deployAccount':
        result = await deployAccount();
        break;
      
      case 'getAddress':
        result = connectedWallet ? { address: connectedWallet.getAddress().toString() } : null;
        break;
      
      case 'test':
        result = { success: true, message: 'Aztec sidecar is running' };
        break;
      
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    return { id, result };
  } catch (error) {
    return {
      id,
      error: {
        code: -32000,
        message: error.message,
        data: error.stack,
      },
    };
  }
}

async function initialize(nodeUrl) {
  aztecNode = await createAztecNodeClient(nodeUrl);
  
  const config = getPXEServiceConfig();
  config.l1Contracts = await aztecNode.getL1ContractAddresses();
  config.proverEnabled = PROVER_ENABLED;
  pxe = await createPXEService(aztecNode, config);
  
  await pxe.registerContract({
    instance: await getSponsoredFPCContract(),
    artifact: SponsoredFPCContractArtifact,
  });
  
  const nodeInfo = await pxe.getNodeInfo();
  logger.info('PXE Connected to node', nodeInfo);
  
  return { success: true, nodeInfo };
}

async function getSponsoredFPCContract() {
  const { getContractInstanceFromInstantiationParams } = await import('@aztec/aztec.js');
  return await getContractInstanceFromInstantiationParams(
    SponsoredFPCContractArtifact,
    { salt: new Fr(SPONSORED_FPC_SALT) }
  );
}

async function getNewAccountCredentials() {
  const DEPLOYER_SECRET_PHRASE = process.env.DEPLOYER_SECRET_PHRASE || 'hola';
  const DEPLOYER_SALT = process.env.DEPLOYER_SALT || '1337';
  const DEPLOYER_SECRET = await poseidon2Hash([
    Fr.fromBufferReduce(Buffer.from(DEPLOYER_SECRET_PHRASE.padEnd(32, '#'), 'utf8')),
  ]);
  const secretKey = DEPLOYER_SECRET;
  const salt = Fr.fromString(DEPLOYER_SALT);
  const signingKey = Buffer.from(DEPLOYER_SECRET.toBuffer().subarray(0, 32));
  
  return { secretKey, salt, signingKey };
}

async function createAccount() {
  if (!pxe) {
    throw new Error('PXE not initialized');
  }
  
  const { secretKey, salt, signingKey } = await getNewAccountCredentials();
  
  const ecdsaAccount = await getEcdsaRAccount(pxe, secretKey, signingKey, salt);
  await ecdsaAccount.register();
  const ecdsaWallet = await ecdsaAccount.getWallet();
  
  accountManager = ecdsaAccount;
  connectedWallet = ecdsaWallet;
  
  return {
    address: ecdsaWallet.getAddress().toString(),
    secretKey: secretKey.toString(),
    signingKey: signingKey.toString('hex'),
    salt: salt.toString(),
  };
}

async function connectExistingAccount(credentials) {
  if (!pxe) {
    throw new Error('PXE not initialized');
  }
  
  const secretKeyFr = Fr.fromString(credentials.secretKey);
  const saltFr = Fr.fromString(credentials.salt);
  const signingKeyBuf = Buffer.from(credentials.signingKey, 'hex');
  
  const ecdsaAccount = await getEcdsaRAccount(pxe, secretKeyFr, signingKeyBuf, saltFr);
  await ecdsaAccount.register();
  const ecdsaWallet = await ecdsaAccount.getWallet();
  
  accountManager = ecdsaAccount;
  connectedWallet = ecdsaWallet;
  
  return {
    address: ecdsaWallet.getAddress().toString(),
  };
}

async function deployAccount() {
  if (!accountManager) {
    throw new Error('No account manager');
  }
  
  const accountInitialized = await isInitializationNullifierPublished(
    aztecNode,
    accountManager.getAddress()
  );
  
  if (accountInitialized) {
    return { alreadyDeployed: true, txHash: null };
  }
  
  try {
    const sponsoredFPCContract = await getSponsoredFPCContract();
    const paymentMethod = new SponsoredFeePaymentMethod(sponsoredFPCContract.address);
    const deployMethod = await accountManager.getDeployMethod();
    
    if (!deployMethod) {
      throw new Error('Failed to get deploy method');
    }
    
    const receipt = await accountManager.deploy({ fee: { paymentMethod } }).wait({ timeout: 900 });
    const txHash = receipt.txHash ? receipt.txHash.toString() : null;
    
    logger.info('Deployment completed', { status: receipt.status, txHash });
    return { txHash, alreadyDeployed: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (
      errorMessage.includes('Existing nullifier') ||
      errorMessage.includes('Invalid tx: Existing nullifier')
    ) {
      logger.info('Account already deployed');
      return { alreadyDeployed: true, txHash: null };
    }
    
    throw error;
  }
}

async function isInitializationNullifierPublished(node, address) {
  const initNullifier = await siloNullifier(address, address.toField());
  const witness = await node.getNullifierMembershipWitness('latest', initNullifier);
  return !!witness;
}

// Handle process termination
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Send ready signal
process.stdout.write(JSON.stringify({ ready: true }) + '\n');

