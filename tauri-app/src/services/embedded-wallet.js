/**
 * Embedded Wallet Service
 * Integrates WalletService (PIN-based storage) with Aztec sidecar operations
 * Provides high-level interface for Aztec account management and PasswordManager contract interactions
 */

// Helper to get invoke function dynamically (for testing)
function getInvoke() {
  return window.__TAURI__.core.invoke;
}

export class EmbeddedWalletService {
  constructor(walletService) {
    this.walletService = walletService;
    this.aztecInitialized = false;
    this.aztecNodeUrl = 'http://localhost:8080';
    this.aztecAccount = null; // { address, secretKey, signingKey, salt }
  }

  /**
   * Initialize Aztec connection
   * @param {string} nodeUrl - Aztec node URL (default: http://localhost:8080)
   */
  async initializeAztec(nodeUrl = 'http://localhost:8080') {
    if (this.aztecInitialized) {
      return { success: true, message: 'Already initialized' };
    }

    try {
      const result = await getInvoke()('aztec_initialize', { nodeUrl });
      this.aztecNodeUrl = nodeUrl;
      this.aztecInitialized = true;
      return result;
    } catch (error) {
      console.error('Failed to initialize Aztec:', error);
      throw new Error(`Failed to initialize Aztec: ${error}`);
    }
  }

  /**
   * Create a new Aztec account and store credentials in encrypted wallet
   * @param {string} pin - User's PIN for encryption
   * @returns {Promise<{address: string}>}
   */
  async createAztecAccount(pin) {
    if (!this.aztecInitialized) {
      await this.initializeAztec();
    }

    try {
      // Create Aztec account via sidecar
      const accountData = await getInvoke()('aztec_create_account');
      
      // Store credentials in encrypted wallet
      const walletData = {
        private_key: accountData.secretKey,
        address: accountData.address,
        // Store additional Aztec-specific data
        aztec: {
          signingKey: accountData.signingKey,
          salt: accountData.salt,
        },
      };

      // Store credentials in encrypted wallet (using walletService which handles encryption)
      await getInvoke()('encrypt_and_store_wallet', {
        wallet: walletData,
        pin: pin,
      });
      
      // Update walletService state
      this.walletService.walletData = {
        address: accountData.address,
      };
      this.walletService.isUnlocked = true;

      this.aztecAccount = {
        address: accountData.address,
        secretKey: accountData.secretKey,
        signingKey: accountData.signingKey,
        salt: accountData.salt,
      };

      return {
        address: accountData.address,
      };
    } catch (error) {
      console.error('Failed to create Aztec account:', error);
      throw new Error(`Failed to create Aztec account: ${error}`);
    }
  }

  /**
   * Connect to existing Aztec account from stored credentials
   * @param {string} pin - User's PIN to decrypt wallet
   */
  async connectAztecAccount(pin) {
    if (!this.aztecInitialized) {
      await this.initializeAztec();
    }

    try {
      // Unlock wallet to get credentials
      const walletData = await this.walletService.unlockWallet(pin);
      
      if (!walletData.aztec) {
        throw new Error('No Aztec credentials found in wallet');
      }

      // Connect to Aztec account via sidecar
      const result = await getInvoke()('aztec_connect_account', {
        credentials: {
          secretKey: walletData.private_key,
          signingKey: walletData.aztec.signingKey,
          salt: walletData.aztec.salt,
        },
      });

      this.aztecAccount = {
        address: result.address,
        secretKey: walletData.private_key,
        signingKey: walletData.aztec.signingKey,
        salt: walletData.aztec.salt,
      };

      return {
        address: result.address,
      };
    } catch (error) {
      console.error('Failed to connect Aztec account:', error);
      throw new Error(`Failed to connect Aztec account: ${error}`);
    }
  }

  /**
   * Deploy Aztec account to the network
   * @returns {Promise<{txHash: string | null, alreadyDeployed: boolean}>}
   */
  async deployAztecAccount() {
    if (!this.aztecAccount) {
      throw new Error('No Aztec account connected');
    }

    try {
      const result = await getInvoke()('aztec_deploy_account');
      return result;
    } catch (error) {
      console.error('Failed to deploy Aztec account:', error);
      throw new Error(`Failed to deploy Aztec account: ${error}`);
    }
  }

  /**
   * Get current Aztec account address
   * @returns {string | null}
   */
  getAztecAddress() {
    return this.aztecAccount?.address || null;
  }

  /**
   * Check if Aztec account is connected
   * @returns {boolean}
   */
  isAztecConnected() {
    return !!this.aztecAccount;
  }

  /**
   * Helper to create FieldCompressedString from a string
   * @param {string} str - String to compress
   * @returns {{value: bigint}}
   */
  createCompressedString(str) {
    const padded = str.padEnd(31, ' ').slice(0, 31);
    const hash = BigInt(
      padded
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );
    return { value: hash };
  }

  /**
   * Deploy PasswordManager contract
   * @returns {Promise<{address: string, txHash: string | null}>}
   */
  async deployPasswordManager() {
    if (!this.aztecAccount) {
      throw new Error('No Aztec account connected');
    }

    try {
      const result = await getInvoke()('password_manager_deploy');
      return {
        address: result.address,
        txHash: result.txHash,
      };
    } catch (error) {
      console.error('Failed to deploy PasswordManager:', error);
      throw new Error(`Failed to deploy PasswordManager: ${error}`);
    }
  }

  /**
   * Create a password entry in PasswordManager contract
   * @param {string} contractAddress - PasswordManager contract address
   * @param {string} label - Password entry label
   * @param {string} password - Password value
   * @param {number} id - Unique entry ID
   * @param {number} randomness - Random value for security
   */
  async createPasswordEntry(contractAddress, label, password, id, randomness) {
    if (!this.aztecAccount) {
      throw new Error('No Aztec account connected');
    }

    try {
      const result = await getInvoke()('password_manager_create_entry', {
        contractAddress,
        label,
        password,
        id,
        randomness,
      });
      return result;
    } catch (error) {
      console.error('Failed to create password entry:', error);
      throw new Error(`Failed to create password entry: ${error}`);
    }
  }

  /**
   * Get password entry IDs for the current account
   * @param {string} contractAddress - PasswordManager contract address
   * @param {number} offset - Pagination offset
   */
  async getPasswordEntryIds(contractAddress, offset = 0) {
    if (!this.aztecAccount) {
      throw new Error('No Aztec account connected');
    }

    try {
      const result = await getInvoke()('password_manager_get_entry_ids', {
        contractAddress,
        offset,
      });
      return result;
    } catch (error) {
      console.error('Failed to get password entry IDs:', error);
      throw new Error(`Failed to get password entry IDs: ${error}`);
    }
  }

  /**
   * Get password entry by ID
   * @param {string} contractAddress - PasswordManager contract address
   * @param {number} id - Entry ID
   * @param {number} offset - Pagination offset
   */
  async getPasswordEntryById(contractAddress, id, offset = 0) {
    if (!this.aztecAccount) {
      throw new Error('No Aztec account connected');
    }

    try {
      const result = await getInvoke()('password_manager_get_entry_by_id', {
        contractAddress,
        id,
        offset,
      });
      return result;
    } catch (error) {
      console.error('Failed to get password entry:', error);
      throw new Error(`Failed to get password entry: ${error}`);
    }
  }

  /**
   * Update password entry
   * @param {string} contractAddress - PasswordManager contract address
   * @param {string} label - New label
   * @param {string} password - New password
   * @param {number} id - Entry ID
   * @param {number} randomness - Random value for security
   */
  async updatePasswordEntry(contractAddress, label, password, id, randomness) {
    if (!this.aztecAccount) {
      throw new Error('No Aztec account connected');
    }

    try {
      const result = await getInvoke()('password_manager_update_entry', {
        contractAddress,
        label,
        password,
        id,
        randomness,
      });
      return result;
    } catch (error) {
      console.error('Failed to update password entry:', error);
      throw new Error(`Failed to update password entry: ${error}`);
    }
  }

  /**
   * Delete password entry
   * @param {string} contractAddress - PasswordManager contract address
   * @param {number} id - Entry ID
   */
  async deletePasswordEntry(contractAddress, id) {
    if (!this.aztecAccount) {
      throw new Error('No Aztec account connected');
    }

    try {
      const result = await getInvoke()('password_manager_delete_entry', {
        contractAddress,
        id,
      });
      return result;
    } catch (error) {
      console.error('Failed to delete password entry:', error);
      throw new Error(`Failed to delete password entry: ${error}`);
    }
  }
}

