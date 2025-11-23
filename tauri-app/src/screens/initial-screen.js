import { PinInput } from '../components/pin-input.js';

export class InitialScreen {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pinInput = null;
    this.mode = 'selection'; // 'selection', 'login', 'create'
    this.onLogin = null;
    this.onCreateAccount = null;
    this.failedAttempts = 0;
    this.maxFailedAttempts = 2;
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
          <!-- Button Selection Section (shown initially) -->
          <div id="button-selection-section" class="button-selection-section">
            <div class="account-actions">
              <button class="login-btn" id="login-btn">
                Login
              </button>
              <button class="create-account-btn" id="create-account-btn">
                Create Account
              </button>
            </div>
          </div>

          <!-- PIN Input Section (shown when login is selected) -->
          <div id="pin-section" class="pin-section" style="display: none;">
            <div id="pin-input-container"></div>
          </div>
        </div>
      </div>
    `;
    
    // Setup event listeners
    this.setupEventListeners();
  }

  // Setup event listeners
  setupEventListeners() {
    const loginBtn = document.getElementById('login-btn');
    const createAccountBtn = document.getElementById('create-account-btn');
    
    loginBtn.addEventListener('click', () => {
      this.handleLoginClick();
    });

    createAccountBtn.addEventListener('click', () => {
      this.handleCreateAccountClick();
    });
  }

  // Handle login button click
  handleLoginClick() {
    this.mode = 'login';
    this.showPinInput();
  }

  // Handle create account button click
  handleCreateAccountClick() {
    if (this.onCreateAccount) {
      this.onCreateAccount();
    }
  }

  // Show PIN input for login
  showPinInput() {
    const buttonSection = document.getElementById('button-selection-section');
    const pinSection = document.getElementById('pin-section');
    
    buttonSection.style.display = 'none';
    pinSection.style.display = 'block';

    // Initialize PIN input
    this.pinInput = new PinInput('pin-input-container', {
      length: 6,
      onComplete: (pin) => {
        // Try logging in immediately when PIN is complete
        this.handleLogin(pin);
      },
      onInput: (pin, index) => {
        // Clear any errors when user starts typing
        this.pinInput.hideError();
      },
    });
    this.pinInput.render();
  }

  // Handle login attempt
  async handleLogin(pin) {
    if (!pin || pin.length !== 6) {
      this.showError('Please enter a 6-digit PIN');
      this.pinInput.shake();
      return;
    }

    // Disable inputs while processing
    this.pinInput.disable();

    try {
      // Call login callback
      if (this.onLogin) {
        await this.onLogin(pin);
        // Success - reset failed attempts
        this.failedAttempts = 0;
      }
    } catch (error) {
      // Login failed
      this.failedAttempts++;
      
      if (this.failedAttempts >= this.maxFailedAttempts) {
        // After 2 failed attempts, return to home screen
        this.reset();
      } else {
        // Show error and allow retry
        this.showError('PIN not recognized in this device');
        this.pinInput.shake();
        this.pinInput.enable();
        this.pinInput.clear();
        setTimeout(() => {
          this.pinInput.focusBox(0);
        }, 100);
      }
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
    this.mode = 'selection';
    this.failedAttempts = 0;
    const buttonSection = document.getElementById('button-selection-section');
    const pinSection = document.getElementById('pin-section');
    
    buttonSection.style.display = 'block';
    pinSection.style.display = 'none';

    if (this.pinInput) {
      this.pinInput.clear();
      this.pinInput.enable();
      this.pinInput.hideError();
    }
  }
}

