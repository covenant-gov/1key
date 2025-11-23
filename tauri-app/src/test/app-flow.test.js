/**
 * Tests for App initialization and screen flow
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('App Flow', () => {
  let App;
  let mockContainer;
  let mockInitialScreen;
  let mockPinSetupScreen;
  let mockUnlockScreen;
  let mockWalletService;

  beforeEach(() => {
    // Create mock container
    mockContainer = {
      innerHTML: '<div class="loading-state">Loading...</div>',
      id: 'app',
    };
    
    global.document.getElementById = vi.fn((id) => {
      if (id === 'app') return mockContainer;
      return null;
    });

    // Mock screen classes
    mockInitialScreen = {
      render: vi.fn(),
      onCreateAccount: null,
    };
    
    mockPinSetupScreen = {
      render: vi.fn(),
      onComplete: null,
      showError: vi.fn(),
      enableInputs: vi.fn(),
      reset: vi.fn(),
    };
    
    mockUnlockScreen = {
      render: vi.fn(),
      onUnlock: null,
      reset: vi.fn(),
    };

    // Mock wallet service
    mockWalletService = {
      walletExists: vi.fn(),
      createWallet: vi.fn(),
      unlockWallet: vi.fn(),
    };

    // Mock screen imports
    vi.mock('../screens/initial-screen.js', () => ({
      InitialScreen: vi.fn(() => mockInitialScreen),
    }));

    vi.mock('../screens/pin-setup-screen.js', () => ({
      PinSetupScreen: vi.fn(() => mockPinSetupScreen),
    }));

    vi.mock('../screens/unlock-screen.js', () => ({
      UnlockScreen: vi.fn(() => mockUnlockScreen),
    }));

    vi.mock('../services/wallet.js', () => ({
      walletService: mockWalletService,
    }));

    // Import App after mocks are set up
    return import('../main.js').then((module) => {
      // App class is not exported, so we need to access it differently
      // For now, let's test the behavior through the DOM
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should show initial screen when no wallet exists', async () => {
      mockWalletService.walletExists.mockResolvedValue(false);
      
      // Simulate DOMContentLoaded
      const event = new Event('DOMContentLoaded');
      window.dispatchEvent(event);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that initial screen was rendered
      expect(mockInitialScreen.render).toHaveBeenCalled();
    });

    it('should show unlock screen when wallet exists', async () => {
      mockWalletService.walletExists.mockResolvedValue(true);
      
      // Simulate DOMContentLoaded
      const event = new Event('DOMContentLoaded');
      window.dispatchEvent(event);
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check that unlock screen was rendered
      expect(mockUnlockScreen.render).toHaveBeenCalled();
    });
  });

  describe('PIN Setup Flow', () => {
    it('should transition from initial to PIN setup screen', async () => {
      mockWalletService.walletExists.mockResolvedValue(false);
      
      // Initialize app
      const event = new Event('DOMContentLoaded');
      window.dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Simulate "Create Account" click
      if (mockInitialScreen.onCreateAccount) {
        mockInitialScreen.onCreateAccount();
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Check that PIN setup screen was rendered
      expect(mockPinSetupScreen.render).toHaveBeenCalled();
    });

    it('should create wallet when PIN is confirmed', async () => {
      const pin = '123456';
      const mockWallet = {
        address: '0xabcdef1234567890',
      };
      
      mockWalletService.createWallet.mockResolvedValue(mockWallet);
      
      // Simulate PIN confirmation
      if (mockPinSetupScreen.onComplete) {
        await mockPinSetupScreen.onComplete(pin);
      }
      
      // Check that wallet was created
      expect(mockWalletService.createWallet).toHaveBeenCalledWith(pin);
    });

    it('should show error if wallet creation fails', async () => {
      const pin = '123456';
      const error = new Error('Failed to create wallet');
      
      mockWalletService.createWallet.mockRejectedValue(error);
      
      // Simulate PIN confirmation
      if (mockPinSetupScreen.onComplete) {
        await mockPinSetupScreen.onComplete(pin);
      }
      
      // Check that error was shown
      expect(mockPinSetupScreen.showError).toHaveBeenCalled();
      expect(mockPinSetupScreen.enableInputs).toHaveBeenCalled();
    });
  });
});

