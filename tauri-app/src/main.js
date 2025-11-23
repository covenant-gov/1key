/**
 * Main Application Entry Point
 * 1Key Password Manager
 */
import { InitialScreen } from './screens/initial-screen.js';
import { PinSetupScreen } from './screens/pin-setup-screen.js';

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
    // TODO: Step 3 - Implement unlock screen
    this.container.innerHTML = `
      <div class="screen">
        <h1>Unlock Screen</h1>
        <p>Will be implemented in Step 3</p>
      </div>
    `;
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
