import { PinInput } from '../components/pin-input.js';

export class InitialScreen {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pinInput = null;
    this.onCreateAccount = null;
  }

  // Render the initial screen
  render() {
    this.container.innerHTML = `
      <div class="screen initial-screen">
        <div class="screen-header">
          <h1 class="app-title">1Key</h1>
          <p class="app-subtitle">Your secure password manager</p>
        </div>

        <div class="screen-content">
          <!-- PIN Input Container -->
          <div id="pin-input-container" class="pin-section"></div>

          <!-- Create Account Section -->
          <div class="account-actions">
            <button class="create-account-btn" id="create-account-btn">
              Create Account
            </button>
            <p class="account-help-text">
              New to 1Key? Create an account to get started securely storing your passwords.
            </p>
          </div>
        </div>
      </div>
    `;

    // Initialize PIN input
    this.initPinInput();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  // Initialize PIN input component
  initPinInput() {
    const pinContainer = document.getElementById('pin-input-container');
    this.pinInput = new PinInput('pin-input-container', {
      length: 6,
      onComplete: (pin) => {
        // PIN completed - could auto-trigger unlock if account exists
        // For now, we'll just show feedback
        console.log('PIN entered:', pin);
      },
      onInput: (pin, index) => {
        // Clear any errors when user starts typing
        this.pinInput.hideError();
      },
    });
    this.pinInput.render();
  }

  // Setup event listeners
  setupEventListeners() {
    const createAccountBtn = document.getElementById('create-account-btn');
    
    createAccountBtn.addEventListener('click', () => {
      this.handleCreateAccount();
    });

    // Allow Enter key to trigger create account
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.pinInput.isComplete()) {
        this.handleCreateAccount();
      }
    });
  }

  // Handle create account button click
  handleCreateAccount() {
    this.pinInput.hideError();
    
    if (this.onCreateAccount) {
      this.onCreateAccount();
    }
  }

  // Show error message
  showError(message) {
    if (this.pinInput) {
      this.pinInput.showError(message);
      this.pinInput.shake();
    }
  }

  // Reset screen state
  reset() {
    if (this.pinInput) {
      this.pinInput.clear();
      this.pinInput.enable();
    }
    const createBtn = document.getElementById('create-account-btn');
    if (createBtn) {
      createBtn.disabled = false;
      createBtn.textContent = 'Create Account';
    }
  }
}

