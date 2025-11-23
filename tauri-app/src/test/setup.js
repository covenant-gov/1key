/**
 * Vitest setup file
 * Mocks Tauri APIs for testing
 */

import { vi } from 'vitest';

// Mock Tauri core API
global.window = global.window || {};
global.window.__TAURI__ = {
  core: {
    invoke: vi.fn(),
  },
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

