import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    const contacts = await prisma.customer.findMany({
      where: { orgId: user.orgId },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(contacts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
