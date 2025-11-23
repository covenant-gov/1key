<script>
  import { onMount } from 'svelte';
  import { InitialScreen } from '../screens/initial-screen.js';
  import { PinSetupScreen } from '../screens/pin-setup-screen.js';
  import { UnlockScreen } from '../screens/unlock-screen.js';
  import { walletService } from '../services/wallet.js';
  import { testAztecImport } from '../lib/aztec-test.js';

  let currentScreen = null;
  let hasAccount = false;

  onMount(async () => {
    // Test Aztec.js import first
    console.log('🧪 Testing Aztec.js import...');
    await testAztecImport();
    
    // Check if wallet exists via wallet service
    hasAccount = await checkAccountExists();

    if (hasAccount) {
      showUnlockScreen();
    } else {
      showInitialScreen();
    }
  });

  function showInitialScreen() {
    const initialScreen = new InitialScreen('app-container');
    initialScreen.render();

    // Handle login - try to unlock with PIN
    initialScreen.onLogin = async (pin) => {
      try {
        console.log('Logging in with PIN:', pin);
        const wallet = await walletService.unlockWallet(pin);
        console.log('Login successful:', wallet.address);
        
        // After successful login, show main app
        // TODO: Show password manager interface
        alert(`Login successful!\n\nAddress: ${wallet.address.substring(0, 10)}...\n\nPassword manager will be implemented in Step 7.`);
        
        // Reset screen
        initialScreen.reset();
      } catch (error) {
        console.error('Login failed:', error);
        throw error; // Re-throw to let InitialScreen handle the error display
      }
    };

    // Handle create account - transition to PIN setup screen
    initialScreen.onCreateAccount = async () => {
      showPinSetupScreen();
    };

    currentScreen = initialScreen;
  }

  function showPinSetupScreen() {
    const pinSetupScreen = new PinSetupScreen('app-container');
    pinSetupScreen.render();

    // Handle account creation completion
    pinSetupScreen.onComplete = async (pin) => {
      try {
        console.log('PINs confirmed to match. Creating and encrypting wallet...');
        
        // Create wallet via wallet service
        // This will:
        // 1. Generate wallet data
        // 2. Encrypt it with PIN using AES-256-GCM + Argon2 (via Rust backend)
        // 3. Store encrypted wallet to local file system
        const wallet = await walletService.createWallet(pin);
        
        console.log('Wallet created and encrypted successfully:', wallet.address);
        alert(`Account created successfully!\n\nAddress: ${wallet.address.substring(0, 10)}...\n\nNext time you open the app, you'll see the unlock screen.`);
        
        // Show unlock screen (since wallet now exists)
        hasAccount = true;
        showUnlockScreen();
      } catch (error) {
        // This error only occurs if encryption/storage fails AFTER PINs matched
        console.error('Failed to create/encrypt wallet after PIN confirmation:', error);
        
        // Reset processing flag so user can retry
        pinSetupScreen.isProcessing = false;
        
        // Show error - this only appears if wallet creation/encryption/storage failed
        pinSetupScreen.showError('Failed to create wallet. Please try again.');
        pinSetupScreen.enableInputs();
        
        // Clear the confirm PIN so user can re-enter it and try again
        if (pinSetupScreen.confirmPinInput) {
          pinSetupScreen.confirmPinInput.clear();
          setTimeout(() => {
            pinSetupScreen.confirmPinInput.focusBox(0);
          }, 100);
        }
      }
    };

    currentScreen = pinSetupScreen;
  }

  function showUnlockScreen() {
    const unlockScreen = new UnlockScreen('app-container');
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

    // Handle return to home after 2 failed attempts
    unlockScreen.onReturnHome = () => {
      hasAccount = false;
      showInitialScreen();
    };

    currentScreen = unlockScreen;
  }

  async function checkAccountExists() {
    try {
      return await walletService.walletExists();
    } catch (error) {
      console.error('Error checking account existence:', error);
      return false;
    }
  }
</script>

<div id="app-container">
  <!-- Initial loading state -->
  <div class="loading-state">
    <h1>1Key</h1>
    <p>Loading...</p>
  </div>
</div>

