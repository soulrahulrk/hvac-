import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { getAIProvider } from '@/lib/ai/provider';
import { SYSTEM_PROMPTS, buildPrompt } from '@/lib/ai/prompts';
import { buildCustomerContext } from '@/lib/ai/context';
import { z } from 'zod';
import { decrypt } from '@/lib/crypto';

const SuggestSchema = z.object({
  customerId: z.string().cuid(),
  customerMessage: z.string().min(1),
  channel: z.enum(['SMS', 'EMAIL', 'REVIEW']).default('SMS'),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { customerId, customerMessage, channel } = SuggestSchema.parse(body);

    const customer = await prisma.customer.findUnique({
      where: { id: customerId, orgId: user.orgId },
      include: { org: true }
    });

    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const org = customer.org;
    let apiKey = org.aiApiKey ? decrypt(org.aiApiKey) : null;
    if (!apiKey) {
      if (org.aiProvider === 'gemini') apiKey = process.env.GOOGLE_API_KEY || null;
      if (org.aiProvider === 'nvidia') apiKey = process.env.KIMI_API_KEY || null;
    }
    if (!apiKey) return NextResponse.json({ error: 'AI key missing' }, { status: 400 });

    const provider = getAIProvider(org.aiProvider, apiKey, org.aiModel);
    const context = await buildCustomerContext(customerId);
    
    let systemPrompt = `You are a customer service rep. Respond to the customer's message below. Keep it concise, helpful, and friendly.`;
    if (channel === 'REVIEW') {
      systemPrompt = SYSTEM_PROMPTS.REVIEW_REPLY;
    }

    const fullPrompt = `${systemPrompt}\n\n--- CUSTOMER CONTEXT ---\n${context}\n\n--- CUSTOMER MESSAGE ---\n"${customerMessage}"\n\nDraft a suggested response:`;

    const generatedText = await provider.generateText(fullPrompt, { temperature: 0.6 });

    return NextResponse.json({ success: true, text: generatedText });
  } catch (error) {
    console.error('Suggest reply error:', error);
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 });
  }
}
