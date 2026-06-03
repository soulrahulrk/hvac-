import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAIProvider } from '@/lib/ai/provider';
import { buildCustomerContext } from '@/lib/ai/context';
import { sendSms } from '@/lib/telephony/sms-client';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Twilio payload properties
    const fromNumber = formData.get('From') as string;
    const toNumber = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    if (!fromNumber || !body) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Find the organization based on the Twilio phone number receiving the SMS
    // For prototype purposes without real Twilio integration, we might match on first org.
    const org = await prisma.organization.findFirst({
      // where: { twilioPhone: toNumber }
    });

    if (!org) {
      return NextResponse.json({ success: false, error: 'Org not found' });
    }

    // Find customer by phone number
    let customer = await prisma.customer.findFirst({
      where: { orgId: org.id, phone: fromNumber }
    });

    // If customer doesn't exist, this is a net-new lead!
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          orgId: org.id,
          phone: fromNumber,
          firstName: 'Unknown',
          lastName: 'Contact',
          leadStatus: 'NEW',
          source: 'INBOUND_SMS'
        }
      });
      
      // Log pipeline activity
      await prisma.activityLog.create({
        data: {
          orgId: org.id,
          customerId: customer.id,
          type: 'LEAD_STATUS_CHANGED',
          description: `New lead created from inbound SMS: ${fromNumber}`
        }
      });
    }

    // Log the inbound message
    await prisma.message.create({
      data: {
        orgId: org.id,
        customerId: customer.id,
        direction: 'INBOUND',
        channel: 'SMS',
        content: body,
        status: 'RECEIVED',
        externalId: messageSid
      }
    });

    // Check opt-out
    if (body.trim().toUpperCase() === 'STOP') {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { smsOptIn: false }
      });
      
      // Opt out of any active campaigns
      await prisma.campaignEnrollment.updateMany({
        where: { customerId: customer.id, status: 'ACTIVE' },
        data: { status: 'OPTED_OUT', completedAt: new Date() }
      });
      
      return NextResponse.json({ success: true, optedOut: true });
    }

    // AI Auto-Responder logic
    // We check if a Trigger is configured for INBOUND_SMS
    const trigger = await prisma.trigger.findFirst({
      where: { orgId: org.id, event: 'INBOUND_SMS', enabled: true }
    });

    if (trigger && trigger.actionType === 'AI_RESPOND') {
      // JobQueue will handle the generation and sending asynchronously
      // to keep webhook response time fast.
      await prisma.jobQueue.create({
        data: {
          orgId: org.id,
          type: 'AI_GENERATE',
          payload: JSON.stringify({
            customerId: customer.id,
            promptType: 'SMS_INBOUND_REPLY',
            customerMessage: body,
          }),
          status: 'PENDING'
        }
      });
    }

    // Twilio requires an empty TwiML response to acknowledge receipt without sending a direct reply
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    });
  } catch (error) {
    console.error('Inbound SMS error:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
