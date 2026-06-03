import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { createSystemSegments } from '@/lib/engine/segmentation';
import { z } from 'zod';

const CreateSegmentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  rules: z.record(z.any()),
});

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Auto-create system segments if none exist
    const count = await prisma.segment.count({ where: { orgId: user.orgId } });
    if (count === 0) {
      await createSystemSegments(user.orgId);
    }
    
    const segments = await prisma.segment.findMany({
      where: { orgId: user.orgId },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(segments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { name, description, rules } = CreateSegmentSchema.parse(body);

    const segment = await prisma.segment.create({
      data: {
        orgId: user.orgId,
        name,
        description,
        rules: JSON.stringify(rules),
        isSystem: false,
      }
    });

    return NextResponse.json(segment);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
