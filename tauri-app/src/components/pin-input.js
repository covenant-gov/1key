export class PinInput {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      length: 6,
      onComplete: null,
      onInput: null,
      placeholder: '•',
      ...options,
    };
    this.boxes = [];
    this.currentIndex = 0;
  }

  render() {
    this.container.innerHTML = `
      <div class="pin-input-container">
        <div class="pin-input-wrapper" id="pin-wrapper">
          ${Array.from({ length: this.options.length }, (_, i) => `
            <input
              type="text"
              class="pin-box"
              id="pin-box-${i}"
              maxlength="1"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="off"
              aria-label="PIN digit ${i + 1}"
            />
          `).join('')}
        </div>
        <div class="pin-error" id="pin-error" style="display: none;"></div>
      </div>
    `;

    this.boxes = Array.from({ length: this.options.length }, (_, i) => {
      return document.getElementById(`pin-box-${i}`);
    });

    this.setupEventListeners();
    this.focusBox(0);
  }

  setupEventListeners() {
    this.boxes.forEach((box, index) => {
      // Handle input
      box.addEventListener('input', (e) => {
        this.handleInput(e, index);
      });

      // Handle backspace
      box.addEventListener('keydown', (e) => {
        this.handleKeydown(e, index);
      });

      // Handle paste
      box.addEventListener('paste', (e) => {
        this.handlePaste(e, index);
      });

      // Handle focus
      box.addEventListener('focus', () => {
        this.currentIndex = index;
        // Select all text when focused (for easy replacement)
        box.select();
      });

      // Prevent non-numeric input
      box.addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
          e.preventDefault();
        }
      });
    });
  }
  
  // Handle input in a PIN box
  handleInput(e, index) {
    const value = e.target.value;
    
    // Only allow numeric input
    if (value && !/^[0-9]$/.test(value)) {
      e.target.value = '';
      return;
    }

    // Update visual state
    this.updateBoxState(index, value);

    // Call onInput callback
    if (this.options.onInput) {
      this.options.onInput(this.getPinValue(), index);
    }

    // If value entered, move to next box
    if (value && index < this.boxes.length - 1) {
      this.focusBox(index + 1);
    }

    // Check if all boxes are filled
    if (this.isComplete()) {
      if (this.options.onComplete) {
        this.options.onComplete(this.getPinValue());
      }
    }
  }

  // Handle keydown events (backspace, arrow keys, etc.)
  handleKeydown(e, index) {
    // Backspace handling
    if (e.key === 'Backspace') {
      if (this.boxes[index].value) {
        // Clear current box
        this.boxes[index].value = '';
        this.updateBoxState(index, '');
      } else if (index > 0) {
        // Move to previous box and clear it
        this.focusBox(index - 1);
        this.boxes[index - 1].value = '';
        this.updateBoxState(index - 1, '');
      }
    }

    // Arrow key navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      this.focusBox(index - 1);
    }
    if (e.key === 'ArrowRight' && index < this.boxes.length - 1) {
      e.preventDefault();
      this.focusBox(index + 1);
    }
  }

  // Handle paste events (paste full PIN)
  handlePaste(e, index) {
    e.preventDefault();
    const pastedData = (e.clipboardData || window.clipboardData).getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, this.boxes.length);

    // Fill boxes starting from current index
    digits.split('').forEach((digit, i) => {
      const boxIndex = index + i;
      if (boxIndex < this.boxes.length) {
        this.boxes[boxIndex].value = digit;
        this.updateBoxState(boxIndex, digit);
      }
    });

    // Focus last filled box or next empty box
    const nextEmptyIndex = this.boxes.findIndex(box => !box.value);
    if (nextEmptyIndex !== -1) {
      this.focusBox(nextEmptyIndex);
    } else {
      this.focusBox(this.boxes.length - 1);
    }

    // Check if complete
    if (this.isComplete() && this.options.onComplete) {
      this.options.onComplete(this.getPinValue());
    }
  }

  // Focus a specific PIN box
  focusBox(index) {
    if (index >= 0 && index < this.boxes.length) {
      this.boxes[index].focus();
      this.currentIndex = index;
    }
  }

  // Update visual state of a PIN box
  updateBoxState(index, value) {
    const box = this.boxes[index];
    if (value) {
      box.classList.add('filled');
      box.classList.remove('empty');
    } else {
      box.classList.add('empty');
      box.classList.remove('filled');
    }
  }

  // Get current PIN value
  getPinValue() {
    return this.boxes.map(box => box.value).join('');
  }

  // Check if all boxes are filled
  isComplete() {
    return this.boxes.every(box => box.value);
  }

  // Clear all PIN boxes
  clear() {
    this.boxes.forEach((box, index) => {
      box.value = '';
      this.updateBoxState(index, '');
    });
    this.focusBox(0);
  }

  // Set PIN value (for confirmation screen)
  setValue(pin) {
    const digits = pin.slice(0, this.boxes.length).split('');
    this.boxes.forEach((box, index) => {
      box.value = digits[index] || '';
      this.updateBoxState(index, digits[index] || '');
    });
    if (this.isComplete() && this.options.onComplete) {
      this.options.onComplete(this.getPinValue());
    }
  }

  // Show error message
  showError(message) {
    const errorEl = document.getElementById('pin-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      errorEl.classList.add('error-visible');
    }
  }

  // Hide error message
  hideError() {
    const errorEl = document.getElementById('pin-error');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.classList.remove('error-visible');
    }
  }

  // Disable PIN input
  disable() {
    this.boxes.forEach(box => {
      box.disabled = true;
      box.style.cursor = 'not-allowed';
    });
  }

  // Enable PIN input
  enable() {
    this.boxes.forEach(box => {
      box.disabled = false;
      box.style.cursor = 'text';
    });
  }

  // Shake animation for error feedback
  shake() {
    const wrapper = document.getElementById('pin-wrapper');
    if (wrapper) {
      wrapper.classList.add('shake');
      setTimeout(() => {
        wrapper.classList.remove('shake');
      }, 500);
    }
  }
}

