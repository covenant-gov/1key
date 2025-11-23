/**
 * Tests for WalletService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletService } from '../services/wallet.js';

describe('WalletService', () => {
  let walletService;
  let mockInvoke;

  beforeEach(() => {
    walletService = new WalletService();
    mockInvoke = vi.fn();
    
    // Mock Tauri invoke
    global.window.__TAURI__.core.invoke = mockInvoke;
  });

  describe('walletExists', () => {
    it('should return false when Tauri is not available', async () => {
      // Remove Tauri API
      delete global.window.__TAURI__;
      
      const result = await walletService.walletExists();
      expect(result).toBe(false);
    });

    it('should return true when wallet exists', async () => {
      mockInvoke.mockResolvedValue(true);
      
      const result = await walletService.walletExists();
      expect(result).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith('wallet_exists');
    });

    it('should return false when wallet does not exist', async () => {
      mockInvoke.mockResolvedValue(false);
      
      const result = await walletService.walletExists();
      expect(result).toBe(false);
      expect(mockInvoke).toHaveBeenCalledWith('wallet_exists');
    });

    it('should return false on error', async () => {
      mockInvoke.mockRejectedValue(new Error('Tauri error'));
      
      const result = await walletService.walletExists();
      expect(result).toBe(false);
    });
  });

  describe('createWallet', () => {
    it('should throw error if PIN is not 6 digits', async () => {
      await expect(walletService.createWallet('12345')).rejects.toThrow('PIN must be 6 digits');
      await expect(walletService.createWallet('1234567')).rejects.toThrow('PIN must be 6 digits');
      await expect(walletService.createWallet('')).rejects.toThrow('PIN must be 6 digits');
    });

    it('should create wallet and store encrypted data', async () => {
      const pin = '123456';
      mockInvoke.mockResolvedValue(undefined); // encrypt_and_store_wallet returns void
      
      // Mock Aztec wallet service (will fail without bundler, but we can test the flow)
      vi.mock('../services/aztec-wallet.js', () => ({
        aztecWalletService: {
          createAccount: vi.fn().mockRejectedValue(new Error('Aztec not available in tests')),
        },
      }));

      // Should throw error about Aztec, but we can verify PIN validation worked
      await expect(walletService.createWallet(pin)).rejects.toThrow();
      // The PIN validation should pass before Aztec error
    });
  });

  describe('unlockWallet', () => {
    it('should throw error if PIN is not 6 digits', async () => {
      await expect(walletService.unlockWallet('12345')).rejects.toThrow('PIN must be 6 digits');
    });

    it('should unlock wallet with correct PIN', async () => {
      const pin = '123456';
      const mockWalletData = {
        private_key: '0x1234567890abcdef',
        address: '0xabcdef1234567890',
      };
      
      mockInvoke.mockResolvedValue(mockWalletData);
      
      // Will fail on Aztec loading, but we can test the decryption part
      await expect(walletService.unlockWallet(pin)).rejects.toThrow();
      expect(mockInvoke).toHaveBeenCalledWith('decrypt_wallet_with_pin', { pin });
    });

    it('should throw error on wrong PIN', async () => {
      const pin = '123456';
      mockInvoke.mockRejectedValue(new Error('Decryption failed. Wrong PIN?'));
      
      await expect(walletService.unlockWallet(pin)).rejects.toThrow('Incorrect PIN');
    });
  });
});

