import { PinInput } from '../components/pin-input.js';

export class PinSetupScreen {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pinInput = null;
    this.confirmPinInput = null;
    this.onComplete = null;
    this.enteredPin = null;
    this.step = 'enter'; // 'enter' or 'confirm'
    this.isProcessing = false; // Prevent multiple onComplete calls
  }

  // Render the PIN setup screen
  render() {
    this.container.innerHTML = `
      <div class="screen pin-setup-screen">
        <div class="screen-header">
          <h1 class="app-title">1Key</h1>
          <p class="app-subtitle">Create your secure account</p>
        </div>

        <div class="screen-content">
          <!-- Enter PIN Section -->
          <div id="enter-pin-section" class="pin-setup-section">
            <h2 class="section-title">Enter PIN</h2>
            <p class="section-description">Choose a 6-digit PIN to secure your account</p>
            <div id="pin-input-container" class="pin-section"></div>
          </div>

          <!-- Confirm PIN Section (hidden initially) -->
          <div id="confirm-pin-section" class="pin-setup-section" style="display: none;">
            <h2 class="section-title">Confirm PIN</h2>
            <p class="section-description">Re-enter your PIN to confirm</p>
            <div id="confirm-pin-input-container" class="pin-section"></div>
          </div>

          <!-- Error Message -->
          <div id="pin-setup-error" class="error-message" style="display: none;"></div>
        </div>
      </div>
    `;

    this.initPinInputs();
    this.setupEventListeners();
  }

  // Initialize PIN input components
  initPinInputs() {
    // First PIN input (enter PIN)
    this.pinInput = new PinInput('pin-input-container', {
      length: 6,
      onComplete: (pin) => {
        this.handlePinEntered(pin);
      },
      onInput: (pin, index) => {
        this.hideError();
      },
    });
    this.pinInput.render();

    // Second PIN input (confirm PIN) - will be created fresh when needed
    this.confirmPinInput = null;
  }

  // Setup event listeners
  setupEventListeners() {
    // PIN inputs auto-trigger when complete (handled in onComplete callbacks)
    // No additional event listeners needed
  }

  // Handle PIN entered (first step)
  handlePinEntered(pin) {
    // Prevent handling if we're already in confirm step or processing
    if (this.step === 'confirm' || this.isProcessing) {
      return;
    }

    if (pin.length !== 6) {
      this.showError('PIN must be 6 digits');
      this.pinInput.shake();
      return;
    }

    // Store entered PIN
    this.enteredPin = pin;
    this.step = 'confirm';
    
    // Hide enter section, show confirm section
    const enterSection = document.getElementById('enter-pin-section');
    const confirmSection = document.getElementById('confirm-pin-section');

    enterSection.style.display = 'none';
    confirmSection.style.display = 'block';

    // Wait for DOM to update, then create and render confirm PIN input
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Verify container exists
        const container = document.getElementById('confirm-pin-input-container');
        if (!container) {
          console.error('Confirm PIN container not found');
          return;
        }

        // Create fresh confirm PIN input instance
        this.confirmPinInput = new PinInput('confirm-pin-input-container', {
          length: 6,
          onComplete: (pin) => {
            this.handlePinConfirmed(pin);
          },
          onInput: (pin, index) => {
            this.hideError();
          },
        });
        this.confirmPinInput.render();
        
        // Focus first box after rendering
        setTimeout(() => {
          if (this.confirmPinInput) {
            this.confirmPinInput.focusBox(0);
          }
        }, 100);
      }, 100);
    });

    this.hideError();
  }

  // Handle PIN confirmed (second step)
  handlePinConfirmed(confirmPin) {
    // Prevent multiple calls
    if (this.isProcessing) {
      return;
    }

    if (confirmPin.length !== 6) {
      this.showError('PIN must be 6 digits');
      this.confirmPinInput.shake();
      return;
    }

    // Validate PINs match
    if (confirmPin !== this.enteredPin) {
      this.showError('PINs do not match. Please try again.');
      this.confirmPinInput.shake();
      this.confirmPinInput.clear();
      setTimeout(() => {
        this.confirmPinInput.focusBox(0);
      }, 100);
      return;
    }

    // PINs match - proceed with account creation
    // Only proceed if PINs actually match
    if (confirmPin === this.enteredPin) {
      this.isProcessing = true;
      this.hideError();
      this.disableInputs();

      // Call completion callback - this will attempt wallet creation
      if (this.onComplete) {
        this.onComplete(this.enteredPin);
      }
    }
  }

  // Show error message
  showError(message) {
    const errorEl = document.getElementById('pin-setup-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    // Also show error on the active PIN input
    if (this.step === 'enter' && this.pinInput) {
      this.pinInput.showError(message);
    } else if (this.step === 'confirm' && this.confirmPinInput) {
      this.confirmPinInput.showError(message);
    }
  }

  // Hide error message
  hideError() {
    const errorEl = document.getElementById('pin-setup-error');
    if (errorEl) {
      errorEl.style.display = 'none';
    }

    if (this.pinInput) {
      this.pinInput.hideError();
    }
    if (this.confirmPinInput) {
      this.confirmPinInput.hideError();
    }
  }

  // Disable all inputs
  disableInputs() {
    if (this.pinInput) {
      this.pinInput.disable();
    }
    if (this.confirmPinInput) {
      this.confirmPinInput.disable();
    }
  }

  // Enable all inputs
  enableInputs() {
    if (this.pinInput) {
      this.pinInput.enable();
    }
    if (this.confirmPinInput) {
      this.confirmPinInput.enable();
    }
  }

  // Reset screen (go back to enter PIN)
  reset() {
    this.step = 'enter';
    this.enteredPin = null;
    this.isProcessing = false;

    const enterSection = document.getElementById('enter-pin-section');
    const confirmSection = document.getElementById('confirm-pin-section');

    enterSection.style.display = 'block';
    confirmSection.style.display = 'none';

    if (this.pinInput) {
      this.pinInput.clear();
      this.pinInput.enable();
    }
    if (this.confirmPinInput) {
      this.confirmPinInput.clear();
      // Destroy the confirm PIN input to prevent it from triggering callbacks
      this.confirmPinInput = null;
    }

    this.hideError();
  }
}

