import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { getAIProvider } from '@/lib/ai/provider';
import { SYSTEM_PROMPTS, buildPrompt } from '@/lib/ai/prompts';
import { buildCustomerContext } from '@/lib/ai/context';
import { z } from 'zod';
import { decrypt } from '@/lib/crypto';

const GenerateSchema = z.object({
  customerId: z.string().cuid(),
  promptType: z.enum(['SMS_REACTIVATION', 'SMS_ESTIMATE_FOLLOWUP', 'SMS_MAINTENANCE_REMINDER', 'SMS_REVIEW_REQUEST', 'REVIEW_REPLY']),
  additionalInstructions: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { customerId, promptType, additionalInstructions } = GenerateSchema.parse(body);

    // Verify customer belongs to org
    const customer = await prisma.customer.findUnique({
      where: { id: customerId, orgId: user.orgId },
      include: { org: true }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get org AI settings
    const org = customer.org;
    let apiKey = org.aiApiKey ? decrypt(org.aiApiKey) : null;
    
    // Fallback to system env vars if org hasn't set their own keys
    if (!apiKey) {
      if (org.aiProvider === 'gemini') apiKey = process.env.GOOGLE_API_KEY || null;
      if (org.aiProvider === 'nvidia') apiKey = process.env.KIMI_API_KEY || null;
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'AI provider API key not configured' }, { status: 400 });
    }

    const provider = getAIProvider(org.aiProvider, apiKey, org.aiModel);
    
    const context = await buildCustomerContext(customerId);
    const systemPrompt = SYSTEM_PROMPTS[promptType];
    
    const fullPrompt = buildPrompt(systemPrompt, context, additionalInstructions);

    const generatedText = await provider.generateText(fullPrompt, { temperature: 0.7 });

    return NextResponse.json({ success: true, text: generatedText });

  } catch (error) {
    console.error('AI Generate error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
