import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    
    const feedback = await prisma.feedback.findMany({
      where: { orgId: user.orgId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(feedback);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
