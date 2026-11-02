/**
 * Safe Storage Utility for AI Studio Web Applications
 * 
 * Provides quota-safe, resilient LocalStorage/SessionStorage access.
 * Automatically handles QuotaExceededError by purging disposable telemetry caches,
 * falling back to sessionStorage, and retaining state in-memory so the UI never crashes.
 */

// Disposable/transient keys that can be safely evicted when storage quota is exceeded
export const DISPOSABLE_STORAGE_KEYS = [
  'lud_pipeline_telemetry_records_v1',
  'lud_copilot_telemetry_records_v1',
  'lud_telemetry_debug_logs',
  'lud_temp_cache',
];

// In-memory fallback map (active for the page lifetime)
const memoryStorageFallback = new Map<string, string>();

/**
 * Checks whether an error is a browser storage quota exceeded error.
 */
export function isQuotaExceededError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof DOMException) {
    return (
      err.code === 22 ||
      err.code === 1014 ||
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    );
  }
  const str = String(err);
  return (
    str.includes('QuotaExceededError') ||
    str.includes('exceeded the quota') ||
    str.includes('NS_ERROR_DOM_QUOTA_REACHED')
  );
}

/**
 * Purges disposable transient caches to free browser storage quota.
 */
export function purgeDisposableStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  for (const key of DISPOSABLE_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}

/**
 * Safely writes a key-value pair to localStorage with automatic QuotaExceeded recovery,
 * fallback to sessionStorage, and in-memory retention.
 * NEVER throws an unhandled exception.
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  // Always update in-memory cache as immediate fallback
  memoryStorageFallback.set(key, value);

  if (typeof window === 'undefined' || !window.localStorage) {
    return true;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (firstErr) {
    if (isQuotaExceededError(firstErr)) {
      console.warn(`[safeStorage] QuotaExceededError writing "${key}". Purging transient caches and retrying...`);
      // Evict transient telemetry/cache keys
      purgeDisposableStorage();

      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[safeStorage] Storage quota still exceeded after purge. Falling back to sessionStorage & memory for "${key}".`, retryErr);
        // Fallback to sessionStorage
        try {
          if (window.sessionStorage) {
            window.sessionStorage.setItem(key, value);
          }
        } catch {
          // Ignore sessionStorage errors
        }
        return true;
      }
    }

    // Generic error (e.g. security disabled in private mode)
    console.warn(`[safeStorage] Storage write failed for "${key}". Kept in memory.`, firstErr);
    return true;
  }
}

/**
 * Safely reads a value from storage, checking localStorage -> sessionStorage -> memory fallback.
 */
export function safeLocalStorageGet(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      // Ignore
    }
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const sessionVal = window.sessionStorage.getItem(key);
      if (sessionVal !== null) return sessionVal;
    } catch {
      // Ignore
    }
  }

  return memoryStorageFallback.get(key) ?? null;
}

/**
 * Safely removes a key from localStorage, sessionStorage, and memory fallback.
 */
export function safeLocalStorageRemove(key: string): void {
  memoryStorageFallback.delete(key);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }
}
