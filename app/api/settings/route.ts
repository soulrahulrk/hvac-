import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst({
      include: {
        settings: true
      }
    });
    if (!org) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 });
    }
    
    const settingsObj = org.settings.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    return NextResponse.json({
      ...org,
      ...settingsObj
    });
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
        
        name: data.companyName ?? org.name,
        phone: data.bizPhone ?? org.phone,
        email: data.bizEmail ?? org.email,
        address: data.bizAddress ?? org.address,
        brandColor: data.brandColor ?? org.brandColor,
      }
    });

    const settingKeys = ['autoTextBack', 'aiResponses', 'autoReview', 'followUpReminders', 'followUpDelay', 'maxMessages'];
    
    for (const key of settingKeys) {
      if (data[key] !== undefined) {
        // Upsert setting
        const existing = await prisma.settings.findUnique({
          where: { orgId_key: { orgId: org.id, key } }
        });
        if (existing) {
          await prisma.settings.update({
            where: { id: existing.id },
            data: { value: String(data[key]) }
          });
        } else {
          await prisma.settings.create({
            data: { orgId: org.id, key, value: String(data[key]) }
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
