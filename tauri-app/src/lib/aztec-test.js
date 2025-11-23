/**
 * Test Aztec sidecar connection via Tauri commands
 */

const { invoke } = window.__TAURI__.core;

export async function testAztecImport() {
  try {
    console.log('Testing Aztec sidecar connection...');
    
    // Test sidecar connection
    const result = await invoke('aztec_test');
    console.log('✅ Sidecar test result:', result);
    
    return { 
      success: true, 
      message: 'Aztec sidecar is connected',
      result,
    };
  } catch (error) {
    console.error('❌ Failed to connect to Aztec sidecar:', error);
    console.error('Error details:', {
      message: error,
    });
    return { success: false, error: String(error) };
  }
}

