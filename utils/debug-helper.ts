/**
 * デバッグヘルパー関数
 * ブラウザコンソールから手動でテストするための関数群
 */

import { DebugLogger } from './debug-logger';
import { StorageManager } from './storage-config';
import { BrowserAPIManager } from './BrowserAPIManager';
import type { ReaderViewStyleConfig } from './types';

// グローバルオブジェクトにデバッグ関数を追加
declare global {
  interface Window {
    debugReaderView: {
      getStoredLogs: () => void;
      clearLogs: () => void;
      testStorageWrite: (config?: Partial<ReaderViewStyleConfig>) => Promise<void>;
      testStorageRead: () => Promise<void>;
      getStorageConfig: () => Promise<void>;
      getBrowserInfo: () => void;
      testMigration: () => Promise<void>;
    };
  }
}

/**
 * デバッグ関数をグローバルに公開
 */
export function exposeDebugFunctions() {
  if (typeof window !== 'undefined') {
    window.debugReaderView = {
      // ストレージされたログを表示
      getStoredLogs() {
        const logs = DebugLogger.getStoredLogs();
        console.group('📋 Debug Logs');
        logs.forEach((log, index) => {
          console.log(`${index + 1}. [${log.timestamp}] [${log.category}] ${log.message}`, log.data ? JSON.parse(log.data) : '');
        });
        console.groupEnd();
      },

      // ログをクリア
      clearLogs() {
        DebugLogger.clearLogs();
        console.log('✅ Debug logs cleared');
      },

      // ストレージ書き込みテスト
      async testStorageWrite(config = { theme: 'dark', fontSize: 'large', fontFamily: 'serif' }) {
        console.log('🔧 Testing storage write with config:', config);
        try {
          await StorageManager.updateStyleConfig(config as ReaderViewStyleConfig);
          console.log('✅ Storage write test completed');
        } catch (error) {
          console.error('❌ Storage write test failed:', error);
        }
      },

      // ストレージ読み込みテスト
      async testStorageRead() {
        console.log('📖 Testing storage read');
        try {
          const config = await StorageManager.getStyleConfig();
          console.log('✅ Storage read result:', config);
        } catch (error) {
          console.error('❌ Storage read test failed:', error);
        }
      },

      // 現在のストレージ設定を取得
      async getStorageConfig() {
        console.log('⚙️ Getting current storage configuration');
        try {
          const styleConfig = await StorageManager.getStyleConfig();
          const readerState = await StorageManager.getReaderViewState();
          
          console.group('📋 Current Storage Configuration');
          console.log('Style Config:', styleConfig);
          console.log('Reader State:', readerState);
          console.groupEnd();
        } catch (error) {
          console.error('❌ Failed to get storage config:', error);
        }
      },

      // ブラウザ情報を表示
      getBrowserInfo() {
        console.group('🌐 Browser Information');
        console.log('Browser compatibility:', BrowserAPIManager.getBrowserCompatibility());
        console.log('Storage supported:', BrowserAPIManager.isStorageSupported());
        console.log('Storage local API:', BrowserAPIManager.getStorageAPI('local'));
        console.log('Storage session API:', BrowserAPIManager.getStorageAPI('session'));
        console.groupEnd();
      },

      // マイグレーションテスト
      async testMigration() {
        console.log('🔄 Testing legacy storage migration');
        try {
          await StorageManager.migrateFromLegacyStorage();
          console.log('✅ Migration test completed');
        } catch (error) {
          console.error('❌ Migration test failed:', error);
        }
      }
    };

    console.log('🐛 Debug functions loaded. Use window.debugReaderView to access:');
    console.log('  - getStoredLogs(): Show all debug logs');
    console.log('  - clearLogs(): Clear debug logs');  
    console.log('  - testStorageWrite(): Test writing to storage');
    console.log('  - testStorageRead(): Test reading from storage');
    console.log('  - getStorageConfig(): Show current storage config');
    console.log('  - getBrowserInfo(): Show browser compatibility info');
    console.log('  - testMigration(): Test legacy storage migration');
  }
}