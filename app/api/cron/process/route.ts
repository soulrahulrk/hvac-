import { NextResponse } from 'next/server';
import { processJobQueue } from '@/lib/engine/job-processor';
import { refreshAllSegments } from '@/lib/engine/segmentation';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    // In production, secure this endpoint with a cron secret key
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Process job queue
    await processJobQueue();

    // Nightly segmentation refresh logic could go here based on time of day
    const hour = new Date().getUTCHours();
    if (hour === 8) { // 8 AM UTC
      const orgs = await prisma.organization.findMany({ select: { id: true } });
      for (const org of orgs) {
        await refreshAllSegments(org.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cron process error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
