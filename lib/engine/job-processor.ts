import { prisma } from '@/lib/db';
import { executeCampaignStep } from './campaign-executor';

// Simple SMS mock for now. In Phase 4 this will use Twilio/Textbelt.
async function sendSms(payload: any) {
  // In a real environment, this calls Twilio/Textbelt
  console.log(`[SENDING SMS] To ${payload.customerId}: ${payload.content}`);
  
  await prisma.message.create({
    data: {
      orgId: payload.orgId,
      customerId: payload.customerId,
      direction: 'OUTBOUND',
      channel: 'SMS',
      content: payload.content,
      status: 'SENT',
      campaignId: payload.campaignId,
      enrollmentId: payload.enrollmentId,
      aiGenerated: true
    }
  });
}

export async function processJobQueue() {
  // Pull top 10 pending jobs that are due
  const jobs = await prisma.jobQueue.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: new Date() }
    },
    orderBy: [
      { priority: 'desc' },
      { scheduledFor: 'asc' }
    ],
    take: 10
  });

  for (const job of jobs) {
    // Lock job
    await prisma.jobQueue.update({
      where: { id: job.id },
      data: { status: 'RUNNING', startedAt: new Date() }
    });

    try {
      const payload = JSON.parse(job.payload);
      
      switch (job.type) {
        case 'CAMPAIGN_STEP':
          // Process all due enrollments for a campaign
          const enrollments = await prisma.campaignEnrollment.findMany({
            where: {
              campaignId: payload.campaignId,
              status: 'ACTIVE',
              nextStepAt: { lte: new Date() }
            },
            take: 50
          });
          
          for (const enc of enrollments) {
            await executeCampaignStep(enc.id);
          }
          break;
          
        case 'SEND_SMS':
          await sendSms({ ...payload, orgId: job.orgId });
          break;
          
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Mark success
      await prisma.jobQueue.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });

    } catch (error: any) {
      console.error(`Job ${job.id} failed:`, error);
      
      if (job.attempts + 1 >= job.maxAttempts) {
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: { status: 'DEAD', error: error.message, attempts: { increment: 1 } }
        });
      } else {
        // Retry with backoff (e.g., 5 mins)
        const nextTime = new Date();
        nextTime.setMinutes(nextTime.getMinutes() + 5);
        await prisma.jobQueue.update({
          where: { id: job.id },
          data: { status: 'PENDING', error: error.message, attempts: { increment: 1 }, scheduledFor: nextTime }
        });
      }
    }
  }
}
