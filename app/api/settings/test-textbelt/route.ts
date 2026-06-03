import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, key } = await req.json();
    if (!phone || !key) {
      return NextResponse.json({ error: 'Phone and Textbelt Key are required' }, { status: 400 });
    }

    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone,
        message: 'This is a test message from your HVAC Revenue Recovery app using Textbelt!',
        key: key,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      return NextResponse.json({ error: data.error || 'Textbelt API error' }, { status: 400 });
    }

    return NextResponse.json({ success: true, quotaRemaining: data.quotaRemaining });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
