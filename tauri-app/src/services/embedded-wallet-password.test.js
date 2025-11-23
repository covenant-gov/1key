/**
 * Tests for EmbeddedWalletService PasswordManager contract interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmbeddedWalletService } from './embedded-wallet.js';
import { WalletService } from './wallet.js';

describe('EmbeddedWalletService - PasswordManager', () => {
  let embeddedWallet;
  let walletService;
  let mockInvoke;

  beforeEach(() => {
    mockInvoke = vi.fn();
    window.__TAURI__.core.invoke = mockInvoke;

    walletService = new WalletService();
    embeddedWallet = new EmbeddedWalletService(walletService);
    
    // Set up connected account
    embeddedWallet.aztecAccount = {
      address: '0x1234',
      secretKey: 'secret',
      signingKey: 'signing',
      salt: 'salt',
    };
  });

  describe('deployPasswordManager', () => {
    it('should deploy PasswordManager contract', async () => {
      const mockResult = {
        address: '0xcontract123',
        txHash: '0xtx123',
      };

      mockInvoke.mockResolvedValue(mockResult);

      const result = await embeddedWallet.deployPasswordManager();

      expect(mockInvoke).toHaveBeenCalledWith('password_manager_deploy');
      expect(result.address).toBe('0xcontract123');
      expect(result.txHash).toBe('0xtx123');
    });

    it('should throw error if no account connected', async () => {
      embeddedWallet.aztecAccount = null;

      await expect(embeddedWallet.deployPasswordManager()).rejects.toThrow(
        'No Aztec account connected'
      );
    });
  });

  describe('createPasswordEntry', () => {
    it('should create password entry', async () => {
      const mockResult = {
        txHash: '0xtx123',
        status: 'mined',
      };

      mockInvoke.mockResolvedValue(mockResult);

      const result = await embeddedWallet.createPasswordEntry(
        '0xcontract123',
        'Bank Account',
        'secret123',
        1,
        12345
      );

      expect(mockInvoke).toHaveBeenCalledWith('password_manager_create_entry', {
        contractAddress: '0xcontract123',
        label: 'Bank Account',
        password: 'secret123',
        id: 1,
        randomness: 12345,
      });
      expect(result.txHash).toBe('0xtx123');
    });

    it('should throw error if no account connected', async () => {
      embeddedWallet.aztecAccount = null;

      await expect(
        embeddedWallet.createPasswordEntry('0xcontract', 'label', 'pass', 1, 123)
      ).rejects.toThrow('No Aztec account connected');
    });
  });

  describe('getPasswordEntryIds', () => {
    it('should get password entry IDs', async () => {
      const mockResult = {
        entryIds: ['1', '2', '3'],
        hasMore: false,
      };

      mockInvoke.mockResolvedValue(mockResult);

      const result = await embeddedWallet.getPasswordEntryIds('0xcontract123', 0);

      expect(mockInvoke).toHaveBeenCalledWith('password_manager_get_entry_ids', {
        contractAddress: '0xcontract123',
        offset: 0,
      });
      expect(result.entryIds).toEqual(['1', '2', '3']);
      expect(result.hasMore).toBe(false);
    });

    it('should use default offset if not provided', async () => {
      mockInvoke.mockResolvedValue({ entryIds: [], hasMore: false });

      await embeddedWallet.getPasswordEntryIds('0xcontract123');

      expect(mockInvoke).toHaveBeenCalledWith('password_manager_get_entry_ids', {
        contractAddress: '0xcontract123',
        offset: 0,
      });
    });
  });

  describe('getPasswordEntryById', () => {
    it('should get password entry by ID', async () => {
      const mockResult = {
        label: '12345',
        password: '67890',
      };

      mockInvoke.mockResolvedValue(mockResult);

      const result = await embeddedWallet.getPasswordEntryById('0xcontract123', 1, 0);

      expect(mockInvoke).toHaveBeenCalledWith('password_manager_get_entry_by_id', {
        contractAddress: '0xcontract123',
        id: 1,
        offset: 0,
      });
      expect(result.label).toBe('12345');
      expect(result.password).toBe('67890');
    });
  });

  describe('updatePasswordEntry', () => {
    it('should update password entry', async () => {
      const mockResult = {
        txHash: '0xtx456',
        status: 'mined',
      };

      mockInvoke.mockResolvedValue(mockResult);

      const result = await embeddedWallet.updatePasswordEntry(
        '0xcontract123',
        'Updated Label',
        'newpassword',
        1,
        67890
      );

      expect(mockInvoke).toHaveBeenCalledWith('password_manager_update_entry', {
        contractAddress: '0xcontract123',
        label: 'Updated Label',
        password: 'newpassword',
        id: 1,
        randomness: 67890,
      });
      expect(result.txHash).toBe('0xtx456');
    });
  });

  describe('deletePasswordEntry', () => {
    it('should delete password entry', async () => {
      const mockResult = {
        txHash: '0xtx789',
        status: 'mined',
      };

      mockInvoke.mockResolvedValue(mockResult);

      const result = await embeddedWallet.deletePasswordEntry('0xcontract123', 1);

      expect(mockInvoke).toHaveBeenCalledWith('password_manager_delete_entry', {
        contractAddress: '0xcontract123',
        id: 1,
      });
      expect(result.txHash).toBe('0xtx789');
    });
  });
});

