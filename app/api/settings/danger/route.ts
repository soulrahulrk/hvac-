import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    const org = await prisma.organization.findFirst();
    
    if (!org) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }

    if (action === 'clear-messages') {
      await prisma.message.deleteMany({
        where: { orgId: org.id }
      });
      return NextResponse.json({ success: true, message: 'Message history cleared' });
    } 
    
    if (action === 'reset-all') {
      // Delete in correct order or rely on cascade, but we can do it explicitly
      await prisma.activityLog.deleteMany({ where: { orgId: org.id } });
      await prisma.message.deleteMany({ where: { orgId: org.id } });
      await prisma.campaign.deleteMany({ where: { orgId: org.id } });
      await prisma.customer.deleteMany({ where: { orgId: org.id } });
      
      // Keep Organization and Settings so they don't get locked out
      return NextResponse.json({ success: true, message: 'All data reset' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
