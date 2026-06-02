import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Missing Hubspot token' }, { status: 500 });
    }

    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?properties=firstname,lastname,email,phone,address,city,state,zip', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: 'Hubspot API error', details: errorText }, { status: res.status });
    }

    const data = await res.json();
    const contacts = data.results || [];
    
    let syncedCount = 0;

    for (const contact of contacts) {
      const props = contact.properties;
      const email = props.email || `no-email-${contact.id}@hubspot.local`;
      
      await prisma.customer.upsert({
        where: { email },
        update: {
          firstName: props.firstname || 'Unknown',
          lastName: props.lastname || '',
          phone: props.phone || '',
          address: props.address || '',
          city: props.city || '',
          state: props.state || '',
          zipCode: props.zip || '',
        },
        create: {
          email,
          firstName: props.firstname || 'Unknown',
          lastName: props.lastname || '',
          phone: props.phone || '',
          address: props.address || '',
          city: props.city || '',
          state: props.state || '',
          zipCode: props.zip || '',
          equipmentType: 'Unknown',
          equipmentAge: 0,
        }
      });
      syncedCount++;
    }

    return NextResponse.json({ success: true, syncedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
