import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  // prevent vite from obscuring rust errors
  clearScreen: false,
  optimizeDeps: {
    // Aztec packages are now in the sidecar, not in frontend
  },
  resolve: {
    // Handle packages without "." exports
    conditions: ['import', 'module', 'browser', 'default'],
  },
  plugins: [sveltekit()],
  ssr: {
    // Aztec packages are now in the sidecar, not in frontend
    noExternal: [],
  },
  server: {
    // make sure this port matches the devUrl port in tauri.conf.json file
    port: 5173,
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    // Safari 14+ required for BigInt literal support (used by Aztec packages)
    target:
      process.env.TAURI_ENV_PLATFORM == 'windows'
        ? 'chrome105'
        : 'safari14',
    // don't minify for debug builds
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    rollupOptions: {
      // Ensure Aztec packages are bundled for client (not externalized)
      // They'll be bundled since they're only used client-side via dynamic imports
      output: {
        // Handle Node.js built-ins that Aztec uses
        format: 'es',
      },
    },
  },
});

