import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { CampaignCreateSchema } from '@/lib/validation';
import { z } from 'zod';

export async function GET() {
  try {
    const user = await requireAuth();
    
    const campaigns = await prisma.campaign.findMany({
      where: { orgId: user.orgId, status: { not: 'ARCHIVED' } },
      include: { segment: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    // In real app, CampaignCreateSchema should be robust enough to handle steps
    const { name, type, channel, scheduleType, targetSegment } = CampaignCreateSchema.parse(body);

    const campaign = await prisma.campaign.create({
      data: {
        orgId: user.orgId,
        name,
        type,
        channel,
        scheduleType,
        targetSegment,
        segmentId: body.segmentId,
      }
    });

    // If steps provided, create them
    if (body.steps && Array.isArray(body.steps)) {
      for (let i = 0; i < body.steps.length; i++) {
        await prisma.campaignStep.create({
          data: {
            campaignId: campaign.id,
            stepNumber: i + 1,
            templateContent: body.steps[i].templateContent,
            delayMinutes: body.steps[i].delayMinutes || 0,
            channel: body.steps[i].channel || channel,
            aiPersonalize: body.steps[i].aiPersonalize ?? true,
          }
        });
      }
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
