import { StorageError, ErrorHandler } from './errors';
import {
  ReaderViewStyleConfig,
  ReaderViewState,
  StorageConfig,
  StorageArea,
  StorageChangeEvent,
  StorageChangeListener,
} from './types';
import { BrowserAPIManager } from './BrowserAPIManager';

/**
 * Storage configurations for Reader View
 */
export const STORAGE_CONFIGS = {
  STYLE_CONFIG: {
    key: 'readerViewStyleConfig',
    area: 'local' as StorageArea,
    defaultValue: {
      theme: 'light',
      fontSize: 'medium',
      fontFamily: 'sans-serif',
    } as ReaderViewStyleConfig,
  } satisfies StorageConfig<ReaderViewStyleConfig>,

  READER_STATE: {
    key: 'readerViewState',
    area: 'session' as StorageArea, // sessionが推奨だがlocalにフォールバック
    defaultValue: {
      isActive: false,
    } as ReaderViewState,
  } satisfies StorageConfig<ReaderViewState>,
} as const;

/**
 * Pluggable Storage Manager implementation
 * Provides type-safe, error-handled storage operations with reactive capabilities
 */
export class StorageManager {
  private static listeners = new Map<string, Set<StorageChangeListener>>();

  /**
   * Get value from storage with type safety and error handling
   */
  static async get<T>(config: StorageConfig<T>): Promise<T> {
    const result = await BrowserAPIManager.safeAsyncAPICall(
      async () => {
        const storageArea = BrowserAPIManager.getStorageAPI(config.area);

        if (!storageArea) {
          throw new Error(`Storage area ${config.area} not available`);
        }

        const result = await storageArea.get(config.key);
        const stored = result[config.key];

        // Merge with defaults for partial data
        if (
          stored &&
          typeof stored === 'object' &&
          typeof config.defaultValue === 'object'
        ) {
          const merged = { ...config.defaultValue, ...stored } as T;
          return merged;
        }

        const finalValue = stored ?? config.defaultValue;
        return finalValue;
      },
      config.defaultValue,
      `storage.${config.area}`
    );

    return result;
  }

  /**
   * Set complete value in storage
   */
  static async set<T>(config: StorageConfig<T>, value: T): Promise<void> {
    await BrowserAPIManager.safeAsyncAPICall(
      async () => {
        const storageArea = BrowserAPIManager.getStorageAPI(config.area);

        if (!storageArea) {
          throw new Error(`Storage area ${config.area} not available`);
        }

        const oldValue = await this.get(config);

        const setData = { [config.key]: value };

        await storageArea.set(setData);

        // Emit change event
        this.emitChange({
          key: config.key,
          area: config.area,
          oldValue,
          newValue: value,
        });
      },
      undefined,
      `storage.${config.area}`
    );
  }

  /**
   * Update partial value in storage
   */
  static async update<T>(
    config: StorageConfig<T>,
    updates: Partial<T>
  ): Promise<void> {
    try {
      const currentValue = await this.get(config);
      const newValue = { ...currentValue, ...updates } as T;
      await this.set(config, newValue);
    } catch (error) {
      const storageError = new StorageError(
        `update ${config.key} in ${config.area}`,
        error as Error
      );
      ErrorHandler.handle(storageError);
      throw storageError;
    }
  }

  /**
   * Reset value to default
   */
  static async reset<T>(config: StorageConfig<T>): Promise<void> {
    await this.set(config, config.defaultValue);
  }

  /**
   * Clear storage area or specific keys
   */
  static async clear(area?: StorageArea, keys?: string[]): Promise<void> {
    await BrowserAPIManager.safeAsyncAPICall(
      async () => {
        if (area) {
          const storageArea = BrowserAPIManager.getStorageAPI(area);
          if (!storageArea) {
            throw new Error(`Storage area ${area} not available`);
          }

          if (keys && keys.length > 0) {
            await storageArea.remove(keys);
          } else {
            await storageArea.clear();
          }
        } else {
          // Clear all areas
          const localStorage = BrowserAPIManager.getStorageAPI('local');
          const sessionStorage = BrowserAPIManager.getStorageAPI('session');

          const clearPromises = [];
          if (localStorage) clearPromises.push(localStorage.clear());
          if (sessionStorage) clearPromises.push(sessionStorage.clear());

          await Promise.all(clearPromises);
        }
      },
      undefined,
      'storage'
    );
  }

  /**
   * Subscribe to storage changes
   */
  static subscribe<T>(
    key: string,
    listener: StorageChangeListener<T>
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener as StorageChangeListener);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(listener as StorageChangeListener);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Emit storage change event to subscribers
   */
  private static emitChange<T>(event: StorageChangeEvent<T>): void {
    const listeners = this.listeners.get(event.key);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          const storageListenerError = new StorageError(
            'storage change listener',
            error as Error
          );
          ErrorHandler.handle(storageListenerError);
        }
      });
    }
  }

  // Convenience methods for specific storage operations
  /**
   * Get style configuration
   */
  static async getStyleConfig(): Promise<ReaderViewStyleConfig> {
    return this.get(STORAGE_CONFIGS.STYLE_CONFIG);
  }

  /**
   * Update style configuration
   */
  static async updateStyleConfig(
    config: Partial<ReaderViewStyleConfig>
  ): Promise<void> {
    return this.update(STORAGE_CONFIGS.STYLE_CONFIG, config);
  }

  /**
   * Get Reader View state
   */
  static async getReaderViewState(): Promise<ReaderViewState> {
    return this.get(STORAGE_CONFIGS.READER_STATE);
  }

  /**
   * Update Reader View state
   */
  static async updateReaderViewState(
    state: Partial<ReaderViewState>
  ): Promise<void> {
    return this.update(STORAGE_CONFIGS.READER_STATE, state);
  }

  /**
   * Activate Reader View
   */
  static async activateReaderView(url?: string, title?: string): Promise<void> {
    return this.set(STORAGE_CONFIGS.READER_STATE, {
      isActive: true,
      url,
      title,
    });
  }

  /**
   * Deactivate Reader View
   */
  static async deactivateReaderView(): Promise<void> {
    return this.set(STORAGE_CONFIGS.READER_STATE, {
      isActive: false,
      url: undefined,
      title: undefined,
    });
  }

  /**
   * Migrate from legacy storage keys for backward compatibility
   */
  static async migrateFromLegacyStorage(): Promise<void> {
    await BrowserAPIManager.safeAsyncAPICall(
      async () => {
        const localStorage = BrowserAPIManager.getStorageAPI('local');
        if (!localStorage) {
          throw new Error('Local storage not available');
        }

        const legacyData = await localStorage.get(
          'globalReaderViewStyleConfig'
        );
        if (legacyData.globalReaderViewStyleConfig) {
          // Migrate to new key
          await this.updateStyleConfig(legacyData.globalReaderViewStyleConfig);
          // Remove old key
          await localStorage.remove('globalReaderViewStyleConfig');
        }
      },
      undefined,
      'storage.local'
    );
  }

  /**
   * Reset all settings to defaults
   */
  static async resetAllSettings(): Promise<void> {
    try {
      await Promise.all([
        this.reset(STORAGE_CONFIGS.STYLE_CONFIG),
        this.reset(STORAGE_CONFIGS.READER_STATE),
      ]);
    } catch (error) {
      const storageError = new StorageError(
        'reset all settings',
        error as Error
      );
      ErrorHandler.handle(storageError);
      throw storageError;
    }
  }
}

// Re-export types for convenience
export type { ReaderViewStyleConfig, ReaderViewState } from './types';
