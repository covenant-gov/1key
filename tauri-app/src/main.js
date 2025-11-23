/**
 * Main Application Entry Point
 * 1Key Password Manager
 */
import { InitialScreen } from './screens/initial-screen.js';
import { PinSetupScreen } from './screens/pin-setup-screen.js';
import { UnlockScreen } from './screens/unlock-screen.js';

class App {
  constructor() {
    this.container = document.getElementById('app');
    this.currentScreen = null;
    this.hasAccount = false;
  }

  // Initialize the application
  async init() {
    this.hasAccount = false; // await this.checkAccountExists();

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
        console.log('Creating account with PIN:', pin);
        // TODO: Implement wallet creation with PIN
        // await this.createAccount(pin);
        
        // For now, show success and reset
        alert('Account created successfully! (Wallet creation will be implemented... WIP!)');
        
        // After account is created, we should show unlock screen next time
        // For now, just reset
        this.showInitialScreen();
      } catch (error) {
        console.error('Failed to create account:', error);
        pinSetupScreen.showError('Failed to create account. Please try again.');
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
        console.log('Unlocking with PIN:', pin);
        // TODO: Unlock wallet with PIN via Rust backend
        // const wallet = await this.unlockWallet(pin);
        
        // For now, simulate unlock
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // After successful unlock, show main app
        // TODO: Show password manager interface
        alert('Wallet unlocked! (Password manager will be implemented in Step 7)');
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
    // TODO: Check with Rust backend
    // const { invoke } = window.__TAURI__.core;
    // return await invoke('wallet_exists');
    return false;
  }
}

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
