import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }
    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }
    
    const updated = await prisma.organization.update({
      where: { id: org.id },
      data: {
        twilioSid: data.twilioSid,
        twilioToken: data.twilioToken,
        twilioPhone: data.twilioPhone,
        hubspotToken: data.hubspotToken,
        textbeltKey: data.textbeltKey,
        aiProvider: data.aiProvider,
        aiApiKey: data.aiApiKey,
        aiModel: data.aiModel,
      }
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
