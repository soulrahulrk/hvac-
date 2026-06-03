import { prisma } from '@/lib/db';

export async function refreshAllSegments(orgId: string) {
  const segments = await prisma.segment.findMany({ where: { orgId } });
  
  for (const segment of segments) {
    await refreshSegment(segment.id);
  }
}

export async function refreshSegment(segmentId: string) {
  const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
  if (!segment) throw new Error('Segment not found');

  const rules = JSON.parse(segment.rules);
  
  // Basic rule parser for demonstration
  // Real implementation would use Prisma's dynamic 'where' builder based on complex rules
  let whereClause: any = { orgId: segment.orgId };

  if (rules.type === 'DORMANT') {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    whereClause = {
      ...whereClause,
      OR: [
        { leadStatus: 'DORMANT' },
        { lastServiceDate: { lt: oneYearAgo } }
      ]
    };
  } else if (rules.type === 'OPEN_ESTIMATES') {
    whereClause = {
      ...whereClause,
      estimateStatus: { in: ['SENT', 'FOLLOW_UP'] },
      estimateAmount: { gt: 0 }
    };
  } else if (rules.type === 'PAST_CUSTOMERS') {
    whereClause = {
      ...whereClause,
      totalServices: { gt: 0 }
    };
  } else if (rules.type === 'LAPSED_MEMBERS') {
    whereClause = {
      ...whereClause,
      membershipStatus: { in: ['LAPSED', 'EXPIRED'] }
    };
  } else if (rules.type === 'REPLACEMENT_CANDIDATES') {
    whereClause = {
      ...whereClause,
      equipmentAge: { gt: 10 }
    };
  } else if (rules.type === 'HIGH_VALUE') {
    whereClause = {
      ...whereClause,
      totalSpent: { gt: 5000 }
    };
  } else if (rules.type === 'CUSTOM') {
    // Custom rules parsing would go here
  }

  // Calculate new count
  const count = await prisma.customer.count({ where: whereClause });

  // Update segment
  await prisma.segment.update({
    where: { id: segmentId },
    data: {
      customerCount: count,
      lastRefreshedAt: new Date(),
    }
  });

  return count;
}

export async function getCustomersInSegment(segmentId: string) {
  const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
  if (!segment) throw new Error('Segment not found');

  const rules = JSON.parse(segment.rules);
  let whereClause: any = { orgId: segment.orgId };

  // Re-apply rules
  if (rules.type === 'DORMANT') {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    whereClause = { ...whereClause, OR: [{ leadStatus: 'DORMANT' }, { lastServiceDate: { lt: oneYearAgo } }] };
  } else if (rules.type === 'OPEN_ESTIMATES') {
    whereClause = { ...whereClause, estimateStatus: { in: ['SENT', 'FOLLOW_UP'] }, estimateAmount: { gt: 0 } };
  } else if (rules.type === 'PAST_CUSTOMERS') {
    whereClause = { ...whereClause, totalServices: { gt: 0 } };
  } else if (rules.type === 'LAPSED_MEMBERS') {
    whereClause = { ...whereClause, membershipStatus: { in: ['LAPSED', 'EXPIRED'] } };
  } else if (rules.type === 'REPLACEMENT_CANDIDATES') {
    whereClause = { ...whereClause, equipmentAge: { gt: 10 } };
  } else if (rules.type === 'HIGH_VALUE') {
    whereClause = { ...whereClause, totalSpent: { gt: 5000 } };
  }

  return await prisma.customer.findMany({ where: whereClause });
}

export async function createSystemSegments(orgId: string) {
  const systemSegments = [
    { name: 'Dormant Leads', description: 'No service in > 1 year', rules: JSON.stringify({ type: 'DORMANT' }), isSystem: true },
    { name: 'Open Estimates', description: 'Estimates sent but not accepted', rules: JSON.stringify({ type: 'OPEN_ESTIMATES' }), isSystem: true },
    { name: 'Past Customers', description: 'Customers with at least 1 completed service', rules: JSON.stringify({ type: 'PAST_CUSTOMERS' }), isSystem: true },
    { name: 'Lapsed Members', description: 'Expired or lapsed memberships', rules: JSON.stringify({ type: 'LAPSED_MEMBERS' }), isSystem: true },
    { name: 'Replacement Candidates', description: 'Equipment > 10 years old', rules: JSON.stringify({ type: 'REPLACEMENT_CANDIDATES' }), isSystem: true },
    { name: 'High Value Customers', description: 'Lifetime spend > $5,000', rules: JSON.stringify({ type: 'HIGH_VALUE' }), isSystem: true },
  ];

  for (const seg of systemSegments) {
    await prisma.segment.upsert({
      where: { orgId_name: { orgId, name: seg.name } },
      update: {},
      create: {
        orgId,
        ...seg
      }
    });
  }
}
