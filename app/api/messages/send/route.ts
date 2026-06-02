import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { phone, text, customerId } = await req.json();
    
    if (!phone || !text) {
      return NextResponse.json({ error: 'Phone and text are required' }, { status: 400 });
    }

    const key = process.env.TEXTBELT_API_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Textbelt API key is missing' }, { status: 500 });
    }

    // Send SMS via Textbelt
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        message: text,
        key
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json({ error: data.error || 'Failed to send SMS via Textbelt' }, { status: 400 });
    }

    // Save to DB if customerId is provided
    if (customerId) {
      await prisma.message.create({
        data: {
          customerId: Number(customerId),
          direction: 'OUTBOUND',
          channel: 'SMS',
          content: text,
          status: 'SENT'
        }
      });
    }

    return NextResponse.json({ success: true, textbeltResponse: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
