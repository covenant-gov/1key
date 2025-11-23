<script>
  import { onMount } from 'svelte';
  import { InitialScreen } from '../screens/initial-screen.js';
  import { PinSetupScreen } from '../screens/pin-setup-screen.js';
  import { UnlockScreen } from '../screens/unlock-screen.js';
  import { walletService } from '../services/wallet.js';

  let currentScreen = null;
  let hasAccount = false;

  onMount(async () => {
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
        console.log('Creating wallet with PIN:', pin);
        
        // Create wallet via wallet service
        const wallet = await walletService.createWallet(pin);
        
        console.log('Wallet created successfully:', wallet.address);
        alert(`Account created successfully!\n\nAddress: ${wallet.address.substring(0, 10)}...\n\nNext time you open the app, you'll see the unlock screen.`);
        
        // Show unlock screen (since wallet now exists)
        hasAccount = true;
        showUnlockScreen();
      } catch (error) {
        console.error('Failed to create account:', error);
        pinSetupScreen.showError(error.message || 'Failed to create account. Please try again.');
        pinSetupScreen.enableInputs();
        pinSetupScreen.reset();
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

