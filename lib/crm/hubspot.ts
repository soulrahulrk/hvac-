import { prisma } from '@/lib/db';

// This is the sync abstraction layer for HubSpot
export async function syncHubspotContacts(orgId: string, accessToken: string) {
  let hasMore = true;
  let offset = '';
  let syncedCount = 0;

  try {
    while (hasMore) {
      const url = new URL('https://api.hubapi.com/crm/v3/objects/contacts');
      url.searchParams.append('limit', '100');
      url.searchParams.append('properties', 'firstname,lastname,email,phone,lifecyclestage,hs_lead_status,total_revenue');
      if (offset) url.searchParams.append('after', offset);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const contact of data.results) {
        const props = contact.properties;
        
        await prisma.customer.upsert({
          where: {
            orgId_externalId: { orgId, externalId: contact.id }
          },
          update: {
            firstName: props.firstname || 'Unknown',
            lastName: props.lastname || '',
            email: props.email,
            phone: props.phone,
            leadStatus: props.hs_lead_status || 'NEW',
            totalSpent: props.total_revenue ? parseFloat(props.total_revenue) : 0,
            lastSyncAt: new Date()
          },
          create: {
            orgId,
            externalId: contact.id,
            firstName: props.firstname || 'Unknown',
            lastName: props.lastname || '',
            email: props.email,
            phone: props.phone,
            leadStatus: props.hs_lead_status || 'NEW',
            totalSpent: props.total_revenue ? parseFloat(props.total_revenue) : 0,
            source: 'HUBSPOT',
            lastSyncAt: new Date()
          }
        });
        syncedCount++;
      }

      hasMore = !!data.paging?.next?.after;
      offset = data.paging?.next?.after || '';
    }

    return { success: true, count: syncedCount };
  } catch (error) {
    console.error('Hubspot sync failed:', error);
    throw error;
  }
}
