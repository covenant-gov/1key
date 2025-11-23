import { PinInput } from '../components/pin-input.js';

export class UnlockScreen {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pinInput = null;
    this.onUnlock = null;
    this.onReturnHome = null; // Callback to return to home screen
    this.attempts = 0;
    this.maxAttempts = 5;
    this.maxFailedAttemptsBeforeReturn = 2; // Return home after 2 failed attempts
    this.lockoutTime = 60000; // 1 minute in milliseconds
    this.isLocked = false;
  }

  // Render the unlock screen
  render() {
    this.container.innerHTML = `
      <div class="screen unlock-screen">
        <div class="screen-header">
          <h1 class="app-title">1Key</h1>
          <p class="app-subtitle">Enter your PIN to unlock</p>
        </div>

        <div class="screen-content">
          <!-- PIN Input Container -->
          <div id="pin-input-container" class="pin-section"></div>

          <!-- Error Message -->
          <div id="unlock-error" class="error-message" style="display: none;"></div>

          <!-- Attempts Remaining -->
          <div id="attempts-remaining" class="attempts-info" style="display: none;"></div>

          <!-- Lockout Message -->
          <div id="lockout-message" class="lockout-message" style="display: none;"></div>
        </div>
      </div>
    `;

    this.initPinInput();
    this.setupEventListeners();
  }

  // Initialize PIN input component
  initPinInput() {
    this.pinInput = new PinInput('pin-input-container', {
      length: 6,
      onComplete: (pin) => {
        // Auto-trigger unlock when PIN is complete
        this.handleUnlock(pin);
      },
      onInput: (pin, index) => {
        // Clear error when user starts typing
        this.hideError();
      },
    });
    this.pinInput.render();
  }

  // Setup event listeners
  setupEventListeners() {
    // PIN input auto-triggers unlock when complete (handled in onComplete callback)
    // No additional event listeners needed
  }

  // Handle unlock attempt
  async handleUnlock(pin) {
    if (this.isLocked) {
      return; // Don't process if locked out
    }

    if (!pin || pin.length !== 6) {
      this.showError('Please enter a 6-digit PIN');
      this.pinInput.shake();
      return;
    }

    // Disable inputs while processing
    this.pinInput.disable();

    try {
      // Call unlock callback
      if (this.onUnlock) {
        await this.onUnlock(pin);
        // Success - reset attempts
        this.attempts = 0;
        this.hideError();
        this.hideAttemptsInfo();
      }
    } catch (error) {
      // Unlock failed - show specific error message
      this.handleUnlockFailure(error);
    }
  }

  // Handle unlock failure
  handleUnlockFailure(error) {
    this.attempts++;
    const remaining = this.maxAttempts - this.attempts;

    // Re-enable inputs
    this.pinInput.enable();

    // After 2 failed attempts, return to home screen
    if (this.attempts >= this.maxFailedAttemptsBeforeReturn && this.onReturnHome) {
      this.onReturnHome();
      return;
    }

    if (this.attempts >= this.maxAttempts) {
      // Lock out user
      this.lockOut();
    } else {
      // Show error message - use specific message if available, otherwise generic
      const errorMessage = error?.message?.includes('Incorrect PIN') 
        ? 'PIN not recognized in this device'
        : 'PIN not recognized in this device';
      this.showError(errorMessage);
      this.showAttemptsInfo(remaining);
      this.pinInput.shake();
      this.pinInput.clear();
      setTimeout(() => {
        this.pinInput.focusBox(0);
      }, 100);
    }
  }

  // Lock out user after too many failed attempts
  lockOut() {
    this.isLocked = true;
    this.pinInput.disable();

    const lockoutMessage = document.getElementById('lockout-message');
    if (lockoutMessage) {
      lockoutMessage.textContent = `Too many failed attempts. Please wait ${this.lockoutTime / 1000} seconds before trying again.`;
      lockoutMessage.style.display = 'block';
    }

    this.hideError();
    this.hideAttemptsInfo();

    // Countdown timer
    let timeLeft = this.lockoutTime / 1000;
    const countdownInterval = setInterval(() => {
      timeLeft--;
      if (lockoutMessage) {
        lockoutMessage.textContent = `Too many failed attempts. Please wait ${timeLeft} second${timeLeft !== 1 ? 's' : ''} before trying again.`;
      }

      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
        this.unlock();
      }
    }, 1000);
  }

  // Unlock after lockout period
  unlock() {
    this.isLocked = false;
    this.attempts = 0;
    this.pinInput.enable();

    const lockoutMessage = document.getElementById('lockout-message');
    if (lockoutMessage) {
      lockoutMessage.style.display = 'none';
    }

    this.pinInput.clear();
    this.pinInput.focusBox(0);
  }

  // Show error message
  showError(message) {
    const errorEl = document.getElementById('unlock-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    if (this.pinInput) {
      this.pinInput.showError(message);
    }
  }

  // Hide error message
  hideError() {
    const errorEl = document.getElementById('unlock-error');
    if (errorEl) {
      errorEl.style.display = 'none';
    }

    if (this.pinInput) {
      this.pinInput.hideError();
    }
  }

  // Show attempts remaining
  showAttemptsInfo(remaining) {
    const attemptsEl = document.getElementById('attempts-remaining');
    if (attemptsEl) {
      attemptsEl.textContent = `${remaining} attempt${remaining !== 1 ? 's' : ''} remaining`;
      attemptsEl.style.display = 'block';
    }
  }

  // Hide attempts info
  hideAttemptsInfo() {
    const attemptsEl = document.getElementById('attempts-remaining');
    if (attemptsEl) {
      attemptsEl.style.display = 'none';
    }
  }

  // Reset screen state
  reset() {
    this.attempts = 0;
    this.isLocked = false;
    
    if (this.pinInput) {
      this.pinInput.clear();
      this.pinInput.enable();
    }


    this.hideError();
    this.hideAttemptsInfo();

    const lockoutMessage = document.getElementById('lockout-message');
    if (lockoutMessage) {
      lockoutMessage.style.display = 'none';
    }
  }
}

