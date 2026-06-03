import { prisma } from '@/lib/db';

export async function buildCustomerContext(customerId: string): Promise<string> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        take: 3
      },
      memberships: {
        where: { status: 'ACTIVE' },
        take: 1
      },
      org: true
    }
  });

  if (!customer) {
    throw new Error(`Customer ${customerId} not found`);
  }

  const parts = [];

  // Basic Info
  parts.push(`Customer Name: ${customer.firstName} ${customer.lastName}`);
  parts.push(`Company Name: ${customer.org.name}`);
  
  if (customer.equipmentType) {
    let eq = `Equipment: ${customer.equipmentType}`;
    if (customer.equipmentAge) eq += ` (Age: ${customer.equipmentAge} years)`;
    parts.push(eq);
  }

  // Memberships
  if (customer.memberships.length > 0) {
    parts.push(`Membership Status: ACTIVE (${customer.memberships[0].plan} Plan)`);
  } else {
    parts.push(`Membership Status: NONE`);
  }

  // Estimates
  if (customer.estimateStatus === 'SENT' || customer.estimateStatus === 'FOLLOW_UP') {
    parts.push(`Open Estimate: $${customer.estimateAmount}`);
  }

  // Recent History
  if (customer.appointments.length > 0) {
    const lastAppt = customer.appointments[0];
    parts.push(`Last Service: ${lastAppt.serviceType} on ${lastAppt.scheduledAt.toISOString().split('T')[0]}`);
  }

  return parts.join('\n');
}
