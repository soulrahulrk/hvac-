import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;

    const call = await prisma.phoneCall.findFirst({
      where: { externalCallId: callSid }
    });

    if (!call) {
      return NextResponse.json({ success: false });
    }

    // Update status
    let mappedStatus = 'ANSWERED';
    if (['no-answer', 'busy', 'canceled', 'failed'].includes(callStatus)) {
      mappedStatus = 'MISSED';
    }

    await prisma.phoneCall.update({
      where: { id: call.id },
      data: { status: mappedStatus }
    });

    // If missed call, trigger the text-back campaign
    if (mappedStatus === 'MISSED' && !call.textBackSent && call.customerId) {
      const trigger = await prisma.trigger.findFirst({
        where: { orgId: call.orgId, event: 'MISSED_CALL', enabled: true }
      });

      if (trigger && trigger.actionType === 'START_CAMPAIGN') {
        const config = JSON.parse(trigger.actionConfig);
        
        // Enroll customer in missed call campaign immediately
        if (config.campaignId) {
          await prisma.campaignEnrollment.create({
            data: {
              campaignId: config.campaignId,
              customerId: call.customerId,
              status: 'ACTIVE',
              nextStepAt: new Date()
            }
          });

          // Kick the queue
          await prisma.jobQueue.create({
            data: {
              orgId: call.orgId,
              type: 'CAMPAIGN_STEP',
              payload: JSON.stringify({ campaignId: config.campaignId }),
              priority: 10,
            }
          });

          await prisma.phoneCall.update({
            where: { id: call.id },
            data: { textBackSent: true, textBackAt: new Date() }
          });
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Status callback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
