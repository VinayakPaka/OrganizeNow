/**
 * Safe LocalStorage Utilities
 * Handles quota exceeded and private browsing scenarios
 */

export class SafeStorage {
  private static inMemoryStorage = new Map<string, string>();
  private static isAvailable: boolean | null = null;

  /**
   * Check if localStorage is available
   */
  private static checkAvailability(): boolean {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
      return true;
    } catch (error) {
      console.warn('[SafeStorage] localStorage not available:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Safely set item in localStorage with fallback to memory
   */
  static setItem(key: string, value: string): boolean {
    try {
      if (this.checkAvailability()) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (error) {
      console.warn('[SafeStorage] Failed to set item in localStorage:', error);
    }

    // Fallback to in-memory storage
    this.inMemoryStorage.set(key, value);
    return false;
  }

  /**
   * Safely get item from localStorage with fallback to memory
   */
  static getItem(key: string): string | null {
    try {
      if (this.checkAvailability()) {
        const value = localStorage.getItem(key);
        if (value !== null) return value;
      }
    } catch (error) {
      console.warn('[SafeStorage] Failed to get item from localStorage:', error);
    }

    // Fallback to in-memory storage
    return this.inMemoryStorage.get(key) || null;
  }

  /**
   * Safely remove item from localStorage
   */
  static removeItem(key: string): void {
    try {
      if (this.checkAvailability()) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('[SafeStorage] Failed to remove item from localStorage:', error);
    }

    // Also remove from memory
    this.inMemoryStorage.delete(key);
  }

  /**
   * Clean up old entries from localStorage
   */
  static cleanup(keyPrefix: string, maxAge: number): void {
    try {
      if (!this.checkAvailability()) return;

      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(keyPrefix)) continue;

        const value = localStorage.getItem(key);
        if (!value) continue;

        try {
          const timestamp = parseInt(value, 10);
          if (now - timestamp > maxAge) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Invalid value, remove it
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      if (keysToRemove.length > 0) {
        console.log(`[SafeStorage] Cleaned up ${keysToRemove.length} old entries`);
      }
    } catch (error) {
      console.warn('[SafeStorage] Failed to cleanup:', error);
    }
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
