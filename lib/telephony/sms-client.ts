import { decrypt } from '@/lib/crypto';
import { prisma } from '@/lib/db';

export async function sendSms(orgId: string, to: string, message: string) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new Error('Organization not found');

  // Unified sending: if Twilio configured use it, else fallback to Textbelt
  
  const hasTwilio = org.twilioSid && org.twilioToken && org.twilioPhone;

  if (hasTwilio) {
    // Phase 4: Full Twilio Integration
    const twilioSid = decrypt(org.twilioSid!);
    const twilioToken = decrypt(org.twilioToken!);
    
    // In actual node environment, we would use the twilio npm package
    // const client = require('twilio')(twilioSid, twilioToken);
    // await client.messages.create({ body: message, from: org.twilioPhone, to });
    
    // Using fetch for edge-compatibility if needed
    const encodedCredentials = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
    
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', org.twilioPhone!);
    params.append('Body', message);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Twilio Error: ${err.message}`);
    }

    return await response.json();

  } else {
    // Fallback to Textbelt
    let key = org.textbeltKey ? decrypt(org.textbeltKey) : process.env.TEXTBELT_API_KEY;
    if (!key) throw new Error('No SMS provider configured');

    const res = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: to,
        message: message,
        key: key
      })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(`Textbelt Error: ${data.error}`);
    }
    
    return data;
  }
}
