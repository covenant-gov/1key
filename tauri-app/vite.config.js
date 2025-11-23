import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // Tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
  // Clear screen on restart
  clearScreen: false,
  // Tauri uses a fixed port, so we need to set env variables
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // Don't minify for easier debugging
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    // Output directory
    outDir: 'dist',
  },
});

