import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateTwilioWebhook } from '@/lib/telephony/twilio';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const fromNumber = formData.get('From') as string;
    const toNumber = formData.get('To') as string;
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;

    if (!fromNumber || !toNumber) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const org = await prisma.organization.findFirst({
      // Match org based on phone
    });

    if (!org) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Reject reason="busy"/></Response>',
        { headers: { 'Content-Type': 'text/xml' } }
      );
    }

    // Twilio Security Validation
    if (org.twilioToken) {
      const signature = req.headers.get('x-twilio-signature') || '';
      const host = req.headers.get('host') || '';
      // Reconstruct URL for validation. Assuming https
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

    let customer = await prisma.customer.findFirst({
      where: { orgId: org.id, phone: fromNumber }
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          orgId: org.id,
          phone: fromNumber,
          firstName: 'Unknown',
          lastName: 'Caller',
          source: 'INBOUND_CALL'
        }
      });
    }

    await prisma.phoneCall.create({
      data: {
        orgId: org.id,
        customerId: customer.id,
        externalCallId: callSid,
        direction: 'INBOUND',
        fromNumber,
        toNumber,
        status: callStatus === 'completed' ? 'ANSWERED' : 'MISSED',
      }
    });

    // AI Voice Receptionist
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Gather input="speech" action="/api/webhooks/voice/process" method="POST" speechTimeout="auto">
          <Say voice="Polly.Matthew">Hello, thank you for calling. How can I help you with your heating or cooling system today?</Say>
        </Gather>
        <Say voice="Polly.Matthew">We didn't receive any input. Goodbye.</Say>
        <Hangup />
      </Response>
    `;

    return new NextResponse(twiml.trim(), { headers: { 'Content-Type': 'text/xml' } });
  } catch (error) {
    console.error('Inbound voice error:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred.</Say></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
