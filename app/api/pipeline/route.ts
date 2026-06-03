import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Aggregate customers by leadStatus to represent the pipeline
    const customers = await prisma.customer.findMany({
      where: { orgId: user.orgId }
    });

    const pipeline = {
      NEW: customers.filter(c => c.leadStatus === 'NEW'),
      CONTACTED: customers.filter(c => c.leadStatus === 'CONTACTED'),
      ESTIMATE: customers.filter(c => c.estimateStatus === 'SENT' || c.estimateStatus === 'FOLLOW_UP'),
      WON: customers.filter(c => c.leadStatus === 'WON'),
      LOST: customers.filter(c => c.leadStatus === 'LOST'),
      DORMANT: customers.filter(c => c.leadStatus === 'DORMANT')
    };
    
    return NextResponse.json(pipeline);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
