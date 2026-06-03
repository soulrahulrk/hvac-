import twilio from 'twilio';
import { decrypt } from '@/lib/crypto';

export function validateTwilioWebhook(
  token: string,
  signature: string,
  url: string,
  params: Record<string, any>
): boolean {
  // Always skip in local dev unless explicitly testing
  if (process.env.NODE_ENV !== 'production' && !process.env.TEST_TWILIO_VALIDATION) {
    return true;
  }

  // Decrypt token if it's encrypted
  const actualToken = decrypt(token) || token;

  try {
    return twilio.validateRequest(actualToken, signature, url, params);
  } catch (err) {
    console.error('Twilio validation failed:', err);
    return false;
  }
}
