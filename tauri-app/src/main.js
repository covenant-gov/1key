/**
 * Main Application Entry Point
 * 1Key Password Manager
 */
import { InitialScreen } from './screens/initial-screen.js';

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

    // Handle create account
    initialScreen.onCreateAccount = async (pin) => {
      try {
        console.log('Creating account with PIN:', pin);
        // TODO: Implement wallet creation with PIN
        // await this.createAccount(pin);
        
        alert('TODO: Implement wallet creation with PIN');
        initialScreen.reset();
      } catch (error) {
        console.error('Failed to create account:', error);
        initialScreen.showError('Failed to create account. Please try again.');
        initialScreen.reset();
      }
    };

    this.currentScreen = initialScreen;
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
