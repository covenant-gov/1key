/**
 * Main Application Entry Point
 * 1Key Password Manager
 */
import { InitialScreen } from './screens/initial-screen.js';
import { PinSetupScreen } from './screens/pin-setup-screen.js';
import { UnlockScreen } from './screens/unlock-screen.js';
import { walletService } from './services/wallet.js';

class App {
  constructor() {
    this.container = document.getElementById('app');
    this.currentScreen = null;
    this.hasAccount = false;
  }

  // Initialize the application
  async init() {
    // Check if wallet exists via wallet service
    this.hasAccount = await this.checkAccountExists();

    if (this.hasAccount) {
      this.showUnlockScreen();
    } else {
      this.showInitialScreen();
    }
  }

  // Show initial screen (for new users)
  showInitialScreen() {
    const initialScreen = new InitialScreen('app');
    initialScreen.render();

    // Handle create account - transition to PIN setup screen
    initialScreen.onCreateAccount = async (pin) => {
      // Transition to PIN setup screen
      this.showPinSetupScreen();
    };

    this.currentScreen = initialScreen;
  }

  // Show PIN setup screen (with confirmation)
  showPinSetupScreen() {
    const pinSetupScreen = new PinSetupScreen('app');
    pinSetupScreen.render();

    // Handle account creation completion
    pinSetupScreen.onComplete = async (pin) => {
      try {
        console.log('Creating wallet with PIN:', pin);
        
        // Create wallet via wallet service
        const wallet = await walletService.createWallet(pin);
        
        console.log('Wallet created successfully:', wallet.address);
        alert(`Account created successfully!\n\nAddress: ${wallet.address.substring(0, 10)}...\n\nNext time you open the app, you'll see the unlock screen.`);
        
        // Show unlock screen (since wallet now exists)
        this.hasAccount = true;
        this.showUnlockScreen();
      } catch (error) {
        console.error('Failed to create account:', error);
        pinSetupScreen.showError(error.message || 'Failed to create account. Please try again.');
        pinSetupScreen.enableInputs();
        pinSetupScreen.reset();
      }
    };

    this.currentScreen = pinSetupScreen;
  }

  // Show unlock screen (for existing users)
  showUnlockScreen() {
    const unlockScreen = new UnlockScreen('app');
    unlockScreen.render();

    // Handle unlock
    unlockScreen.onUnlock = async (pin) => {
      try {
        console.log('Unlocking wallet with PIN:', pin);
        
        const wallet = await walletService.unlockWallet(pin);
        console.log('Wallet unlocked successfully:', wallet.address);
        
        // After successful unlock, show main app
        // TODO: Show password manager interface
        alert(`Wallet unlocked!\n\nAddress: ${wallet.address.substring(0, 10)}...\n\nPassword manager will be implemented in Step 7.`);
        
        // For now, just reset
        unlockScreen.reset();
      } catch (error) {
        console.error('Failed to unlock:', error);
        // Error will be handled by unlock screen
        throw error;
      }
    };

    this.currentScreen = unlockScreen;
  }

  // Check if account exists
  async checkAccountExists() {
    try {
      return await walletService.walletExists();
    } catch (error) {
      console.error('Error checking account existence:', error);
      return false;
    }
  }
}

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
