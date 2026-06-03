import { NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';

export async function POST(req: Request) {
  try {
    const { provider, apiKey, model } = await req.json();
    
    if (!provider || !apiKey) {
      return NextResponse.json({ error: 'Missing provider or API key' }, { status: 400 });
    }

    // Try using our internal provider framework first
    try {
      const ai = getAIProvider(provider, apiKey, model);
      const result = await ai.generateText('Say "Connection successful" if you receive this message.');
      return NextResponse.json({ success: true, message: result });
    } catch (err: any) {
      // If provider not supported in lib/ai/provider.ts, do basic fetch checks
      if (provider === 'groq') {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model || 'llama3-8b-8192',
            messages: [{ role: 'user', content: 'Say "Connection successful"' }]
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Groq error');
        return NextResponse.json({ success: true, message: data.choices[0].message.content });
      } 
      else if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: 'Say "Connection successful"' }]
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'OpenAI error');
        return NextResponse.json({ success: true, message: data.choices[0].message.content });
      }

      throw err; // Unsupported provider or other error
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
