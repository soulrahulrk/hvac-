import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const fromNumber = formData.get('From') as string;
    const toNumber = formData.get('To') as string;
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string; // 'ringing', 'in-progress'

    if (!fromNumber || !toNumber) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Find org by Twilio Phone
    const org = await prisma.organization.findFirst({
      // where: { twilioPhone: toNumber }
    });

    if (!org) {
      // End call if no org found
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Reject reason="busy"/></Response>',
        { headers: { 'Content-Type': 'text/xml' } }
      );
    }

    // Find or create customer
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

    // Log the call
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

    // Check if MISSED CALL TEXT BACK trigger exists
    const trigger = await prisma.trigger.findFirst({
      where: { orgId: org.id, event: 'MISSED_CALL', enabled: true }
    });

    // We generate TwiML for the call.
    // If we want AI receptionist, we'd use <Gather input="speech">.
    // For now, simple voicemail or ring forwarding.
    const twiml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Matthew">Thank you for calling. Please leave a message after the tone.</Say>
        <Record action="/api/webhooks/voice/record" maxLength="60" />
      </Response>
    `;

    // Note: To truly detect a "missed call", we handle the Twilio StatusCallback where CallStatus is 'no-answer', 'busy', 'canceled', 'failed'.
    // If this route is hit, it means the call just started.

    return new NextResponse(twiml.trim(), { headers: { 'Content-Type': 'text/xml' } });
  } catch (error) {
    console.error('Inbound voice error:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred.</Say></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
