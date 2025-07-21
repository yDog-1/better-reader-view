/**
 * デバッグログ機能
 * 実際のブラウザ環境での動作確認用
 */

export class DebugLogger {
  private static isDevelopment = process.env.NODE_ENV === 'development';
  
  static log(category: string, message: string, data?: unknown) {
    if (this.isDevelopment || typeof window !== 'undefined') {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${category}] ${message}`;
      
      console.log(logMessage, data || '');
      
      // ブラウザ環境ではsessionStorageにも記録
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const logs = JSON.parse(sessionStorage.getItem('debug-logs') || '[]');
          logs.push({
            timestamp,
            category,
            message,
            data: data ? JSON.stringify(data) : null
          });
          
          // 最新100件のみ保持
          if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
          }
          
          sessionStorage.setItem('debug-logs', JSON.stringify(logs));
        } catch (error) {
          console.warn('Failed to save debug log to sessionStorage:', error);
        }
      }
    }
  }
  
  static error(category: string, message: string, error?: unknown) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [ERROR] [${category}] ${message}`;
    
    console.error(logMessage, error || '');
    
    // ブラウザ環境ではsessionStorageにも記録
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const logs = JSON.parse(sessionStorage.getItem('debug-logs') || '[]');
        logs.push({
          timestamp,
          category,
          message: `ERROR: ${message}`,
          data: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : null
        });
        
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }
        
        sessionStorage.setItem('debug-logs', JSON.stringify(logs));
      } catch (sessionError) {
        console.warn('Failed to save debug error to sessionStorage:', sessionError);
      }
    }
  }
  
  static getStoredLogs(): Array<{timestamp: string, category: string, message: string, data: string | null}> {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        return JSON.parse(sessionStorage.getItem('debug-logs') || '[]');
      } catch (error) {
        console.warn('Failed to retrieve debug logs:', error);
      }
    }
    return [];
  }
  
  static clearLogs() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem('debug-logs');
        console.log('Debug logs cleared');
      } catch (error) {
        console.warn('Failed to clear debug logs:', error);
      }
    }
  }
}