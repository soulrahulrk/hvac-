import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-insecure-key-change-this-in-production'; // Must be 256 bits (32 characters)
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): string {
  if (!text) return text;
  
  // Create a 16-byte initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create a 32-byte key from the environment variable (pad or truncate if needed)
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string | null {
  if (!encryptedText) return null;
  if (!encryptedText.includes(':')) return encryptedText; // Probably unencrypted fallback
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];
    
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
