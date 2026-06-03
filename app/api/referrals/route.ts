import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    
    const referrals = await prisma.referral.findMany({
      where: { orgId: user.orgId },
      include: {
        referrer: true,
        referred: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(referrals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
