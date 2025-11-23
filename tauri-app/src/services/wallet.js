/**
 * Wallet Service
 * Handles wallet creation, storage, and unlocking via Rust backend
 */

// Import Tauri invoke function (window.__TAURI__.core.invoke)
const { invoke } = window.__TAURI__.core;

export class WalletService {
  constructor() {
    this.isUnlocked = false;
    this.walletData = null;
  }

  /**
   * Check if wallet exists
   * @returns {Promise<boolean>}
   */
  async walletExists() {
    try {
      return await invoke('wallet_exists');
    } catch (error) {
      console.error('Error checking wallet existence:', error);
      return false;
    }
  }

  /**
   * Create a new wallet and encrypt it with PIN
   * @param {string} pin - User's PIN (6 digits)
   * @returns {Promise<{address: string}>}
   */
  async createWallet(pin) {
    if (!pin || pin.length !== 6) {
      throw new Error('PIN must be 6 digits');
    }

    // TODO: Generate actual Aztec account
    // For now, create placeholder wallet data
    const walletData = {
      private_key: this.generatePlaceholderPrivateKey(),
      address: this.generatePlaceholderAddress(),
    };

    // Encrypt and store via Rust backend
    try {
      await invoke('encrypt_and_store_wallet', {
        wallet: walletData,
        pin: pin,
      });

      // Store wallet data in memory (but not the private key for security)
      this.walletData = {
        address: walletData.address,
      };
      this.isUnlocked = true;

      return {
        address: walletData.address,
      };
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet. Please try again.');
    }
  }

  /**
   * Unlock wallet with PIN
   * @param {string} pin - User's PIN
   * @returns {Promise<{address: string, privateKey: string}>}
   */
  async unlockWallet(pin) {
    if (this.isUnlocked && this.walletData) {
      // Already unlocked, return cached data
      return this.walletData;
    }

    if (!pin || pin.length !== 6) {
      throw new Error('PIN must be 6 digits');
    }

    try {
      // Decrypt wallet via Rust backend
      const walletData = await invoke('decrypt_wallet_with_pin', {
        pin: pin,
      });

      // Store in memory (will be used for Aztec account loading in Step 6)
      this.walletData = walletData;
      this.isUnlocked = true;

      return walletData;
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      // Check if it's a decryption error (wrong PIN)
      if (error.toString().includes('Decryption failed') || 
          error.toString().includes('Wrong PIN')) {
        throw new Error('Incorrect PIN');
      }
      throw new Error('Failed to unlock wallet. Please try again.');
    }
  }

  // Lock wallet (clear from memory)
  lockWallet() {
    this.walletData = null;
    this.isUnlocked = false;
  }

  /**
   * Get current wallet data (if unlocked)
   * @returns {{address: string, privateKey: string} | null}
   */
  getWalletData() {
    if (!this.isUnlocked || !this.walletData) {
      return null;
    }
    return this.walletData;
  }

  /**
   * Check if wallet is currently unlocked
   * @returns {boolean}
   */
  isWalletUnlocked() {
    return this.isUnlocked;
  }

  /**
   * Delete wallet (for testing/reset)
   * @returns {Promise<void>}
   */
  async deleteWallet() {
    try {
      await invoke('delete_wallet');
      this.lockWallet();
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw new Error('Failed to delete wallet');
    }
  }

  /**
   * Generate placeholder private key
   * @returns {string}
   */
  generatePlaceholderPrivateKey() {
    // Generate a random hex string (64 chars = 32 bytes)
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return '0x' + result;
  }

  /**
   * Generate placeholder address
   * @returns {string}
   */
  generatePlaceholderAddress() {
    // Generate a random hex string (64 chars)
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return '0x' + result;
  }
}

// Export singleton instance
export const walletService = new WalletService();

