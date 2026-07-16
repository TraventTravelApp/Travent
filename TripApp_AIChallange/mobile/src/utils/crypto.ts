// Encryption utility for securing tokens in AsyncStorage
// Simple encryption using Base64 (for demonstration - in production use crypto-js or similar)

/**
 * Encrypt data using Base64 encoding
 * @param data - Data to encrypt (string or object)
 * @returns Encrypted string
 */
export const encrypt = (data: string | object): string => {
  try {
    const dataToEncrypt = typeof data === 'string' ? data : JSON.stringify(data);
    // Simple Base64 encoding for demonstration
    // In production, replace with proper encryption like AES from crypto-js
    return btoa(unescape(encodeURIComponent(dataToEncrypt)));
  } catch (error) {
    console.error('[CRYPTO] Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using Base64 decoding
 * @param encryptedData - Encrypted string to decrypt
 * @returns Decrypted string or parsed object
 */
export const decrypt = <T>(encryptedData: string | null): T | string | null => {
  if (!encryptedData) return null;
  try {
    // Simple Base64 decoding for demonstration
    // In production, replace with proper decryption like AES from crypto-js
    const decoded = decodeURIComponent(escape(atob(encryptedData)));
    
    // Try to parse as JSON, return as string if parsing fails
    try {
      return JSON.parse(decoded) as T;
    } catch (e) {
      return decoded as T;
    }
  } catch (error) {
    console.error('[CRYPTO] Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};