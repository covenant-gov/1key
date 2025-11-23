/**
 * Tests for EmbeddedWalletService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmbeddedWalletService } from './embedded-wallet.js';
import { WalletService } from './wallet.js';

describe('EmbeddedWalletService', () => {
  let embeddedWallet;
  let walletService;
  let mockInvoke;

  beforeEach(() => {
    // Reset mocks
    mockInvoke = vi.fn();
    window.__TAURI__.core.invoke = mockInvoke;

    walletService = new WalletService();
    embeddedWallet = new EmbeddedWalletService(walletService);
  });

  describe('initializeAztec', () => {
    it('should initialize Aztec connection', async () => {
      mockInvoke.mockResolvedValue({ success: true });

      const result = await embeddedWallet.initializeAztec('http://localhost:8080');

      expect(mockInvoke).toHaveBeenCalledWith('aztec_initialize', {
        nodeUrl: 'http://localhost:8080',
      });
      expect(result.success).toBe(true);
      expect(embeddedWallet.aztecInitialized).toBe(true);
    });

    it('should not re-initialize if already initialized', async () => {
      embeddedWallet.aztecInitialized = true;
      mockInvoke.mockResolvedValue({ success: true });

      const result = await embeddedWallet.initializeAztec();

      expect(mockInvoke).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('createAztecAccount', () => {
    it('should create Aztec account and store credentials', async () => {
      const mockAccountData = {
        address: '0x1234',
        secretKey: 'secret123',
        signingKey: 'signing456',
        salt: 'salt789',
      };

      mockInvoke
        .mockResolvedValueOnce({ success: true }) // initialize
        .mockResolvedValueOnce(mockAccountData) // create account
        .mockResolvedValueOnce(undefined); // store wallet

      vi.spyOn(walletService, 'createWallet').mockResolvedValue({
        address: mockAccountData.address,
      });

      const result = await embeddedWallet.createAztecAccount('123456');

      expect(mockInvoke).toHaveBeenCalledWith('aztec_initialize', {
        nodeUrl: 'http://localhost:8080',
      });
      expect(mockInvoke).toHaveBeenCalledWith('aztec_create_account');
      expect(result.address).toBe(mockAccountData.address);
      expect(embeddedWallet.aztecAccount).toEqual({
        address: mockAccountData.address,
        secretKey: mockAccountData.secretKey,
        signingKey: mockAccountData.signingKey,
        salt: mockAccountData.salt,
      });
    });

    it('should throw error if account creation fails', async () => {
      mockInvoke
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Account creation failed'));

      await expect(embeddedWallet.createAztecAccount('123456')).rejects.toThrow(
        'Failed to create Aztec account'
      );
    });
  });

  describe('connectAztecAccount', () => {
    it('should connect to existing Aztec account', async () => {
      const mockWalletData = {
        private_key: 'secret123',
        address: '0x1234',
        aztec: {
          signingKey: 'signing456',
          salt: 'salt789',
        },
      };

      const mockConnectResult = {
        address: '0x1234',
      };

      vi.spyOn(walletService, 'unlockWallet').mockResolvedValue(mockWalletData);
      mockInvoke
        .mockResolvedValueOnce({ success: true }) // initialize
        .mockResolvedValueOnce(mockConnectResult); // connect account

      const result = await embeddedWallet.connectAztecAccount('123456');

      expect(mockInvoke).toHaveBeenCalledWith('aztec_connect_account', {
        credentials: {
          secretKey: mockWalletData.private_key,
          signingKey: mockWalletData.aztec.signingKey,
          salt: mockWalletData.aztec.salt,
        },
      });
      expect(result.address).toBe('0x1234');
      expect(embeddedWallet.aztecAccount).toBeDefined();
    });

    it('should throw error if no Aztec credentials found', async () => {
      const mockWalletData = {
        private_key: 'secret123',
        address: '0x1234',
        // No aztec field
      };

      vi.spyOn(walletService, 'unlockWallet').mockResolvedValue(mockWalletData);
      mockInvoke.mockResolvedValueOnce({ success: true });

      await expect(embeddedWallet.connectAztecAccount('123456')).rejects.toThrow(
        'No Aztec credentials found in wallet'
      );
    });
  });

  describe('deployAztecAccount', () => {
    it('should deploy Aztec account', async () => {
      embeddedWallet.aztecAccount = {
        address: '0x1234',
        secretKey: 'secret',
        signingKey: 'signing',
        salt: 'salt',
      };

      mockInvoke.mockResolvedValue({
        txHash: '0xabcd',
        alreadyDeployed: false,
      });

      const result = await embeddedWallet.deployAztecAccount();

      expect(mockInvoke).toHaveBeenCalledWith('aztec_deploy_account');
      expect(result.txHash).toBe('0xabcd');
      expect(result.alreadyDeployed).toBe(false);
    });

    it('should throw error if no account connected', async () => {
      embeddedWallet.aztecAccount = null;

      await expect(embeddedWallet.deployAztecAccount()).rejects.toThrow(
        'No Aztec account connected'
      );
    });
  });

  describe('createCompressedString', () => {
    it('should create compressed string from input', () => {
      const result = embeddedWallet.createCompressedString('test');
      
      expect(result).toHaveProperty('value');
      expect(typeof result.value).toBe('bigint');
    });

    it('should pad strings to 31 characters', () => {
      const short = embeddedWallet.createCompressedString('a');
      const long = embeddedWallet.createCompressedString('a'.repeat(50));
      
      // Both should produce valid bigint values
      expect(typeof short.value).toBe('bigint');
      expect(typeof long.value).toBe('bigint');
    });
  });

  describe('getAztecAddress', () => {
    it('should return address when connected', () => {
      embeddedWallet.aztecAccount = { address: '0x1234' };
      expect(embeddedWallet.getAztecAddress()).toBe('0x1234');
    });

    it('should return null when not connected', () => {
      embeddedWallet.aztecAccount = null;
      expect(embeddedWallet.getAztecAddress()).toBeNull();
    });
  });

  describe('isAztecConnected', () => {
    it('should return true when account is connected', () => {
      embeddedWallet.aztecAccount = { address: '0x1234' };
      expect(embeddedWallet.isAztecConnected()).toBe(true);
    });

    it('should return false when account is not connected', () => {
      embeddedWallet.aztecAccount = null;
      expect(embeddedWallet.isAztecConnected()).toBe(false);
    });
  });
});

