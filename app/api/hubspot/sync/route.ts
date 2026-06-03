import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { syncHubspotContacts } from '@/lib/crm/hubspot';
import { decrypt } from '@/lib/crypto';

export async function POST() {
  try {
    const user = await requireAuth();
    
    const org = await prisma.organization.findUnique({ where: { id: user.orgId } });
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    // Use organization's Hubspot token if they have one, otherwise fallback to system token for demo
    let token = org.hubspotToken ? decrypt(org.hubspotToken) : process.env.HUBSPOT_ACCESS_TOKEN;
    
    if (!token) {
      return NextResponse.json({ error: 'HubSpot not configured' }, { status: 400 });
    }

    const result = await syncHubspotContacts(user.orgId, token);

    // After sync, automatically trigger a segmentation refresh
    await prisma.jobQueue.create({
      data: {
        orgId: user.orgId,
        type: 'REFRESH_SEGMENTS',
        payload: '{}',
        status: 'PENDING'
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
