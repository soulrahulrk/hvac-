import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    
    // Fetch stats
    const customers = await prisma.customer.count({ where: { orgId: user.orgId } });
    
    // Active campaigns
    const activeCampaigns = await prisma.campaign.count({
      where: { orgId: user.orgId, status: 'ACTIVE' }
    });

    // Revenue
    const revenueEvents = await prisma.revenueEvent.findMany({
      where: { orgId: user.orgId }
    });
    const totalRecovered = revenueEvents.reduce((acc, curr) => acc + curr.amount, 0);

    // Recent activity
    const recentActivity = await prisma.activityLog.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: 'desc' },
      take: 8
    });

    // Recent campaigns
    const recentCampaigns = await prisma.campaign.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    return NextResponse.json({
      stats: {
        totalRecovered,
        activeCampaigns,
        totalCustomers: customers,
        responseRate: 0 // To be calculated based on messages
      },
      activities: recentActivity.map(a => ({
        text: a.description,
        time: a.createdAt,
        type: a.type
      })),
      campaigns: recentCampaigns.map(c => ({
        name: c.name,
        type: c.type,
        sent: c.totalSent,
        responded: c.totalResponded,
        status: c.status
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
