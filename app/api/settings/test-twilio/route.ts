import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sid, token, fromPhone, toPhone } = await req.json();
    if (!sid || !token || !fromPhone || !toPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const params = new URLSearchParams();
    params.append('To', toPhone);
    params.append('From', fromPhone);
    params.append('Body', 'This is a test message from your HVAC app via Twilio!');

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Twilio error' }, { status: 400 });
    }

    return NextResponse.json({ success: true, sid: data.sid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
