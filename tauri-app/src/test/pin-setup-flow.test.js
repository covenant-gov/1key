/**
 * Tests for PIN setup flow - specifically testing the issue where
 * screen returns to original after PIN placement
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('PIN Setup Flow - Screen Persistence', () => {
  let PinSetupScreen;
  let mockContainer;
  let mockPinInput;
  let mockWalletService;

  beforeEach(async () => {
    // Setup DOM mocks
    mockContainer = {
      innerHTML: '',
      id: 'app',
      querySelector: vi.fn(),
    };

    global.document.getElementById = vi.fn((id) => {
      if (id === 'app') return mockContainer;
      if (id === 'enter-pin-section') {
        return { style: { display: '' } };
      }
      if (id === 'confirm-pin-section') {
        return { style: { display: 'none' } };
      }
      if (id === 'setup-submit-btn') {
        return {
          style: { display: 'none' },
          textContent: '',
          addEventListener: vi.fn(),
          disabled: false,
        };
      }
      if (id === 'confirm-pin-input-container') {
        return {};
      }
      if (id === 'pin-setup-error') {
        return { textContent: '', style: { display: 'none' } };
      }
      return null;
    });

    global.document.addEventListener = vi.fn();
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));
    global.setTimeout = vi.fn((cb) => {
      if (typeof cb === 'function') {
        cb();
      }
      return 123; // mock timer ID
    });

    // Mock PinInput
    mockPinInput = {
      render: vi.fn(),
      getPinValue: vi.fn(() => '123456'),
      isComplete: vi.fn(() => true),
      clear: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      showError: vi.fn(),
      hideError: vi.fn(),
      shake: vi.fn(),
      focusBox: vi.fn(),
    };

    vi.mock('../components/pin-input.js', () => ({
      PinInput: vi.fn(() => mockPinInput),
    }));

    // Mock wallet service
    mockWalletService = {
      createWallet: vi.fn(),
    };

    vi.mock('../services/wallet.js', () => ({
      walletService: mockWalletService,
    }));

    // Import after mocks
    const module = await import('../screens/pin-setup-screen.js');
    PinSetupScreen = module.PinSetupScreen;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should persist on PIN setup screen after wallet creation', async () => {
    const pin = '123456';
    const mockWallet = {
      address: '0xabcdef1234567890',
    };

    mockWalletService.createWallet.mockResolvedValue(mockWallet);

    const screen = new PinSetupScreen('app');
    screen.render();

    // Simulate PIN confirmation
    screen.enteredPin = pin;
    screen.step = 'confirm';
    screen.confirmPinInput = mockPinInput;

    // Call onComplete handler
    let onCompleteCalled = false;
    screen.onComplete = async (confirmedPin) => {
      onCompleteCalled = true;
      expect(confirmedPin).toBe(pin);
      
      // Verify wallet creation was called
      expect(mockWalletService.createWallet).toHaveBeenCalledWith(pin);
      
      // After wallet creation, screen should NOT reset
      // The parent App should handle screen transition
      expect(screen.step).toBe('confirm'); // Should still be on confirm step
    };

    // Simulate PIN confirmation
    await screen.handlePinConfirmed(pin);

    expect(onCompleteCalled).toBe(true);
    expect(mockWalletService.createWallet).toHaveBeenCalledWith(pin);
  });

  it('should handle wallet creation error without resetting screen incorrectly', async () => {
    const pin = '123456';
    const error = new Error('Failed to create wallet');

    mockWalletService.createWallet.mockRejectedValue(error);

    const screen = new PinSetupScreen('app');
    screen.render();

    screen.enteredPin = pin;
    screen.step = 'confirm';
    screen.confirmPinInput = mockPinInput;

    let onCompleteCalled = false;
    screen.onComplete = async (confirmedPin) => {
      onCompleteCalled = true;
      // Should throw error
      await expect(mockWalletService.createWallet(confirmedPin)).rejects.toThrow();
    };

    // This should trigger error handling
    try {
      await screen.handlePinConfirmed(pin);
      if (screen.onComplete) {
        await screen.onComplete(pin);
      }
    } catch (e) {
      // Error expected
    }

    // Screen should show error, not reset
    expect(screen.showError).toHaveBeenCalled();
  });
});

