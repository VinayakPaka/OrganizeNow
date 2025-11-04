import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

/**
 * Encrypt password using AES encryption
 */
export function encryptPassword(password: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }

  const encrypted = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
  return encrypted;
}

/**
 * Decrypt password using AES decryption
 */
export function decryptPassword(encryptedPassword: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }

  const decrypted = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Client-side encryption (uses same key but runs in browser)
 * Note: In production, consider using a different approach for client-side encryption
 */
export function encryptPasswordClient(password: string, key: string): string {
  return CryptoJS.AES.encrypt(password, key).toString();
}

/**
 * Client-side decryption
 */
export function decryptPasswordClient(encryptedPassword: string, key: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedPassword, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}
