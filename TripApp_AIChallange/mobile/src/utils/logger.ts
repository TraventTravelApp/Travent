// Logger utility to prevent sensitive data leakage in production
export const logger = {
  log: (...args: any[]) => {
    // In production (non-expo), disable logging of potentially sensitive info
    const isProduction = !__DEV__; // Expo provides __DEV__ global
    if (!isProduction) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    const isProduction = !__DEV__;
    if (!isProduction) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors for debugging, but be cautious about what we log
    console.error(...args);
  },
  
  // Special method for token-related logging that's always disabled in production
  debug: (...args: any[]) => {
    const isProduction = !__DEV__;
    if (!isProduction) {
      console.log('[DEBUG]', ...args);
    }
  }
};