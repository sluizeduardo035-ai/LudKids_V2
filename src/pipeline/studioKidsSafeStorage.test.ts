import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  safeLocalStorageSet,
  safeLocalStorageGet,
  safeLocalStorageRemove,
  isQuotaExceededError,
  purgeDisposableStorage,
  DISPOSABLE_STORAGE_KEYS,
} from '../utils/safeStorage.js';

describe('Studio Kids Poc 2 - Safe Storage & Quota Exceeded Resilience', () => {
  // Mock localStorage and sessionStorage
  let mockLocalStore: Record<string, string> = {};
  let mockSessionStore: Record<string, string> = {};
  let shouldThrowQuotaOnLocalSet = false;
  let throwQuotaCount = 0;

  beforeEach(() => {
    mockLocalStore = {};
    mockSessionStore = {};
    shouldThrowQuotaOnLocalSet = false;
    throwQuotaCount = 0;

    // Install mock window
    (globalThis as any).window = {
      localStorage: {
        getItem: (k: string) => mockLocalStore[k] ?? null,
        setItem: (k: string, v: string) => {
          if (shouldThrowQuotaOnLocalSet) {
            throwQuotaCount++;
            const quotaErr = new Error("Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota.");
            quotaErr.name = 'QuotaExceededError';
            (quotaErr as any).code = 22;
            throw quotaErr;
          }
          mockLocalStore[k] = v;
        },
        removeItem: (k: string) => {
          delete mockLocalStore[k];
        },
        clear: () => {
          mockLocalStore = {};
        },
      },
      sessionStorage: {
        getItem: (k: string) => mockSessionStore[k] ?? null,
        setItem: (k: string, v: string) => {
          mockSessionStore[k] = v;
        },
        removeItem: (k: string) => {
          delete mockSessionStore[k];
        },
      },
    };
  });

  it('correctly detects QuotaExceededError variants', () => {
    const standardQuotaErr = new Error("Failed to execute 'setItem' on 'Storage': Setting the value exceeded the quota.");
    standardQuotaErr.name = 'QuotaExceededError';
    (standardQuotaErr as any).code = 22;
    assert.strictEqual(isQuotaExceededError(standardQuotaErr), true);

    const firefoxQuotaErr = new Error('The quota has been exceeded');
    firefoxQuotaErr.name = 'NS_ERROR_DOM_QUOTA_REACHED';
    (firefoxQuotaErr as any).code = 1014;
    assert.strictEqual(isQuotaExceededError(firefoxQuotaErr), true);

    const regularErr = new Error('SyntaxError: invalid json');
    assert.strictEqual(isQuotaExceededError(regularErr), false);
    assert.strictEqual(isQuotaExceededError(null), false);
  });

  it('writes and reads data normally without quota pressure', () => {
    const key = 'test_key_normal';
    const val = JSON.stringify({ name: 'skill-audio', reasoning: 'HIGH' });

    const ok = safeLocalStorageSet(key, val);
    assert.strictEqual(ok, true);
    assert.strictEqual(safeLocalStorageGet(key), val);

    safeLocalStorageRemove(key);
    assert.strictEqual(safeLocalStorageGet(key), null);
  });

  it('purges disposable telemetry keys when quota is exceeded and retries successfully', () => {
    // Populate disposable cache keys
    for (const k of DISPOSABLE_STORAGE_KEYS) {
      mockLocalStore[k] = 'transient_large_log_data_'.repeat(100);
    }
    assert.strictEqual(DISPOSABLE_STORAGE_KEYS.length > 0, true);
    assert.ok(mockLocalStore[DISPOSABLE_STORAGE_KEYS[0]]);

    // Simulate quota error once, then succeed after purge
    let callCount = 0;
    (globalThis as any).window.localStorage.setItem = (k: string, v: string) => {
      callCount++;
      if (callCount === 1) {
        const err = new Error('Setting the value exceeded the quota.');
        err.name = 'QuotaExceededError';
        (err as any).code = 22;
        throw err;
      }
      mockLocalStore[k] = v;
    };

    const targetKey = 'lud_kids_poc2_custom_skills_v1';
    const targetPayload = JSON.stringify([{ id: 'SKILL_CUSTOM_1', name: 'my-custom-skill' }]);

    const success = safeLocalStorageSet(targetKey, targetPayload);
    assert.strictEqual(success, true);
    assert.strictEqual(mockLocalStore[targetKey], targetPayload);

    // Verify disposable keys were purged to free quota
    assert.strictEqual(mockLocalStore[DISPOSABLE_STORAGE_KEYS[0]], undefined);
  });

  it('falls back gracefully to sessionStorage and memory when localStorage is permanently saturated', () => {
    // LocalStorage permanently throws QuotaExceededError
    shouldThrowQuotaOnLocalSet = true;

    const targetKey = 'lud_kids_poc2_custom_skills_v1';
    const targetPayload = JSON.stringify([{ id: 'SKILL_OVERFLOW', name: 'emergency-fallback' }]);

    // MUST NOT THROW UNHANDLED EXCEPTION
    assert.doesNotThrow(() => {
      const ok = safeLocalStorageSet(targetKey, targetPayload);
      assert.strictEqual(ok, true);
    });

    // Should be safely persisted in sessionStorage
    assert.strictEqual(mockSessionStore[targetKey], targetPayload);

    // And retrieved accurately via safeLocalStorageGet
    const retrieved = safeLocalStorageGet(targetKey);
    assert.strictEqual(retrieved, targetPayload);
  });

  it('falls back to in-memory cache when running in SSR or window-less environment', () => {
    // Remove window
    (globalThis as any).window = undefined;

    const key = 'ssr_skill_key';
    const val = JSON.stringify({ ssr: true });

    assert.doesNotThrow(() => {
      const ok = safeLocalStorageSet(key, val);
      assert.strictEqual(ok, true);
    });

    assert.strictEqual(safeLocalStorageGet(key), val);
    safeLocalStorageRemove(key);
    assert.strictEqual(safeLocalStorageGet(key), null);
  });

  it('maintains 100% isolated storage keys under poc2_produtora_* namespace', async () => {
    const { POC2_STORAGE_KEYS } = await import('./studioKids/poc2StorageKeys.js');
    const values = Object.values(POC2_STORAGE_KEYS);
    assert.ok(values.length >= 5);
    for (const k of values) {
      assert.strictEqual(k.startsWith('poc2_produtora_'), true, `Key ${k} must start with poc2_produtora_`);
    }
  });
});

