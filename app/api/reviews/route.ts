import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Using Prisma to fetch all real reviews for this organization
    const reviews = await prisma.review.findMany({
      where: { orgId: user.orgId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    
    const review = await prisma.review.create({
      data: {
        orgId: user.orgId,
        customerId: body.customerId,
        rating: body.rating,
        content: body.content,
        platform: body.platform || 'GOOGLE',
        url: body.url,
      }
    });

    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
