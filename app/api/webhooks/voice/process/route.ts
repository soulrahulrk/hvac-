import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAIProvider } from '@/lib/ai/provider';
import { validateTwilioWebhook } from '@/lib/telephony/twilio';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const callSid = formData.get('CallSid') as string;
    const speechResult = formData.get('SpeechResult') as string;

    // A real implementation would parse the orgId from the URL or state, 
    // but for now we'll match the first org just like the inbound route.
    const org = await prisma.organization.findFirst({});

    if (!org) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>',
        { headers: { 'Content-Type': 'text/xml' } }
      );
    }

    // Twilio Security Validation
    if (org.twilioToken) {
      const signature = req.headers.get('x-twilio-signature') || '';
      const host = req.headers.get('host') || '';
      const url = `https://${host}${req.url.replace(/^http(s)?:\/\/[^\/]+/, '')}`;
      
      const isValid = validateTwilioWebhook(
        org.twilioToken,
        signature,
        url,
        Object.fromEntries(formData.entries())
      );

      if (!isValid) {
        return new NextResponse('Invalid signature', { status: 403 });
      }
    }

    if (!speechResult) {
      // No speech detected, hang up
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Matthew">I didn\'t catch that. Goodbye.</Say><Hangup/></Response>',
        { headers: { 'Content-Type': 'text/xml' } }
      );
    }

    // Log the transcription
    await prisma.phoneCall.updateMany({
      where: { externalCallId: callSid },
      data: { transcription: speechResult }
    });

    let aiResponseText = "Thank you for your message. We will reach out shortly.";

    try {
      if (org.aiApiKey) {
        const aiProvider = getAIProvider(org.aiProvider, org.aiApiKey, org.aiModel);
        
        const systemPrompt = `You are a virtual receptionist for an HVAC company. 
A customer just called and said: "${speechResult}"
Respond briefly, politely, and professionally. Acknowledge their issue, tell them a technician will be dispatched or someone will call them back. Keep the response under 3 sentences so it can be spoken quickly over the phone. Do not include emojis or special formatting.`;

        aiResponseText = await aiProvider.generateText(systemPrompt, { temperature: 0.5 });
      }
    } catch (aiError) {
      console.error('AI Voice Generation failed:', aiError);
      // Fallback
    }

    // Return TwiML
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Matthew">${aiResponseText}</Say>
        <Pause length="1"/>
        <Say voice="Polly.Matthew">Goodbye!</Say>
        <Hangup />
      </Response>
    `;

    return new NextResponse(twiml.trim(), { headers: { 'Content-Type': 'text/xml' } });
  } catch (error) {
    console.error('Voice process error:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred.</Say></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
