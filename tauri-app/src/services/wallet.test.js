/**
 * Tests for WalletService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WalletService } from './wallet.js';

describe('WalletService', () => {
  let walletService;
  let mockInvoke;

  beforeEach(() => {
    mockInvoke = vi.fn();
    window.__TAURI__.core.invoke = mockInvoke;
    walletService = new WalletService();
  });

  describe('walletExists', () => {
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
    });

    it('should return false on error', async () => {
      mockInvoke.mockRejectedValue(new Error('Test error'));
      const result = await walletService.walletExists();
      expect(result).toBe(false);
    });
  });

  describe('createWallet', () => {
    it('should create wallet with valid PIN', async () => {
      const mockWalletData = {
        address: '0x1234',
        private_key: '0xabcd',
      };

      mockInvoke.mockResolvedValue(undefined);

      const result = await walletService.createWallet('123456');

      expect(mockInvoke).toHaveBeenCalledWith('encrypt_and_store_wallet', {
        wallet: expect.objectContaining({
          address: expect.any(String),
          private_key: expect.any(String),
        }),
        pin: '123456',
      });
      expect(result.address).toBeDefined();
      expect(walletService.isUnlocked).toBe(true);
    });

    it('should throw error for invalid PIN length', async () => {
      await expect(walletService.createWallet('12345')).rejects.toThrow(
        'PIN must be 6 digits'
      );
      await expect(walletService.createWallet('1234567')).rejects.toThrow(
        'PIN must be 6 digits'
      );
    });
  });

  describe('unlockWallet', () => {
    it('should unlock wallet with correct PIN', async () => {
      const mockWalletData = {
        address: '0x1234',
        private_key: '0xabcd',
      };

      mockInvoke.mockResolvedValue(mockWalletData);

      const result = await walletService.unlockWallet('123456');

      expect(mockInvoke).toHaveBeenCalledWith('decrypt_wallet_with_pin', {
        pin: '123456',
      });
      expect(result).toEqual(mockWalletData);
      expect(walletService.isUnlocked).toBe(true);
      expect(walletService.walletData).toEqual(mockWalletData);
    });

    it('should return cached data if already unlocked', async () => {
      walletService.isUnlocked = true;
      walletService.walletData = { address: '0x1234' };

      const result = await walletService.unlockWallet('123456');

      expect(mockInvoke).not.toHaveBeenCalled();
      expect(result.address).toBe('0x1234');
    });

    it('should throw error for incorrect PIN', async () => {
      mockInvoke.mockRejectedValue(new Error('Decryption failed'));

      await expect(walletService.unlockWallet('123456')).rejects.toThrow(
        'Incorrect PIN'
      );
    });
  });

  describe('lockWallet', () => {
    it('should clear wallet data and lock', () => {
      walletService.isUnlocked = true;
      walletService.walletData = { address: '0x1234' };

      walletService.lockWallet();

      expect(walletService.isUnlocked).toBe(false);
      expect(walletService.walletData).toBeNull();
    });
  });

  describe('getWalletData', () => {
    it('should return wallet data when unlocked', () => {
      walletService.isUnlocked = true;
      walletService.walletData = { address: '0x1234' };

      const result = walletService.getWalletData();
      expect(result).toEqual({ address: '0x1234' });
    });

    it('should return null when locked', () => {
      walletService.isUnlocked = false;
      expect(walletService.getWalletData()).toBeNull();
    });
  });

  describe('deleteWallet', () => {
    it('should delete wallet and lock', async () => {
      walletService.isUnlocked = true;
      walletService.walletData = { address: '0x1234' };
      mockInvoke.mockResolvedValue(undefined);

      await walletService.deleteWallet();

      expect(mockInvoke).toHaveBeenCalledWith('delete_wallet');
      expect(walletService.isUnlocked).toBe(false);
      expect(walletService.walletData).toBeNull();
    });
  });
});

