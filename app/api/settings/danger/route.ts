import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (action === 'clear-messages') {
      await prisma.message.deleteMany();
      return NextResponse.json({ success: true, message: 'Message history cleared' });
    } 
    
    if (action === 'reset-all') {
      await prisma.activityLog.deleteMany();
      await prisma.message.deleteMany();
      await prisma.campaign.deleteMany();
      await prisma.customer.deleteMany();
      // Keep Organization and Settings so they don't get locked out
      return NextResponse.json({ success: true, message: 'All data reset' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
