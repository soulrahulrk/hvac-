import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { launchCampaign } from '@/lib/engine/campaign-executor';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const campaignId = params.id;

    const result = await launchCampaign(campaignId, user.orgId);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}
