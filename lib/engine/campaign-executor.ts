import { prisma } from '@/lib/db';
import { getCustomersInSegment } from './segmentation';
import { getAIProvider } from '@/lib/ai/provider';
import { buildCustomerContext } from '@/lib/ai/context';
import { buildPrompt, SYSTEM_PROMPTS } from '@/lib/ai/prompts';
import { decrypt } from '@/lib/crypto';

export async function launchCampaign(campaignId: string, orgId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, orgId },
    include: { steps: { orderBy: { stepNumber: 'asc' } }, org: true }
  });

  if (!campaign || campaign.status !== 'DRAFT') {
    throw new Error('Invalid campaign or not in DRAFT status');
  }

  if (!campaign.segmentId) {
    throw new Error('Campaign requires a segment');
  }

  // Update status to Active
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'ACTIVE' }
  });

  // Get target customers
  const customers = await getCustomersInSegment(campaign.segmentId);
  
  // Enroll customers
  for (const customer of customers) {
    await prisma.campaignEnrollment.create({
      data: {
        campaignId: campaign.id,
        customerId: customer.id,
        currentStep: 1,
        status: 'ACTIVE',
        nextStepAt: new Date(), // Immediate for step 1
      }
    });
  }

  // Schedule the processor job to start picking up these enrollments immediately
  await prisma.jobQueue.create({
    data: {
      orgId,
      type: 'CAMPAIGN_STEP',
      payload: JSON.stringify({ campaignId: campaign.id }),
      status: 'PENDING',
      priority: 10,
    }
  });

  // Activity Log
  await prisma.activityLog.create({
    data: {
      orgId,
      type: 'CAMPAIGN_LAUNCHED',
      description: `Launched campaign: ${campaign.name} targeting ${customers.length} customers.`,
    }
  });

  return { success: true, enrolledCount: customers.length };
}

// NOTE: This would be called by the background job processor
export async function executeCampaignStep(enrollmentId: string) {
  const enrollment = await prisma.campaignEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      campaign: { include: { steps: true, org: true } },
      customer: true
    }
  });

  if (!enrollment || enrollment.status !== 'ACTIVE') return;

  const currentStepDef = enrollment.campaign.steps.find(s => s.stepNumber === enrollment.currentStep);
  if (!currentStepDef) {
    // Campaign complete
    await prisma.campaignEnrollment.update({
      where: { id: enrollmentId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });
    return;
  }

  // Generate Message Content using AI if enabled
  let finalContent = currentStepDef.templateContent;
  
  if (currentStepDef.aiPersonalize) {
    try {
      const org = enrollment.campaign.org;
      let apiKey = org.aiApiKey ? decrypt(org.aiApiKey) : null;
      if (!apiKey) apiKey = org.aiProvider === 'gemini' ? process.env.GOOGLE_API_KEY : process.env.KIMI_API_KEY;
      
      if (apiKey) {
        const provider = getAIProvider(org.aiProvider, apiKey, org.aiModel);
        const context = await buildCustomerContext(enrollment.customerId);
        
        // Map campaign type to prompt type
        const promptTypeMap: Record<string, string> = {
          'REACTIVATION': 'SMS_REACTIVATION',
          'ESTIMATE_FOLLOWUP': 'SMS_ESTIMATE_FOLLOWUP',
          'MAINTENANCE_REMINDER': 'SMS_MAINTENANCE_REMINDER',
          'REVIEW_REQUEST': 'SMS_REVIEW_REQUEST'
        };
        
        const systemPrompt = SYSTEM_PROMPTS[promptTypeMap[enrollment.campaign.type] as keyof typeof SYSTEM_PROMPTS] 
          || `You are an HVAC rep. Use this template as a base but personalize it: "${currentStepDef.templateContent}"`;
          
        const prompt = buildPrompt(systemPrompt, context);
        finalContent = await provider.generateText(prompt);
      }
    } catch (error) {
      console.error('AI Personalization failed, falling back to raw template', error);
      // Fallback to basic replacement
      finalContent = finalContent
        .replace('{firstName}', enrollment.customer.firstName)
        .replace('{lastName}', enrollment.customer.lastName);
    }
  } else {
     finalContent = finalContent
        .replace('{firstName}', enrollment.customer.firstName)
        .replace('{lastName}', enrollment.customer.lastName);
  }

  // Queue actual message sending
  await prisma.jobQueue.create({
    data: {
      orgId: enrollment.campaign.orgId,
      type: 'SEND_SMS', // Or EMAIL based on step.channel
      payload: JSON.stringify({
        customerId: enrollment.customerId,
        content: finalContent,
        campaignId: enrollment.campaignId,
        enrollmentId: enrollment.id
      }),
      status: 'PENDING'
    }
  });

  // Advance step
  const nextStepDef = enrollment.campaign.steps.find(s => s.stepNumber === enrollment.currentStep + 1);
  
  if (nextStepDef) {
    const nextTime = new Date();
    nextTime.setMinutes(nextTime.getMinutes() + nextStepDef.delayMinutes);
    
    await prisma.campaignEnrollment.update({
      where: { id: enrollmentId },
      data: { 
        currentStep: enrollment.currentStep + 1,
        lastStepAt: new Date(),
        nextStepAt: nextTime
      }
    });
  } else {
    // No more steps
    await prisma.campaignEnrollment.update({
      where: { id: enrollmentId },
      data: { 
        status: 'COMPLETED',
        lastStepAt: new Date(),
        completedAt: new Date()
      }
    });
  }

  // Update stats
  await prisma.campaign.update({
    where: { id: enrollment.campaignId },
    data: { totalSent: { increment: 1 } }
  });
}
