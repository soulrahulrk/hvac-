import { NextResponse } from 'next/server';
import { syncHubspotContacts } from '@/lib/services/crm-sync';
import { runSegmentationEngine } from '@/lib/services/segmentation';

export async function GET() {
  try {
    const contacts = await syncHubspotContacts();
    const segmentedContacts = runSegmentationEngine(contacts);
    
    return NextResponse.json({
      success: true,
      processed: segmentedContacts
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
