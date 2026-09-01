// ============================================
// LifeOS — Vitest Setup
// ============================================

import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Vitest's jsdom environment does not expose `localStorage`, though the app
 * depends on it everywhere (services/storage.ts). Provide a spec-shaped
 * in-memory Storage so tests exercise the real code paths.
 */
class MemoryStorage implements Storage {
  #data = new Map<string, string>();

  get length(): number {
    return this.#data.size;
  }

  key(index: number): string | null {
    return [...this.#data.keys()][index] ?? null;
  }

  getItem(key: string): string | null {
    return this.#data.has(String(key)) ? this.#data.get(String(key))! : null;
  }

  setItem(key: string, value: string): void {
    this.#data.set(String(key), String(value));
  }

  removeItem(key: string): void {
    this.#data.delete(String(key));
  }

  clear(): void {
    this.#data.clear();
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
  }
}

// jsdom ships no matchMedia; useMediaQuery depends on it.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
